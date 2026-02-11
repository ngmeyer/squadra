'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { AlertCircle, Check, Copy, Eye, EyeOff } from 'lucide-react';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL || '',
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function StripeSettingsPage() {
	const params = useParams();
	const storeId = params.id as string;

	const [loading, setLoading] = useState(false);
	const [saved, setSaved] = useState(false);
	const [showKeys, setShowKeys] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		stripe_publishable_key: '',
		stripe_secret_key: '',
		stripe_webhook_secret: '',
		stripe_account_email: ''
	});

	const [currentStore, setCurrentStore] = useState<any>(null);

	// Load store data
	useEffect(() => {
		const loadStore = async () => {
			const { data, error } = await supabase
				.from('stores')
				.select('*')
				.eq('id', storeId)
				.single();

			if (error) {
				setError(error.message);
				return;
			}

			if (data) {
				setCurrentStore(data);
				setFormData({
					stripe_publishable_key: data.stripe_publishable_key || '',
					stripe_secret_key: data.stripe_secret_key || '',
					stripe_webhook_secret: data.stripe_webhook_secret || '',
					stripe_account_email: data.stripe_account_email || ''
				});
			}
		};

		loadStore();
	}, [storeId]);

	const validateKeys = (keys: any) => {
		const errors: string[] = [];

		if (keys.stripe_publishable_key && !keys.stripe_publishable_key.startsWith('pk_')) {
			errors.push('Publishable key must start with pk_');
		}

		if (keys.stripe_secret_key && !keys.stripe_secret_key.startsWith('sk_')) {
			errors.push('Secret key must start with sk_');
		}

		if (keys.stripe_webhook_secret && !keys.stripe_webhook_secret.startsWith('whsec_')) {
			errors.push('Webhook secret must start with whsec_');
		}

		return errors;
	};

	const handleSave = async () => {
		setError(null);
		setSaved(false);

		// Validate
		const validationErrors = validateKeys(formData);
		if (validationErrors.length > 0) {
			setError(validationErrors.join(', '));
			return;
		}

		setLoading(true);

		try {
			const { error } = await supabase
				.from('stores')
				.update({
					stripe_publishable_key: formData.stripe_publishable_key,
					stripe_secret_key: formData.stripe_secret_key,
					stripe_webhook_secret: formData.stripe_webhook_secret,
					stripe_account_email: formData.stripe_account_email,
					stripe_connected: !!(
						formData.stripe_publishable_key &&
						formData.stripe_secret_key &&
						formData.stripe_webhook_secret
					)
				})
				.eq('id', storeId);

			if (error) throw error;

			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const maskKey = (key: string) => {
		if (!key) return '';
		return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
	};

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold">Stripe Configuration</h1>
				<p className="text-gray-600 mt-2">Connect your Stripe account to accept payments</p>
			</div>

			{/* Status */}
			<div
				className={`p-4 rounded-lg border ${
					currentStore?.stripe_connected
						? 'bg-green-50 border-green-200'
						: 'bg-yellow-50 border-yellow-200'
				}`}
			>
				<div className="flex items-center gap-2">
					{currentStore?.stripe_connected ? (
						<>
							<Check className="w-5 h-5 text-green-600" />
							<span className="text-green-800 font-medium">Stripe Account Connected</span>
						</>
					) : (
						<>
							<AlertCircle className="w-5 h-5 text-yellow-600" />
							<span className="text-yellow-800 font-medium">Stripe Account Not Connected</span>
						</>
					)}
				</div>
				{currentStore?.stripe_account_email && (
					<p className="text-sm text-gray-700 mt-2">
						Account: <strong>{currentStore.stripe_account_email}</strong>
					</p>
				)}
			</div>

			{/* Error */}
			{error && (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-800">
						<AlertCircle className="w-4 h-4 inline mr-2" />
						{error}
					</p>
				</div>
			)}

			{/* Success */}
			{saved && (
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-green-800">
						<Check className="w-4 h-4 inline mr-2" />
						Stripe configuration saved successfully!
					</p>
				</div>
			)}

			{/* Form */}
			<div className="space-y-4 bg-white p-6 rounded-lg border">
				{/* Publishable Key */}
				<div>
					<label className="block text-sm font-medium mb-2">Stripe Publishable Key</label>
					<div className="relative">
						<input
							type={showKeys ? 'text' : 'password'}
							value={formData.stripe_publishable_key}
							onChange={(e) =>
								setFormData({ ...formData, stripe_publishable_key: e.target.value })
							}
							placeholder="pk_test_..."
							className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
						/>
						<button
							onClick={() => setShowKeys(!showKeys)}
							className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
						>
							{showKeys ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					<p className="text-xs text-gray-600 mt-1">Safe to share. Usually starts with pk_test_ or pk_live_</p>
				</div>

				{/* Secret Key */}
				<div>
					<label className="block text-sm font-medium mb-2">Stripe Secret Key</label>
					<div className="relative">
						<input
							type={showKeys ? 'text' : 'password'}
							value={formData.stripe_secret_key}
							onChange={(e) =>
								setFormData({ ...formData, stripe_secret_key: e.target.value })
							}
							placeholder="sk_test_..."
							className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
						/>
						<button
							onClick={() => setShowKeys(!showKeys)}
							className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
						>
							{showKeys ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					<p className="text-xs text-gray-600 mt-1">⚠️ PRIVATE! Never commit to git. Starts with sk_test_ or sk_live_</p>
				</div>

				{/* Webhook Secret */}
				<div>
					<label className="block text-sm font-medium mb-2">Webhook Signing Secret</label>
					<div className="relative">
						<input
							type={showKeys ? 'text' : 'password'}
							value={formData.stripe_webhook_secret}
							onChange={(e) =>
								setFormData({ ...formData, stripe_webhook_secret: e.target.value })
							}
							placeholder="whsec_..."
							className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
						/>
						<button
							onClick={() => setShowKeys(!showKeys)}
							className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
						>
							{showKeys ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					<p className="text-xs text-gray-600 mt-1">⚠️ PRIVATE! From Dashboard → Developers → Webhooks</p>
				</div>

				{/* Account Email */}
				<div>
					<label className="block text-sm font-medium mb-2">Stripe Account Email</label>
					<input
						type="email"
						value={formData.stripe_account_email}
						onChange={(e) =>
							setFormData({ ...formData, stripe_account_email: e.target.value })
						}
						placeholder="your-email@example.com"
						className="w-full px-4 py-2 border rounded-lg"
					/>
					<p className="text-xs text-gray-600 mt-1">For reference only. The email of your Stripe account holder.</p>
				</div>

				{/* Save Button */}
				<button
					onClick={handleSave}
					disabled={loading}
					className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
				>
					{loading ? 'Saving...' : 'Save Stripe Configuration'}
				</button>
			</div>

			{/* Instructions */}
			<div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
				<h3 className="font-bold text-blue-900 mb-3">How to Find Your Stripe Keys</h3>
				<ol className="space-y-2 text-sm text-blue-900">
					<li>1. Go to https://dashboard.stripe.com</li>
					<li>2. Click <strong>Developers</strong> in the sidebar</li>
					<li>3. Click <strong>API Keys</strong></li>
					<li>4. Copy <strong>Publishable key</strong> and <strong>Secret key</strong></li>
					<li>5. Go to <strong>Webhooks</strong> section</li>
					<li>6. Find your endpoint and click to see the <strong>Signing secret</strong></li>
					<li>7. Paste all three keys above</li>
				</ol>
			</div>
		</div>
	);
}
