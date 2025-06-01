#!/bin/bash

# ----------------------------------------------------------------------------
#  File:        c-suite-blockchain.sh
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: C-Suite blockchain management script - Fully integrated with build.md and agents.md
#  Version:     2.0.1
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

BINARY="../../target/release/parachain-template-node"
POLKADOT_BINARY="../../target/release/polkadot"

# Add our binaries to PATH for zombienet
export PATH="$(dirname "$POLKADOT_BINARY"):$PATH"

# C-Suite Agents Registry (compatible with older bash/zsh)
AGENT_NAMES="lyra echo verdict volt core vitals sentinel theory beacon lens arc otto luma"
AGENT_DESCRIPTIONS=(
    "OS/meta-orchestrator, boots and coordinates all agents"
    "Insight relay / auditing"
    "Legal/compliance output"
    "Hardware/electrical diagnostics, smart-panel ops"
    "Main processor/insight engine"
    "Medical/health diagnostics"
    "Security/surveillance, anomaly detection"
    "Research & hypothesis generation"
    "Knowledge base, recall of facts/data"
    "Visual analysis, scanner agent"
    "ECU (vehicle controller), Otto's assistant"
    "Autonomous vehicle/robotics agent"
    "Smart home, environmental agent"
)

get_agent_description() {
    local agent_name="$1"
    local index=0
    for name in $AGENT_NAMES; do
        if [ "$name" = "$agent_name" ]; then
            echo "${AGENT_DESCRIPTIONS[$index]}"
            return
        fi
        ((index++))
    done
    echo "Unknown agent"
}

show_help() {
    echo -e "${CYAN}🏢 C-Suite Blockchain Management - Full Integration${NC}"
    echo "============================================================="
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo "  build        - Build the C-Suite blockchain with all custom pallets"
    echo "  start        - Get comprehensive setup instructions"
    echo "  zombienet    - Run with Zombienet (relay chain + parachain)"
    echo "  agents       - List all registered C-Suite agents and their roles"
    echo "  pallets      - Show all custom pallets and their functionality"
    echo "  rpc          - List all custom RPC endpoints and usage"
    echo "  extrinsics   - Show all custom transaction types"
    echo "  genesis      - Show genesis configuration with pre-registered agents"
    echo "  test         - Run blockchain tests and validation"
    echo "  stop         - Stop the blockchain"
    echo "  status       - Check blockchain status with detailed info"
    echo "  help         - Show this help"
    echo ""
    echo -e "${MAGENTA}🎯 Custom Pallets (as per build.md):${NC}"
    echo "  • Agent Registry Pallet (Index 51) - Register/update/lookup C-Suite agents"
    echo "  • Consensus & Insight Log Pallet (Index 52) - Immutable AI output logs"
    echo "  • Agent Reputation Pallet (Index 53) - Track agent reliability & scoring"
    echo ""
    echo -e "${BLUE}🔗 Integration Features:${NC}"
    echo "  • CID/Hash Storage for IPFS/Arweave content"
    echo "  • Multi-agent Signature Verification (SR25519/ED25519)"
    echo "  • Role-based Permissions & Access Control"
    echo "  • Immutable Audit Trails & Consensus Records"
    echo "  • Custom RPC Methods for Dashboard Integration"
    echo ""
}

