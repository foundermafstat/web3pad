import { signIn } from 'next-auth/react';
import { connectLeather, signMessage, LeatherError } from './leather';
import { ENV_CONFIG } from '../env.config';

export interface WalletAuthResult {
	success: boolean;
	error?: string;
}

export async function authenticateWithWallet(): Promise<WalletAuthResult> {
	try {
		// Use the configured server URL
		const serverUrl = ENV_CONFIG.SERVER_URL;
		console.log('[WalletAuth] Using server URL:', serverUrl);

		// Connect to wallet
		const walletAddress = await connectLeather();
		console.log('[WalletAuth] Wallet connected:', walletAddress);

		// Generate challenge message
		const challenge = `Sign this message to authenticate with W3P Platform:\nNonce: ${Math.random().toString(36).substring(7)}\nTime: ${Date.now()}`;
		
		// Sign the message
		const signature = await signMessage(challenge);
		console.log('[WalletAuth] Message signed');
		
		// Sign in with NextAuth using the signature
		const result = await signIn('leather', {
			walletAddress: walletAddress,
			signature: signature.signature,
			message: challenge,
			redirect: false,
		});

		console.log('[WalletAuth] NextAuth result:', result);

		if (result?.error) {
			let errorMessage = result.error;
			
			// Provide more helpful error messages
			if (errorMessage === 'CredentialsSignin') {
				errorMessage = 'Authentication failed. Please restart the server and try again.';
			} else if (errorMessage.includes('fetch')) {
				errorMessage = 'Cannot connect to server. Please make sure the server is running on port 3001.';
			} else if (errorMessage.includes('Signature verification failed')) {
				errorMessage = 'Server needs to be restarted. Please restart the server and try again.';
			}
			
			throw new Error(errorMessage);
		}

		if (result?.ok) {
			console.log('[WalletAuth] Authentication successful!');
			return { success: true };
		} else {
			throw new Error('Authentication failed - no success response');
		}
	} catch (err: any) {
		console.error('[WalletAuth] Authentication error:', err);
		return { 
			success: false, 
			error: err.message || 'Authentication failed' 
		};
	}
}
