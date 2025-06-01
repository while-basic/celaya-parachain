#!/bin/bash

# ----------------------------------------------------------------------------
#  File:        check-connection.sh
#  Project:     Celaya Solutions (C-Suite Dashboard)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Quick connection checker for zombienet blockchain
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: May 2025
# ----------------------------------------------------------------------------

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔍 C-Suite Zombienet Connection Check${NC}"
echo "======================================"
echo ""

# Check parachain (primary connection)
echo -e "${BLUE}Checking C-Suite Parachain (ws://localhost:9988)...${NC}"
if curl -s -X POST -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
    http://localhost:9988 | grep -q "result"; then
    echo -e "${GREEN}✅ Parachain is running and responding${NC}"
    PARACHAIN_STATUS="✅"
else
    echo -e "${RED}❌ Parachain not responding${NC}"
    PARACHAIN_STATUS="❌"
fi

echo ""

# Check relay chain
echo -e "${BLUE}Checking Relay Chain Alice (ws://localhost:9944)...${NC}"
if curl -s -X POST -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
    http://localhost:9944 | grep -q "result"; then
    echo -e "${GREEN}✅ Relay chain is running and responding${NC}"
    RELAY_STATUS="✅"
else
    echo -e "${RED}❌ Relay chain not responding${NC}"
    RELAY_STATUS="❌"
fi

echo ""

# Check relay chain Bob
echo -e "${BLUE}Checking Relay Chain Bob (ws://localhost:9955)...${NC}"
if curl -s -X POST -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
    http://localhost:9955 | grep -q "result"; then
    echo -e "${GREEN}✅ Relay chain Bob is running and responding${NC}"
    BOB_STATUS="✅"
else
    echo -e "${YELLOW}⚠️  Relay chain Bob not responding (not critical)${NC}"
    BOB_STATUS="⚠️"
fi

echo ""
echo -e "${CYAN}📊 Summary${NC}"
echo "=========="
echo -e "Parachain (9988): $PARACHAIN_STATUS"
echo -e "Relay Alice (9944): $RELAY_STATUS" 
echo -e "Relay Bob (9955): $BOB_STATUS"
echo ""

if [ "$PARACHAIN_STATUS" = "✅" ]; then
    echo -e "${GREEN}🎉 Dashboard can connect to the blockchain!${NC}"
    echo -e "${BLUE}🚀 Start dashboard with: ./start-dashboard.sh${NC}"
else
    echo -e "${YELLOW}💡 To start the blockchain:${NC}"
    echo "   cd ../polkadot-sdk-polkadot-stable2503-5/templates/parachain"
    echo "   ./c-suite-blockchain.sh zombienet"
fi 