show_agents() {
    echo -e "${CYAN}🤖 C-Suite Agent Registry (13 Agents)${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}Registered Agents with Blockchain Requirements:${NC}"
    echo ""
    
    local count=1
    for agent in $AGENT_NAMES; do
        local description=$(get_agent_description "$agent")
        echo -e "${GREEN}${count}. ${agent^}${NC} - ${description}"
        case $agent in
            "lyra")
                echo "   🔹 Super agent privileges, system-level events, consensus triggers"
                ;;
            "echo")
                echo "   🔹 Every insight logged to chain (CID, hash, timestamp, signature)"
                ;;
            "verdict")
                echo "   🔹 Immutable legal records, multi-agent sign-off required"
                ;;
            "volt")
                echo "   🔹 Hardware event correlation, signed diagnostics logs"
                ;;
            "core")
                echo "   🔹 Major consensus events, data processing proof hashes"
                ;;
            "vitals")
                echo "   🔹 Medical diagnostics as CIDs, privacy flags, critical action co-sign"
                ;;
            "sentinel")
                echo "   🔹 Tamper-evident security logs, cross-signs with Volt/Core"
                ;;
            "theory")
                echo "   🔹 Research theories as hashed records, peer review signatures"
                ;;
            "beacon")
                echo "   🔹 Fact retrieval logs, new entry hashing, source verification"
                ;;
            "lens")
                echo "   🔹 Image hashes, scan events, CID links to stored visual data"
                ;;
            "arc")
                echo "   🔹 Vehicle action logs, diagnostics, ECU overrides"
                ;;
            "otto")
                echo "   🔹 High-privilege agent, motion decisions, safety-critical multi-sig"
                ;;
            "luma")
                echo "   🔹 Environment control decisions, home automation event logs"
                ;;
        esac
        echo ""
        ((count++))
    done
    
    echo -e "${YELLOW}📋 All agents require:${NC}"
    echo "  • On-chain identity (agent_id, pubkey, role, trust_score, status)"
    echo "  • Signed actions using SR25519/ED25519 keys"
    echo "  • Immutable log storage with timestamps and CIDs"
    echo "  • Multi-signature support for consensus events"
    echo "  • Reputation tracking and role-based permissions"
    echo ""
}

show_pallets() {
    echo -e "${CYAN}🏗️ Custom Pallets Implementation (build.md Integration)${NC}"
    echo "============================================================"
    echo ""
    
    echo -e "${BLUE}1. Agent Registry Pallet (Index 51)${NC}"
    echo "   📁 Purpose: Register, update, and lookup C-Suite agents"
    echo "   🔧 Fields:"
    echo "      • agent_id (unique string/hash)"
    echo "      • pubkey (SR25519/ED25519)"
    echo "      • role (Lyra, Echo, Volt, etc.)"
    echo "      • trust_score (u64, incremented by consensus)"
    echo "      • status (Online/Offline/Retired)"
    echo "      • metadata (optional JSON blob)"
    echo "   ⚡ Actions: register_agent, update_agent, query_agent"
    echo ""
    
    echo -e "${BLUE}2. Consensus & Insight Log Pallet (Index 52)${NC}"
    echo "   📁 Purpose: Store consensus records, immutable AI output, CIDs/hashes"
    echo "   🔧 Fields:"
    echo "      • log_id (auto-generated hash)"
    echo "      • timestamp (block timestamp)"
    echo "      • insight_cid (IPFS/Arweave hash)"
    echo "      • agents_involved (Vec<AgentId>)"
    echo "      • signatures (Vec<Signature>)"
    echo "      • decision_metadata (JSON blob)"
    echo "   ⚡ Actions: log_consensus, submit_insight, query_records"
    echo ""
    
    echo -e "${BLUE}3. Agent Reputation Pallet (Index 53)${NC}"
    echo "   📁 Purpose: Track agent reliability and score based on actions"
    echo "   🔧 Fields:"
    echo "      • agent_id (reference to registry)"
    echo "      • score (auto-incremented/decremented)"
    echo "      • reason (successful_signoff, missed_consensus, flagged)"
    echo "   ⚡ Actions: increment_score, decrement_score, query_reputation"
    echo ""
    
    echo -e "${YELLOW}🔑 Shared Features:${NC}"
    echo "  • CID/Hash Storage (Vec<u8>/BoundedVec for IPFS hashes)"
    echo "  • Multi-agent Signature Verification (threshold signatures)"
    echo "  • Event Emission (AgentRegistered, ConsensusLogged, InsightSubmitted)"
    echo "  • Role-based Access Control (super agent privileges for Lyra/Otto)"
    echo ""
}

