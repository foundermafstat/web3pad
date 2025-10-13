import type { Metadata } from 'next';
import { Tektur } from 'next/font/google';
import './globals.css';

const tektur = Tektur({
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700', '800', '900'],
	variable: '--font-tektur',
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'W3P - Web3Pad',
	description:
		'Transform any screen into an instant multiplayer arena. Your phone becomes the controller. No downloads. No installations. Just scan and play.',
	keywords: [
		'multiplayer games',
		'mobile controller',
		'party games',
		'browser games',
		'QR code gaming',
		'instant gaming',
		'no download games',
	],
	authors: [{ name: 'W3P Team' }],
	icons: {
		icon: '/W3P-icon.jpg',
		shortcut: '/W3P-icon.jpg',
		apple: '/W3P-icon.jpg',
	},
	openGraph: {
		title: 'W3P - Web3Pad',
		description:
			'Turn any screen into an instant multiplayer arena. Your phone becomes the controller.',
		images: ['/logo-W3P.jpg'],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'W3P - Web3Pad',
		description:
			'Turn any screen into an instant multiplayer arena. Your phone becomes the controller.',
		images: ['/logo-W3P.jpg'],
	},
};

import { Providers } from './providers';
import { Header } from '@/components/Header';
import { auth } from '@/lib/auth';

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();
	
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${tektur.variable} antialiased`} suppressHydrationWarning>
				<Providers session={session}>
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
