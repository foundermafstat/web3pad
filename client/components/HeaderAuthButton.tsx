'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { AuthDialog } from './AuthDialog';
import { StacksWalletAuth } from './auth/StacksWalletAuth';

export function HeaderAuthButton() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isWalletAuthOpen, setIsWalletAuthOpen] = useState(false);

	const handleWalletSuccess = () => {
		// Refresh the page to update auth state
		window.location.reload();
	};

	const handleWalletError = (error: string) => {
		console.error('Wallet auth error:', error);
		// Optionally show error toast
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				size="sm"
				onClick={() => setIsWalletAuthOpen(true)}
				className="text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400"
			>
				Connect Wallet
			</Button>
			<Button
				size="sm"
				onClick={() => setIsDialogOpen(true)}
				variant="outline"
				className="text-sm"
			>
				Sign In
			</Button>
			
			<AuthDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
			
			{isWalletAuthOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
						<StacksWalletAuth 
							onSuccess={handleWalletSuccess}
							onError={handleWalletError}
							className="border-0 shadow-none"
						/>
						<div className="p-4 border-t">
							<Button 
								variant="outline" 
								onClick={() => setIsWalletAuthOpen(false)}
								className="w-full"
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

