import { auth } from '@/lib/auth';
import Link from 'next/link';
import { UserMenu } from './UserMenu';
import { HeaderAuthButton } from './HeaderAuthButton';
import { ThemeLogo } from './ThemeLogo';
import { ThemeToggle } from './ThemeToggle';

export async function Header() {
	const session = await auth();

	return (
		<header className="sticky top-0 z-50 w-full glass-header">
			<div className="container mx-auto max-w-7xl h-10 md:h-16 flex items-center justify-between px-4">
				{/* Logo */}
				<Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
					<ThemeLogo
						width={90}
						height={30}
						className="object-contain"
					/>
				</Link>

				{/* Navigation */}
				<nav className="flex items-center gap-4 md:gap-6">
					<Link
						href="/leaderboard"
						className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Leaderboard
					</Link>
				</nav>

				{/* Auth section */}
				<div className="flex items-center gap-2">
					<ThemeToggle />
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

