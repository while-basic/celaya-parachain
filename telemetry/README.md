# Celaya Blockchain Observability Stack

## Overview

This directory contains a complete observability stack for the Celaya C-Suite blockchain, implementing **Task 0** from the blockchain enhancement roadmap. It provides real-time monitoring, logging, and tracing capabilities for agent consensus events, performance metrics, and system health.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Substrate     │    │     Vector      │    │    Grafana      │
│     Node        │───▶│   (Collector)   │───▶│  (Dashboard)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Prometheus    │              │
         │              │   (Metrics)     │◀─────────────┘
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Loki       │    │     Tempo       │    │  OpenTelemetry  │
│    (Logs)       │    │   (Traces)      │    │   Collector     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### Core Services
- **Grafana**: Visualization and dashboards (Port 3000)
- **Prometheus**: Metrics collection and storage (Port 9090)
- **Loki**: Log aggregation and querying (Port 3100)
- **Tempo**: Distributed tracing (Port 3200)

### Data Collection
- **Vector**: Log and event processing (Ports 8686, 8687)
- **OpenTelemetry Collector**: Advanced telemetry processing (Ports 4317, 4318)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Substrate node running with metrics enabled on port 9615

### Launch the Stack

```bash
cd telemetry
./start-observability.sh
```

This will:
1. Start all observability services
2. Wait for health checks
3. Display service URLs and access information

### Access Points

- **Grafana Dashboard**: http://localhost:3000 (admin/celaya123)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200
- **Vector API**: http://localhost:8686

### Stop the Stack

```bash
./stop-observability.sh

# To also clean up all data volumes:
./stop-observability.sh --clean
```

## Key Features

### 1. Real-time Agent Consensus Monitoring
- Track `ConsensusLogged` events from the blockchain
- Monitor agent participation and signatures
- Visualize consensus round times and success rates

### 2. Performance Metrics
- Block import times and heights
- Gas usage per agent action
- System resource utilization (CPU, memory, disk)

### 3. Agent Reputation Tracking
- Real-time reputation score changes
- Agent activity and uptime monitoring
- Reputation delta visualization

### 4. Distributed Tracing
- End-to-end transaction tracing
- Consensus round latency analysis
- Agent interaction patterns

## Dashboard Features

The pre-configured **Celaya Blockchain Overview** dashboard includes:

- **Block Height**: Current blockchain height over time
- **Consensus Events Rate**: Events per minute
- **Agent Consensus Logs**: Real-time log stream
- **Agent Reputation Scores**: Reputation tracking by agent
- **Agent Gas Usage**: Gas consumption metrics
- **System Resources**: CPU and memory utilization

## Event Integration

### Webhook Endpoint
Send blockchain events to: `POST http://localhost:8687/substrate/events`

Example payload:
```json
{
  "event_name": "ConsensusLogged",
  "agents_involved": ["agent1", "agent2", "agent3"],
  "metadata": {
    "round_time": 150,
    "gas_used": 1000000,
    "reputation_delta": 0.025
  }
}
```

### Log Parsing
Vector automatically parses substrate logs for:
- Agent action registrations
- Consensus events
- Block imports
- Performance metrics

## Configuration

### Vector Configuration
- **File**: `vector.toml`
- **Sources**: Substrate logs, system metrics, webhook events
- **Transforms**: Log parsing, OpenTelemetry context injection
- **Sinks**: Loki, Prometheus, Tempo, console

### Grafana Provisioning
- **Datasources**: Auto-configured Prometheus, Loki, Tempo
- **Dashboards**: Pre-loaded blockchain overview dashboard
- **Alerts**: Ready for custom alerting rules

## Monitoring Capabilities

### Metrics Collected
- `substrate_block_height`: Current block number
- `substrate_consensus_events_total`: Total consensus events
- `substrate_agent_reputation_score`: Agent reputation values
- `substrate_agent_gas_used_total`: Gas consumption by agent
- `host_cpu_seconds_total`: System CPU usage
- `host_memory_used_bytes`: Memory utilization

### Log Streams
- Substrate node logs with structured parsing
- Agent consensus events with metadata
- System performance logs
- Vector processing logs

### Traces
- Consensus round spans with timing
- Agent action traces with gas metrics
- Cross-service interaction traces

## Troubleshooting

### Common Issues

1. **Services not starting**: Check Docker daemon and port availability
2. **No metrics**: Ensure substrate node has `--prometheus-external` flag
3. **Missing logs**: Verify log file paths in vector.toml
4. **Dashboard empty**: Check datasource connections in Grafana

### Health Checks
- Vector API: `curl http://localhost:8686/health`
- Prometheus: `curl http://localhost:9090/-/healthy`
- Loki: `curl http://localhost:3100/ready`
- Tempo: `curl http://localhost:3200/ready`

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service
docker-compose logs -f grafana
docker-compose logs -f vector
```

## Next Steps

This observability stack provides the foundation for:
1. **Performance optimization** based on real metrics
2. **Alerting** on consensus failures or performance degradation
3. **Capacity planning** using historical data
4. **Debugging** complex multi-agent interactions

The stack is designed to scale with additional agents and can be extended with custom metrics and dashboards as the blockchain evolves. 