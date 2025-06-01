#!/bin/bash
# ----------------------------------------------------------------------------
#  File:        stop-observability.sh
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Stop script for blockchain observability stack
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop all services
stop_services() {
    print_status "Stopping Celaya Blockchain Observability Stack..."
    
    if docker-compose ps -q | grep -q .; then
        docker-compose down
        print_success "All services stopped"
    else
        print_warning "No services were running"
    fi
}

# Clean up volumes (optional)
cleanup_volumes() {
    if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
        print_warning "Cleaning up volumes and data..."
        read -p "Are you sure you want to delete all observability data? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            print_success "Volumes cleaned up"
        else
            print_status "Volume cleanup cancelled"
        fi
    fi
}

# Main execution
main() {
    echo "🛑 Celaya Blockchain Observability Stack Stop"
    echo "=============================================="
    
    stop_services
    cleanup_volumes "$1"
    
    print_success "Observability stack stopped successfully"
    echo ""
    print_status "Use './start-observability.sh' to restart the stack"
}

main "$@" 