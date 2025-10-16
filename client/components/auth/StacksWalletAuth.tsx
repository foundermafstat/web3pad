'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';
import { connectLeather, signMessage, LeatherError, getCurrentAddress, disconnectLeather } from '@/lib/leather';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface StacksWalletAuthProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
	className?: string;
}

export function StacksWalletAuth({ onSuccess, onError, className }: StacksWalletAuthProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [address, setAddress] = useState<string | null>(null);

	const handleConnect = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Connect to wallet
			const walletAddress = await connectLeather();
			setAddress(walletAddress);
			setIsConnected(true);
		} catch (err: any) {
			const errorMessage = err.message || 'Failed to connect to wallet';
			setError(errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAuthenticate = async () => {
		if (!address) return;

		setIsLoading(true);
		setError(null);

		try {
			// First check if server is available
			const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
			try {
				const healthCheck = await fetch(`${serverUrl}/api/auth/leather`, {
					method: 'OPTIONS'
				});
				console.log('[StacksWalletAuth] Server health check:', healthCheck.status);
			} catch (serverError) {
				throw new Error('Server is not running. Please start the server on port 3001.');
			}
			// Generate challenge message
			const challenge = `Sign this message to authenticate with W3P Platform:\nNonce: ${Math.random().toString(36).substring(7)}\nTime: ${Date.now()}`;
			
			console.log('[StacksWalletAuth] Starting authentication...', {
				address,
				challengeLength: challenge.length
			});
			
			// Sign the message
			const signature = await signMessage(challenge);
			
			console.log('[StacksWalletAuth] Message signed, attempting NextAuth signin...', {
				hasSignature: !!signature.signature,
				hasPublicKey: !!signature.publicKey
			});
			
			// Sign in with NextAuth using the signature
			const result = await signIn('leather', {
				walletAddress: address,
				signature: signature.signature,
				message: challenge,
				redirect: false,
			});

			console.log('[StacksWalletAuth] NextAuth result:', result);

			if (result?.error) {
				throw new Error(result.error);
			}

			if (result?.ok) {
				console.log('[StacksWalletAuth] Authentication successful!');
				onSuccess?.();
			} else {
				throw new Error('Authentication failed - no success response');
			}
		} catch (err: any) {
			let errorMessage = err.message || 'Authentication failed';
			
			// Provide more helpful error messages
			if (errorMessage === 'CredentialsSignin') {
				errorMessage = 'Authentication failed. Please restart the server and try again.';
			} else if (errorMessage.includes('fetch')) {
				errorMessage = 'Cannot connect to server. Please make sure the server is running on port 3001.';
			} else if (errorMessage.includes('Signature verification failed')) {
				errorMessage = 'Server needs to be restarted. Please restart the server and try again.';
			}
			
			console.error('[StacksWalletAuth] Authentication error:', err);
			setError(errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnect = () => {
		disconnectLeather();
		setIsConnected(false);
		setAddress(null);
		setError(null);
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<span className="w-6 h-6 bg-orange-500 rounded-full"></span>
					Stacks Wallet Authentication
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<div className="p-3 border border-red-200 bg-red-50 rounded-md">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{!isConnected ? (
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground">
							Connect your Stacks wallet to authenticate
						</p>
						<Button 
							onClick={handleConnect} 
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Connecting...
								</>
							) : (
								'Connect Wallet'
							)}
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						<div className="p-3 border border-green-200 bg-green-50 rounded-md">
							<p className="text-sm text-green-700">
								<strong>Connected:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
							</p>
						</div>
						
						<div className="flex gap-2">
							<Button 
								onClick={handleAuthenticate} 
								disabled={isLoading}
								className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
							>
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Authenticating...
									</>
								) : (
									'Sign & Authenticate'
								)}
							</Button>
							<Button 
								onClick={handleDisconnect} 
								variant="outline"
								disabled={isLoading}
							>
								Disconnect
							</Button>
						</div>
					</div>
				)}

				<div className="text-xs text-muted-foreground">
					<p>Supported wallets: Leather, Hiro, Xverse</p>
					<p>Your wallet address will be used as your unique identifier</p>
					<p className="text-yellow-600 mt-2">
						⚠️ If authentication fails, make sure the server is running on port 3001
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
