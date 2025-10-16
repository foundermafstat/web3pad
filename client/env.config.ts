/**
 * Environment configuration
 *
 * Automatically detects production/development environment
 * and uses appropriate settings.
 */

// Detect production based on hostname (works in browser)
const getIsProduction = () => {
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname;
		const isProd = !['localhost', '127.0.0.1'].includes(hostname) && !hostname.startsWith('192.168');
		console.log('[ENV_CONFIG] isProduction - browser:', { hostname, isProd });
		return isProd;
	}
	const isProd = process.env.NODE_ENV === 'production';
	console.log('[ENV_CONFIG] isProduction - SSR:', isProd);
	return isProd;
};

const isProduction = getIsProduction();

// Development local IP - update this to your local network IP
const DEV_LOCAL_IP = '192.168.1.XXX';

// Get base URL from current hostname in browser, or use default for SSR
const getBaseUrl = () => {
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname;
		// Use DEV_LOCAL_IP in development for mobile access
		if (!isProduction && (hostname === 'localhost' || hostname === '127.0.0.1')) {
			console.log('[ENV_CONFIG] getBaseUrl - using DEV_LOCAL_IP:', DEV_LOCAL_IP);
			return DEV_LOCAL_IP;
		}
		console.log('[ENV_CONFIG] getBaseUrl - browser:', hostname);
		return hostname;
	}
	// Fallback for SSR
	const fallback = process.env.NODE_ENV === 'production' ? 'nft-dnd.xyz' : DEV_LOCAL_IP;
	console.log('[ENV_CONFIG] getBaseUrl - SSR fallback:', fallback);
	return fallback;
};

export const ENV_CONFIG = {
	/**
	 * Production domain (hardcoded for QR code generation)
	 */
	PRODUCTION_DOMAIN: 'nft-dnd.xyz',
	
	/**
	 * Development local IP
	 * ⚠️ Update this to your local network IP for development
	 */
	DEV_LOCAL_IP,
	
	/**
	 * Base URL for the application
	 * 
	 * Production: uses domain name
	 * Development: uses local IP address
	 * 
	 * @example Production: 'nft-dnd.xyz'
	 * @example Development: '192.168.1.43'
	 */
	get BASE_URL() {
		return getBaseUrl();
	},

	/**
	 * Client application port (Next.js)
	 * 
	 * Production: 4444 (configured via PM2)
	 * Development: 3000 (Next.js default)
	 */
	CLIENT_PORT: isProduction ? 4444 : 3000,

	/**
	 * Server port (Socket.IO)
	 * 
	 * Production: 5566 (configured via PM2)
	 * Development: 3001
	 */
	SERVER_PORT: isProduction ? 5566 : 3001,

	/**
	 * Full server URL for Socket.IO connection
	 */
	get SERVER_URL() {
		const protocol = isProduction ? 'https' : 'http';
		const baseUrl = this.BASE_URL;
		const url = isProduction 
			? `${protocol}://${baseUrl}` 
			: `${protocol}://${baseUrl}:${this.SERVER_PORT}`;
		
		// Debug logging
		console.log('[ENV_CONFIG] SERVER_URL:', {
			isProduction,
			protocol,
			baseUrl,
			url,
			windowHostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
		});
		
		// In production, nginx proxies /socket.io/ to localhost:5566
		// so we don't need to specify the port
		return url;
	},

	/**
	 * Full client URL for QR code generation
	 */
	get CLIENT_URL() {
		const protocol = isProduction ? 'https' : 'http';
		const baseUrl = this.BASE_URL;
		const url = `${protocol}://${baseUrl}${isProduction ? '' : `:${this.CLIENT_PORT}`}`;
		
		// Debug logging
		console.log('[ENV_CONFIG] CLIENT_URL:', {
			isProduction,
			protocol,
			baseUrl,
			url,
			windowHostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
		});
		
		return url;
	},

	/**
	 * Check if running in production
	 */
	get IS_PRODUCTION() {
		return isProduction;
	},
	
	/**
	 * Generate QR code URL
	 * Production: uses domain
	 * Development: uses local IP for mobile access
	 */
	getQRCodeUrl(path: string) {
		if (isProduction) {
			const url = `https://${this.PRODUCTION_DOMAIN}${path}`;
			console.log('[ENV_CONFIG] getQRCodeUrl (production):', url);
			return url;
		} else {
			const url = `http://${DEV_LOCAL_IP}:${this.CLIENT_PORT}${path}`;
			console.log('[ENV_CONFIG] getQRCodeUrl (development):', url);
			return url;
		}
	},
};
