'use client';

import Link from 'next/link';
import { ThemeLogo } from './ThemeLogo';
import { useLoading } from '@/contexts/LoadingContext';

export function FallbackLogo() {
	const { isLoading } = useLoading();

	return (
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
	);
}
