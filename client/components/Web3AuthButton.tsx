'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { connectLeather, signMessage, isLeatherInstalled, LeatherError } from '@/lib/leather';
import { LeatherAuthButton } from './LeatherAuthButton';

interface Web3AuthButtonProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export function Web3AuthButton({ onSuccess, onError }: Web3AuthButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Don't render anything on server side
	if (!isMounted) {
		return null;
	}

	const handleWeb3Auth = async () => {
		setIsLoading(true);
		setError('');

		try {
			// Try Stacks wallet
			if (isMounted && isLeatherInstalled()) {
				await authenticateWithLeather();
			} else {
				throw new Error('No Stacks wallet found. Please install Leather or Hiro wallet.');
			}
		} catch (err: any) {
			console.error('Web3 auth error:', err);
			const errorMessage = err.message || 'Failed to authenticate with Stacks wallet';
			setError(errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLeatherAuth = () => {
		// This will be handled by LeatherAuthButton
	};


	const authenticateWithLeather = async () => {
		try {
			console.log('[Web3Auth] Authenticating with Leather...');
			
			// Connect to Leather wallet
			const address = await connectLeather();
			console.log('[Web3Auth] Connected to Leather:', address);

			// Create message to sign
			const message = `Sign in to OSG Game Platform\n\nAddress: ${address}\nTimestamp: ${Date.now()}`;
			
			// Sign message
			const signature = await signMessage(message);
			console.log('[Web3Auth] Message signed with Leather');

			// Authenticate with NextAuth
			const result = await signIn('leather', {
				walletAddress: address,
				signature: signature,
				message: message,
				redirect: false,
			});

			if (result?.error) {
				throw new Error('Authentication failed');
			}

			console.log('[Web3Auth] Leather authentication successful');
			onSuccess?.();
		} catch (err: any) {
			if (err instanceof LeatherError) {
				throw err;
			}
			throw new Error('Leather authentication failed: ' + err.message);
		}
	};


	return (
		<div className="space-y-2">
			{/* Stacks Wallet Button */}
			{isMounted && isLeatherInstalled() && (
				<LeatherAuthButton 
					onSuccess={onSuccess}
					onError={onError}
					variant="compact"
				/>
			)}
			
			{/* Fallback if no Stacks wallet installed */}
			{!isLeatherInstalled() && (
				<Button
					size="sm"
					onClick={handleWeb3Auth}
					disabled={true}
					className="text-sm bg-gray-500 text-white cursor-not-allowed"
				>
					No Stacks Wallet
				</Button>
			)}
			
			{error && (
				<div className="mt-2 p-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
					{error}
				</div>
			)}
		</div>
	);
}
