interface MetaMaskWindow extends Window {
	ethereum?: {
		isMetaMask?: boolean;
		request?: (request: { method: string; params?: any[] }) => Promise<any>;
		on?: (eventName: string, handler: (accounts: string[]) => void) => void;
		removeListener?: (eventName: string, handler: (accounts: string[]) => void) => void;
	};
}

declare const window: MetaMaskWindow;

export class MetaMaskError extends Error {
	constructor(message: string, public code?: number) {
		super(message);
		this.name = 'MetaMaskError';
	}
}

export const isMetaMaskInstalled = (): boolean => {
	const result = typeof window !== 'undefined' && 
		   typeof window.ethereum !== 'undefined' && 
		   Boolean(window.ethereum.isMetaMask);
	console.log('[MetaMask] Detection:', { 
		hasWindow: typeof window !== 'undefined',
		hasEthereum: typeof window?.ethereum !== 'undefined',
		isMetaMask: Boolean(window?.ethereum?.isMetaMask),
		result 
	});
	return result;
};

export const connectMetaMask = async (): Promise<string[]> => {
	console.log('[MetaMask] Starting connection...');
	
	if (!isMetaMaskInstalled()) {
		throw new MetaMaskError('MetaMask is not installed. Please install MetaMask browser extension.');
	}

	console.log('[MetaMask] MetaMask detected, requesting accounts...');

	try {
		const accounts = await window.ethereum!.request!({
			method: 'eth_requestAccounts',
		});
		
		console.log('[MetaMask] Received accounts:', accounts);
		
		if (!accounts || accounts.length === 0) {
			throw new MetaMaskError('No accounts found. Please unlock MetaMask and try again.');
		}

		console.log('[MetaMask] Connection successful, account:', accounts[0]);
		return accounts;
	} catch (error: any) {
		console.error('[MetaMask] Connection error:', error);
		if (error.code === 4001) {
			throw new MetaMaskError('Connection rejected by user.');
		}
		throw new MetaMaskError(error.message || 'Failed to connect to MetaMask.');
	}
};

export const getAccounts = async (): Promise<string[]> => {
	console.log('[MetaMask] Getting accounts...');
	
	if (!isMetaMaskInstalled()) {
		console.log('[MetaMask] Not installed, returning empty array');
		return [];
	}

	try {
		const accounts = await window.ethereum!.request!({
			method: 'eth_accounts',
		});
		console.log('[MetaMask] Got accounts:', accounts);
		return accounts || [];
	} catch (error) {
		console.error('[MetaMask] Error getting accounts:', error);
		return [];
	}
};

export const signMessage = async (account: string, message: string): Promise<string> => {
	if (!isMetaMaskInstalled()) {
		throw new MetaMaskError('MetaMask is not installed.');
	}

	try {
		const signature = await window.ethereum!.request!({
			method: 'personal_sign',
			params: [message, account],
		});
		return signature;
	} catch (error: any) {
		if (error.code === 4001) {
			throw new MetaMaskError('Signature rejected by user.');
		}
		throw new MetaMaskError(error.message || 'Failed to sign message.');
	}
};

export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
	if (!isMetaMaskInstalled() || !window.ethereum!.on) {
		return () => {};
	}

	window.ethereum!.on!('accountsChanged', callback);
	
	return () => {
		if (window.ethereum!.removeListener) {
			window.ethereum!.removeListener!('accountsChanged', callback);
		}
	};
};

export const formatAddress = (address: string): string => {
	if (!address) return '';
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidAddress = (address: string): boolean => {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
};
