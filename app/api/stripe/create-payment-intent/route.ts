import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
	try {
		// Initialize Supabase client at request time (not build time)
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
		
		if (!supabaseUrl || !supabaseKey) {
			return NextResponse.json(
				{ error: 'Server configuration error: Supabase not configured' },
				{ status: 500 }
			);
		}
		
		const supabase = createClient(supabaseUrl, supabaseKey);
		
		const { storeId, amount, campaignId, items } = await request.json();

		if (!storeId || !amount || !campaignId) {
			return NextResponse.json(
				{ error: 'Missing required fields: storeId, amount, campaignId' },
				{ status: 400 }
			);
		}

		// ============================================
		// 1. FETCH STORE'S STRIPE KEYS
		// ============================================
		const { data: store, error: storeError } = await supabase
			.from('stores')
			.select('stripe_secret_key, stripe_publishable_key, stripe_connected')
			.eq('id', storeId)
			.single();

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
