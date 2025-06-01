# ----------------------------------------------------------------------------
#  File:        lyra_cli.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Lyra Agent CLI - Interactive Command Line Interface
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from agents.lyra.lyra_agent_enhanced import LyraAgentEnhanced

class LyraCLI:
    """Command Line Interface for Lyra Agent - OS/Meta-Orchestrator"""
    
    def __init__(self):
        self.agent = None
        self.config = {
            'max_agents': 13,
            'consensus_timeout': 300
        }
        
    async def start(self):
        """Start the CLI session"""
        print("🏢 Lyra Agent - OS/Meta-Orchestrator")
        print("=" * 60)
        print("The supreme coordinator of all C-Suite agents")
        print("Commands: boot, register, consensus, health, delegate, status, tools, help, exit")
        print("=" * 60)
        
        self.agent = LyraAgentEnhanced(self.config)
        
        while True:
            try:
                command = input("\nlyra> ").strip().lower()
                
                if command == "exit":
                    print("🏢 Lyra Agent shutting down...")
                    break
                elif command == "help":
                    self.show_help()
                elif command == "boot":
                    await self.handle_boot()
                elif command == "register":
                    await self.handle_register()
                elif command == "consensus":
                    await self.handle_consensus()
                elif command == "health":
                    await self.handle_health()
                elif command == "delegate":
                    await self.handle_delegate()
                elif command == "status":
                    await self.handle_status()
                elif command == "tools":
                    self.show_tools()
                elif command == "":
                    continue
                else:
                    print(f"❌ Unknown command: {command}")
                    print("Type 'help' for available commands")
                    
            except KeyboardInterrupt:
                print("\n🏢 Lyra Agent shutting down...")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

    def show_help(self):
        """Show available commands"""
        commands = {
            "boot": "Boot the C-Suite agent system",
            "register": "Register a new agent with the orchestrator",
            "consensus": "Initiate multi-agent consensus on a topic",
            "health": "Check system and agent health status",
            "delegate": "Delegate authority to another agent",
            "status": "Show current system status and metrics",
            "tools": "List all available tools",
            "help": "Show this help message",
            "exit": "Exit Lyra CLI"
        }
        
        print("\n🏢 Lyra Agent Commands:")
        print("-" * 40)
        for cmd, desc in commands.items():
            print(f"  {cmd:12} - {desc}")

    def show_tools(self):
        """Show all available tools"""
        if not self.agent:
            print("❌ Agent not initialized")
            return
            
        tools = self.agent.get_available_tools()
        print(f"\n🔧 Available Tools ({len(tools)} total):")
        print("-" * 50)
        
        for tool in tools:
            print(f"  📋 {tool['name']}")
            print(f"     {tool['description']}")
            if 'parameters' in tool and tool['parameters']:
                print("     Parameters:")
                for param, desc in tool['parameters'].items():
                    print(f"       - {param}: {desc}")
            print()

    async def handle_boot(self):
        """Handle system boot command"""
        print("\n🚀 Initiating C-Suite System Boot...")
        
        # Ask for specific agents or boot all
        response = input("Boot specific agents? (Enter agent IDs separated by commas, or press Enter for all): ").strip()
        
        target_agents = None
        if response:
            target_agents = [agent.strip() for agent in response.split(',')]
            print(f"Target agents: {target_agents}")
        else:
            print("Booting all expected agents...")
        
        try:
            result = await self.agent.lyra_boot_system(target_agents)
            
            print(f"\n🎯 Boot Results:")
            print(f"   System Ready: {'✅' if result['system_ready'] else '❌'} {result['system_ready']}")
            print(f"   Online Agents: {result.get('online_agents', 0)}/{result.get('total_agents', 0)}")
            print(f"   Readiness: {result.get('readiness_percentage', 0):.1f}%")
            print(f"   Boot Time: {result.get('boot_time_seconds', 0):.2f}s")
            
            if 'boot_status' in result:
                print(f"\n📊 Agent Status:")
                for agent_id, status in result['boot_status'].items():
                    status_emoji = "✅" if status['status'] == 'online' else "❌"
                    print(f"   {status_emoji} {agent_id}: {status['status']}")
                    if 'error' in status:
                        print(f"      Error: {status['error']}")
                        
        except Exception as e:
            print(f"❌ Boot failed: {e}")

    async def handle_register(self):
        """Handle agent registration"""
        print("\n📝 Agent Registration")
        
        try:
            agent_id = input("Agent ID: ").strip()
            if not agent_id:
                print("❌ Agent ID required")
                return
                
            role = input("Agent Role: ").strip()
            if not role:
                print("❌ Agent role required")
                return
                
            capabilities_input = input("Capabilities (comma-separated): ").strip()
            capabilities = [cap.strip() for cap in capabilities_input.split(',')] if capabilities_input else []
            
            result = await self.agent.lyra_register_agent(agent_id, role, capabilities)
            
            if result['success']:
                print(f"✅ Agent {agent_id} registered successfully!")
                print(f"   Role: {role}")
                print(f"   Capabilities: {capabilities}")
                print(f"   Total Agents: {result['total_agents']}")
                print(f"   Event ID: {result['event_id']}")
            else:
                print(f"❌ Registration failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Registration error: {e}")

    async def handle_consensus(self):
        """Handle consensus coordination"""
        print("\n🤝 Multi-Agent Consensus")
        
        try:
            topic = input("Consensus Topic: ").strip()
            if not topic:
                print("❌ Topic required")
                return
                
            proposal = input("Proposal: ").strip()
            if not proposal:
                print("❌ Proposal required")
                return
                
            agents_input = input("Required agents (comma-separated, or Enter for all): ").strip()
            required_agents = [agent.strip() for agent in agents_input.split(',')] if agents_input else None
            
            timeout_input = input("Timeout in minutes (default 5): ").strip()
            timeout_minutes = int(timeout_input) if timeout_input else 5
            
            print(f"\n🎯 Initiating consensus on: {topic}")
            print(f"   Proposal: {proposal}")
            print(f"   Timeout: {timeout_minutes} minutes")
            
            result = await self.agent.lyra_coordinate_consensus(
                topic, proposal, required_agents, timeout_minutes
            )
            
            print(f"\n📊 Consensus Results:")
            print(f"   Status: {'✅' if result.get('status') == 'passed' else '❌'} {result.get('status', 'failed')}")
            print(f"   Votes For: {result.get('votes_for', 0)}")
            print(f"   Votes Against: {result.get('votes_against', 0)}")
            print(f"   Participation: {result.get('participation_rate', 0):.1%}")
            print(f"   Consensus Rate: {result.get('consensus_rate', 0):.1%}")
            
            if 'vote_details' in result:
                print(f"\n🗳️ Vote Details:")
                for agent_id, vote_data in result['vote_details'].items():
                    vote_emoji = "✅" if vote_data['vote'] else "❌"
                    print(f"   {vote_emoji} {agent_id}: {vote_data['reasoning']}")
                    
        except Exception as e:
            print(f"❌ Consensus error: {e}")

    async def handle_health(self):
        """Handle system health check"""
        print("\n💓 System Health Check")
        
        try:
            result = await self.agent.lyra_monitor_system_health()
            
            system_health = result['system_health']
            
            # Overall status
            status_emoji = {"healthy": "✅", "degraded": "⚠️", "critical": "❌"}.get(
                system_health['overall_status'], "❓"
            )
            
            print(f"\n🏥 System Status: {status_emoji} {system_health['overall_status'].upper()}")
            print(f"   Health Percentage: {system_health.get('health_percentage', 0):.1f}%")
            print(f"   Healthy Agents: {system_health.get('healthy_agents', 0)}/{system_health.get('total_agents', 0)}")
            print(f"   Total Events: {system_health.get('total_events', 0)}")
            print(f"   Critical Alerts: {system_health.get('critical_alerts', 0)}")
            print(f"   Consensus Success Rate: {system_health.get('consensus_success_rate', 0):.1%}")
            
            # Agent status
            if 'agent_status' in result:
                print(f"\n👥 Agent Health:")
                for agent_id, status in result['agent_status'].items():
                    status_emoji = {"healthy": "✅", "unhealthy": "⚠️", "error": "❌"}.get(
                        status['status'], "❓"
                    )
                    print(f"   {status_emoji} {agent_id}: {status['status']}")
                    if 'error' in status:
                        print(f"      Error: {status['error']}")
            
            # Critical issues
            if result.get('critical_issues'):
                print(f"\n⚠️ Critical Issues:")
                for issue in result['critical_issues']:
                    print(f"   - {issue}")
            
            # Recommendations
            if result.get('recommendations'):
                print(f"\n💡 Recommendations:")
                for rec in result['recommendations']:
                    print(f"   - {rec}")
                    
        except Exception as e:
            print(f"❌ Health check error: {e}")

    async def handle_delegate(self):
        """Handle authority delegation"""
        print("\n🔑 Authority Delegation")
        
        try:
            target_agent = input("Target Agent ID: ").strip()
            if not target_agent:
                print("❌ Target agent required")
                return
                
            privileges_input = input("Privileges to delegate (comma-separated): ").strip()
            if not privileges_input:
                print("❌ Privileges required")
                return
                
            privileges = [priv.strip() for priv in privileges_input.split(',')]
            
            duration_input = input("Duration in minutes (default 60): ").strip()
            duration = int(duration_input) if duration_input else 60
            
            result = await self.agent.lyra_delegate_authority(target_agent, privileges, duration)
            
            if result['success']:
                print(f"✅ Authority delegated successfully!")
                print(f"   Delegate: {target_agent}")
                print(f"   Privileges: {privileges}")
                print(f"   Expires: {result['expires_at']}")
                print(f"   Delegation ID: {result['delegation_id']}")
                print(f"   Notification Sent: {'✅' if result['notification_sent'] else '❌'}")
            else:
                print(f"❌ Delegation failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Delegation error: {e}")

    async def handle_status(self):
        """Handle status display"""
        print("\n📊 Lyra Agent Status")
        
        try:
            # System health overview
            print(f"\n🏢 System Overview:")
            print(f"   Agent ID: {self.agent.agent_id}")
            print(f"   Super Agent: {'✅' if self.agent.is_super_agent else '❌'}")
            print(f"   Max Agents: {self.agent.max_agents}")
            print(f"   Registered Agents: {len(self.agent.registered_agents)}")
            print(f"   Active Consensus: {len(self.agent.active_consensus)}")
            print(f"   System Events: {len(self.agent.system_events)}")
            
            # System health
            health = self.agent.system_health
            print(f"\n💓 System Health:")
            print(f"   Status: {health['overall_status']}")
            print(f"   Uptime Start: {health['uptime_start']}")
            print(f"   Total Events: {health['total_events']}")
            print(f"   Critical Alerts: {health['critical_alerts']}")
            print(f"   Consensus Success Rate: {health.get('consensus_success_rate', 0):.1%}")
            
            # Registered agents
            if self.agent.registered_agents:
                print(f"\n👥 Registered Agents:")
                for agent_id, agent_info in self.agent.registered_agents.items():
                    print(f"   📋 {agent_id}")
                    print(f"      Role: {agent_info.role}")
                    print(f"      Status: {agent_info.status.value}")
                    print(f"      Trust Score: {agent_info.trust_score:.2f}")
                    print(f"      Capabilities: {len(agent_info.capabilities)}")
            
            # Active consensus
            if self.agent.active_consensus:
                print(f"\n🤝 Active Consensus:")
                for consensus_id, consensus in self.agent.active_consensus.items():
                    print(f"   📋 {consensus_id}")
                    print(f"      Topic: {consensus.topic}")
                    print(f"      Status: {consensus.status}")
                    print(f"      Votes: {len(consensus.votes)}/{len(consensus.required_agents)}")
                    
        except Exception as e:
            print(f"❌ Status error: {e}")

async def main():
    """Main CLI entry point"""
    cli = LyraCLI()
    await cli.start()

if __name__ == "__main__":
    asyncio.run(main()) 