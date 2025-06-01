# C-Suite Blockchain

**Enterprise-Grade Blockchain for C-Suite Agent Management and Consensus**

Built on Polkadot SDK stable2503-5 | License: BSL (BUSL-1.1) | Version: 1.0.0

---

## 🎯 Overview

The C-Suite Blockchain is a specialized enterprise blockchain designed for managing C-Suite AI agents and their consensus processes. Built using the latest Polkadot SDK, it provides a robust, scalable platform for executive decision-making and governance.

### Key Features

- **🤖 Agent Registry**: Register and manage C-Suite AI agents (Lyra, Echo, Verdict, etc.)
- **📋 Consensus Logging**: Record executive decisions and multi-signature consensus
- **🔒 Trust Scoring**: Track agent reliability and participation
- **⚡ High Performance**: Built on Substrate with optimized pallets
- **🌐 Interoperable**: Full Polkadot ecosystem compatibility

---

## 🏗️ Architecture

### Pallets

#### Agent Registry Pallet (Index 51)
Manages the lifecycle of C-Suite agents:
- Agent registration with roles and metadata
- Status management (Online/Offline/Retired/Maintenance)
- Trust score tracking
- Agent authentication and verification

#### Consensus Log Pallet (Index 52)
Handles consensus processes and decision logging:
- Submit consensus proposals with IPFS content identifiers
- Multi-signature support for agent participation
- Automatic finalization when quorum is reached
- Immutable audit trail of executive decisions

### Technical Specifications

- **Runtime**: Polkadot SDK stable2503-5
- **Consensus**: Grandpa + Aura (Development mode)
- **Database**: RocksDB
- **Network**: Development/Testnet ready
- **RPC**: HTTP/WebSocket on port 9944

---

## 🚀 Quick Start

### Prerequisites

- Rust 1.82.0+
- Polkadot SDK workspace environment

### Build & Deploy

```bash
# Clone and navigate to the blockchain
cd polkadot-sdk-polkadot-stable2503-5/templates/parachain

# Build the blockchain
./deploy_c_suite.sh

# Start the node
../../target/release/parachain-template-node --dev --rpc-cors all
```

### Access Points

