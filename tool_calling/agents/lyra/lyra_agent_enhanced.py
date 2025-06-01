# ----------------------------------------------------------------------------
#  File:        lyra_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Lyra Agent - OS/Meta-Orchestrator with System Coordination
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import sys
from enum import Enum

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from core.core_tools import CoreTools

class AgentStatus(Enum):
    OFFLINE = "offline"
    ONLINE = "online"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    BOOTING = "booting"

class SystemPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class AgentInfo:
    """Information about a registered C-Suite agent"""
    agent_id: str
    role: str
    status: AgentStatus
    capabilities: List[str]
    last_heartbeat: str
    trust_score: float
    uptime: float
    current_task: Optional[str] = None

@dataclass
class SystemEvent:
    """System-level event for orchestration"""
    event_id: str
    event_type: str
    priority: SystemPriority
    description: str
    involved_agents: List[str]
    timestamp: str
    status: str = "pending"

@dataclass
class ConsensusRequest:
    """Multi-agent consensus request"""
    consensus_id: str
    proposer: str
    topic: str
    proposal: str
    required_agents: List[str]
    votes: Dict[str, bool]
    status: str = "active"
    created_at: str = None
    deadline: str = None

class LyraAgentEnhanced(CoreTools):
    """
    Enhanced Lyra - OS/Meta-Orchestrator Agent
    
    The highest-privilege agent responsible for:
    - Booting and coordinating all C-Suite agents
    - System-level event management
    - Multi-agent consensus orchestration
    - Authority delegation and privilege management
    - System health monitoring and maintenance
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize core tools with super agent privileges
        super().__init__("lyra_agent", config)
        
        # Lyra-specific configuration
        self.is_super_agent = True
        self.max_agents = config.get('max_agents', 13)
        self.consensus_timeout = config.get('consensus_timeout', 300)  # 5 minutes
        
        # Agent registry and system state
        self.registered_agents: Dict[str, AgentInfo] = {}
        self.system_events: Dict[str, SystemEvent] = {}
        self.active_consensus: Dict[str, ConsensusRequest] = {}
        
        # System monitoring
        self.system_health = {
            'overall_status': 'initializing',
            'uptime_start': datetime.utcnow().isoformat(),
            'total_events': 0,
            'critical_alerts': 0,
            'consensus_success_rate': 1.0
        }
        
        # Known C-Suite agents and their expected roles
        self.expected_agents = {
            'beacon_agent': 'Knowledge & Insight Agent',
            'theory_agent': 'Fact-Checking & Validation Agent', 
            'core_agent': 'Main Processor & Insight Engine',
            'echo_agent': 'Insight Relay & Auditing Agent',
            'verdict_agent': 'Legal & Compliance Agent',
            'volt_agent': 'Hardware & Electrical Diagnostics Agent',
            'vitals_agent': 'Medical & Health Diagnostics Agent',
            'sentinel_agent': 'Security & Surveillance Agent',
            'lens_agent': 'Visual Analysis & Scanner Agent',
            'arc_agent': 'ECU & Vehicle Controller Agent',
            'otto_agent': 'Autonomous Vehicle & Robotics Agent',
            'luma_agent': 'Smart Home & Environmental Agent'
        }

    # =============================================================================
    # LYRA-SPECIFIC ORCHESTRATION TOOLS
    # =============================================================================

    async def lyra_register_agent(self, agent_id: str, role: str, 
                                 capabilities: List[str]) -> Dict[str, Any]:
        """
        Register a new C-Suite agent with the orchestrator
        """
        try:
            # Validate agent registration
            if agent_id in self.registered_agents:
                return {
                    'success': False,
                    'error': f'Agent {agent_id} already registered',
                    'existing_role': self.registered_agents[agent_id].role
                }
            
            if len(self.registered_agents) >= self.max_agents:
                return {
                    'success': False,
                    'error': f'Maximum agents ({self.max_agents}) already registered'
                }
            
            # Create agent info
            agent_info = AgentInfo(
                agent_id=agent_id,
                role=role,
                status=AgentStatus.ONLINE,
                capabilities=capabilities,
                last_heartbeat=datetime.utcnow().isoformat(),
                trust_score=0.8,  # Default trust
                uptime=0.0
            )
            
            # Register the agent
            self.registered_agents[agent_id] = agent_info
            
            # Log registration event
            event_id = await self._create_system_event(
                'agent_registration',
                SystemPriority.HIGH,
                f'Agent {agent_id} registered with role: {role}',
                [agent_id]
            )
            
            # Log to blockchain
            await self.recall_log_insight(
                f'Agent registration: {agent_id} as {role}',
                {
                    'type': 'agent_registration',
                    'agent_id': agent_id,
                    'role': role,
                    'capabilities': capabilities,
                    'event_id': event_id
                }
            )
            
            return {
                'success': True,
                'agent_id': agent_id,
                'role': role,
                'event_id': event_id,
                'total_agents': len(self.registered_agents)
            }
            
        except Exception as e:
            await self.security_log_risk(f"Agent registration failed: {e}", "high")
            return {'success': False, 'error': str(e)}

    async def lyra_boot_system(self, target_agents: List[str] = None) -> Dict[str, Any]:
        """
        Boot the C-Suite agent system and coordinate startup
        """
        try:
            boot_start = time.time()
            
            # Log system boot initiation
            boot_event_id = await self._create_system_event(
                'system_boot',
                SystemPriority.CRITICAL,
                'Initiating C-Suite system boot sequence',
                target_agents or list(self.expected_agents.keys())
            )
            
            boot_results = {
                'boot_event_id': boot_event_id,
                'started_at': datetime.utcnow().isoformat(),
                'target_agents': target_agents or list(self.expected_agents.keys()),
                'boot_status': {},
                'system_ready': False
            }
            
            # If specific agents not specified, try to contact all expected agents
            agents_to_boot = target_agents or list(self.expected_agents.keys())
            
            # Attempt to contact and coordinate with each agent
            for agent_id in agents_to_boot:
                try:
                    # Try to communicate with the agent
                    response = await self.tools_call_agent(
                        agent_id,
                        "System boot coordination - please report status and capabilities"
                    )
                    
                    if response.get('success'):
                        boot_results['boot_status'][agent_id] = {
                            'status': 'online',
                            'response': response
                        }
                        
                        # If not already registered, attempt registration
                        if agent_id not in self.registered_agents:
                            expected_role = self.expected_agents.get(agent_id, 'Unknown Agent')
                            capabilities = response.get('capabilities', ['basic_tools'])
                            
                            reg_result = await self.lyra_register_agent(
                                agent_id, expected_role, capabilities
                            )
                            boot_results['boot_status'][agent_id]['registration'] = reg_result
                    
                    else:
                        boot_results['boot_status'][agent_id] = {
                            'status': 'failed',
                            'error': response.get('error', 'No response')
                        }
                        
                except Exception as e:
                    boot_results['boot_status'][agent_id] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            # Calculate system readiness
            online_agents = sum(1 for status in boot_results['boot_status'].values() 
                              if status['status'] == 'online')
            total_agents = len(agents_to_boot)
            readiness_percentage = (online_agents / total_agents) * 100 if total_agents > 0 else 0
            
            boot_results['online_agents'] = online_agents
            boot_results['total_agents'] = total_agents
            boot_results['readiness_percentage'] = readiness_percentage
            boot_results['system_ready'] = readiness_percentage >= 60  # 60% threshold for "ready"
            boot_results['boot_time_seconds'] = time.time() - boot_start
            
            # Update system health
            self.system_health['overall_status'] = 'operational' if boot_results['system_ready'] else 'degraded'
            
            # Log boot completion
            await self.recall_log_insight(
                f'System boot completed: {online_agents}/{total_agents} agents online ({readiness_percentage:.1f}%)',
                {
                    'type': 'system_boot_complete',
                    'boot_event_id': boot_event_id,
                    'online_agents': online_agents,
                    'total_agents': total_agents,
                    'readiness_percentage': readiness_percentage,
                    'boot_time': boot_results['boot_time_seconds']
                }
            )
            
            return boot_results
            
        except Exception as e:
            await self.security_log_risk(f"System boot failed: {e}", "critical")
            return {
                'success': False,
                'error': str(e),
                'system_ready': False
            }

    async def lyra_coordinate_consensus(self, topic: str, proposal: str,
                                      required_agents: List[str] = None,
                                      timeout_minutes: int = 5) -> Dict[str, Any]:
        """
        Coordinate multi-agent consensus on a decision or proposal
        """
        try:
            consensus_id = f"consensus_{int(time.time())}"
            deadline = datetime.utcnow() + timedelta(minutes=timeout_minutes)
            
            # Default to all registered agents if none specified
            if required_agents is None:
                required_agents = list(self.registered_agents.keys())
            
            # Create consensus request
            consensus_request = ConsensusRequest(
                consensus_id=consensus_id,
                proposer=self.agent_id,
                topic=topic,
                proposal=proposal,
                required_agents=required_agents,
                votes={},
                status='active',
                created_at=datetime.utcnow().isoformat(),
                deadline=deadline.isoformat()
            )
            
            self.active_consensus[consensus_id] = consensus_request
            
            # Create system event
            event_id = await self._create_system_event(
                'consensus_initiated',
                SystemPriority.HIGH,
                f'Consensus requested on: {topic}',
                required_agents
            )
            
            # Request votes from all required agents
            consensus_task = f"""
            CONSENSUS REQUEST: {consensus_id}
            Topic: {topic}
            Proposal: {proposal}
            
            Please vote: respond with {{'vote': true}} for agree or {{'vote': false}} for disagree.
            Include your reasoning in the 'reasoning' field.
            Deadline: {deadline.isoformat()}
            """
            
            vote_tasks = []
            for agent_id in required_agents:
                if agent_id in self.registered_agents:
                    vote_tasks.append(
                        self._request_consensus_vote(consensus_id, agent_id, consensus_task)
                    )
            
            # Wait for votes or timeout
            try:
                await asyncio.wait_for(
                    asyncio.gather(*vote_tasks, return_exceptions=True),
                    timeout=timeout_minutes * 60
                )
            except asyncio.TimeoutError:
                pass
            
            # Calculate consensus result
            result = await self._finalize_consensus(consensus_id)
            
            # Log consensus completion
            await self.recall_log_insight(
                f'Consensus completed: {consensus_id} - {result["status"]}',
                {
                    'type': 'consensus_complete',
                    'consensus_id': consensus_id,
                    'topic': topic,
                    'result': result['status'],
                    'votes_for': result['votes_for'],
                    'votes_against': result['votes_against'],
                    'event_id': event_id
                }
            )
            
            return result
            
        except Exception as e:
            await self.security_log_risk(f"Consensus coordination failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'consensus_id': consensus_id if 'consensus_id' in locals() else None
            }

    async def lyra_monitor_system_health(self) -> Dict[str, Any]:
        """
        Monitor overall system health and agent status
        """
        try:
            health_check_start = time.time()
            
            # Check all registered agents
            agent_status = {}
            critical_issues = []
            
            for agent_id, agent_info in self.registered_agents.items():
                try:
                    # Send health ping
                    response = await self.tools_call_agent(
                        agent_id, 
                        "Health check - please report current status"
                    )
                    
                    if response.get('success'):
                        # Update last heartbeat
                        agent_info.last_heartbeat = datetime.utcnow().isoformat()
                        agent_info.status = AgentStatus.ONLINE
                        
                        agent_status[agent_id] = {
                            'status': 'healthy',
                            'last_response_time': response.get('response_time', 'N/A'),
                            'current_task': response.get('current_task')
                        }
                    else:
                        agent_info.status = AgentStatus.ERROR
                        issue = f"Agent {agent_id} health check failed"
                        critical_issues.append(issue)
                        
                        agent_status[agent_id] = {
                            'status': 'unhealthy',
                            'error': response.get('error', 'No response')
                        }
                        
                except Exception as e:
                    agent_info.status = AgentStatus.ERROR
                    issue = f"Agent {agent_id} communication error: {str(e)}"
                    critical_issues.append(issue)
                    
                    agent_status[agent_id] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            # Calculate health metrics
            total_agents = len(self.registered_agents)
            healthy_agents = sum(1 for status in agent_status.values() 
                               if status['status'] == 'healthy')
            
            health_percentage = (healthy_agents / total_agents * 100) if total_agents > 0 else 0
            
            # Update system health
            overall_status = 'healthy'
            if health_percentage < 50:
                overall_status = 'critical'
            elif health_percentage < 80:
                overall_status = 'degraded'
            
            self.system_health.update({
                'overall_status': overall_status,
                'health_percentage': health_percentage,
                'healthy_agents': healthy_agents,
                'total_agents': total_agents,
                'critical_issues': critical_issues,
                'last_health_check': datetime.utcnow().isoformat(),
                'check_duration': time.time() - health_check_start
            })
            
            # Log health check if there are issues
            if critical_issues:
                await self.security_log_risk(
                    f"System health issues detected: {len(critical_issues)} problems",
                    "high" if health_percentage > 50 else "critical"
                )
            
            health_report = {
                'system_health': self.system_health.copy(),
                'agent_status': agent_status,
                'critical_issues': critical_issues,
                'recommendations': self._generate_health_recommendations(agent_status)
            }
            
            return health_report
            
        except Exception as e:
            await self.security_log_risk(f"Health monitoring failed: {e}", "critical")
            return {
                'success': False,
                'error': str(e),
                'system_health': self.system_health.copy()
            }

    async def lyra_delegate_authority(self, target_agent: str, privileges: List[str],
                                    duration_minutes: int = 60) -> Dict[str, Any]:
        """
        Delegate temporary authority to another agent
        """
        try:
            if target_agent not in self.registered_agents:
                return {
                    'success': False,
                    'error': f'Agent {target_agent} not registered'
                }
            
            delegation_id = f"delegation_{int(time.time())}"
            expiry = datetime.utcnow() + timedelta(minutes=duration_minutes)
            
            delegation_record = {
                'delegation_id': delegation_id,
                'delegator': self.agent_id,
                'delegate': target_agent,
                'privileges': privileges,
                'granted_at': datetime.utcnow().isoformat(),
                'expires_at': expiry.isoformat(),
                'status': 'active'
            }
            
            # Log delegation to blockchain
            await self.recall_log_insight(
                f'Authority delegated to {target_agent}: {", ".join(privileges)}',
                {
                    'type': 'authority_delegation',
                    'delegation_record': delegation_record
                }
            )
            
            # Notify the delegate
            notification = await self.tools_call_agent(
                target_agent,
                f"Authority delegation: You have been granted privileges {privileges} "
                f"until {expiry.isoformat()}. Delegation ID: {delegation_id}"
            )
            
            return {
                'success': True,
                'delegation_id': delegation_id,
                'delegate': target_agent,
                'privileges': privileges,
                'expires_at': expiry.isoformat(),
                'notification_sent': notification.get('success', False)
            }
            
        except Exception as e:
            await self.security_log_risk(f"Authority delegation failed: {e}", "high")
            return {'success': False, 'error': str(e)}

    # =============================================================================
    # HELPER METHODS
    # =============================================================================

    async def _create_system_event(self, event_type: str, priority: SystemPriority,
                                 description: str, involved_agents: List[str]) -> str:
        """Create and log a system event"""
        event_id = f"event_{int(time.time())}"
        
        system_event = SystemEvent(
            event_id=event_id,
            event_type=event_type,
            priority=priority,
            description=description,
            involved_agents=involved_agents,
            timestamp=datetime.utcnow().isoformat()
        )
        
        self.system_events[event_id] = system_event
        self.system_health['total_events'] += 1
        
        if priority == SystemPriority.CRITICAL:
            self.system_health['critical_alerts'] += 1
        
        return event_id

    async def _request_consensus_vote(self, consensus_id: str, agent_id: str, 
                                    consensus_task: str) -> None:
        """Request a vote from an agent for consensus"""
        try:
            response = await self.tools_call_agent(agent_id, consensus_task)
            
            if response.get('success') and 'vote' in response:
                vote = response['vote']
                reasoning = response.get('reasoning', 'No reasoning provided')
                
                # Record the vote
                if consensus_id in self.active_consensus:
                    self.active_consensus[consensus_id].votes[agent_id] = {
                        'vote': vote,
                        'reasoning': reasoning,
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            # Log failed vote attempt
            if consensus_id in self.active_consensus:
                self.active_consensus[consensus_id].votes[agent_id] = {
                    'vote': False,
                    'reasoning': f'Vote request failed: {str(e)}',
                    'timestamp': datetime.utcnow().isoformat()
                }

    async def _finalize_consensus(self, consensus_id: str) -> Dict[str, Any]:
        """Finalize consensus and determine result"""
        if consensus_id not in self.active_consensus:
            return {'success': False, 'error': 'Consensus not found'}
        
        consensus = self.active_consensus[consensus_id]
        
        # Count votes
        votes_for = sum(1 for vote_data in consensus.votes.values() 
                       if vote_data['vote'] is True)
        votes_against = sum(1 for vote_data in consensus.votes.values() 
                          if vote_data['vote'] is False)
        total_votes = len(consensus.votes)
        required_votes = len(consensus.required_agents)
        
        # Determine result (simple majority + minimum participation)
        participation_rate = total_votes / required_votes if required_votes > 0 else 0
        consensus_rate = votes_for / total_votes if total_votes > 0 else 0
        
        if participation_rate >= 0.6 and consensus_rate > 0.5:
            status = 'passed'
        elif participation_rate >= 0.6:
            status = 'rejected'
        else:
            status = 'failed_quorum'
        
        # Update consensus status
        consensus.status = status
        
        # Update system consensus rate
        if status in ['passed', 'rejected']:
            # Simple moving average update
            self.system_health['consensus_success_rate'] = (
                self.system_health['consensus_success_rate'] * 0.9 + 
                (1.0 if status == 'passed' else 0.0) * 0.1
            )
        
        result = {
            'success': True,
            'consensus_id': consensus_id,
            'status': status,
            'votes_for': votes_for,
            'votes_against': votes_against,
            'total_votes': total_votes,
            'required_votes': required_votes,
            'participation_rate': participation_rate,
            'consensus_rate': consensus_rate,
            'vote_details': consensus.votes
        }
        
        return result

    def _generate_health_recommendations(self, agent_status: Dict[str, Any]) -> List[str]:
        """Generate health recommendations based on agent status"""
        recommendations = []
        
        unhealthy_agents = [agent_id for agent_id, status in agent_status.items() 
                           if status['status'] != 'healthy']
        
        if unhealthy_agents:
            recommendations.append(f"Investigate {len(unhealthy_agents)} unhealthy agents: {', '.join(unhealthy_agents)}")
        
        healthy_count = len([s for s in agent_status.values() if s['status'] == 'healthy'])
        total_count = len(agent_status)
        
        if healthy_count < total_count * 0.8:
            recommendations.append("System health below 80% - consider maintenance mode")
        
        if len(self.system_events) > 100:
            recommendations.append("Consider archiving old system events")
        
        return recommendations

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get all available tools including inherited core tools"""
        lyra_tools = [
            {
                'name': 'lyra_register_agent',
                'description': 'Register a new C-Suite agent with the orchestrator',
                'parameters': {
                    'agent_id': 'string - Unique identifier for the agent',
                    'role': 'string - Role/function of the agent',
                    'capabilities': 'list - List of agent capabilities'
                }
            },
            {
                'name': 'lyra_boot_system',
                'description': 'Boot the C-Suite agent system and coordinate startup',
                'parameters': {
                    'target_agents': 'list - Optional list of specific agents to boot'
                }
            },
            {
                'name': 'lyra_coordinate_consensus',
                'description': 'Coordinate multi-agent consensus on a decision',
                'parameters': {
                    'topic': 'string - Topic for consensus',
                    'proposal': 'string - Specific proposal to vote on',
                    'required_agents': 'list - Optional list of required voting agents',
                    'timeout_minutes': 'int - Voting timeout in minutes (default 5)'
                }
            },
            {
                'name': 'lyra_monitor_system_health',
                'description': 'Monitor overall system health and agent status',
                'parameters': {}
            },
            {
                'name': 'lyra_delegate_authority',
                'description': 'Delegate temporary authority to another agent',
                'parameters': {
                    'target_agent': 'string - Agent to delegate authority to',
                    'privileges': 'list - List of privileges to delegate',
                    'duration_minutes': 'int - Duration of delegation (default 60)'
                }
            }
        ]
        
        # Combine with inherited core tools
        core_tools = super().get_available_tools()
        return core_tools + lyra_tools

    async def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """Execute a tool by name with given parameters"""
        # First try Lyra-specific tools
        if hasattr(self, tool_name):
            method = getattr(self, tool_name)
            if callable(method):
                return await method(**kwargs)
        
        # Fall back to core tools
        return await super().execute_tool(tool_name, **kwargs)

