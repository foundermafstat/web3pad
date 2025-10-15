'use client';

import React, { useState } from 'react';
import { useMetaMask } from '@/hooks/useMetaMask';
import { formatAddress } from '@/lib/metamask';
import { 
	Wallet, 
	ExternalLink, 
	CheckCircle2, 
	AlertCircle,
	Loader2,
	Unlink,
	Link as LinkIcon,
	Copy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WalletConnectionProps {
	currentWalletAddress?: string | null;
	onWalletConnect: (address: string) => Promise<void>;
	onWalletDisconnect: () => Promise<void>;
}

export function WalletConnection({ 
	currentWalletAddress, 
	onWalletConnect, 
	onWalletDisconnect 
}: WalletConnectionProps) {
	const { 
		isInstalled, 
		isConnecting, 
		isConnected, 
		account, 
		error, 
		connect, 
		clearError 
	} = useMetaMask();

	const [isLinking, setIsLinking] = useState(false);
	const [isUnlinking, setIsUnlinking] = useState(false);
	const [isCopied, setIsCopied] = useState(false);

	const handleConnectWallet = async () => {
		console.log('[WalletConnection] Connect wallet clicked, isInstalled:', isInstalled);
		
		if (!isInstalled) {
			console.log('[WalletConnection] MetaMask not installed, opening download page');
			window.open('https://metamask.io/download/', '_blank');
			return;
		}

		console.log('[WalletConnection] Clearing errors and calling connect...');
		console.log('[WalletConnection] MetaMask popup should appear now - check for popup blockers!');
		clearError();
		
		try {
			await connect();
			console.log('[WalletConnection] Connection successful!');
		} catch (error) {
			console.error('[WalletConnection] Connection failed:', error);
			// Error is already handled in useMetaMask hook
		}
	};

	const handleLinkWallet = async () => {
		if (!account) return;

		setIsLinking(true);
		try {
			await onWalletConnect(account);
		} catch (error) {
			console.error('Failed to link wallet:', error);
		} finally {
			setIsLinking(false);
		}
	};

	const handleUnlinkWallet = async () => {
		setIsUnlinking(true);
		try {
			await onWalletDisconnect();
		} catch (error) {
			console.error('Failed to unlink wallet:', error);
		} finally {
			setIsUnlinking(false);
		}
	};

	const handleCopyAddress = async () => {
		if (!currentWalletAddress) return;
		
		try {
			await navigator.clipboard.writeText(currentWalletAddress);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
		} catch (error) {
			console.error('Failed to copy address:', error);
		}
	};

	const isWalletLinked = Boolean(currentWalletAddress);
	const isCurrentWalletConnected = isConnected && account === currentWalletAddress;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Wallet className="w-5 h-5 text-primary" />
						<CardTitle>Crypto Wallet</CardTitle>
					</div>
					{isWalletLinked && isConnected ? (
						<Badge variant="outline" className="text-green-600">
							<CheckCircle2 className="w-3 h-3 mr-1" />
							Connected
						</Badge>
					) : isWalletLinked && !isConnected ? (
						<Badge variant="outline" className="text-amber-600">
							<AlertCircle className="w-3 h-3 mr-1" />
							Saved
						</Badge>
					) : null}
				</div>
				<CardDescription>
					Connect your MetaMask wallet to access Web3 features and secure authentication.
				</CardDescription>
			</CardHeader>
			
			<CardContent className="space-y-4">
				{/* Error Display */}
				{error && (
					<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
						<div className="flex items-center space-x-2">
							<AlertCircle className="w-4 h-4 text-destructive" />
							<p className="text-sm text-destructive">{error}</p>
						</div>
					</div>
				)}

				{/* Current Linked Wallet - shown only when wallet is connected AND address is in DB */}
				{isWalletLinked && isConnected && (
					<div className="bg-muted/50 rounded-lg p-4 space-y-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Linked Wallet</p>
								<p className="text-xs text-muted-foreground font-mono">
									{formatAddress(currentWalletAddress!)}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCopyAddress}
									className="text-muted-foreground hover:text-foreground"
									title={isCopied ? "Copied!" : "Copy address"}
								>
									{isCopied ? (
										<CheckCircle2 className="w-4 h-4 text-green-600" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</Button>
								<a
									href={`https://etherscan.io/address/${currentWalletAddress}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground"
								>
									<ExternalLink className="w-4 h-4" />
								</a>
								<Button
									variant="outline"
									size="sm"
									onClick={handleUnlinkWallet}
									disabled={isUnlinking}
								>
									{isUnlinking ? (
										<Loader2 className="w-3 h-3 animate-spin" />
									) : (
										<Unlink className="w-3 h-3" />
									)}
								</Button>
							</div>
						</div>
						
						{isCurrentWalletConnected && (
							<div className="flex items-center space-x-2 text-sm text-green-600">
								<CheckCircle2 className="w-4 h-4" />
								<span>Currently active in MetaMask</span>
							</div>
						)}
					</div>
				)}

				{/* Wallet saved in DB but MetaMask not connected */}
				{isWalletLinked && !isConnected && (
					<div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-amber-800 dark:text-amber-200">Wallet Saved (Not Connected)</p>
								<p className="text-xs text-amber-600 dark:text-amber-300 font-mono">
									{formatAddress(currentWalletAddress!)}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCopyAddress}
									className="text-amber-600 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-100"
									title={isCopied ? "Copied!" : "Copy address"}
								>
									{isCopied ? (
										<CheckCircle2 className="w-4 h-4 text-green-600" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</Button>
								<a
									href={`https://etherscan.io/address/${currentWalletAddress}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-amber-600 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-100"
								>
									<ExternalLink className="w-4 h-4" />
								</a>
								<Button
									variant="outline"
									size="sm"
									onClick={handleUnlinkWallet}
									disabled={isUnlinking}
									className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
								>
									{isUnlinking ? (
										<Loader2 className="w-3 h-3 animate-spin" />
									) : (
										<Unlink className="w-3 h-3" />
									)}
								</Button>
							</div>
						</div>
						<p className="text-xs text-amber-600 dark:text-amber-400">
							Connect MetaMask to use this wallet or link a different one.
						</p>
					</div>
				)}

				{/* MetaMask Connection Status */}
				<div className="space-y-3">
					{!isInstalled ? (
						<div className="text-center py-6">
							<Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
							<p className="text-sm text-muted-foreground mb-3">
								MetaMask is required to connect your crypto wallet
							</p>
							<Button onClick={handleConnectWallet}>
								<ExternalLink className="w-4 h-4 mr-2" />
								Install MetaMask
							</Button>
						</div>
					) : !isConnected ? (
						<div className="text-center py-4">
							<p className="text-sm text-muted-foreground mb-3">
								Connect MetaMask to link your wallet
							</p>
							<Button 
								onClick={handleConnectWallet}
								disabled={isConnecting}
							>
								{isConnecting ? (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<Wallet className="w-4 h-4 mr-2" />
								)}
								Connect MetaMask
							</Button>
							{isConnecting && (
								<p className="text-xs text-muted-foreground mt-3 animate-pulse">
									⚠️ Check MetaMask popup to approve connection
								</p>
							)}
						</div>
					) : (
						<div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 space-y-3">
							<div className="flex items-center space-x-2">
								<CheckCircle2 className="w-4 h-4 text-green-600" />
								<span className="text-sm font-medium">MetaMask Connected</span>
							</div>
							
							<div className="text-sm text-muted-foreground">
								<p>Account: <span className="font-mono">{formatAddress(account!)}</span></p>
							</div>

							{!isWalletLinked ? (
								<Button 
									onClick={handleLinkWallet} 
									disabled={isLinking}
									className="w-full"
								>
									{isLinking ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : (
										<LinkIcon className="w-4 h-4 mr-2" />
									)}
									Link This Wallet to Profile
								</Button>
							) : account !== currentWalletAddress ? (
								<div className="space-y-2">
									<p className="text-xs text-amber-600 dark:text-amber-400">
										This is a different wallet than the one linked to your profile.
									</p>
									<Button 
										onClick={handleLinkWallet} 
										disabled={isLinking}
										variant="outline"
										className="w-full"
									>
										{isLinking ? (
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										) : (
											<LinkIcon className="w-4 h-4 mr-2" />
										)}
										Update Linked Wallet
									</Button>
								</div>
							) : (
								<div className="text-sm text-green-600 dark:text-green-400">
									✓ This wallet is linked to your profile
								</div>
							)}
						</div>
					)}
				</div>

				{/* Info Section */}
				<div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
					<p className="mb-1">💡 <strong>Why connect a wallet?</strong></p>
					<ul className="space-y-1 ml-4 list-disc">
						<li>Secure Web3 authentication</li>
						<li>Access to exclusive features</li>
						<li>Enhanced security for your profile</li>
						<li>Future NFT and token rewards</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
