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
	title: 'OSG - One Screen Games',
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
	authors: [{ name: 'OSG Team' }],
	icons: {
		icon: '/logo-osg.jpg',
		shortcut: '/logo-osg.jpg',
		apple: '/logo-osg.jpg',
	},
	openGraph: {
		title: 'OSG - One Screen Games',
		description:
			'Turn any screen into an instant multiplayer arena. Your phone becomes the controller.',
		images: ['/logo-osg.jpg'],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'OSG - One Screen Games',
		description:
			'Turn any screen into an instant multiplayer arena. Your phone becomes the controller.',
		images: ['/logo-osg.jpg'],
	},
};

import { Providers } from './providers';
import { Header } from '@/components/Header';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${tektur.variable} antialiased`} suppressHydrationWarning>
				<Providers>
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