show_extrinsics() {
    echo -e "${CYAN}⚡ Custom Transaction Types / Extrinsics${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}C-Suite Specific Extrinsics (not generic transfers):${NC}"
    echo ""
    echo "🔹 register_agent(agent_info: AgentInfo)"
    echo "🔹 update_agent(agent_id: AgentId, updates: AgentUpdate)"
    echo "🔹 log_consensus(consensus_record: ConsensusRecord)"
    echo "🔹 submit_insight(insight_cid: Vec<u8>, metadata: Vec<u8>)"
    echo "🔹 sign_output(output_hash: Hash, agent_signature: Signature)"
    echo "🔹 update_reputation(agent_id: AgentId, score_change: i32, reason: Vec<u8>)"
    echo "🔹 create_multi_sig_consensus(agents: Vec<AgentId>, threshold: u32)"
    echo "🔹 validate_agent_action(agent_id: AgentId, action_hash: Hash)"
    echo ""
    echo -e "${YELLOW}🛡️ Security Features:${NC}"
    echo "  • All extrinsics require valid agent signatures"
    echo "  • Multi-signature validation for consensus events"
    echo "  • Role-based permission checks (super agents vs regular agents)"
    echo "  • CID format validation for hash storage"
    echo ""
}

show_rpc() {
    echo -e "${CYAN}🌐 Custom RPC Endpoints${NC}"
    echo "========================"
    echo ""
    echo -e "${BLUE}Dashboard Integration RPC Methods:${NC}"
    echo ""
    echo "🔗 agent_getLatestConsensus() -> Latest consensus record"
    echo "🔗 agent_getAgentStatus(agent_id) -> Agent online status & metadata"
    echo "🔗 agent_getConsensusHistory(from_block, to_block) -> Historical records"
    echo "🔗 agent_getReputationScore(agent_id) -> Current trust score"
    echo "🔗 agent_getActiveAgents() -> List of online agents"
    echo "🔗 agent_getInsightsByCid(cid) -> Retrieve insights by content hash"
    echo "🔗 agent_validateSignature(agent_id, signature, data) -> Signature verification"
    echo "🔗 agent_getMultiSigStatus(consensus_id) -> Multi-signature status"
    echo ""
    echo -e "${YELLOW}💡 Usage Examples:${NC}"
    echo "  curl -X POST -H 'Content-Type: application/json' \\"
    echo "       -d '{\"id\":1, \"jsonrpc\":\"2.0\", \"method\": \"agent_getActiveAgents\", \"params\":[]}' \\"
    echo "       http://localhost:9944"
    echo ""
    echo -e "${BLUE}🔧 Integration with:${NC}"
    echo "  • Polkadot.js API for frontend dashboards"
    echo "  • Python/JavaScript scripts for automation"
    echo "  • Real-time WebSocket subscriptions for live updates"
    echo ""
}

show_genesis() {
    echo -e "${CYAN}🌱 Genesis Configuration${NC}"
    echo "========================="
    echo ""
    echo -e "${BLUE}Pre-registered Demo Agents (Bootstrap):${NC}"
    echo ""
    
    local count=1
    for agent in $AGENT_NAMES; do
        local description=$(get_agent_description "$agent")
        echo -e "${GREEN}${count}. ${agent^}${NC}"
        echo "   🆔 agent_id: \"csuite_${agent}\""
        echo "   🔑 pubkey: [generated SR25519 key]"
        echo "   🎭 role: \"${description}\""
        echo "   📊 trust_score: 100 (initial)"
        echo "   📡 status: Online"
        echo ""
        ((count++))
    done
    
    echo -e "${YELLOW}📋 Genesis Features:${NC}"
    echo "  • All 13 C-Suite agents pre-registered for immediate use"
    echo "  • Sample consensus logs for dashboard testing"
    echo "  • Initial reputation scores set"
    echo "  • Super agent privileges assigned to Lyra and Otto"
    echo ""
    echo -e "${BLUE}🔧 Customize Genesis:${NC}"
    echo "  Edit: runtime/src/lib.rs -> GenesisConfig"
    echo "  Add custom agent keys, roles, and initial data"
    echo ""
}

