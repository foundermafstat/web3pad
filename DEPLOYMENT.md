# Deployment Guide

## Prerequisites

### Server Requirements
- Ubuntu 24.04 LTS
- Node.js 18+ installed
- PM2 installed globally
- Domain: `nft-dnd.xyz` pointing to your server
- Nginx configured to proxy port 4444

### Install Node.js and PM2
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install pnpm (optional but recommended)
sudo npm install -g pnpm
```

## Nginx Configuration

Create/edit nginx configuration for the domain:

```bash
sudo nano /etc/nginx/sites-available/nft-dnd.xyz
```

Add the following configuration:

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name nft-dnd.xyz www.nft-dnd.xyz;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS - Main Application (Next.js)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nft-dnd.xyz www.nft-dnd.xyz;

    # SSL Configuration (use certbot to generate certificates)
    ssl_certificate /etc/letsencrypt/live/nft-dnd.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nft-dnd.xyz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # API proxy to server on port 5566
    location /api/ {
        proxy_pass http://localhost:5566;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket/Socket.IO proxy to port 5566
    location /socket.io/ {
        proxy_pass http://localhost:5566;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy to Next.js on port 4444
    location / {
        proxy_pass http://localhost:4444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/nft-dnd.xyz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d nft-dnd.xyz -d www.nft-dnd.xyz

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

## Deployment Steps

### 1. Clone Repository

```bash
cd /var/www
sudo mkdir -p nft-dnd
sudo chown $USER:$USER nft-dnd
cd nft-dnd
git clone <your-repo-url> .
```

### 2. Configure Environment

The project will automatically detect production environment. No manual configuration needed.

### 3. Deploy

Make the deployment script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

Or deploy manually:

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build client
cd client && npm run build && cd ..

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions from the command output
```

## PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# View specific app logs
pm2 logs W3P-server
pm2 logs W3P-client

# Monitor
pm2 monit

# Restart applications
pm2 restart all
pm2 restart W3P-server
pm2 restart W3P-client

# Stop applications
pm2 stop all

# Delete applications
pm2 delete all
```

## Project Structure

```
.
├── server/              # Node.js Socket.IO server (Port 5566)
├── client/              # Next.js application (Port 4444)
├── ecosystem.config.cjs # PM2 configuration
├── deploy.sh            # Deployment script
└── logs/                # Application logs
    ├── server-error.log
    ├── server-out.log
    ├── client-error.log
    └── client-out.log
```

## Ports Configuration

- **Client (Next.js)**: Port 4444 (proxied via Nginx)
- **Server (Socket.IO)**: Port 5566 (proxied via Nginx at `/socket.io/`)
- **Nginx**: Port 80 (HTTP) → redirects to 443 (HTTPS)

## Firewall Configuration

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'

# Allow SSH (if not already allowed)
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Troubleshooting

### Check if applications are running
```bash
pm2 status
netstat -tulpn | grep -E '4444|5566'
```

### Check logs
```bash
pm2 logs
# or
tail -f logs/server-error.log
tail -f logs/client-error.log
```

### Restart services
```bash
pm2 restart all
```

### Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Check SSL certificate
```bash
sudo certbot certificates
```

## Updating the Application

```bash
cd /var/www/nft-dnd

# Pull latest changes
git pull

# Run deployment script
./deploy.sh
```

## Monitoring

### Setup PM2 web monitoring (optional)
```bash
pm2 install pm2-server-monit
```

### Check server resources
```bash
pm2 monit
htop
```

## Backup

```bash
# Backup script (run periodically via cron)
tar -czf backup-$(date +%Y%m%d).tar.gz \
    --exclude=node_modules \
    --exclude=client/node_modules \
    --exclude=client/.next \
    --exclude=logs \
    .
```

## Security Considerations

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Firewall** - Only necessary ports should be open
3. **SSL/TLS** - Always use HTTPS in production
4. **Environment variables** - Never commit sensitive data
5. **Regular backups** - Backup your data regularly
6. **Monitor logs** - Check logs regularly for errors or security issues

## Support

For issues or questions, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/error.log`
- Application logs: `./logs/`

