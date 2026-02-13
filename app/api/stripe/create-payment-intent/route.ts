import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@/lib/supabase/service';
import Stripe from 'stripe';
import { z } from 'zod';

// Input validation schema
const PaymentIntentSchema = z.object({
	storeId: z.string().uuid(),
	amount: z.number().positive('Amount must be a positive number'),
	campaignId: z.string().uuid(),
	items: z.array(z.any()).optional()
});

export async function POST(request: NextRequest) {
	try {
		// Use the shared service role client
		const supabase = createServiceClient();
		
		// Parse and validate request body
		const body = await request.json();
		const validation = PaymentIntentSchema.safeParse(body);
		
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validation.error.flatten() },
				{ status: 400 }
			);
		}
		
		const { storeId, amount, campaignId, items } = validation.data;

		// ============================================
		// 1. FETCH STORE'S STRIPE KEYS
		// ============================================
		// Note: Type assertion needed until types are regenerated from DB
		const { data: store, error: storeError } = await supabase
			.from('stores')
			.select('stripe_secret_key, stripe_publishable_key, stripe_connected')
			.eq('id', storeId)
			.single() as { 
				data: { 
					stripe_secret_key: string | null; 
					stripe_publishable_key: string | null; 
					stripe_connected: boolean | null;
				} | null; 
				error: any 
			};

		if (storeError || !store) {
			return NextResponse.json(
				{ error: 'Store not found or Stripe not configured' },
				{ status: 404 }
			);
		}

		if (!store.stripe_connected || !store.stripe_secret_key) {
			return NextResponse.json(
				{ error: 'This store has not connected their Stripe account' },
				{ status: 400 }
			);
		}

		// ============================================
		// 2. INITIALIZE STRIPE WITH STORE'S KEYS
		// ============================================
		if (!store.stripe_secret_key) {
			return NextResponse.json(
				{ error: 'Stripe secret key not configured for this store' },
				{ status: 500 }
			);
		}
		
		const stripe = new Stripe(store.stripe_secret_key);

		// ============================================
		// 3. CREATE PAYMENT INTENT
		// ============================================
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to cents
			currency: 'usd',
			metadata: {
				storeId,
				campaignId,
				itemCount: items?.length || 0
			}
		});

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
			publishableKey: store.stripe_publishable_key
		});
	} catch (error: any) {
		console.error('[Stripe] Create Payment Intent Error:', error);
		return NextResponse.json(
			{ error: error.message || 'Failed to create payment intent' },
			{ status: 500 }
		);
	}
}
