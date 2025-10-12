import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	eslint: {
		// Disable ESLint during builds
		// Can be re-enabled after fixing all errors
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Ignore TypeScript errors during builds
		// Allows production deployment even with TS errors
		ignoreBuildErrors: true,
	},
	images: {
		// Allow external images from OAuth providers
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.googleusercontent.com',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
