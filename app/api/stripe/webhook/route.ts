import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL || '',
	process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
	const body = await request.text();
	const sig = request.headers.get('stripe-signature');

	if (!sig) {
		return NextResponse.json(
			{ error: 'Missing stripe-signature header' },
			{ status: 400 }
		);
	}

	try {
		// ============================================
		// 1. EXTRACT STORE ID FROM METADATA
		// ============================================
		// First, parse the event without verification to get metadata
		const event = JSON.parse(body);
		const storeId = event.data?.object?.metadata?.storeId;

		if (!storeId) {
			console.warn('[Webhook] No storeId in event metadata');
			return NextResponse.json({ ok: true }); // Silently ignore
		}

		// ============================================
		// 2. FETCH STORE'S WEBHOOK SECRET
		// ============================================
		const { data: store, error: storeError } = await supabase
			.from('stores')
			.select('stripe_webhook_secret, stripe_secret_key')
			.eq('id', storeId)
			.single();

		if (storeError || !store || !store.stripe_webhook_secret) {
			console.error('[Webhook] Store not found or webhook secret not configured:', storeId);
			return NextResponse.json(
				{ error: 'Store not configured for webhooks' },
				{ status: 404 }
			);
		}

		// ============================================
		// 3. VERIFY EVENT WITH STORE'S WEBHOOK SECRET
		// ============================================
		let verifiedEvent: Stripe.Event;
		try {
			const stripe = new Stripe(store.stripe_secret_key);

			verifiedEvent = stripe.webhooks.constructEvent(
				body,
				sig,
				store.stripe_webhook_secret
			) as Stripe.Event;
		} catch (err: any) {
			console.error('[Webhook] Signature verification failed:', err.message);
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 400 }
			);
		}

		// ============================================
		// 4. HANDLE PAYMENT EVENTS
		// ============================================
		switch (verifiedEvent.type) {
			case 'payment_intent.succeeded':
				await handlePaymentSucceeded(verifiedEvent.data.object as Stripe.PaymentIntent);
				break;

			case 'payment_intent.payment_failed':
				await handlePaymentFailed(verifiedEvent.data.object as Stripe.PaymentIntent);
				break;

			case 'charge.refunded':
				await handleRefund(verifiedEvent.data.object as Stripe.Charge);
				break;

			default:
				console.log(`[Webhook] Unhandled event type: ${verifiedEvent.type}`);
		}

		return NextResponse.json({ ok: true });
	} catch (error: any) {
		console.error('[Webhook] Error:', error);
		return NextResponse.json(
			{ error: error.message || 'Webhook processing failed' },
			{ status: 500 }
		);
	}
}

// ============================================
// HANDLER: Payment Succeeded
// ============================================
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
	const { storeId, campaignId } = paymentIntent.metadata || {};

	if (!storeId || !campaignId) {
		console.warn('[Webhook] Missing storeId or campaignId in payment metadata');
		return;
	}

	console.log(`[Webhook] Payment succeeded for store ${storeId}, campaign ${campaignId}`);

	// Find or create order record
	const { data: order, error: orderError } = await supabase
		.from('orders')
		.select('id')
		.eq('payment_intent_id', paymentIntent.id)
		.single();

	if (!orderError && order) {
		// Update existing order
		await supabase
			.from('orders')
			.update({
				status: 'completed',
				stripe_payment_id: paymentIntent.id
			})
			.eq('id', order.id);

		console.log(`[Webhook] Updated order ${order.id} to completed`);
	}

	// TODO: Send confirmation email to customer
	// TODO: Update variant order counts (requires DB function)
	// TODO: Trigger fulfillment workflow
}

// ============================================
// HANDLER: Payment Failed
// ============================================
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
	const { storeId, campaignId } = paymentIntent.metadata || {};

	if (!storeId || !campaignId) {
		console.warn('[Webhook] Missing metadata in failed payment');
		return;
	}

	console.log(`[Webhook] Payment failed for store ${storeId}, campaign ${campaignId}`);

	// Update order status
	const { data: order } = await supabase
		.from('orders')
		.select('id')
		.eq('payment_intent_id', paymentIntent.id)
		.single();

	if (order) {
		await supabase
			.from('orders')
			.update({ status: 'payment_failed' })
			.eq('id', order.id);
	}

	// TODO: Send payment failure notification to customer
}

// ============================================
// HANDLER: Refund Processed
// ============================================
async function handleRefund(charge: Stripe.Charge) {
	const paymentIntentId = charge.payment_intent as string;

	if (!paymentIntentId) {
		console.warn('[Webhook] No payment_intent in refund');
		return;
	}

	console.log(`[Webhook] Refund processed for payment intent ${paymentIntentId}`);

	// Find order
	const { data: order } = await supabase
		.from('orders')
		.select('id')
		.eq('stripe_payment_id', charge.id)
		.single();

	if (order) {
		await supabase
			.from('orders')
			.update({ status: 'refunded' })
			.eq('id', order.id);

		console.log(`[Webhook] Updated order ${order.id} to refunded`);
	}

	// TODO: Send refund confirmation to customer
	// TODO: Reverse variant order counts
}