- **RPC Endpoint**: `http://localhost:9944`
- **WebSocket**: `ws://localhost:9944`
- **Polkadot.js Apps**: [Connect to Local Node](https://polkadot.js.org/apps/#/explorer)

---

## 📚 API Reference

### Agent Registry Pallet

#### Extrinsics

**Register Agent**
```rust
register_agent(role: Vec<u8>, metadata: Option<Vec<u8>>)
```
Register a new C-Suite agent with specified role and optional metadata.

**Update Status**
```rust
update_status(new_status: u8)
```
Update agent status:
- 0: Offline
- 1: Online  
- 2: Retired
- 3: Maintenance

**Update Metadata**
```rust
update_metadata(new_metadata: Option<Vec<u8>>)
```
Update agent metadata and capabilities.

**Increment Trust Score**
```rust
increment_trust_score(agent_id: AccountId, amount: u64)
```
Increment agent trust score (Root/Consensus only).

#### Queries

- `agents(AccountId)`: Get agent information
- `is_agent_active(AccountId)`: Check if agent is online
- `get_trust_score(AccountId)`: Get agent trust score
- `get_active_agents()`: List all active agents

### Consensus Log Pallet

#### Extrinsics

**Submit Consensus Log**
```rust
submit_consensus_log(
    cid: Vec<u8>, 
    agents_involved: Vec<AccountId>, 
    metadata: Option<Vec<u8>>
)
```
Submit a new consensus proposal with content identifier.

**Sign Consensus Log**
```rust
sign_consensus_log(log_id: u32, signature: Vec<u8>)
```
Sign a consensus log to indicate participation.

**Finalize Consensus Log**
```rust
finalize_consensus_log(log_id: u32)
```
Manually finalize a consensus log (Root only).

#### Queries

- `consensus_logs(u32)`: Get consensus log by ID
- `get_consensus_log(u32)`: Helper to get log
- `has_agent_signed(u32, AccountId)`: Check if agent signed
- `get_logs_by_status(ConsensusStatus)`: Filter logs by status

---

## 🔧 Configuration

### Runtime Configuration

```rust
// Agent Registry
impl pallet_agent_registry::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type MaxRoleLength = ConstU32<64>;
    type MaxMetadataLength = ConstU32<2048>;
}

// Consensus Log
impl pallet_consensus_log::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type MaxCIDLength = ConstU32<128>;
    type MaxMetadataLength = ConstU32<4096>;
    type MaxAgentsInvolved = ConstU32<64>;
    type MaxSignatureLength = ConstU32<128>;
    type MaxSignatures = ConstU32<64>;
}
```

### Pallet Indices

- **Agent Registry**: Index 51
- **Consensus Log**: Index 52

---

## 🧪 Testing & Development

### Running Tests

```bash
# Run all tests
cargo test

# Run specific pallet tests
cargo test -p pallet-agent-registry
cargo test -p pallet-consensus-log
```

### Development Mode

```bash
# Start with clean state
../../target/release/parachain-template-node --dev --tmp

# Enable all RPC methods (development only)
../../target/release/parachain-template-node --dev --rpc-methods unsafe
```

### Polkadot.js Apps Integration

1. Navigate to [Polkadot.js Apps](https://polkadot.js.org/apps/)
2. Click "Settings" → "Developer"
3. Add custom types if needed (auto-detection should work)
4. Connect to `ws://localhost:9944`

---

## 📈 Usage Examples

### Register a C-Suite Agent

```javascript
// Using Polkadot.js API
const api = await ApiPromise.create({ provider: wsProvider });

// Register Lyra agent
const tx = api.tx.agentRegistry.registerAgent(
    'Lyra',  // role
    JSON.stringify({ version: '1.0', capabilities: ['analysis', 'reporting'] })  // metadata
);

await tx.signAndSend(account);
```

### Submit Consensus Proposal

```javascript
// Submit consensus log
const consensusTx = api.tx.consensusLog.submitConsensusLog(
    'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',  // IPFS CID
    [lyraAccount, echoAccount, verdictAccount],  // involved agents
    JSON.stringify({ topic: 'Q4 Strategy Review', priority: 'high' })  // metadata
);

await consensusTx.signAndSend(account);
```

---

## 🛠️ Troubleshooting

### Common Issues

**Build Failures**
- Ensure Rust 1.82.0+ is installed
- Run `cargo clean` and rebuild
- Check Polkadot SDK workspace is properly set up

**Connection Issues**
- Verify node is running on port 9944
- Check firewall settings
- Ensure `--rpc-cors all` flag is used

**Transaction Failures**
- Verify account has sufficient balance
- Check transaction parameters match pallet requirements
- Ensure agent is registered before participating in consensus

### Logs & Debugging

```bash
# Enable debug logs
RUST_LOG=debug ../../target/release/parachain-template-node --dev

# Specific pallet logs
RUST_LOG=pallet_agent_registry=debug,pallet_consensus_log=debug \
    ../../target/release/parachain-template-node --dev
```

---

## 🤝 Contributing

This blockchain is part of the Celaya Solutions C-Suite ecosystem. For enterprise support and custom development, contact [chris@celayasolutions.com](mailto:chris@celayasolutions.com).

### Development Guidelines

1. Follow Substrate best practices
2. Maintain backward compatibility
3. Add comprehensive tests for new features
4. Update documentation for API changes

---

## 📄 License

**Business Source License (BUSL-1.1)**

This blockchain is licensed under the Business Source License. Commercial use requires a license agreement. See LICENSE file for details.

---

## 🔗 Resources

- **Polkadot SDK**: [docs.substrate.io](https://docs.substrate.io)
- **Polkadot.js Apps**: [polkadot.js.org/apps](https://polkadot.js.org/apps)
- **Substrate Documentation**: [substrate.dev](https://substrate.dev)
- **Celaya Solutions**: [celayasolutions.com](https://celayasolutions.com)

---

**🎉 C-Suite Blockchain - Powering Enterprise AI Governance** 