'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { connectLeather, signMessage, isLeatherInstalled, LeatherError, getCurrentAddress, disconnectLeather, getAccountInfo } from '@/lib/leather';

export function StacksConnectTest() {
	const [isConnected, setIsConnected] = useState(false);
	const [address, setAddress] = useState<string | null>(null);
	const [accountInfo, setAccountInfo] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [walletDetected, setWalletDetected] = useState(false);

	useEffect(() => {
		setIsMounted(true);
		setWalletDetected(isLeatherInstalled());
		checkConnection();
	}, []);

	const checkConnection = async () => {
		try {
			const currentAddress = await getCurrentAddress();
			if (currentAddress) {
				setAddress(currentAddress);
				setIsConnected(true);
				try {
					const info = await getAccountInfo();
					setAccountInfo(info);
				} catch (err) {
					console.log('Could not get account info:', err);
				}
			} else {
				setIsConnected(false);
				setAddress(null);
				setAccountInfo(null);
			}
		} catch (err) {
			console.error('Error checking connection:', err);
			setIsConnected(false);
		}
	};

	const handleConnect = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const newAddress = await connectLeather();
			setAddress(newAddress);
			setIsConnected(true);
			
			// Try to get account info
			try {
				const info = await getAccountInfo();
				setAccountInfo(info);
			} catch (err) {
				console.log('Could not get account info:', err);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnect = () => {
		disconnectLeather();
		setIsConnected(false);
		setAddress(null);
		setAccountInfo(null);
	};

	const handleSignMessage = async () => {
		if (!address) return;

		setIsLoading(true);
		setError(null);

		try {
			const message = `Test message from OSG Platform\nTimestamp: ${Date.now()}`;
			const signature = await signMessage(message);
			console.log('Message signed:', signature);
			alert('Message signed successfully! Check console for signature.');
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Stacks Connect Test</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Wallet Detection */}
				<div className="p-4 border rounded-lg">
					<h3 className="font-semibold mb-2">Wallet Detection</h3>
					{isMounted ? (
						<>
							<p className="text-sm text-muted-foreground">
								{walletDetected ? '✅ Stacks wallet detected' : '❌ No Stacks wallet found'}
							</p>
							<div className="mt-2 text-xs text-muted-foreground">
								<p>Check browser console for detailed wallet detection info</p>
								<p>Supported wallets: Leather, Hiro, Xverse</p>
							</div>
						</>
					) : (
						<p className="text-sm text-muted-foreground">Loading...</p>
					)}
				</div>

				{/* Connection Status */}
				<div className="p-4 border rounded-lg">
					<h3 className="font-semibold mb-2">Connection Status</h3>
					<p className="text-sm">
						{isConnected ? (
							<span className="text-green-600">✅ Connected</span>
						) : (
							<span className="text-red-600">❌ Not Connected</span>
						)}
					</p>
					{address && (
						<p className="text-xs text-muted-foreground font-mono mt-1">
							Address: {address}
						</p>
					)}
				</div>

				{/* Account Info */}
				{accountInfo && (
					<div className="p-4 border rounded-lg">
						<h3 className="font-semibold mb-2">Account Information</h3>
						<div className="text-xs space-y-1">
							<p><strong>Address:</strong> {accountInfo.address}</p>
							<p><strong>Public Key:</strong> {accountInfo.publicKey?.slice(0, 20)}...</p>
							{accountInfo.gaiaHubUrl && (
								<p><strong>Gaia Hub:</strong> {accountInfo.gaiaHubUrl}</p>
							)}
						</div>
					</div>
				)}

				{/* Error Display */}
				{error && (
					<div className="p-4 border border-red-200 bg-red-50 rounded-lg">
						<h3 className="font-semibold text-red-800 mb-2">Error</h3>
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex flex-wrap gap-2">
					{!isConnected ? (
						<>
							<Button 
								onClick={handleConnect} 
								disabled={isLoading}
								className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400"
							>
								{isLoading ? 'Connecting...' : 'Connect Wallet'}
							</Button>
							{!walletDetected && isMounted && (
								<Button 
									onClick={handleConnect} 
									disabled={isLoading}
									variant="outline"
									className="border-orange-200 text-orange-600 hover:bg-orange-50"
								>
									{isLoading ? 'Connecting...' : 'Force Connect'}
								</Button>
							)}
						</>
					) : (
						<>
							<Button 
								onClick={handleSignMessage} 
								disabled={isLoading}
								variant="outline"
							>
								{isLoading ? 'Signing...' : 'Sign Test Message'}
							</Button>
							<Button 
								onClick={handleDisconnect} 
								variant="destructive"
							>
								Disconnect
							</Button>
						</>
					)}
					<Button 
						onClick={checkConnection} 
						variant="outline"
						disabled={isLoading}
					>
						Refresh Status
					</Button>
				</div>

				{/* Instructions */}
				<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
					<ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
						<li>Make sure you have Leather or Hiro wallet installed</li>
						<li>Click "Connect Wallet" to initiate connection</li>
						<li>Approve the connection in your wallet</li>
						<li>Try signing a test message</li>
						<li>Use "Disconnect" to clear the connection</li>
					</ol>
				</div>
			</CardContent>
		</Card>
	);
}
