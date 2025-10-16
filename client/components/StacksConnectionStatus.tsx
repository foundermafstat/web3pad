'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { isLeatherInstalled, getCurrentAddress, formatAddress } from '@/lib/leather';

interface StacksConnectionStatusProps {
	onConnect?: () => void;
	className?: string;
}

export function StacksConnectionStatus({ onConnect, className = '' }: StacksConnectionStatusProps) {
	const [isConnected, setIsConnected] = useState(false);
	const [address, setAddress] = useState<string | null>(null);
	const [isChecking, setIsChecking] = useState(true);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		
		const checkConnection = async () => {
			setIsChecking(true);
			
			try {
				if (isLeatherInstalled()) {
					const currentAddress = await getCurrentAddress();
					if (currentAddress) {
						setAddress(currentAddress);
						setIsConnected(true);
					} else {
						setIsConnected(false);
					}
				} else {
					setIsConnected(false);
				}
			} catch (error) {
				console.error('Error checking Stacks connection:', error);
				setIsConnected(false);
			} finally {
				setIsChecking(false);
			}
		};

		checkConnection();
	}, []);

	// Don't render anything on server side
	if (!isMounted) {
		return null;
	}

	if (isChecking) {
		return (
			<div className={`flex items-center space-x-2 text-gray-400 ${className}`}>
				<div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
				<span className="text-sm">Checking Stacks...</span>
			</div>
		);
	}

	if (isConnected && address) {
		return (
			<div className={`flex items-center space-x-2 text-green-400 ${className}`}>
				<CheckCircle className="w-4 h-4" />
				<div className="flex flex-col">
					<span className="text-sm font-medium">Stacks Connected</span>
					<span className="text-xs text-gray-400">{formatAddress(address)}</span>
				</div>
			</div>
		);
	}

	return (
		<div className={`flex items-center space-x-2 text-orange-400 ${className}`}>
			<AlertCircle className="w-4 h-4" />
			<div className="flex flex-col">
				<span className="text-sm">Stacks Not Connected</span>
				{onConnect && (
					<button
						onClick={onConnect}
						className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
					>
						<Wallet className="w-3 h-3" />
						<span>Connect Leather</span>
					</button>
				)}
			</div>
		</div>
	);
}
