'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserMenu } from './UserMenu';
import { HeaderAuthButton } from './HeaderAuthButton';
import { ThemeLogo } from './ThemeLogo';
import { MobileNavigation } from './MobileNavigation';
import { DesktopNavigation } from './DesktopNavigation';
import { useLoading } from '@/contexts/LoadingContext';

export function Header() {
	const { data: session } = useSession();
	const { isLoading } = useLoading();

	return (
		<header className="fixed top-0 z-50 w-full bg-gradient-to-b from-background/50 to-transparent">
			<div className="relative h-10 md:h-16 flex items-center px-4">
				{/* Logo */}
				<Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
					<ThemeLogo
						width={78}
						height={52}
						className="object-contain"
						isLoading={isLoading}
						loadingColor="#000000"
						loadedColor="#ffffff"
					/>
				</Link>

				{/* Navigation Menu - Centered */}
				<div className="absolute left-1/2 transform -translate-x-1/2">
					<DesktopNavigation />
				</div>

				{/* Mobile Navigation */}
				<div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
					<MobileNavigation />
				</div>

				{/* Auth section */}
				<div className="ml-auto flex items-center gap-4">
					{session?.user ? (
						<UserMenu user={session.user} />
					) : (
						<HeaderAuthButton />
					)}
				</div>
			</div>
		</header>
	);
}

