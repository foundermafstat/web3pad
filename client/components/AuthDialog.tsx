'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { StacksWalletAuth } from './auth/StacksWalletAuth';
import { useWalletCheck } from '@/hooks/useWalletCheck';
import { formatAddress } from '@/lib/leather';

interface AuthDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
	const [error, setError] = useState('');
	const { walletInfo, isChecking } = useWalletCheck();

	const handleSuccess = () => {
		onOpenChange(false);
		setError('');
		router.refresh();
	};

	const handleError = (errorMessage: string) => {
		setError(errorMessage);
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value as 'signin' | 'signup');
		setError('');
	};

	const handleWeb3Success = () => {
		onOpenChange(false);
		setError('');
		router.refresh();
	};

	const handleWeb3Error = (errorMessage: string) => {
		setError(errorMessage);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-center text-2xl">
						{activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
					</DialogTitle>
				</DialogHeader>

				<div className="pt-2">
					{/* Error Message */}
					{error && (
						<div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
							{error}
						</div>
					)}

					{/* Web3 Wallet Section */}
					{!isChecking && walletInfo.isConnected && (
						<div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
							<div className="text-center">
								<div className="flex items-center justify-center mb-2">
									<svg className="w-5 h-5 text-purple-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
										<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
									</svg>
									<span className="text-sm font-medium text-purple-800">
										Leather кошелек подключен
									</span>
								</div>
								<p className="text-xs text-purple-600 mb-3">
									{formatAddress(walletInfo.address!)}
								</p>
								<StacksWalletAuth 
									onSuccess={handleWeb3Success}
									onError={handleWeb3Error}
								/>
							</div>
						</div>
					)}

					{/* Divider */}
					{!isChecking && walletInfo.isConnected && (
						<div className="relative mb-6">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">или</span>
							</div>
						</div>
					)}

					{/* Tabs */}
					<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
						<TabsList className="grid w-full grid-cols-2 mb-6">
							<TabsTrigger value="signin">Sign In</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>

						<TabsContent value="signin">
							<SignInForm onSuccess={handleSuccess} onError={handleError} />
						</TabsContent>

						<TabsContent value="signup">
							<SignUpForm onSuccess={handleSuccess} onError={handleError} />
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}

