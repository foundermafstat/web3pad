'use client';

import { useState, useEffect } from 'react';
import { isLeatherInstalled, getCurrentAddress } from '@/lib/leather';

export interface WalletInfo {
	type: 'leather' | null;
	address: string | null;
	isConnected: boolean;
}

export function useWalletCheck() {
	const [walletInfo, setWalletInfo] = useState<WalletInfo>({
		type: null,
		address: null,
		isConnected: false,
	});
	const [isChecking, setIsChecking] = useState(true);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		
		const checkWallets = async () => {
			if (!isMounted) return;
			setIsChecking(true);
			
			try {
				// Check Stacks wallet
				if (isLeatherInstalled()) {
					const address = await getCurrentAddress();
					if (address) {
						setWalletInfo({
							type: 'leather',
							address,
							isConnected: true,
						});
						setIsChecking(false);
						return;
					}
				}

				// No wallet connected
				setWalletInfo({
					type: null,
					address: null,
					isConnected: false,
				});
			} catch (error) {
				console.error('Error checking wallets:', error);
				setWalletInfo({
					type: null,
					address: null,
					isConnected: false,
				});
			} finally {
				setIsChecking(false);
			}
		};

		checkWallets();
	}, []);

	// Don't check wallets on server side
	if (!isMounted) {
		return {
			walletInfo: { type: null, address: null, isConnected: false },
			isChecking: true,
			checkWallets: () => {},
		};
	}

	return {
		walletInfo,
		isChecking,
		checkWallets: () => {}, // Placeholder function
	};
}
