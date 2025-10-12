'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { AuthDialog } from './AuthDialog';

export function HeaderAuthButton() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<>
			<Button
				size="sm"
				onClick={() => setIsDialogOpen(true)}
				className="text-sm"
			>
				Sign In
			</Button>
			<AuthDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
		</>
	);
}

