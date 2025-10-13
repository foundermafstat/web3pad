'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeLogoProps {
	width: number;
	height: number;
	className?: string;
}

export function ThemeLogo({ width, height, className }: ThemeLogoProps) {
	const { theme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Return a default logo during SSR
		return (
			<Image
				src="/W3P-logo-black.png"
				alt="W3P"
				width={width}
				height={height}
				className={className}
				priority
			/>
		);
	}

	const currentTheme = resolvedTheme || theme;
	const logoSrc = currentTheme === 'dark' ? '/W3P-logo-white.png' : '/W3P-logo-black.png';

	return (
		<Image
			src={logoSrc}
			alt="W3P"
			width={width}
			height={height}
			className={className}
			priority
		/>
	);
}
