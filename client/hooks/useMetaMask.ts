'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
	isMetaMaskInstalled, 
	connectMetaMask, 
	getAccounts, 
	signMessage, 
	onAccountsChanged,
	MetaMaskError 
} from '@/lib/metamask';

interface UseMetaMaskReturn {
	isInstalled: boolean;
	isConnecting: boolean;
	isConnected: boolean;
	account: string | null;
	error: string | null;
	connect: () => Promise<void>;
	disconnect: () => void;
	signMessage: (message: string) => Promise<string>;
	clearError: () => void;
}

export const useMetaMask = (): UseMetaMaskReturn => {
	const [isConnecting, setIsConnecting] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [account, setAccount] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isInstalled, setIsInstalled] = useState(false);

	// Check if MetaMask is installed
	useEffect(() => {
		console.log('[useMetaMask] Checking MetaMask installation...');
		const installed = isMetaMaskInstalled();
		console.log('[useMetaMask] MetaMask installed:', installed);
		setIsInstalled(installed);
	}, []);

	// Check if already connected on mount
	useEffect(() => {
		const checkConnection = async () => {
			console.log('[useMetaMask] Checking existing connection, isInstalled:', isInstalled);
			
			if (!isInstalled) {
				console.log('[useMetaMask] Not installed, skipping connection check');
				return;
			}

			try {
				console.log('[useMetaMask] Getting existing accounts...');
				const accounts = await getAccounts();
				console.log('[useMetaMask] Existing accounts found:', accounts);
				
				if (accounts.length > 0) {
					setAccount(accounts[0]);
					setIsConnected(true);
					console.log('[useMetaMask] Auto-connected to existing account:', accounts[0]);
				} else {
					console.log('[useMetaMask] No existing accounts found');
				}
			} catch (error) {
				console.error('[useMetaMask] Error checking connection:', error);
			}
		};

		checkConnection();
	}, [isInstalled]);

	// Listen for account changes
	useEffect(() => {
		if (!isInstalled) return;

		const handleAccountsChanged = (accounts: string[]) => {
			if (accounts.length === 0) {
				setAccount(null);
				setIsConnected(false);
			} else if (accounts[0] !== account) {
				setAccount(accounts[0]);
				setIsConnected(true);
			}
		};

		const removeListener = onAccountsChanged(handleAccountsChanged);
		
		return removeListener;
	}, [isInstalled, account]);

	const connect = useCallback(async () => {
		console.log('[useMetaMask] Connect called, isInstalled:', isInstalled);
		
		if (!isInstalled) {
			const errorMsg = 'MetaMask is not installed. Please install MetaMask browser extension.';
			console.error('[useMetaMask]', errorMsg);
			setError(errorMsg);
			return;
		}

		setIsConnecting(true);
		setError(null);
		console.log('[useMetaMask] Starting connection process...');

		try {
			const accounts = await connectMetaMask();
			console.log('[useMetaMask] Got accounts from connectMetaMask:', accounts);
			
			setAccount(accounts[0]);
			setIsConnected(true);
			console.log('[useMetaMask] State updated - connected with account:', accounts[0]);
		} catch (error) {
			console.error('[useMetaMask] Connect error:', error);
			if (error instanceof MetaMaskError) {
				setError(error.message);
			} else {
				setError('Failed to connect to MetaMask');
			}
		} finally {
			setIsConnecting(false);
			console.log('[useMetaMask] Connection process finished');
		}
	}, [isInstalled]);

	const disconnect = useCallback(() => {
		setAccount(null);
		setIsConnected(false);
		setError(null);
	}, []);

	const sign = useCallback(async (message: string): Promise<string> => {
		if (!account) {
			throw new Error('No account connected');
		}

		setError(null);
		try {
			return await signMessage(account, message);
		} catch (error) {
			if (error instanceof MetaMaskError) {
				setError(error.message);
				throw error;
			} else {
				const errorMsg = 'Failed to sign message';
				setError(errorMsg);
				throw new Error(errorMsg);
			}
		}
	}, [account]);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		isInstalled,
		isConnecting,
		isConnected,
		account,
		error,
		connect,
		disconnect,
		signMessage: sign,
		clearError,
	};
};
