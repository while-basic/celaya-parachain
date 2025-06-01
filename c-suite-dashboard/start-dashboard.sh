#!/bin/bash

# ----------------------------------------------------------------------------
#  File:        start-dashboard.sh
#  Project:     Celaya Solutions (C-Suite Dashboard)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Start script that launches zombienet blockchain and dashboard together
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: May 2025
# ----------------------------------------------------------------------------

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

BLOCKCHAIN_SCRIPT="../polkadot-sdk-polkadot-stable2503-5/templates/parachain/c-suite-blockchain.sh"

echo -e "${CYAN}🚀 C-Suite Dashboard Launcher${NC}"
echo "=================================="
echo ""

# Check if we're in the dashboard directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    echo -e "${RED}❌ Please run this script from the c-suite-dashboard directory${NC}"
    exit 1
fi

# Check if blockchain script exists
if [ ! -f "$BLOCKCHAIN_SCRIPT" ]; then
    echo -e "${RED}❌ Blockchain script not found at $BLOCKCHAIN_SCRIPT${NC}"
    echo -e "${YELLOW}💡 Make sure you're running from c-suite-dashboard/ directory${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Checking blockchain status...${NC}"

# Check if blockchain is already running
if curl -s -X POST -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
    http://localhost:9988 &>/dev/null; then
    echo -e "${GREEN}✅ C-Suite parachain already running on port 9988${NC}"
else
    echo -e "${YELLOW}⏳ Starting C-Suite blockchain with zombienet...${NC}"
    echo -e "${BLUE}   This will take about 30-60 seconds...${NC}"
    
    # Start blockchain in background
    cd ../polkadot-sdk-polkadot-stable2503-5/templates/parachain
    nohup ./c-suite-blockchain.sh zombienet > ../../../c-suite-dashboard/blockchain.log 2>&1 &
    BLOCKCHAIN_PID=$!
    cd ../../../c-suite-dashboard
    
    echo -e "${GREEN}   Blockchain starting with PID: $BLOCKCHAIN_PID${NC}"
    
    # Wait for blockchain to be ready (max 120 seconds)
    echo -e "${YELLOW}   Waiting for parachain to be ready...${NC}"
    PARACHAIN_PORT=""
    for i in {1..24}; do
        # Try to find the actual parachain port from the log
        if [ -f "blockchain.log" ]; then
            PARACHAIN_PORT=$(grep -o "ws://127.0.0.1:[0-9]*" blockchain.log | grep -v ":9944\|:9955" | head -1 | cut -d: -f3)
        fi
        
        # Test connection to parachain (try both fixed port and detected port)
        if curl -s -X POST -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
            http://localhost:9988 &>/dev/null; then
            echo -e "${GREEN}✅ Parachain is ready on port 9988!${NC}"
            break
        elif [ -n "$PARACHAIN_PORT" ] && curl -s -X POST -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
            http://localhost:$PARACHAIN_PORT &>/dev/null; then
            echo -e "${GREEN}✅ Parachain is ready on port $PARACHAIN_PORT!${NC}"
            echo -e "${BLUE}   Updating dashboard to use port $PARACHAIN_PORT${NC}"
            
            # Update the API endpoint in the dashboard
            sed -i.bak "s/ws:\/\/localhost:[0-9]*/ws:\/\/localhost:$PARACHAIN_PORT/g" src/lib/useApi.ts
            break
        fi
        
        echo -n "."
        sleep 5
        
        if [ $i -eq 24 ]; then
            echo ""
            echo -e "${RED}❌ Timeout waiting for blockchain to start${NC}"
            echo -e "${YELLOW}💡 Check blockchain.log for details${NC}"
            if [ -f "blockchain.log" ]; then
                echo -e "${BLUE}Recent log entries:${NC}"
                tail -10 blockchain.log
            fi
            exit 1
        fi
    done
    echo ""
fi

echo -e "${BLUE}🌐 Starting Next.js dashboard...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================="
echo ""
echo -e "${BLUE}🔗 Endpoints:${NC}"
echo "  • C-Suite Parachain: ws://localhost:9988"
echo "  • Relay Chain (Alice): ws://localhost:9944"
echo "  • Dashboard: http://localhost:3000"
echo ""
echo -e "${YELLOW}📋 Available Operations:${NC}"
echo "  • View agents: http://localhost:3000/agents"
echo "  • Monitor consensus: http://localhost:3000/consensus" 
echo "  • Real-time logs: http://localhost:3000/log"
echo "  • Submit extrinsics: http://localhost:3000/submit"
echo ""
echo -e "${CYAN}🚀 Starting dashboard...${NC}"
echo ""

# Start the dashboard
npm run dev 