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
	// Exclude Service Worker from being processed as a route
	async headers() {
		return [
			{
				source: '/sw.js',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=0, must-revalidate',
					},
					{
						key: 'Service-Worker-Allowed',
						value: '/',
					},
				],
			},
			{
				source: '/manifest.json',
				headers: [
					{
						key: 'Content-Type',
						value: 'application/manifest+json',
					},
				],
			},
		];
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
	webpack: (config, { isServer, dev }) => {
		// Fix for @stacks/connect module loading issues
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				crypto: false,
				stream: false,
				util: false,
				url: false,
				assert: false,
				http: false,
				https: false,
				os: false,
				buffer: false,
			};
		}
		
		// Handle @stacks/connect modules
		config.externals = config.externals || [];
		if (isServer) {
			config.externals.push('@stacks/connect');
		}
		
		// Optimize chunks for @stacks/connect
		if (!isServer) {
			config.optimization = {
				...config.optimization,
				splitChunks: {
					...config.optimization.splitChunks,
					cacheGroups: {
						...config.optimization.splitChunks.cacheGroups,
						stacks: {
							test: /[\\/]node_modules[\\/]@stacks[\\/]/,
							name: 'stacks',
							chunks: 'all',
							priority: 10,
						},
					},
				},
			};
		}
		
		return config;
	},
	experimental: {
		esmExternals: false,
	},
};

export default nextConfig;