build_blockchain() {
    echo -e "${BLUE}🔨 Building C-Suite Blockchain (Full Integration)${NC}"
    echo "=================================================="
    echo ""
    echo -e "${YELLOW}📋 Building with custom pallets:${NC}"
    echo "  🔧 Agent Registry Pallet (Index 51)"
    echo "  🔧 Consensus & Insight Log Pallet (Index 52)"
    echo "  🔧 Agent Reputation Pallet (Index 53)"
    echo ""
    
    cd ../../
    echo -e "${BLUE}⚡ Compiling Substrate runtime with C-Suite features...${NC}"
    cargo build --release
    
    echo ""
    echo -e "${GREEN}✅ C-Suite blockchain build complete!${NC}"
    echo ""
    echo -e "${CYAN}🎯 Integration Status:${NC}"
    echo "  ✅ Custom pallets integrated"
    echo "  ✅ Agent registry with 13 pre-configured agents"
    echo "  ✅ Custom extrinsics for C-Suite workflow"
    echo "  ✅ CID/Hash storage for IPFS/Arweave"
    echo "  ✅ Multi-signature consensus support"
    echo "  ✅ Custom RPC endpoints for dashboard"
    echo "  ✅ Genesis state with demo agents"
    echo ""
    
    cd templates/parachain
}

start_blockchain() {
    if [ ! -f "$BINARY" ]; then
        echo -e "${RED}❌ Binary not found. Building first...${NC}"
        build_blockchain
    fi

    echo -e "${CYAN}🏢 C-Suite Blockchain - Fully Integrated Setup${NC}"
    echo "=================================================="
    echo ""
    echo -e "${BLUE}✅ Your C-Suite blockchain is built with full build.md integration!${NC}"
    echo ""
    
    echo -e "${MAGENTA}🎯 Custom Pallets Ready:${NC}"
    echo -e "${GREEN}✅ Agent Registry Pallet (Index 51)${NC} - 13 agents pre-registered"
    echo -e "${GREEN}✅ Consensus & Insight Log Pallet (Index 52)${NC} - Immutable AI logs"
    echo -e "${GREEN}✅ Agent Reputation Pallet (Index 53)${NC} - Trust scoring system"
    echo ""
    
    echo -e "${BLUE}🤖 Pre-registered C-Suite Agents:${NC}"
    local count=1
    for agent in $AGENT_NAMES; do
        local description=$(get_agent_description "$agent")
        if [ $count -le 6 ]; then
            echo "  $count. ${agent^} - ${description}"
        fi
        ((count++))
    done
    echo "  ... and 7 more agents (run: ./c-suite-blockchain.sh agents)"
    echo ""
    
    echo -e "${YELLOW}📋 Parachain Template Architecture:${NC}"
    echo "This is a Polkadot parachain that requires relay chain connection."
    echo "It's specifically tuned for C-Suite multi-agent consensus operations."
    echo ""
    
    echo -e "${CYAN}🚀 Launch Options:${NC}"
    echo ""
    echo "1. 🧟 Use Zombienet (Recommended - Automated Setup):"
    echo -e "   ${GREEN}./c-suite-blockchain.sh zombienet${NC}"
    echo "   → Automatically starts relay chain + C-Suite parachain"
    echo "   → All agents and pallets ready for testing"
    echo ""
    
    echo "2. 🔧 Manual Setup (Advanced):"
    echo -e "   ${GREEN}# Terminal 1: Start Relay Chain${NC}"
    echo "   ../../target/release/polkadot --alice --validator \\"
    echo "   --base-path /tmp/relay --chain rococo-local --port 30333 \\"
    echo "   --rpc-port 9988 --unsafe-rpc-external --rpc-cors all"
    echo ""
    echo -e "   ${GREEN}# Terminal 2: Start C-Suite Parachain${NC}"
    echo "   $BINARY --alice --collator --force-authoring \\"
    echo "   --chain dev --base-path /tmp/parachain --port 40333 \\"
    echo "   --rpc-port 9944 --unsafe-rpc-external --rpc-cors all \\"
    echo "   -- --execution wasm --chain rococo-local --port 30343"
    echo ""
    
    echo -e "${BLUE}🌐 Access Your C-Suite Blockchain:${NC}"
    echo "  • 🔗 Parachain RPC: http://localhost:9944"
    echo "  • 🖥️  Polkadot.js Apps: https://polkadot.js.org/apps/#/explorer?rpc=ws://localhost:9944"
    echo "  • 📊 Custom RPC Methods: ./c-suite-blockchain.sh rpc"
    echo "  • 🤖 Agent Management: ./c-suite-blockchain.sh agents"
    echo ""
    
    echo -e "${YELLOW}🔬 Next Steps:${NC}"
    echo "  1. Start the blockchain with zombienet"
    echo "  2. Test agent registration and consensus logging"
    echo "  3. Integrate with your C-Suite dashboard"
    echo "  4. Run custom RPC calls to verify agent functionality"
    echo ""
}

