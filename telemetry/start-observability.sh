#!/bin/bash
# ----------------------------------------------------------------------------
#  File:        start-observability.sh
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Startup script for blockchain observability stack
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

# Function to print colored output
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

# Check if Docker and Docker Compose are available
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p grafana/dashboards/blockchain
    mkdir -p grafana/provisioning/{datasources,dashboards}
    mkdir -p loki
    mkdir -p tempo
    mkdir -p prometheus
    mkdir -p otel
    
    print_success "Directories created"
}

# Wait for service to be healthy
wait_for_service() {
    local service_name=$1
    local url=$2
    local timeout=${3:-60}
    local interval=${4:-5}
    
    print_status "Waiting for $service_name to be ready..."
    
    local count=0
    while [ $count -lt $((timeout / interval)) ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        print_status "Waiting for $service_name... ($((count * interval))s/${timeout}s)"
        sleep $interval
        count=$((count + 1))
    done
    
    print_error "$service_name failed to start within $timeout seconds"
    return 1
}

# Start the observability stack
start_stack() {
    print_status "Starting Celaya Blockchain Observability Stack..."
    
    # Start core services first
    docker-compose up -d prometheus loki tempo
    
    # Wait for core services
    wait_for_service "Prometheus" "http://localhost:9090/-/healthy"
    wait_for_service "Loki" "http://localhost:3100/ready"
    wait_for_service "Tempo" "http://localhost:3200/ready"
    
    # Start Grafana
    docker-compose up -d grafana
    wait_for_service "Grafana" "http://localhost:3001/api/health"
    
    # Start Vector and OTel Collector
    docker-compose up -d vector otel-collector
    wait_for_service "Vector API" "http://localhost:8686/health"
    
    print_success "All services are running!"
}

# Show service URLs
show_urls() {
    print_success "Observability Stack is ready!"
    echo ""
    echo "🔗 Service URLs:"
    echo "   📊 Grafana Dashboard: http://localhost:3001 (admin/celaya123)"
    echo "   📈 Prometheus: http://localhost:9090"
    echo "   📝 Loki: http://localhost:3100"
    echo "   🔍 Tempo: http://localhost:3200"
    echo "   🚀 Vector API: http://localhost:8686"
    echo ""
    echo "📡 Event Webhook Endpoint:"
    echo "   POST http://localhost:8687/substrate/events"
    echo ""
    echo "📊 Pre-configured Dashboards:"
    echo "   - Celaya Blockchain Overview"
    echo "   - Agent Consensus Metrics"
    echo "   - Performance & Resource Usage"
    echo ""
    print_status "Use 'docker-compose logs -f <service>' to view logs"
    print_status "Use './stop-observability.sh' to stop all services"
}

# Main execution
main() {
    echo "🚀 Celaya Blockchain Observability Stack Startup"
    echo "=================================================="
    
    check_dependencies
    create_directories
    start_stack
    show_urls
}

# Handle script termination
trap 'print_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@" 