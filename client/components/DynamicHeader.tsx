'use client';

import dynamic from 'next/dynamic';
import { FallbackLogo } from './FallbackLogo';

const HeaderWrapper = dynamic(() => import('@/components/HeaderWrapper').then(mod => ({ default: mod.HeaderWrapper })), {
	ssr: false,
	loading: () => (
		<header className="fixed top-0 z-50 w-full bg-gradient-to-b from-background/50 to-transparent">
			<div className="relative h-10 md:h-16 flex items-center px-4">
				<FallbackLogo />
			</div>
		</header>
	)
});

export function DynamicHeader() {
	return <HeaderWrapper />;
}
