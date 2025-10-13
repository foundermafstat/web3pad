'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useMetaMask } from '@/hooks/useMetaMask';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { formatAddress } from '@/lib/metamask';

interface MetaMaskAuthProps {
	onClose?: () => void;
	redirectUrl?: string;
}

export function MetaMaskAuth({ onClose, redirectUrl }: MetaMaskAuthProps) {
	const { 
		isInstalled, 
		isConnecting, 
		isConnected, 
		account, 
		error, 
		connect, 
		signMessage, 
		clearError 
	} = useMetaMask();

	const [isSigningIn, setIsSigningIn] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	const handleConnectWallet = async () => {
		if (!isInstalled) {
			window.open('https://metamask.io/download/', '_blank');
			return;
		}

		clearError();
		setAuthError(null);
		await connect();
	};

	const handleSignIn = async () => {
		if (!account) return;

		setIsSigningIn(true);
		setAuthError(null);

		try {
			// Create a message to sign for authentication
			const message = `Sign in to Web3Hub\n\nWallet: ${account}\nTimestamp: ${Date.now()}`;
			
			// Sign the message
			const signature = await signMessage(message);

			// Use NextAuth to sign in with the wallet
			const result = await signIn('metamask', {
				walletAddress: account,
				signature,
				message,
				redirect: false,
				callbackUrl: redirectUrl || '/',
			});

			if (result?.error) {
				setAuthError(result.error);
			} else if (result?.ok) {
				// Successful sign in
				onClose?.();
				if (redirectUrl) {
					window.location.href = redirectUrl;
				} else {
					window.location.reload();
				}
			}
		} catch (error: any) {
			console.error('MetaMask auth error:', error);
			setAuthError(error.message || 'Failed to authenticate with MetaMask');
		} finally {
			setIsSigningIn(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
					<Wallet className="w-8 h-8 text-white" />
				</div>
				<CardTitle>Connect with MetaMask</CardTitle>
				<CardDescription>
					Sign in securely using your crypto wallet
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Error Display */}
				{(error || authError) && (
					<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
						<div className="flex items-center space-x-2">
							<AlertCircle className="w-4 h-4 text-destructive" />
							<p className="text-sm text-destructive">{error || authError}</p>
						</div>
					</div>
				)}

				{!isInstalled ? (
					<div className="text-center py-6">
						<Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
						<p className="text-sm text-muted-foreground mb-4">
							MetaMask is required for crypto wallet authentication
						</p>
						<Button onClick={handleConnectWallet} className="w-full">
							<ExternalLink className="w-4 h-4 mr-2" />
							Install MetaMask
						</Button>
					</div>
				) : !isConnected ? (
					<div className="space-y-4">
						<div className="text-center">
							<p className="text-sm text-muted-foreground mb-4">
								Connect your MetaMask wallet to continue
							</p>
							<Button 
								onClick={handleConnectWallet}
								disabled={isConnecting}
								className="w-full"
							>
								{isConnecting ? (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<Wallet className="w-4 h-4 mr-2" />
								)}
								Connect MetaMask
							</Button>
						</div>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Secure Web3 Authentication
								</span>
							</div>
						</div>

						<div className="text-xs text-muted-foreground text-center space-y-1">
							<p>✓ No passwords needed</p>
							<p>✓ Cryptographically secure</p>
							<p>✓ You control your identity</p>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
							<div className="flex items-center space-x-2 mb-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-sm font-medium text-green-700 dark:text-green-300">
									Wallet Connected
								</span>
							</div>
							<p className="text-sm text-muted-foreground font-mono">
								{formatAddress(account!)}
							</p>
						</div>

						<Button 
							onClick={handleSignIn}
							disabled={isSigningIn}
							className="w-full"
							size="lg"
						>
							{isSigningIn ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Wallet className="w-4 h-4 mr-2" />
							)}
							{isSigningIn ? 'Signing In...' : 'Sign In with MetaMask'}
						</Button>

						<p className="text-xs text-muted-foreground text-center">
							By continuing, you agree to sign a message to verify wallet ownership.
							This is secure and doesn't cost any gas fees.
						</p>
					</div>
				)}

				{onClose && (
					<Button variant="outline" onClick={onClose} className="w-full">
						Cancel
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
