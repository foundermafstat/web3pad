/**
 * PM2 Configuration for W3H Game Server
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 stop all
 *   pm2 restart all
 *   pm2 logs
 *   pm2 monit
 */

module.exports = {
	apps: [
		{
			name: 'W3H-server',
			script: './server/server.js',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
				PORT: 5566,
			},
			error_file: './logs/server-error.log',
			out_file: './logs/server-out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			merge_logs: true,
		},
		{
			name: 'W3H-client',
			script: 'npm',
			args: 'start',
			cwd: './client',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			max_memory_restart: '512M',
			env: {
				NODE_ENV: 'production',
				PORT: 4444,
			},
			error_file: './logs/client-error.log',
			out_file: './logs/client-out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			merge_logs: true,
		},
	],
};