# =============================================================================
# STANDALONE EXECUTION
# =============================================================================

async def main():
    """Demo Lyra Agent functionality"""
    
    config = {
        'max_agents': 13,
        'consensus_timeout': 300
    }
    
    async with LyraAgentEnhanced(config) as lyra:
        print("🏢 Lyra Agent - OS/Meta-Orchestrator")
        print("=" * 50)
        
        # Demo 1: System Boot
        print("\n1. 🚀 System Boot Sequence")
        boot_result = await lyra.lyra_boot_system()
        print(f"System Ready: {boot_result['system_ready']}")
        print(f"Online Agents: {boot_result.get('online_agents', 0)}/{boot_result.get('total_agents', 0)}")
        
        # Demo 2: Health Check
        print("\n2. 💓 System Health Check")
        health = await lyra.lyra_monitor_system_health()
        print(f"System Status: {health['system_health']['overall_status']}")
        print(f"Health Percentage: {health['system_health'].get('health_percentage', 0):.1f}%")
        
        # Demo 3: Agent Registration
        print("\n3. 📝 Agent Registration")
        reg_result = await lyra.lyra_register_agent(
            "demo_agent",
            "Demo Test Agent",
            ["demo_capability", "test_function"]
        )
        print(f"Registration Success: {reg_result['success']}")
        
        # Demo 4: Consensus Coordination
        print("\n4. 🤝 Consensus Demo")
        consensus_result = await lyra.lyra_coordinate_consensus(
            "system_upgrade",
            "Upgrade all agents to version 2.0",
            ["demo_agent"],  # Only demo agent for this test
            1  # 1 minute timeout for demo
        )
        print(f"Consensus Status: {consensus_result.get('status', 'failed')}")
        
        # Demo 5: Authority Delegation  
        print("\n5. 🔑 Authority Delegation")
        delegation = await lyra.lyra_delegate_authority(
            "demo_agent",
            ["system_restart", "maintenance_mode"],
            30  # 30 minutes
        )
        print(f"Delegation Success: {delegation['success']}")
        
        print(f"\n🎯 Lyra Agent Tools: {len(lyra.get_available_tools())}")

if __name__ == "__main__":
    asyncio.run(main()) 