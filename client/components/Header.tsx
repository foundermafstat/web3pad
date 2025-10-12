import { auth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from './UserMenu';
import { HeaderAuthButton } from './HeaderAuthButton';

export async function Header() {
	const session = await auth();

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-10 md:h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
					<Image
						src="/logo-osg.jpg"
						alt="OSG"
						width={28}
						height={28}
						className="rounded-md md:w-8 md:h-8"
						priority
					/>
					<span className="hidden sm:inline-block font-semibold text-base md:text-lg">OSG</span>
				</Link>

				{/* Navigation */}
				<nav className="flex items-center gap-4 md:gap-6 flex-1 justify-center">
					<Link
						href="/leaderboard"
						className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Leaderboard
					</Link>
				</nav>

				{/* Auth section */}
				<div className="flex items-center gap-2">
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

