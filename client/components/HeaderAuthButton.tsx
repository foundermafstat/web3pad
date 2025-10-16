'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { AuthDialog } from './AuthDialog';
import { Web3AuthButton } from './Web3AuthButton';

export function HeaderAuthButton() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleWeb3Success = () => {
		// Refresh the page to update auth state
		window.location.reload();
	};

	const handleWeb3Error = (error: string) => {
		console.error('Web3 auth error:', error);
		// Optionally show error toast
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				size="sm"
				onClick={() => setIsDialogOpen(true)}
				className="text-sm"
			>
				Sign In
			</Button>
			<Web3AuthButton 
				onSuccess={handleWeb3Success}
				onError={handleWeb3Error}
			/>
			<AuthDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
		</div>
	);
}

