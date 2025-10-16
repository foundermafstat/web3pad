import { auth } from '@/lib/auth';
import Link from 'next/link';
import { UserMenu } from './UserMenu';
import { HeaderAuthButton } from './HeaderAuthButton';
import { ThemeLogo } from './ThemeLogo';
import { MobileNavigation } from './MobileNavigation';
import { DesktopNavigation } from './DesktopNavigation';

export async function Header() {
	const session = await auth();

	return (
		<header className=" fixed top-0 z-50 w-full">
			<div className="mx-auto h-10 md:h-16 flex items-center justify-between px-4">
				{/* Logo */}
				<Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
					<ThemeLogo
						width={78}
						height={52}
						className="object-contain"
					/>
				</Link>

				{/* Navigation Menu */}
				<DesktopNavigation />

				{/* Mobile Navigation */}
				<div className="md:hidden">
					<MobileNavigation />
				</div>

				{/* Auth section */}
				<div className="flex items-center gap-4">
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

