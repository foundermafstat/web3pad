'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, User, Mail, Shield } from 'lucide-react';
import { WalletConnection } from '../WalletConnection';

interface SettingsTabProps {
	user: {
		id: string;
		username: string;
		displayName: string;
		avatar?: string;
		walletAddress?: string | null;
	};
}

export function SettingsTab({ user }: SettingsTabProps) {
	const [displayName, setDisplayName] = useState(user.displayName);
	const [loading, setLoading] = useState(false);
	const [walletAddress, setWalletAddress] = useState(user.walletAddress);

	const handleSave = async () => {
		setLoading(true);
		// TODO: Implement save functionality
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setLoading(false);
	};

	const handleWalletConnect = async (address: string) => {
		try {
			const response = await fetch('/api/profile/wallet', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ walletAddress: address }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to connect wallet');
			}

			const data = await response.json();
			setWalletAddress(data.user.walletAddress);
		} catch (error) {
			console.error('Error connecting wallet:', error);
			throw error; // Re-throw to let the component handle the error
		}
	};

	const handleWalletDisconnect = async () => {
		try {
			const response = await fetch('/api/profile/wallet', {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to disconnect wallet');
			}

			setWalletAddress(null);
		} catch (error) {
			console.error('Error disconnecting wallet:', error);
			throw error; // Re-throw to let the component handle the error
		}
	};

	return (
		<div className="max-w-2xl space-y-6">
			<div className="bg-card border border-border rounded-lg p-6">
				<h3 className="text-lg font-bold mb-4 flex items-center gap-2">
					<User className="w-5 h-5" />
					Profile Settings
				</h3>

				<div className="space-y-4">
					{/* Avatar Upload */}
					<div>
						<label className="block text-sm font-medium mb-2">Avatar</label>
						<div className="flex items-center gap-4">
							{user.avatar ? (
								<img
									src={user.avatar}
									alt="Avatar"
									className="w-20 h-20 rounded-full object-cover"
								/>
							) : (
								<div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
									{user.displayName[0].toUpperCase()}
								</div>
							)}
							<Button variant="outline" size="sm">
								<Upload className="w-4 h-4 mr-2" />
								Upload New Avatar
							</Button>
						</div>
					</div>

					{/* Display Name */}
					<div>
						<label htmlFor="displayName" className="block text-sm font-medium mb-2">
							Display Name
						</label>
						<input
							id="displayName"
							type="text"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						/>
					</div>

					{/* Username (read-only) */}
					<div>
						<label className="block text-sm font-medium mb-2">Username</label>
						<input
							type="text"
							value={user.username}
							disabled
							className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Username cannot be changed
						</p>
					</div>
				</div>
			</div>

			{/* Account Settings */}
			<div className="bg-card border border-border rounded-lg p-6">
				<h3 className="text-lg font-bold mb-4 flex items-center gap-2">
					<Shield className="w-5 h-5" />
					Account Settings
				</h3>

				<div className="space-y-4">
					<Button variant="outline" className="w-full">
						<Mail className="w-4 h-4 mr-2" />
						Change Email
					</Button>
					<Button variant="outline" className="w-full">
						<Shield className="w-4 h-4 mr-2" />
						Change Password
					</Button>
				</div>
			</div>

			{/* Crypto Wallet Section */}
			<WalletConnection
				currentWalletAddress={walletAddress}
				onWalletConnect={handleWalletConnect}
				onWalletDisconnect={handleWalletDisconnect}
			/>

			{/* Save Button */}
			<Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
				{loading ? 'Saving...' : 'Save Changes'}
			</Button>
		</div>
	);
}

