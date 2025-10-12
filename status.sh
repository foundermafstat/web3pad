#!/bin/bash

# W3H Status Check Script
# Quick status overview of the application

echo "============================================"
echo "🎮 W3H Application Status"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PM2 Status
echo -e "${BLUE}📊 PM2 Applications:${NC}"
pm2 status
echo ""

# Port Check
echo -e "${BLUE}🔌 Port Status:${NC}"
echo "Checking ports 4444 and 5566..."
if netstat -tulpn 2>/dev/null | grep -q ':4444'; then
    echo -e "${GREEN}✓${NC} Port 4444 (Client) is listening"
else
    echo -e "${RED}✗${NC} Port 4444 (Client) is NOT listening"
fi

if netstat -tulpn 2>/dev/null | grep -q ':5566'; then
    echo -e "${GREEN}✓${NC} Port 5566 (Server) is listening"
else
    echo -e "${RED}✗${NC} Port 5566 (Server) is NOT listening"
fi
echo ""

# Nginx Status
echo -e "${BLUE}🌐 Nginx Status:${NC}"
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓${NC} Nginx is running"
        nginx -t 2>&1 | grep -q "syntax is ok" && echo -e "${GREEN}✓${NC} Nginx config is valid" || echo -e "${RED}✗${NC} Nginx config has errors"
    else
        echo -e "${RED}✗${NC} Nginx is not running"
    fi
else
    echo -e "${YELLOW}⚠${NC} Nginx not installed"
fi
echo ""

# SSL Certificate Check
echo -e "${BLUE}🔒 SSL Certificate:${NC}"
if command -v certbot &> /dev/null; then
    CERT_INFO=$(sudo certbot certificates 2>/dev/null | grep "Certificate Name: nft-dnd.xyz" -A 5)
    if [ ! -z "$CERT_INFO" ]; then
        echo -e "${GREEN}✓${NC} SSL certificate found for nft-dnd.xyz"
        EXPIRY=$(echo "$CERT_INFO" | grep "Expiry Date:" | cut -d: -f2-)
        echo "  Expires:$EXPIRY"
    else
        echo -e "${YELLOW}⚠${NC} SSL certificate not found for nft-dnd.xyz"
    fi
else
    echo -e "${YELLOW}⚠${NC} Certbot not installed"
fi
echo ""

# Disk Space
echo -e "${BLUE}💾 Disk Usage:${NC}"
df -h / | tail -n 1 | awk '{print "  Used: "$3" / "$2" ("$5")"}'
echo ""

# Memory Usage
echo -e "${BLUE}🧠 Memory Usage:${NC}"
free -h | grep "Mem:" | awk '{print "  Used: "$3" / "$2"}'
echo ""

# Recent Errors in Logs
echo -e "${BLUE}📝 Recent Log Errors (last 10):${NC}"
if [ -d "logs" ]; then
    echo "Server errors:"
    if [ -f "logs/server-error.log" ]; then
        tail -n 5 logs/server-error.log 2>/dev/null | sed 's/^/  /' || echo "  No errors"
    else
        echo "  Log file not found"
    fi
    echo ""
    echo "Client errors:"
    if [ -f "logs/client-error.log" ]; then
        tail -n 5 logs/client-error.log 2>/dev/null | sed 's/^/  /' || echo "  No errors"
    else
        echo "  Log file not found"
    fi
else
    echo "  Logs directory not found"
fi
echo ""

echo "============================================"
echo -e "${GREEN}✅ Status check complete!${NC}"
echo "============================================"
echo ""
echo "📊 For detailed logs: pm2 logs"
echo "🔄 To restart: pm2 restart all"
echo "⏹️  To stop: pm2 stop all"


