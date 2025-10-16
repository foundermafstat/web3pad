import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';

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

// Connect to Stacks wallet using @stacks/connect
export const connectLeather = async (): Promise<string> => {
	console.log('[Stacks Connect] Starting connection...');
	
	// Try to detect wallet even if isLeatherInstalled returns false
	const walletDetected = isLeatherInstalled();
	console.log('[Stacks Connect] Wallet detection result:', walletDetected);

	try {
		// Check if already connected
		if (isConnected()) {
			const userData = getLocalStorage();
			if (userData?.addresses?.stx?.[0]?.address) {
				console.log('[Stacks Connect] Already connected:', userData.addresses.stx[0].address);
				return userData.addresses.stx[0].address;
			}
		}

		// Connect to wallet - try even if detection failed
		const response = await connect({
			appDetails: {
				name: 'OSG Game Platform',
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
		
		// If connection fails and no wallet was detected, provide helpful error
		if (!walletDetected) {
			throw new LeatherError('No Stacks wallet found. Please install Leather, Hiro, or Xverse wallet and try again.');
		}
		
		throw new LeatherError(error.message || 'Failed to connect to Stacks wallet.');
	}
};

// Sign message using @stacks/connect
export const signMessage = async (message: string): Promise<string> => {
	if (!isConnected()) {
		throw new LeatherError('Not connected to any wallet. Please connect first.');
	}

	try {
		const userData = getLocalStorage();
		if (!userData?.addresses?.stx?.[0]?.address) {
			throw new LeatherError('No connected address found.');
		}

		const address = userData.addresses.stx[0].address;
		
		// Request message signing
		const response = await request('stx_signMessage', {
			message: message,
			address: address,
		});
		
		console.log('[Stacks Connect] Sign response:', response);
		return response.signature;
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

// Get detailed account information
export const getAccountInfo = async () => {
	if (!isConnected()) {
		throw new LeatherError('Not connected to any wallet.');
	}

	try {
		const accounts = await request('stx_getAccounts');
		const account = accounts.addresses[0];
		
		return {
			address: account.address,
			publicKey: account.publicKey,
			gaiaHubUrl: account.gaiaHubUrl,
		};
	} catch (error: any) {
		console.error('[Stacks Connect] Error getting account info:', error);
		throw new LeatherError(error.message || 'Failed to get account information.');
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
