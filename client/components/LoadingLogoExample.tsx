'use client';

import React, { useState, useEffect } from 'react';
import { ThemeLogo } from './ThemeLogo';

/**
 * Example component demonstrating the loading logo animation
 * This shows how to use the ThemeLogo with loading state
 */
export function LoadingLogoExample() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simulate loading for 3 seconds
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
			<div className="text-center space-y-8">
				<h1 className="text-2xl font-bold text-foreground mb-8">
					Loading Logo Animation Example
				</h1>
				
				{/* Logo with loading state */}
				<div className="flex flex-col items-center space-y-4">
					<ThemeLogo
						width={120}
						height={78}
						isLoading={isLoading}
						loadingColor="#000000"
						loadedColor="#ffffff"
						className="w3p-logo-lg"
					/>
					
					<p className="text-muted-foreground">
						{isLoading ? 'Loading...' : 'Loaded!'}
					</p>
				</div>

				{/* Reset button */}
				<button
					onClick={() => {
						setIsLoading(true);
						setTimeout(() => setIsLoading(false), 3000);
					}}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
				>
					Reset Animation
				</button>

				{/* Usage examples */}
				<div className="mt-12 text-left max-w-2xl">
					<h2 className="text-xl font-semibold text-foreground mb-4">
						Usage Examples:
					</h2>
					<div className="space-y-4 text-sm text-muted-foreground">
						<div>
							<code className="bg-muted px-2 py-1 rounded">
								{`<ThemeLogo isLoading={true} />`}
							</code>
							<p>Basic loading state (black → white)</p>
						</div>
						<div>
							<code className="bg-muted px-2 py-1 rounded">
								{`<ThemeLogo isLoading={true} loadingColor="#ff0000" loadedColor="#00ff00" />`}
							</code>
							<p>Custom colors (red → green)</p>
						</div>
						<div>
							<code className="bg-muted px-2 py-1 rounded">
								{`<ThemeLogo isLoading={isLoading} className="w3p-logo-xl" />`}
							</code>
							<p>With CSS size class</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