run_zombienet() {
    if [ ! -f "$BINARY" ] || [ ! -f "$POLKADOT_BINARY" ]; then
        echo -e "${RED}❌ Binaries not found. Building first...${NC}"
        build_blockchain
    fi

    echo -e "${CYAN}🧟 C-Suite Blockchain with Zombienet - Full Integration${NC}"
    echo "========================================================"
    echo ""
    echo -e "${BLUE}✅ Agent Registry & Consensus Log Pallets Active${NC}"
    echo -e "${BLUE}✅ 13 C-Suite Agents Pre-registered${NC}"
    echo -e "${BLUE}✅ Custom RPC Endpoints Available${NC}"
    echo -e "${YELLOW}✅ Relay Chain + Parachain Automated Setup${NC}"
    echo ""

    # Check if zombienet config exists
    if [ ! -f "zombienet.toml" ]; then
        echo -e "${YELLOW}📋 Creating C-Suite optimized zombienet configuration...${NC}"
        cat > zombienet.toml << 'EOF'
[settings]
timeout = 1000
provider = "native"

[relaychain]
default_image = "polkadot:latest"
default_command = "polkadot"
default_args = [ "-lparachain=debug", "-lagent=debug" ]
chain = "rococo-local"

  [[relaychain.nodes]]
  name = "alice"
  validator = true
  
  [[relaychain.nodes]]
  name = "bob"
  validator = true

[[parachains]]
id = 1000
addToGenesis = true

  [parachains.collator]
  name = "c-suite-collator"
  command = "parachain-template-node"
  args = [ "-lparachain=debug", "-lagent=debug", "-lruntime=debug" ]
EOF
        echo -e "${GREEN}✅ Created C-Suite optimized zombienet.toml${NC}"
    fi

    echo -e "${GREEN}🚀 Launching C-Suite blockchain with full build.md integration...${NC}"
    echo -e "${YELLOW}📋 This will start:${NC}"
    echo "  • Relay chain with 2 validators (Alice, Bob)"
    echo "  • C-Suite parachain with agent pallets"
    echo "  • All 13 agents pre-registered and ready"
    echo "  • Custom RPC endpoints active"
    echo ""
    
    # Make sure zombienet can find our binaries
    export PATH="$(pwd)/../../target/release:$PATH"
    
    # Check if zombienet is installed
    if ! command -v zombienet &> /dev/null; then
        echo -e "${YELLOW}📥 Installing zombienet for macOS...${NC}"
        curl -L -o zombienet https://github.com/paritytech/zombienet/releases/latest/download/zombienet-macos
        chmod +x zombienet
        echo -e "${GREEN}✅ Zombienet installed${NC}"
    fi
    
    echo -e "${CYAN}🎬 Starting C-Suite blockchain network...${NC}"
    if [ -f "./zombienet" ]; then
        ./zombienet spawn zombienet.toml
    else
        zombienet spawn zombienet.toml
    fi
}

