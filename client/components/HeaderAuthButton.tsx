'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { AuthDialog } from './AuthDialog';

export function HeaderAuthButton() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<div className="flex items-center gap-2">
			<Button
				onClick={() => setIsDialogOpen(true)}
				className="px-6 py-2 text-base font-medium bg-background hover:bg-background/90 text-primary"
			>
				Sign In
			</Button>
			
			<AuthDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
		</div>
	);
}

