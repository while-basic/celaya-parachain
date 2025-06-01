# C-Suite Dashboard

Real-time dashboard for C-Suite blockchain agent registry, consensus logs, and verification system.

## 🚀 Quick Start with Zombienet

The dashboard is designed to work with the C-Suite blockchain running via zombienet:

### Option 1: Automated Startup (Recommended)

```bash
cd c-suite-dashboard
./start-dashboard.sh
```

This script will:
1. Check if the blockchain is running
2. Start zombienet if needed (relay chain + parachain)
3. Wait for the parachain to be ready
4. Launch the dashboard at http://localhost:3000

### Option 2: Manual Startup

```bash
# Terminal 1: Start the blockchain
cd /path/to/parachain-template
./c-suite-blockchain.sh zombienet

# Terminal 2: Start the dashboard (once blockchain is ready)
cd c-suite-dashboard
npm install
npm run dev
```

## 🔗 Connection Details

The dashboard connects to:
- **C-Suite Parachain**: `ws://localhost:9988` (primary connection)
- **Relay Chain (Alice)**: `ws://localhost:9944` (reference)
- **Dashboard UI**: `http://localhost:3000`

## 📊 Features

- **Agent Registry**: Live agent metadata, trust scores, and statistics
- **Consensus Logs**: Recent consensus decisions with signature verification
- **Event Streaming**: Real-time blockchain events via WebSocket
- **Signature Validation**: ED25519 signature verification interface
- **Developer Tools**: Extrinsic submission interface
- **CID Replay**: Content verification and replay functionality

## 🧟 Zombienet Configuration

The blockchain runs with:
- **Relay Chain**: 2 validators (Alice on :9944, Bob on :9955)
- **Parachain**: 1 collator (Charlie on :9988) with C-Suite pallets
- **Pre-registered Agents**: 13 C-Suite agents (Lyra, Echo, Verdict, etc.)

## 🛠️ Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📋 Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Components**: ShadCN UI with Tailwind CSS
- **Blockchain API**: Polkadot.js WebSocket connection
- **Error Handling**: React Error Boundary
- **Build Tool**: Next.js with App Router

## 🔧 Configuration

The dashboard automatically connects to the zombienet parachain. If you need to change endpoints, modify `src/lib/useApi.ts`:

```typescript
const DEFAULT_ENDPOINT = 'ws://localhost:9988'; // C-Suite parachain
const RELAY_ENDPOINT = 'ws://localhost:9944';   // Relay chain Alice
```

## 📝 Troubleshooting

**Connection Issues:**
- Ensure zombienet is running: `./c-suite-blockchain.sh status`
- Check parachain endpoint: `curl -X POST -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' http://localhost:9988`

**Build Errors:**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**WebSocket Spam:**
- The dashboard has retry limits and exponential backoff
- Mock data will display when blockchain is unavailable

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard     │───▶│   Zombienet      │───▶│  C-Suite        │
│ (Next.js :3000) │    │ (Parachain :9988)│    │  Pallets        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Relay Chain    │
                       │  (Alice :9944)   │
                       └──────────────────┘
```

## 🚀 Phase 2 Implementation Complete

This dashboard implements all the core features specified in Phase 2 of the C-Suite blockchain project:

### ✅ Features Implemented

- **🤖 Agent Registry** - Live monitoring of registered agents, trust scores, and metadata
- **🔐 Consensus Logs** - Recent consensus decisions and signature verification status  
- **📊 CID Replay** - Content replay interface using Content IDs for verification
- **🔍 Signature Validator** - Agent signature verification and validation tools
- **📡 Real-time Event Log** - Live blockchain event streaming via `api.query.system.events()`
- **⚙️ Developer Interface** - Extrinsic submission for testing (`register_agent`, `submit_insight`, etc.)

### 🛠 Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Components**: ShadCN UI with Tailwind CSS
- **Blockchain API**: Polkadot.js API for WebSocket RPC connection
- **Styling**: Modern gradient design with responsive layout

### 🏗 Architecture

```
c-suite-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home dashboard
│   │   ├── agents/            # Agent registry page
│   │   ├── consensus/         # Consensus logs page
│   │   ├── signatures/        # Signature validator
│   │   ├── log/              # Real-time event log
│   │   ├── submit/           # Dev extrinsic interface
│   │   └── replay/[cid]/     # CID-based replay
│   ├── components/
│   │   ├── ui/               # ShadCN UI components
│   │   └── layout/           # Dashboard layout
│   └── lib/
│       └── useApi.ts         # Polkadot API connection hook
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running C-Suite blockchain node (optional for development)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Blockchain Connection

The dashboard connects to your C-Suite blockchain node via WebSocket:

- **Default endpoint**: `ws://localhost:9944`
- **Connection status**: Displayed in top-right corner
- **Fallback**: Mock data for development when blockchain unavailable

## 📱 Pages Overview

### 🏠 Home Dashboard
- Welcome interface with system overview
- Quick start guide for developers and monitoring
- Technical details and connection status

### 🤖 Agents Registry (`/agents`)
- Live list of registered agents
- Trust scores and metadata display
- Agent capabilities and version tracking
- Statistics: Total agents, active agents, average trust score

### 🔐 Consensus Logs (`/consensus`) 
- Recent consensus decisions table
- Signature verification status
- Consensus strength indicators
- Real-time updates from blockchain

### 🔍 Signature Validator (`/signatures`)
- Agent signature verification interface
- Message authenticity validation
- ED25519 signature format support
- Real-time verification results

### 📡 Event Log (`/log`)
- Real-time blockchain event streaming
- Event filtering by pallet (agentRegistry, consensus, system, balances)
- Live/stopped stream controls
- JSON event data display for debugging

### ⚙️ Submit Extrinsics (`/submit`)
- Developer interface for testing blockchain interactions
- Forms for: Agent registration, Insight submission, Consensus logging
- Mock transaction simulation
- Transaction hash and details display

### 📊 CID Replay (`/replay/[cid]`)
- Content replay using Content IDs
- Agent insight verification and display
- Technical metadata and data sources
- Signature verification details

## 🔧 Development Features

- **Mock Data**: Fallback data when blockchain unavailable
- **Real-time Updates**: Live connection to blockchain events
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful connection error management
- **TypeScript**: Full type safety throughout

## 🌐 Connection Status

The dashboard displays real-time connection status:

- 🟢 **Connected**: Live blockchain connection
- 🟡 **Connecting**: Attempting to connect
- 🔴 **Disconnected**: Connection failed (shows mock data)

## 🔮 Next Steps (Phase 3)

- Agent keygen and signing integration
- LLM ↔ Blockchain toolflow
- End-to-end agent proof testing
- Public testnet deployment
- SDK development (`@celaya/sdk`)

## 📄 License

BSL (SPDX id BUSL) - Celaya Solutions, 2025

---

**Built with ❤️ by Celaya Solutions**
