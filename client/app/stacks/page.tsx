'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { isLeatherInstalled, getCurrentAddress, formatAddress, connectLeather } from '@/lib/leather';
import { LeatherAuthButton } from '@/components/LeatherAuthButton';

export default function StacksPage() {
	const [isConnected, setIsConnected] = useState(false);
	const [address, setAddress] = useState<string | null>(null);
	const [isChecking, setIsChecking] = useState(true);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		checkConnection();
	}, []);

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

	const handleConnect = async () => {
		try {
			const newAddress = await connectLeather();
			setAddress(newAddress);
			setIsConnected(true);
		} catch (error) {
			console.error('Error connecting to Leather:', error);
		}
	};

	const handleCopyAddress = async () => {
		if (address) {
			await navigator.clipboard.writeText(address);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleAuthSuccess = () => {
		// Refresh the page to update auth state
		window.location.reload();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-lime-900 to-blue-900">
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold text-white mb-4">
							Stacks Wallet Integration
						</h1>
						<p className="text-xl text-gray-300">
							Connect your Leather wallet to access Stacks blockchain features
						</p>
					</div>

					{/* Main Content */}
					<div className="grid md:grid-cols-2 gap-8">
						{/* Connection Status */}
						<div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
							<h2 className="text-2xl font-bold text-white mb-6 flex items-center">
								<Wallet className="w-6 h-6 mr-3 text-blue-400" />
								Connection Status
							</h2>

							{isChecking ? (
								<div className="flex items-center space-x-3 text-gray-400">
									<div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
									<span>Checking connection...</span>
								</div>
							) : isConnected ? (
								<div className="space-y-4">
									<div className="flex items-center space-x-3 text-green-400">
										<CheckCircle className="w-6 h-6" />
										<span className="text-lg font-semibold">Connected to Stacks</span>
									</div>
									
									{address && (
										<div className="bg-gray-700/50 rounded-md p-4">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm text-gray-400 mb-1">Stacks Address</p>
													<p className="font-mono text-white">{formatAddress(address)}</p>
												</div>
												<button
													onClick={handleCopyAddress}
													className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
												>
													<Copy className="w-4 h-4" />
													<span>{copied ? 'Copied!' : 'Copy'}</span>
												</button>
											</div>
										</div>
									)}

									<div className="pt-4">
										<LeatherAuthButton 
											onSuccess={handleAuthSuccess}
											variant="full"
										/>
									</div>
								</div>
							) : (
								<div className="space-y-6">
									<div className="flex items-center space-x-3 text-orange-400">
										<AlertCircle className="w-6 h-6" />
										<span className="text-lg font-semibold">Not Connected</span>
									</div>
									
									<p className="text-gray-400">
										Connect your Leather wallet to access Stacks blockchain features and authenticate with your Stacks address.
									</p>

									<button
										onClick={handleConnect}
										className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-md font-semibold transition-all shadow-lg hover:shadow-xl"
									>
										<Wallet className="w-5 h-5" />
										<span>Connect Leather Wallet</span>
									</button>
								</div>
							)}
						</div>

						{/* Features */}
						<div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
							<h2 className="text-2xl font-bold text-white mb-6">
								Stacks Features
							</h2>

							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
									<div>
										<h3 className="text-white font-semibold">Secure Authentication</h3>
										<p className="text-gray-400 text-sm">
											Sign in using your Stacks address with cryptographic signatures
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
									<div>
										<h3 className="text-white font-semibold">Blockchain Integration</h3>
										<p className="text-gray-400 text-sm">
											Access Stacks blockchain features and smart contracts
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
									<div>
										<h3 className="text-white font-semibold">NFT Support</h3>
										<p className="text-gray-400 text-sm">
											Manage and interact with Stacks NFTs
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-3">
									<CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
									<div>
										<h3 className="text-white font-semibold">DeFi Access</h3>
										<p className="text-gray-400 text-sm">
											Connect to Stacks DeFi protocols and applications
										</p>
									</div>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-gray-700">
								<a
									href="https://leather.io/"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
								>
									<span>Get Leather Wallet</span>
									<ExternalLink className="w-4 h-4" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
