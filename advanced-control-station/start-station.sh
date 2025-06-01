#!/bin/bash

# ----------------------------------------------------------------------------
#  File:        start-station.sh
#  Project:     Celaya Solutions (Advanced Control Station)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Complete startup script for Advanced Control Station
#  Version:     2.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: May 2025
# ----------------------------------------------------------------------------

set -e

# Colors and formatting
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'
BOLD='\033[1m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║     ██████╗███████╗██╗      █████╗ ██╗   ██╗ █████╗     ███████╗ ██████╗     ║"
echo "║    ██╔════╝██╔════╝██║     ██╔══██╗╚██╗ ██╔╝██╔══██╗    ██╔════╝██╔═══██╗    ║"
echo "║    ██║     █████╗  ██║     ███████║ ╚████╔╝ ███████║    ███████╗██║   ██║    ║"
echo "║    ██║     ██╔══╝  ██║     ██╔══██║  ╚██╔╝  ██╔══██║    ╚════██║██║   ██║    ║"
echo "║    ╚██████╗███████╗███████╗██║  ██║   ██║   ██║  ██║    ███████║╚██████╔╝    ║"
echo "║     ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚══════╝ ╚═════╝     ║"
echo "║                                                                               ║"
echo "║            🚀 ADVANCED CONTROL STATION - C-SUITE EDITION 🚀                  ║"
echo "║                        Next-Gen Agent Simulation Platform                    ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${WHITE}${BOLD}Advanced Control Station Launcher v2.0${NC}"
echo -e "${CYAN}─────────────────────────────────────────${NC}"
echo ""

# Configuration
STATION_PORT=${STATION_PORT:-3000}

# Functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Check directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the advanced-control-station directory"
    exit 1
fi

print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
print_status "Node.js $(node -v) detected"

# Check PNPM
if ! command -v pnpm &> /dev/null; then
    print_warning "PNPM not found. Installing PNPM..."
    npm install -g pnpm
fi
print_status "PNPM detected"

# Install dependencies
if [ ! -d "node_modules" ]; then
    print_step "Installing dependencies..."
    pnpm install
    print_status "Dependencies installed"
else
    print_info "Dependencies already installed"
fi

# Create directories
print_step "Setting up project structure..."
mkdir -p src/{components/{agents,chat,simulation,tools,logs,signature,network,ui,layout},lib,hooks,types}
mkdir -p public/.papi
print_status "Project structure ready"

# Environment setup
if [ ! -f ".env.local" ]; then
    print_step "Creating environment configuration..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:9944
NEXT_PUBLIC_PARACHAIN_ENDPOINT=ws://localhost:9988
NEXT_PUBLIC_ENABLE_SIMULATIONS=true
NEXT_PUBLIC_ENABLE_TOOL_CALLING=true
EOF
    print_status "Environment configuration created"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}${BOLD}🎉 ADVANCED CONTROL STATION READY! 🎉${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}🔗 System Endpoints:${NC}"
echo -e "  • Control Station:     ${GREEN}http://localhost:$STATION_PORT${NC}"
echo ""

echo -e "${PURPLE}🎯 Available Features:${NC}"
echo -e "  • 🤖 Agent Management      - Monitor and control C-Suite agents"
echo -e "  • 🔧 Tool Calling          - Execute agent tools with parameters"
echo -e "  • 🎮 Simulation Engine     - Run multi-agent simulations"
echo -e "  • 💬 Advanced Chat         - Communicate with agents"
echo -e "  • 📊 System Monitoring     - Real-time logs and metrics"
echo ""

echo -e "${CYAN}🚀 Starting Control Station...${NC}"
echo ""

# Start development server
pnpm dev --port $STATION_PORT 