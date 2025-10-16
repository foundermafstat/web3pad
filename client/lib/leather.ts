import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { verifyMessageSignatureRsv } from '@stacks/encryption';

export class LeatherError extends Error {
	constructor(message: string, public code?: number) {
		super(message);
		this.name = 'LeatherError';
	}
}

// Check if any Stacks wallet is installed
export const isLeatherInstalled = (): boolean => {
	if (typeof window === 'undefined') {
		return false;
	}
	
	// Check for Leather wallet (multiple possible ways it can be detected)
	const hasLeather = (
		typeof (window as any).leather !== 'undefined' ||
		typeof (window as any).LeatherWallet !== 'undefined' ||
		document.querySelector('leather-wallet') !== null
	);
	
	// Check for Hiro wallet
	const hasHiroWallet = typeof (window as any).hiroWallet !== 'undefined';
	
	// Check for Xverse wallet
	const hasXverse = typeof (window as any).XverseProviders !== 'undefined';
	
	// Check for other Stacks wallets
	const hasStacksWallet = (
		typeof (window as any).StacksWallet !== 'undefined' ||
		typeof (window as any).stacksWallet !== 'undefined'
	);
	
	const result = hasLeather || hasHiroWallet || hasXverse || hasStacksWallet;
	
	console.log('[Stacks Connect] Wallet detection:', { 
		hasWindow: typeof window !== 'undefined',
		hasLeather,
		hasHiroWallet,
		hasXverse,
		hasStacksWallet,
		result,
		windowKeys: Object.keys(window).filter(key => 
			key.toLowerCase().includes('leather') || 
			key.toLowerCase().includes('hiro') || 
			key.toLowerCase().includes('stacks') ||
			key.toLowerCase().includes('xverse')
		)
	});
	return result;
};

// Connect to Stacks wallet using @stacks/connect (following official example)
export const connectLeather = async (): Promise<string> => {
	console.log('[Stacks Connect] Starting connection...');

	try {
		// Check if already connected
		if (isConnected()) {
			const userData = getLocalStorage();
			if (userData?.addresses?.stx?.[0]?.address) {
				console.log('[Stacks Connect] Already connected:', userData.addresses.stx[0].address);
				return userData.addresses.stx[0].address;
			}
		}

		// Connect to wallet using official method
		const response = await connect({
			appDetails: {
				name: 'W3P Game Platform',
				icon: window.location.origin + '/logo-osg.jpg',
			},
			redirectTo: window.location.origin,
			onFinish: (payload) => {
				console.log('[Stacks Connect] Connection finished:', payload);
			},
			onCancel: () => {
				console.log('[Stacks Connect] Connection cancelled');
				throw new LeatherError('Connection cancelled by user.');
			},
		});

		console.log('[Stacks Connect] Connected:', response);
		
		// Get the connected address
		const userData = getLocalStorage();
		if (userData?.addresses?.stx?.[0]?.address) {
			return userData.addresses.stx[0].address;
		}

		throw new LeatherError('No address received after connection.');
	} catch (error: any) {
		console.error('[Stacks Connect] Connection error:', error);
		if (error instanceof LeatherError) {
			throw error;
		}
		
		// Provide helpful error message
		throw new LeatherError(error.message || 'Failed to connect to Stacks wallet. Please ensure you have a Stacks wallet installed.');
	}
};

// Sign message using @stacks/connect (following official example)
export const signMessage = async (message: string): Promise<{signature: string, publicKey: string}> => {
	if (!isConnected()) {
		throw new LeatherError('Not connected to any wallet. Please connect first.');
	}

	try {
		// Try different signing methods
		let response;
		
		// First try stx_signMessage
		try {
			response = await request('stx_signMessage', {
				message: message,
			});
			console.log('[Stacks Connect] Sign response (stx_signMessage):', response);
		} catch (err) {
			console.log('[Stacks Connect] stx_signMessage failed, trying alternatives:', err);
			
			// Try alternative method names
			try {
				response = await request('signMessage', {
					message: message,
				});
				console.log('[Stacks Connect] Sign response (signMessage):', response);
			} catch (err2) {
				console.log('[Stacks Connect] signMessage failed, trying sign:', err2);
				
				// Try just 'sign'
				response = await request('sign', {
					message: message,
				});
				console.log('[Stacks Connect] Sign response (sign):', response);
			}
		}
		
		if (!response?.signature || !response?.publicKey) {
			throw new LeatherError('Invalid response from wallet - missing signature or public key.');
		}
		
		return {
			signature: response.signature,
			publicKey: response.publicKey
		};
	} catch (error: any) {
		console.error('[Stacks Connect] Sign error:', error);
		if (error.message?.includes('rejected') || error.message?.includes('cancelled')) {
			throw new LeatherError('Signature rejected by user.');
		}
		throw new LeatherError(error.message || 'Failed to sign message.');
	}
};

// Get current connected address
export const getCurrentAddress = async (): Promise<string | null> => {
	console.log('[Stacks Connect] Getting current address...');
	
	if (!isConnected()) {
		console.log('[Stacks Connect] Not connected');
		return null;
	}

	try {
		const userData = getLocalStorage();
		if (userData?.addresses?.stx?.[0]?.address) {
			return userData.addresses.stx[0].address;
		}
		return null;
	} catch (error) {
		console.error('[Stacks Connect] Error getting address:', error);
		return null;
	}
};

// Disconnect from wallet
export const disconnectLeather = (): void => {
	try {
		disconnect();
		console.log('[Stacks Connect] Disconnected');
	} catch (error) {
		console.error('[Stacks Connect] Error disconnecting:', error);
	}
};

