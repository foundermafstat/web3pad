#!/bin/bash

# OSG Update Script
# Pull latest changes and redeploy

echo "🔄 Updating OSG application..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Stash any local changes
echo -e "${YELLOW}📦 Stashing local changes...${NC}"
git stash

# Pull latest changes
echo -e "${YELLOW}⬇️  Pulling latest changes...${NC}"
git pull

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed${NC}"
    git stash pop
    exit 1
fi

# Pop stashed changes back
git stash pop 2>/dev/null

# Run deployment
echo -e "${YELLOW}🚀 Running deployment...${NC}"
./deploy.sh

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Update completed successfully!${NC}"
    echo ""
    echo "📊 Check status: ./status.sh"
    echo "📝 View logs: pm2 logs"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check logs for errors"
    exit 1
fi

