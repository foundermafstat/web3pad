#!/bin/bash

# W3H Game Server Deployment Script
# For Ubuntu 24 with PM2

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
	echo -e "${RED}❌ Please do not run as root${NC}"
	exit 1
fi

# 1. Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
cd client && npm install && cd ..

# 2. Build client
echo -e "${YELLOW}🏗️  Building Next.js client...${NC}"
cd client && npm run build && cd ..

if [ $? -ne 0 ]; then
	echo -e "${RED}❌ Client build failed${NC}"
	exit 1
fi

# 3. Create logs directory
echo -e "${YELLOW}📁 Creating logs directory...${NC}"
mkdir -p logs

# 4. Stop existing PM2 processes
echo -e "${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
pm2 stop ecosystem.config.cjs 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 5. Start with PM2
echo -e "${YELLOW}🚀 Starting applications with PM2...${NC}"
pm2 start ecosystem.config.cjs

# 6. Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

# 7. Setup PM2 startup script
echo -e "${YELLOW}⚙️  Setting up PM2 startup script...${NC}"
pm2 startup

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"
echo "📊 Monitor: pm2 monit"
echo ""
echo "🌐 Your application should be available at:"
echo "   https://nft-dnd.xyz"

