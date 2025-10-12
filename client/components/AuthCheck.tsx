'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AuthModal from './AuthModal';

interface AuthCheckProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

/**
 * Wrapper component that checks authentication
 * Shows AuthModal if user is not authenticated
 */
export default function AuthCheck({ children, fallback }: AuthCheckProps) {
	const { data: session, status } = useSession();
	const [showAuthModal, setShowAuthModal] = useState(false);

	useEffect(() => {
		if (status === 'unauthenticated') {
			setShowAuthModal(true);
		}
	}, [status]);

	const handleAuthSuccess = () => {
		setShowAuthModal(false);
	};

	if (status === 'loading') {
		return fallback || (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
					<div className="text-white text-2xl font-medium">
						Loading...
					</div>
				</div>
			</div>
		);
	}

	if (status === 'unauthenticated') {
		return (
			<>
				<AuthModal
					isOpen={showAuthModal}
					onClose={() => {}} // Cannot close without auth
					onSuccess={handleAuthSuccess}
				/>
				<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
					<div className="text-center text-white">
						<p className="text-xl mb-4">Please sign in to continue</p>
					</div>
				</div>
			</>
		);
	}

	return <>{children}</>;
}

