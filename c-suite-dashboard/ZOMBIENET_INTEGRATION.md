# 🧟 C-Suite Dashboard + Zombienet Integration

Complete integration guide for connecting the C-Suite Dashboard to the zombienet blockchain.

## 🎯 Summary

The C-Suite Dashboard has been fully configured to work with the zombienet blockchain setup. When you run `./c-suite-blockchain.sh zombienet`, the dashboard will automatically connect to the parachain and display real-time data.

## 🔗 Network Architecture

```
Zombienet Network:
┌─────────────────────────────────────────────────────────────┐
│  Relay Chain (Rococo Local)                                │
│  ├─ Alice    (ws://localhost:9944) - Validator            │
│  └─ Bob      (ws://localhost:9955) - Validator            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  C-Suite Parachain (ID: 1000)                             │
│  └─ Charlie  (ws://localhost:9988) - Collator + C-Suite   │
│     Pallets: Agent Registry, Consensus Logs, Reputation   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  C-Suite Dashboard                                         │
│  └─ Next.js  (http://localhost:3000) - Connected to :9988 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start Options

### Option 1: Automated Launch (Recommended)
```bash
cd c-suite-dashboard
./start-dashboard.sh
# or
npm run start-all
```

### Option 2: Manual Steps
```bash
# Terminal 1: Start blockchain
cd ../polkadot-sdk-polkadot-stable2503-5/templates/parachain
./c-suite-blockchain.sh zombienet

# Terminal 2: Start dashboard (wait for blockchain to be ready)
cd c-suite-dashboard
npm run dev
```

### Option 3: NPM Scripts
```bash
npm run check       # Check connection status
npm run blockchain  # Start only the blockchain
npm run dev         # Start only the dashboard
```

## 🔧 Configuration Changes Made

### 1. Updated API Connection (`src/lib/useApi.ts`)
- **Primary endpoint**: `ws://localhost:9988` (C-Suite parachain)
- **Fallback endpoints**: Relay chain Alice (9944) for reference
- **Enhanced error messages**: Guide users to start zombienet
- **Connection retry logic**: Max 3 attempts with exponential backoff

### 2. Enhanced Dashboard Layout (`src/components/layout/dashboard-layout.tsx`)
- **Zombienet status indicator**: Shows parachain + relay chain status
- **Connection info panel**: Displays both parachain and relay endpoints
- **Real-time status updates**: Green/red indicators for connection health

### 3. Improved Homepage (`src/app/page.tsx`)
- **Zombienet startup guide**: Step-by-step instructions
- **Feature overview**: All dashboard capabilities
- **Quick tips**: Connection troubleshooting

### 4. Added Utility Scripts
- **`start-dashboard.sh`**: Automated blockchain + dashboard launcher
- **`check-connection.sh`**: Connection status checker
- **NPM scripts**: Convenient commands for common tasks

## 📊 Dashboard Features with Zombienet

When connected to the zombienet blockchain, the dashboard provides:

### Agent Registry (`/agents`)
- **Live data**: Real-time agent metadata from `AgentRegistry` pallet
- **13 Pre-registered agents**: Lyra, Echo, Verdict, Volt, Core, etc.
- **Trust scores**: Dynamic scoring based on blockchain activity
- **Agent statistics**: Activity counts and reputation metrics

### Consensus Logs (`/consensus`)
- **Immutable records**: Consensus decisions stored on-chain
- **Multi-signature verification**: ED25519 signature validation
- **Timestamp tracking**: Block-level timestamp accuracy
- **Strength indicators**: Visual representation of signature counts

### Real-time Events (`/log`)
- **Live event streaming**: WebSocket connection to `system.events`
- **Pallet filtering**: AgentRegistry, Consensus, System, Balances
- **Block tracking**: Real-time block number updates
- **JSON data display**: Full event data for debugging

### Signature Validation (`/signatures`)
- **ED25519 support**: Native Substrate signature format
- **Real-time verification**: Instant signature validation
- **Agent key lookup**: Connect signatures to registered agents

### Developer Interface (`/submit`)
- **Extrinsic submission**: Direct blockchain interactions
- **Agent operations**: Register, update, consensus logging
- **Form validation**: Type-safe parameter input
- **Transaction status**: Success/failure feedback

### CID Replay (`/replay/[cid]`)
- **Content verification**: IPFS/Arweave CID validation
- **Blockchain proofs**: On-chain hash verification
- **Metadata display**: Full content reconstruction
- **Signature chains**: Multi-agent verification trails

## 🔍 Connection Verification

### Quick Status Check
```bash
./check-connection.sh
```

### Manual Verification
```bash
# Check parachain health
curl -X POST -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
  http://localhost:9988

# Check relay chain health  
curl -X POST -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
  http://localhost:9944
```

## 🛠️ Troubleshooting

### Common Issues

**"Parachain not responding"**
- Ensure zombienet is running: `./c-suite-blockchain.sh status`
- Check if collator started: Look for "Charlie" in zombienet logs
- Wait 30-60 seconds for full startup

**"WebSocket connection failed"**
- Verify port 9988 is open: `lsof -i :9988`
- Check firewall settings
- Restart zombienet if needed

**"Mock data showing instead of real data"**
- This is normal when blockchain is not connected
- Dashboard will automatically switch to real data when connected
- No action needed for development

### Advanced Debugging

**View zombienet logs:**
```bash
tail -f ../blockchain.log  # If using start-dashboard.sh
```

**Check individual components:**
```bash
# Relay chain Alice
curl -s http://localhost:9944/health | jq

# Relay chain Bob  
curl -s http://localhost:9955/health | jq

# Parachain Charlie
curl -s http://localhost:9988/health | jq
```

**Reset everything:**
```bash
# Stop all processes
pkill -f zombienet
pkill -f polkadot  
pkill -f parachain-template-node

# Clear state and restart
rm -rf /tmp/zombie*
./c-suite-blockchain.sh zombienet
```

## 📈 Performance Optimization

### Connection Settings
- **Retry logic**: 3 attempts max to prevent spam
- **Exponential backoff**: 5s, 10s, 20s delay progression
- **Client-side only**: No SSR connection attempts
- **Mock data fallback**: Graceful degradation

### UI Performance
- **Hydration-safe**: No SSR/client mismatches
- **Error boundaries**: Graceful error handling
- **Efficient updates**: Minimal re-renders on connection changes
- **Responsive design**: Mobile-friendly interface

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Dashboard loads** at http://localhost:3000
2. **Green connection indicator** in top-right corner
3. **"Zombienet Active" status** in sidebar
4. **Real agent data** in `/agents` (not mock data)
5. **Live event stream** in `/log` showing blockchain events
6. **No console errors** related to WebSocket connections

## 🔄 Integration Workflow

This integration follows the complete Phase 2 workflow from `docs/integration.md`:

1. ✅ **Scaffold React + ShadCN Dashboard** (Steps 4)
2. ✅ **Create Pages** (Step 5)  
3. ✅ **Connect RPC** (Step 6)
4. ✅ **Zombienet Integration** (This document)

**Next Phase**: Phase 3 - Agent ↔ Chain Integration with LLM toolflow and real agent interactions. 