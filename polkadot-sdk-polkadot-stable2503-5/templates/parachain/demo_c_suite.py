# ----------------------------------------------------------------------------
#  File:        demo_c_suite.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Demo script for C-Suite blockchain interactions
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

"""
C-Suite Blockchain Demo

This script demonstrates the key functionality of the C-Suite blockchain:
1. Agent Registration (Lyra, Echo, Verdict, etc.)
2. Consensus Logging with IPFS CIDs
3. Multi-signature processes
4. Trust score management

Prerequisites:
- C-Suite blockchain running on ws://localhost:9944
- Python with websockets library: pip install websockets
"""

import asyncio
import json
import websockets
import hashlib
from typing import Dict, List, Optional

class CSuiteBlockchainDemo:
    def __init__(self, rpc_url: str = "ws://localhost:9944"):
        self.rpc_url = rpc_url
        self.websocket = None
        self.request_id = 1
        
        # C-Suite Agents as per agents.md
        self.agents = {
            "lyra": "OS/meta-orchestrator, boots and coordinates all agents",
            "echo": "Insight relay / auditing", 
            "verdict": "Legal/compliance output",
            "volt": "Hardware/electrical diagnostics, smart-panel ops",
            "core": "Main processor/insight engine",
            "vitals": "Medical/health diagnostics",
            "sentinel": "Security/surveillance, anomaly detection",
            "theory": "Research & hypothesis generation",
            "beacon": "Knowledge base, recall of facts/data",
            "lens": "Visual analysis, scanner agent",
            "arc": "ECU (vehicle controller), Otto's assistant",
            "otto": "Autonomous vehicle/robotics agent",
            "luma": "Smart home, environmental agent"
        }

    async def connect(self):
        """Connect to the C-Suite blockchain"""
        try:
            self.websocket = await websockets.connect(self.rpc_url)
            print(f"✅ Connected to C-Suite blockchain at {self.rpc_url}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect: {e}")
            return False

    async def disconnect(self):
        """Disconnect from the blockchain"""
        if self.websocket:
            await self.websocket.close()
            print("🔌 Disconnected from blockchain")

    async def send_rpc_request(self, method: str, params: List = None) -> Dict:
        """Send RPC request to the blockchain"""
        if not self.websocket:
            raise Exception("Not connected to blockchain")
        
        request = {
            "id": self.request_id,
            "jsonrpc": "2.0",
            "method": method,
            "params": params or []
        }
        
        await self.websocket.send(json.dumps(request))
        response = await self.websocket.recv()
        
        self.request_id += 1
        return json.loads(response)

    async def get_blockchain_info(self):
        """Get basic blockchain information"""
        print("\n🏢 C-Suite Blockchain Information")
        print("=" * 40)
        
        try:
            # Get system health
            health = await self.send_rpc_request("system_health")
            print(f"📊 System Health: {health.get('result', {})}")
            
            # Get system name
            name = await self.send_rpc_request("system_name")
            print(f"🔗 System Name: {name.get('result', 'Unknown')}")
            
            # Get current block number
            block_hash = await self.send_rpc_request("chain_getBlockHash")
            print(f"📦 Latest Block: {block_hash.get('result', 'Unknown')}")
            
        except Exception as e:
            print(f"❌ Error getting blockchain info: {e}")

    async def demo_agent_registration(self):
        """Demonstrate agent registration functionality"""
        print("\n🤖 Agent Registration Demo")
        print("=" * 40)
        
        # Example of how agent registration would work
        for agent_name, description in list(self.agents.items())[:3]:
            print(f"📝 Registering {agent_name.title()}: {description}")
            
            # This would be the actual extrinsic call:
            # agentRegistry.registerAgent(role, metadata)
            example_extrinsic = {
                "pallet": "agentRegistry",
                "call": "registerAgent",
                "args": {
                    "role": agent_name.title(),
                    "metadata": json.dumps({
                        "description": description,
                        "version": "1.0.0",
                        "capabilities": ["consensus", "logging", "verification"]
                    })
                }
            }
            print(f"   🔧 Extrinsic: {example_extrinsic}")
            print()

    async def demo_consensus_logging(self):
        """Demonstrate consensus logging functionality"""
        print("\n📋 Consensus Logging Demo")
        print("=" * 40)
        
        # Example consensus scenarios
        scenarios = [
            {
                "title": "Q4 Strategic Planning",
                "agents": ["lyra", "echo", "verdict", "core"],
                "cid": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
                "description": "Multi-agent consensus on Q4 strategy"
            },
            {
                "title": "Security Alert Response",
                "agents": ["sentinel", "volt", "lyra"],
                "cid": "QmPBfGqK8f9r7sHv3CqpqQ8LrQR3iGxRZpzrE4KjqX5mH",
                "description": "Emergency security protocol activation"
            },
            {
                "title": "Medical Protocol Update",
                "agents": ["vitals", "verdict", "echo"],
                "cid": "QmTzQ4jKvPDi8fGqY5yN7Q2E4RjqS6GvHx9wX3KmP5Vq",
                "description": "Healthcare compliance protocol revision"
            }
        ]
        
        for scenario in scenarios:
            print(f"📊 {scenario['title']}")
            print(f"   👥 Agents: {', '.join([a.title() for a in scenario['agents']])}")
            print(f"   🗂️  CID: {scenario['cid']}")
            print(f"   📄 Description: {scenario['description']}")
            
            # Example consensus log extrinsic
            example_extrinsic = {
                "pallet": "consensusLog",
                "call": "submitConsensusLog",
                "args": {
                    "cid": scenario['cid'],
                    "agents_involved": scenario['agents'],
                    "metadata": json.dumps({
                        "title": scenario['title'],
                        "description": scenario['description'],
                        "priority": "high",
                        "timestamp": "2025-01-01T00:00:00Z"
                    })
                }
            }
            print(f"   🔧 Extrinsic: {json.dumps(example_extrinsic, indent=6)}")
            print()

    async def demo_trust_scores(self):
        """Demonstrate trust scoring functionality"""
        print("\n📈 Trust Score Management Demo")
        print("=" * 40)
        
        # Example trust score scenarios
        trust_updates = [
            {"agent": "lyra", "change": +10, "reason": "successful_consensus_leadership"},
            {"agent": "echo", "change": +5, "reason": "accurate_audit_reporting"},
            {"agent": "sentinel", "change": +15, "reason": "critical_security_alert"},
            {"agent": "volt", "change": -2, "reason": "delayed_diagnostic_response"}
        ]
        
        for update in trust_updates:
            action = "🔺 Increase" if update['change'] > 0 else "🔻 Decrease"
            print(f"{action} {update['agent'].title()} trust score by {abs(update['change'])}")
            print(f"   📝 Reason: {update['reason']}")
            
            # Example trust score update extrinsic
            example_extrinsic = {
                "pallet": "agentRegistry",
                "call": "incrementTrustScore",
                "args": {
                    "agent_id": update['agent'],
                    "amount": abs(update['change'])
                }
            }
            print(f"   🔧 Extrinsic: {example_extrinsic}")
            print()

    async def demo_custom_rpc_endpoints(self):
        """Demonstrate custom RPC endpoints as per build.md"""
        print("\n🌐 Custom RPC Endpoints Demo")
        print("=" * 40)
        
        # Custom RPC methods as specified in the README
        rpc_methods = [
            {
                "method": "agent_getActiveAgents",
                "description": "Get list of all online agents",
                "params": []
            },
            {
                "method": "agent_getAgentStatus", 
                "description": "Get specific agent status and metadata",
                "params": ["lyra"]
            },
            {
                "method": "agent_getLatestConsensus",
                "description": "Get the most recent consensus record",
                "params": []
            },
            {
                "method": "agent_getConsensusHistory",
                "description": "Get consensus history for a block range",
                "params": [1, 100]
            },
            {
                "method": "agent_getReputationScore",
                "description": "Get current trust score for an agent",
                "params": ["echo"]
            }
        ]
        
        for rpc in rpc_methods:
            print(f"🔗 {rpc['method']}")
            print(f"   📄 {rpc['description']}")
            print(f"   📥 Params: {rpc['params']}")
            
            # Example curl command
            curl_cmd = f"""curl -X POST -H 'Content-Type: application/json' \\
     -d '{{"id":1, "jsonrpc":"2.0", "method": "{rpc['method']}", "params":{json.dumps(rpc['params'])}}}' \\
     http://localhost:9944"""
            print(f"   💻 Curl: {curl_cmd}")
            print()

    async def run_full_demo(self):
        """Run the complete C-Suite blockchain demo"""
        print("🎬 Starting C-Suite Blockchain Demo")
        print("=" * 50)
        
        # Connect to blockchain
        if not await self.connect():
            return
        
        try:
            # Run all demo sections
            await self.get_blockchain_info()
            await self.demo_agent_registration()
            await self.demo_consensus_logging()
            await self.demo_trust_scores()
            await self.demo_custom_rpc_endpoints()
            
            print("\n🎯 Demo Summary")
            print("=" * 40)
            print("✅ Agent Registry Pallet - Register and manage 13 C-Suite agents")
            print("✅ Consensus Log Pallet - Immutable AI output logs with CIDs")
            print("✅ Trust Scoring System - Track agent reliability and participation")
            print("✅ Custom RPC Endpoints - Dashboard integration ready")
            print("✅ Multi-signature Support - Consensus verification")
            print("✅ IPFS/Arweave Integration - Content-addressable storage")
            
            print(f"\n🏢 {len(self.agents)} C-Suite Agents Ready:")
            for agent, desc in self.agents.items():
                print(f"   🤖 {agent.title()}: {desc}")
                
        except Exception as e:
            print(f"❌ Demo error: {e}")
        
        finally:
            await self.disconnect()

async def main():
    """Main demo function"""
    demo = CSuiteBlockchainDemo()
    await demo.run_full_demo()

if __name__ == "__main__":
    print("""
# ----------------------------------------------------------------------------
#  C-Suite Blockchain Demo
#  Celaya Solutions, 2025
# ----------------------------------------------------------------------------
#
#  This demo showcases the enterprise-grade blockchain designed for
#  C-Suite AI agent management and consensus processes.
#
#  Features demonstrated:
#  • Agent Registry (Lyra, Echo, Verdict, Volt, Core, Vitals, etc.)
#  • Consensus Logging with IPFS content identifiers
#  • Trust scoring and reputation management
#  • Custom RPC endpoints for dashboard integration
#  • Multi-signature consensus verification
#
# ----------------------------------------------------------------------------
""")
    
    asyncio.run(main()) 