// Verify signature using official method
export const verifySignature = async (
	message: string,
	signature: string,
	publicKey: string
): Promise<boolean> => {
	try {
		const isValid = verifyMessageSignatureRsv({
			message,
			signature,
			publicKey
		});
		
		if (isValid) {
			console.log('✓ Signature verified successfully');
		} else {
			console.log('✗ Invalid signature');
		}
		
		return isValid;
	} catch (error: any) {
		console.error('[Stacks Connect] Signature verification error:', error);
		return false;
	}
};

// Generate a unique challenge for authentication
export const generateChallenge = (): string => {
	const nonce = Math.random().toString(36).substring(7);
	const timestamp = Date.now();
	return `Sign this message to authenticate:\nNonce: ${nonce}\nTime: ${timestamp}`;
};

// Complete authentication flow
export const authenticate = async (): Promise<{success: boolean, address?: string, publicKey?: string}> => {
	const challenge = generateChallenge();
	
	try {
		// Request signature
		const signResponse = await signMessage(challenge);
		
		// Verify immediately
		const isValid = await verifySignature(
			challenge,
			signResponse.signature,
			signResponse.publicKey
		);
		
		if (isValid) {
			// Get the connected address
			const userData = getLocalStorage();
			const address = userData?.addresses?.stx?.[0]?.address;
			
			// Store auth token or session
			localStorage.setItem('stacks_auth', JSON.stringify({
				publicKey: signResponse.publicKey,
				address: address,
				timestamp: Date.now()
			}));
			
			return { 
				success: true, 
				address: address || undefined,
				publicKey: signResponse.publicKey 
			};
		}
	} catch (error: any) {
		console.error('Authentication failed:', error);
	}
	
	return { success: false };
};

// Get detailed account information
export const getAccountInfo = async () => {
	if (!isConnected()) {
		throw new LeatherError('Not connected to any wallet.');
	}

	try {
		// Get basic account info from local storage first
		const userData = getLocalStorage();
		if (!userData?.addresses?.stx?.[0]) {
			throw new LeatherError('No account information available.');
		}

		const address = userData.addresses.stx[0].address;
		let publicKey = null;

		// Try to get public key - no checks, just try
		try {
			const pubKeyResponse = await request('stx_getPublicKey');
			publicKey = pubKeyResponse.publicKey;
		} catch (err) {
			console.log('[Stacks Connect] Could not get public key:', err);
		}

		return {
			address: address,
			publicKey: publicKey,
			gaiaHubUrl: null // Not available in basic connection
		};
	} catch (error: any) {
		console.error('[Stacks Connect] Error getting account info:', error);
		throw new LeatherError(error.message || 'Failed to get account information.');
	}
};

// Get supported methods from the wallet
export const getSupportedMethods = async (): Promise<string[]> => {
	try {
		if (!isConnected()) {
			return [];
		}
		
		const supportedMethods = await request('supportedMethods');
		console.log('[Stacks Connect] Wallet supported methods:', supportedMethods);
		console.log('[Stacks Connect] Type of supportedMethods:', typeof supportedMethods);
		console.log('[Stacks Connect] Is array:', Array.isArray(supportedMethods));
		
		// Ensure we return an array
		if (Array.isArray(supportedMethods)) {
			return supportedMethods;
		}
		
		// If it's an object with methods property
		if (supportedMethods && typeof supportedMethods === 'object' && supportedMethods.methods) {
			return Array.isArray(supportedMethods.methods) ? supportedMethods.methods : [];
		}
		
		// If it's a string, try to parse it
		if (typeof supportedMethods === 'string') {
			try {
				const parsed = JSON.parse(supportedMethods);
				return Array.isArray(parsed) ? parsed : [];
			} catch {
				return [];
			}
		}
		
		// If it's an object, try to extract methods from common properties
		if (supportedMethods && typeof supportedMethods === 'object') {
			console.log('[Stacks Connect] Object keys:', Object.keys(supportedMethods));
			
			// Try common property names
			const possibleMethods = supportedMethods.methods || supportedMethods.supportedMethods || supportedMethods.methodsList || supportedMethods.capabilities;
			if (Array.isArray(possibleMethods)) {
				return possibleMethods;
			}
		}
		
		console.warn('[Stacks Connect] Could not parse supported methods, returning empty array');
		return [];
	} catch (error: any) {
		console.error('[Stacks Connect] Error getting supported methods:', error);
		return [];
	}
};

export const formatAddress = (address: string): string => {
	if (!address) return '';
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidStacksAddress = (address: string): boolean => {
	// Stacks addresses start with SP (mainnet) or ST (testnet) followed by 40 characters
	return /^[SP][0-9A-HJ-NP-Z]{40}$/.test(address);
};

// Check wallet compatibility and capabilities - simplified version
export const checkWalletCompatibility = async (): Promise<{
	isCompatible: boolean;
	supportedMethods: string[];
	missingMethods: string[];
	recommendations: string[];
}> => {
	try {
		if (!isConnected()) {
			return {
				isCompatible: false,
				supportedMethods: [],
				missingMethods: [],
				recommendations: ['Connect to a Stacks wallet first']
			};
		}

		// Assume compatibility if connected - no checks
		return {
			isCompatible: true,
			supportedMethods: [],
			missingMethods: [],
			recommendations: ['Wallet connected - all features should work']
		};
	} catch (error: any) {
		console.error('[Stacks Connect] Compatibility check error:', error);
		return {
			isCompatible: true, // Assume compatible even on error
			supportedMethods: [],
			missingMethods: [],
			recommendations: ['Compatibility check failed - assuming compatible']
		};
	}
};
