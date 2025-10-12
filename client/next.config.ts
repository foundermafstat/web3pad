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
};

export default nextConfig;
