'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { connectLeather, signMessage, isLeatherInstalled, LeatherError, getCurrentAddress } from '@/lib/leather';

interface LeatherAuthButtonProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
	variant?: 'default' | 'compact' | 'full';
}

export function LeatherAuthButton({ onSuccess, onError, variant = 'default' }: LeatherAuthButtonProps) {
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

	const handleLeatherAuth = async () => {
		setIsLoading(true);
		setError('');

		try {
			if (!isMounted || !isLeatherInstalled()) {
				throw new LeatherError('No Stacks wallet found. Please install Leather or Hiro wallet.');
			}

			console.log('[LeatherAuth] Starting authentication...');
			
			// Connect to Stacks wallet using @stacks/connect
			const address = await connectLeather();
			console.log('[LeatherAuth] Connected to Stacks wallet:', address);

			// Create message to sign
			const message = `Sign in to OSG Game Platform\n\nStacks Address: ${address}\nTimestamp: ${Date.now()}`;
			
			// Sign message
			const signature = await signMessage(message);
			console.log('[LeatherAuth] Message signed with Stacks wallet');

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

			console.log('[LeatherAuth] Stacks wallet authentication successful');
			onSuccess?.();
		} catch (err: any) {
			console.error('Stacks wallet auth error:', err);
			const errorMessage = err.message || 'Failed to authenticate with Stacks wallet';
			setError(errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const getButtonContent = () => {
		if (isLoading) {
			return (
				<>
					<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
					{variant === 'compact' ? 'Connecting...' : 'Connecting to Stacks...'}
				</>
			);
		}

		return (
			<>
				<svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
				{variant === 'compact' ? 'Stacks' : 'Connect with Stacks'}
			</>
		);
	};

	const getButtonClassName = () => {
		const baseClasses = "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white";
		
		switch (variant) {
			case 'compact':
				return `text-sm ${baseClasses}`;
			case 'full':
				return `w-full ${baseClasses}`;
			default:
				return baseClasses;
		}
	};

	return (
		<div className="relative">
			<Button
				size={variant === 'compact' ? 'sm' : 'default'}
				onClick={handleLeatherAuth}
				disabled={isLoading}
				className={getButtonClassName()}
			>
				{getButtonContent()}
			</Button>
			
			{error && (
				<div className="absolute top-full left-0 right-0 mt-1 p-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md z-50">
					{error}
				</div>
			)}
		</div>
	);
}