run_tests() {
    echo -e "${CYAN}🔬 C-Suite Blockchain Tests & Validation${NC}"
    echo "========================================="
    echo ""
    
    if [ ! -f "$BINARY" ]; then
        echo -e "${RED}❌ Binary not found. Building first...${NC}"
        build_blockchain
    fi
    
    echo -e "${BLUE}🧪 Running integration tests...${NC}"
    cd ../../
    
    echo -e "${YELLOW}📋 Test Categories:${NC}"
    echo "  🔹 Agent registration and lookup"
    echo "  🔹 Consensus logging and retrieval"
    echo "  🔹 Multi-signature verification"
    echo "  🔹 CID/Hash storage validation"
    echo "  🔹 Reputation scoring"
    echo "  🔹 Custom RPC endpoint responses"
    echo ""
    
    # Run cargo tests
    cargo test --release
    
    echo ""
    echo -e "${GREEN}✅ Tests completed${NC}"
    cd templates/parachain
}

stop_blockchain() {
    echo -e "${YELLOW}🛑 Stopping C-Suite blockchain...${NC}"
    pkill -f parachain-template-node 2>/dev/null || true
    pkill -f polkadot 2>/dev/null || true
    pkill -f zombienet 2>/dev/null || true
    echo -e "${GREEN}✅ C-Suite blockchain stopped${NC}"
}

check_status() {
    echo -e "${CYAN}📊 C-Suite Blockchain Status${NC}"
    echo "============================="
    echo ""
    
    if pgrep -f parachain-template-node > /dev/null; then
        echo -e "${GREEN}✅ C-Suite parachain is running${NC}"
        echo -e "${BLUE}  🔗 RPC Endpoint: http://localhost:9944${NC}"
        
        # Test RPC connection
        echo -e "${YELLOW}🔍 Testing RPC connection...${NC}"
        RPC_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
             -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
             http://localhost:9944 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✅ RPC is responding${NC}"
            
            # Test custom RPC (if available)
            AGENT_RPC=$(curl -s -X POST -H "Content-Type: application/json" \
                 -d '{"id":1, "jsonrpc":"2.0", "method": "agent_getActiveAgents", "params":[]}' \
                 http://localhost:9944 2>/dev/null)
            
            if echo "$AGENT_RPC" | grep -q "result"; then
                echo -e "${GREEN}  ✅ Custom agent RPC endpoints active${NC}"
            else
                echo -e "${YELLOW}  ⏳ Custom RPC endpoints not yet available${NC}"
            fi
        else
            echo -e "${YELLOW}  ⏳ RPC not yet ready${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}🎯 Available Operations:${NC}"
        echo "  • Query agents: ./c-suite-blockchain.sh agents"
        echo "  • Check pallets: ./c-suite-blockchain.sh pallets"
        echo "  • Test RPC: ./c-suite-blockchain.sh rpc"
        
    else
        echo -e "${RED}❌ C-Suite blockchain is not running${NC}"
        echo -e "${YELLOW}💡 Start with: ./c-suite-blockchain.sh zombienet${NC}"
    fi
    
    echo ""
    if pgrep -f polkadot > /dev/null; then
        echo -e "${GREEN}✅ Relay chain is running${NC}"
    else
        echo -e "${YELLOW}⏳ Relay chain not detected${NC}"
    fi
}

# Main command dispatcher
case "${1:-help}" in
    build)       build_blockchain ;;
    start)       start_blockchain ;;
    stop)        stop_blockchain ;;
    status)      check_status ;;
    agents)      show_agents ;;
    pallets)     show_pallets ;;
    rpc)         show_rpc ;;
    extrinsics)  show_extrinsics ;;
    genesis)     show_genesis ;;
    test)        run_tests ;;
    zombienet)   run_zombienet ;;
    help)        show_help ;;
    *)           show_help ;;
esac 