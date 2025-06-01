# ----------------------------------------------------------------------------
#  File:        core_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Core Agent - Main Processor & Insight Engine
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import sys
import time

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from core.core_tools import CoreTools, KnowledgeSource

@dataclass
class ProcessingTask:
    """Represents a processing task for the Core agent"""
    task_id: str
    task_type: str  # 'research', 'analysis', 'consensus', 'validation'
    input_data: Dict[str, Any]
    priority: int  # 1-10, 10 being highest
    assigned_agents: List[str]
    status: str  # 'pending', 'processing', 'completed', 'failed'
    created_at: str
    completed_at: Optional[str] = None
    results: Optional[Dict[str, Any]] = None

@dataclass
class ConsensusRecord:
    """Records consensus events between multiple agents"""
    consensus_id: str
    topic: str
    participating_agents: List[str]
    agent_inputs: Dict[str, Any]
    consensus_result: Dict[str, Any]
    confidence_score: float
    consensus_type: str  # 'unanimous', 'majority', 'split', 'failed'
    created_at: str
    core_signature: str

@dataclass
class InsightSynthesis:
    """Synthesized insight from multiple agent inputs"""
    synthesis_id: str
    topic: str
    source_insights: List[Dict[str, Any]]
    synthesized_content: str
    reliability_score: float
    contributing_agents: List[str]
    synthesis_method: str
    created_at: str
    blockchain_hash: str

class CoreAgentEnhanced(CoreTools):
    """
    Enhanced Core - Main Processor & Insight Engine with Full Tool Calling
    
    The Core agent serves as the central processing unit for the C-Suite ecosystem.
    It orchestrates tasks between agents, synthesizes insights, manages consensus,
    and maintains the overall system state with full blockchain integration.
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize core tools first
        super().__init__("core_agent", config)
        
        # Core-specific configuration
        self.max_concurrent_tasks = config.get('max_concurrent_tasks', 5)
        self.consensus_threshold = config.get('consensus_threshold', 0.7)
        self.insight_retention_days = config.get('insight_retention_days', 90)
        
        # Task management
        self.active_tasks = {}
        self.task_queue = []
        self.processing_history = {}
        
        # Agent coordination
        self.agent_status = {
            'beacon_agent': {'status': 'unknown', 'last_seen': None, 'capabilities': []},
            'theory_agent': {'status': 'unknown', 'last_seen': None, 'capabilities': []},
        }
        
        # Consensus management
        self.active_consensus = {}
        self.consensus_history = {}
        
        # Insight synthesis tracking
        self.synthesis_cache = {}
        self.insight_index = {}

    async def __aenter__(self):
        """Async context manager entry"""
        await self._initialize_core_systems()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self._shutdown_core_systems()

    # =============================================================================
    # CORE-SPECIFIC TOOLS (In addition to minimum required tools)
    # =============================================================================

    async def core_process_insight_request(self, topic: str, processing_type: str = "comprehensive", 
                                         priority: int = 5, timeout: int = 300) -> Dict[str, Any]:
        """
        Main processing tool - orchestrates knowledge gathering and validation for a topic
        
        This is the primary tool that coordinates Beacon (knowledge) and Theory (validation)
        """
        try:
            # Create processing task
            task_id = hashlib.md5(f"{topic}{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]
            
            # Log processing start
            processing_id = await self.recall_log_insight(
                f"Starting insight processing for: {topic}",
                {'type': 'processing_start', 'topic': topic, 'task_id': task_id, 'processing_type': processing_type}
            )
            
            # Save task to memory
            memory_key = await self.memory_save(
                f"Processing task: {topic}",
                {'type': 'processing_task', 'task_id': task_id, 'processing_id': processing_id}
            )
            
            print(f"🔄 Core processing: {topic}")
            
            # Phase 1: Knowledge Gathering (Beacon)
            print(f"📚 Phase 1: Knowledge gathering...")
            beacon_result = await self.tools_call_agent(
                'beacon_agent',
                f'Search for comprehensive knowledge on: {topic}'
            )
            
            # Simulate beacon response with structured data
            beacon_insights = {
                'topic': topic,
                'summary': f'Comprehensive knowledge summary for {topic}',
                'sources': [
                    {'url': 'https://example.com/source1', 'reliability_score': 0.9},
                    {'url': 'https://example.com/source2', 'reliability_score': 0.8}
                ],
                'confidence': 0.85,
                'agent': 'beacon_agent'
            }
            
            # Phase 2: Validation (Theory)  
            print(f"🧠 Phase 2: Insight validation...")
            theory_result = await self.tools_call_agent(
                'theory_agent',
                f'Validate insights and check for bias in topic: {topic}'
            )
            
            # Simulate theory response
            theory_validation = {
                'topic': topic,
                'reliability_score': 0.82,
                'bias_level': 'low',
                'recommendation': 'accept_with_caution',
                'fact_checks': ['claim1_verified', 'claim2_disputed'],
                'agent': 'theory_agent'
            }
            
            # Phase 3: Core Synthesis
            print(f"⚙️ Phase 3: Core synthesis...")
            synthesis_result = await self._synthesize_insights(
                topic, [beacon_insights, theory_validation], task_id
            )
            
            # Phase 4: Consensus Recording
            consensus_result = await self._record_consensus(
                topic, {'beacon': beacon_insights, 'theory': theory_validation}, task_id
            )
            
            # Create final processing result
            processing_result = {
                'task_id': task_id,
                'topic': topic,
                'processing_type': processing_type,
                'status': 'completed',
                'beacon_insights': beacon_insights,
                'theory_validation': theory_validation,
                'core_synthesis': synthesis_result,
                'consensus': consensus_result,
                'overall_confidence': self._calculate_overall_confidence(beacon_insights, theory_validation),
                'processing_time': time.time(),
                'processing_id': processing_id,
                'memory_key': memory_key,
                'completed_at': datetime.utcnow().isoformat()
            }
            
            # Store processing result
            await self._store_processing_result(task_id, processing_result)
            
            # Log completion
            await self.recall_log_insight(
                f"Processing completed for: {topic}. Confidence: {processing_result['overall_confidence']:.2f}",
                {'type': 'processing_complete', 'task_id': task_id, 'confidence': processing_result['overall_confidence']}
            )
            
            return processing_result
            
        except Exception as e:
            await self.security_log_risk(f"Core processing failed: {e}", "high")
            return {'error': str(e), 'topic': topic, 'task_id': task_id}

    async def core_manage_consensus(self, topic: str, agent_inputs: Dict[str, Dict[str, Any]], 
                                  consensus_type: str = "weighted") -> Dict[str, Any]:
        """
        Manage consensus between multiple agents on a topic
        """
        try:
            consensus_id = hashlib.md5(f"consensus_{topic}_{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]
            
            # Log consensus start
            await self.recall_log_insight(
                f"Starting consensus for: {topic} with {len(agent_inputs)} agents",
                {'type': 'consensus_start', 'topic': topic, 'consensus_id': consensus_id}
            )
            
            # Analyze agent inputs
            confidence_scores = []
            reliability_scores = []
            recommendations = []
            
            for agent_id, input_data in agent_inputs.items():
                confidence_scores.append(input_data.get('confidence', 0.5))
                reliability_scores.append(input_data.get('reliability_score', 0.5))
                recommendations.append(input_data.get('recommendation', 'neutral'))
            
            # Calculate consensus metrics
            avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
            avg_reliability = sum(reliability_scores) / len(reliability_scores) if reliability_scores else 0.0
            
            # Determine consensus type
            unique_recommendations = set(recommendations)
            if len(unique_recommendations) == 1:
                consensus_type_result = "unanimous"
            elif len(unique_recommendations) <= len(recommendations) / 2:
                consensus_type_result = "majority"
            else:
                consensus_type_result = "split"
            
            # Calculate overall consensus score
            consensus_score = (avg_confidence + avg_reliability) / 2
            
            # Generate consensus result
            consensus_result = {
                'consensus_id': consensus_id,
                'topic': topic,
                'participating_agents': list(agent_inputs.keys()),
                'consensus_type': consensus_type_result,
                'consensus_score': consensus_score,
                'average_confidence': avg_confidence,
                'average_reliability': avg_reliability,
                'dominant_recommendation': max(set(recommendations), key=recommendations.count) if recommendations else 'neutral',
                'agent_inputs': agent_inputs,
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Sign consensus
            consensus_signature = await self.tools_sign_output(
                f"Consensus: {topic} - Score: {consensus_score:.2f}"
            )
            consensus_result['core_signature'] = consensus_signature.get('signature', '')
            
            # Store consensus
            self.consensus_history[consensus_id] = consensus_result
            
            # Save to memory
            memory_key = await self.memory_save(
                f"Consensus result for: {topic}",
                {'type': 'consensus_result', 'consensus_id': consensus_id, 'score': consensus_score}
            )
            consensus_result['memory_key'] = memory_key
            
            # Log completion
            await self.recall_log_insight(
                f"Consensus completed for: {topic}. Type: {consensus_type_result}, Score: {consensus_score:.2f}",
                {'type': 'consensus_complete', 'consensus_id': consensus_id, 'score': consensus_score}
            )
            
            return consensus_result
            
        except Exception as e:
            await self.security_log_risk(f"Consensus management failed: {e}")
            return {'error': str(e), 'topic': topic}

    async def core_synthesize_multi_agent_insights(self, insights: List[Dict[str, Any]], 
                                                 synthesis_method: str = "weighted_average") -> Dict[str, Any]:
        """
        Synthesize insights from multiple agents into a coherent result
        """
        try:
            synthesis_id = hashlib.md5(f"synthesis_{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]
            
            # Extract topics and validate consistency
            topics = [insight.get('topic', 'unknown') for insight in insights]
            primary_topic = max(set(topics), key=topics.count) if topics else 'unknown'
            
            # Log synthesis start
            await self.recall_log_insight(
                f"Synthesizing {len(insights)} insights for: {primary_topic}",
                {'type': 'synthesis_start', 'topic': primary_topic, 'synthesis_id': synthesis_id}
            )
            
            # Extract key metrics
            confidence_scores = [insight.get('confidence', 0.5) for insight in insights]
            reliability_scores = [insight.get('reliability_score', 0.5) for insight in insights]
            contributing_agents = [insight.get('agent', 'unknown') for insight in insights]
            
            # Synthesize content
            if synthesis_method == "weighted_average":
                # Weight by confidence scores
                weights = confidence_scores
                total_weight = sum(weights) if weights else 1.0
                
                synthesized_confidence = sum(conf * weight for conf, weight in zip(confidence_scores, weights)) / total_weight
                synthesized_reliability = sum(rel * weight for rel, weight in zip(reliability_scores, weights)) / total_weight
            else:
                # Simple average
                synthesized_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
                synthesized_reliability = sum(reliability_scores) / len(reliability_scores) if reliability_scores else 0.0
            
            # Generate synthesized content
            synthesized_content = self._generate_synthesis_summary(insights, primary_topic)
            
            # Create synthesis result
            synthesis_result = {
                'synthesis_id': synthesis_id,
                'topic': primary_topic,
                'synthesis_method': synthesis_method,
                'source_insights': insights,
                'contributing_agents': contributing_agents,
                'synthesized_confidence': synthesized_confidence,
                'synthesized_reliability': synthesized_reliability,
                'synthesized_content': synthesized_content,
                'insight_count': len(insights),
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Generate blockchain hash
            synthesis_hash = await self.tools_sign_output(synthesized_content)
            synthesis_result['blockchain_hash'] = synthesis_hash.get('content_hash', '')
            
            # Save to memory
            memory_key = await self.memory_save(
                synthesized_content,
                {'type': 'synthesis_result', 'synthesis_id': synthesis_id, 'topic': primary_topic}
            )
            synthesis_result['memory_key'] = memory_key
            
            # Store in synthesis cache
            self.synthesis_cache[synthesis_id] = synthesis_result
            
            # Log completion
            await self.recall_log_insight(
                f"Synthesis completed for: {primary_topic}. Reliability: {synthesized_reliability:.2f}",
                {'type': 'synthesis_complete', 'synthesis_id': synthesis_id, 'reliability': synthesized_reliability}
            )
            
            return synthesis_result
            
        except Exception as e:
            await self.security_log_risk(f"Insight synthesis failed: {e}")
            return {'error': str(e)}

    async def core_coordinate_agents(self, task_description: str, required_agents: List[str], 
                                   coordination_type: str = "sequential") -> Dict[str, Any]:
        """
        Coordinate multiple agents to work on a complex task
        """
        try:
            coordination_id = hashlib.md5(f"coord_{task_description}_{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]
            
            # Log coordination start
            await self.recall_log_insight(
                f"Starting agent coordination: {task_description}",
                {'type': 'coordination_start', 'task': task_description, 'coordination_id': coordination_id}
            )
            
            coordination_results = {
                'coordination_id': coordination_id,
                'task_description': task_description,
                'coordination_type': coordination_type,
                'required_agents': required_agents,
                'agent_results': {},
                'execution_order': [],
                'started_at': datetime.utcnow().isoformat(),
                'status': 'running'
            }
            
            if coordination_type == "sequential":
                # Execute agents one by one
                for agent_id in required_agents:
                    print(f"🤝 Coordinating with {agent_id}...")
                    
                    agent_result = await self.tools_call_agent(
                        agent_id,
                        f"Execute task: {task_description}"
                    )
                    
                    coordination_results['agent_results'][agent_id] = agent_result
                    coordination_results['execution_order'].append(agent_id)
                    
                    # Log agent completion
                    await self.recall_log_insight(
                        f"Agent {agent_id} completed coordination task",
                        {'type': 'agent_coordination_step', 'agent': agent_id, 'coordination_id': coordination_id}
                    )
                    
            elif coordination_type == "parallel":
                # Execute all agents simultaneously
                tasks = []
                for agent_id in required_agents:
                    task = self.tools_call_agent(agent_id, f"Execute task: {task_description}")
                    tasks.append((agent_id, task))
                
                # Wait for all to complete
                for agent_id, task in tasks:
                    result = await task
                    coordination_results['agent_results'][agent_id] = result
                    coordination_results['execution_order'].append(agent_id)
            
            # Mark as completed
            coordination_results['status'] = 'completed'
            coordination_results['completed_at'] = datetime.utcnow().isoformat()
            
            # Calculate overall success rate
            successful_agents = sum(1 for result in coordination_results['agent_results'].values() 
                                  if 'error' not in result)
            success_rate = successful_agents / len(required_agents) if required_agents else 0.0
            coordination_results['success_rate'] = success_rate
            
            # Save coordination result
            memory_key = await self.memory_save(
                f"Agent coordination: {task_description}",
                {'type': 'coordination_result', 'coordination_id': coordination_id, 'success_rate': success_rate}
            )
            coordination_results['memory_key'] = memory_key
            
            # Log completion
            await self.recall_log_insight(
                f"Agent coordination completed. Success rate: {success_rate:.2f}",
                {'type': 'coordination_complete', 'coordination_id': coordination_id, 'success_rate': success_rate}
            )
            
            return coordination_results
            
        except Exception as e:
            await self.security_log_risk(f"Agent coordination failed: {e}")
            return {'error': str(e), 'task': task_description}

    # =============================================================================
    # ENHANCED TOOL REGISTRATION
    # =============================================================================
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get all available tools including core tools and Core-specific tools"""
        # Get core tools from parent class
        tools = super().get_available_tools()
        
        # Add Core-specific tools
        core_agent_tools = [
            {
                "name": "core_process_insight_request",
                "description": "Orchestrate knowledge gathering and validation for a topic using Beacon and Theory agents",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "The topic to process insights for"
                        },
                        "processing_type": {
                            "type": "string",
                            "description": "Type of processing (comprehensive, quick, validation_only)",
                            "default": "comprehensive"
                        },
                        "priority": {
                            "type": "integer",
                            "description": "Processing priority 1-10 (10 highest)",
                            "default": 5
                        },
                        "timeout": {
                            "type": "integer",
                            "description": "Processing timeout in seconds",
                            "default": 300
                        }
                    },
                    "required": ["topic"]
                }
            },
            {
                "name": "core_manage_consensus",
                "description": "Manage consensus between multiple agents on a topic",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "Topic for consensus"
                        },
                        "agent_inputs": {
                            "type": "object",
                            "description": "Dictionary of agent IDs to their input data"
                        },
                        "consensus_type": {
                            "type": "string",
                            "description": "Type of consensus (weighted, simple_majority, unanimous)",
                            "default": "weighted"
                        }
                    },
                    "required": ["topic", "agent_inputs"]
                }
            },
            {
                "name": "core_synthesize_multi_agent_insights",
                "description": "Synthesize insights from multiple agents into a coherent result",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "insights": {
                            "type": "array",
                            "items": {"type": "object"},
                            "description": "List of insights from different agents"
                        },
                        "synthesis_method": {
                            "type": "string",
                            "description": "Method for synthesis (weighted_average, simple_average, consensus)",
                            "default": "weighted_average"
                        }
                    },
                    "required": ["insights"]
                }
            },
            {
                "name": "core_coordinate_agents",
                "description": "Coordinate multiple agents to work on a complex task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_description": {
                            "type": "string",
                            "description": "Description of the task to coordinate"
                        },
                        "required_agents": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of agent IDs required for the task"
                        },
                        "coordination_type": {
                            "type": "string",
                            "description": "Type of coordination (sequential, parallel)",
                            "default": "sequential"
                        }
                    },
                    "required": ["task_description", "required_agents"]
                }
            }
        ]
        
        # Combine all tools
        tools.extend(core_agent_tools)
        return tools

    # =============================================================================
    # PRIVATE METHODS
    # =============================================================================
    
    async def _initialize_core_systems(self):
        """Initialize Core agent systems"""
        print(f"🔄 Initializing Core agent systems...")
        
        # Initialize agent status
        await self.recall_log_insight(
            "Core agent initialized and ready for processing",
            {'type': 'core_initialization', 'status': 'ready'}
        )

    async def _shutdown_core_systems(self):
        """Shutdown Core agent systems gracefully"""
        await self.recall_log_insight(
            "Core agent shutting down gracefully",
            {'type': 'core_shutdown', 'active_tasks': len(self.active_tasks)}
        )

    async def _synthesize_insights(self, topic: str, insights: List[Dict[str, Any]], task_id: str) -> Dict[str, Any]:
        """Internal method to synthesize insights from multiple agents"""
        try:
            # Extract key information
            summaries = []
            confidence_scores = []
            reliability_scores = []
            
            for insight in insights:
                if 'summary' in insight:
                    summaries.append(insight['summary'])
                confidence_scores.append(insight.get('confidence', 0.5))
                reliability_scores.append(insight.get('reliability_score', 0.5))
            
            # Create synthesized summary
            synthesized_summary = f"Core synthesis for {topic}: " + "; ".join(summaries[:2])
            
            # Calculate overall scores
            avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
            avg_reliability = sum(reliability_scores) / len(reliability_scores) if reliability_scores else 0.0
            
            synthesis = {
                'topic': topic,
                'synthesized_summary': synthesized_summary,
                'overall_confidence': avg_confidence,
                'overall_reliability': avg_reliability,
                'source_count': len(insights),
                'synthesis_method': 'core_weighted_average',
                'task_id': task_id,
                'synthesized_at': datetime.utcnow().isoformat()
            }
            
            return synthesis
            
        except Exception as e:
            return {'error': str(e), 'topic': topic}

    async def _record_consensus(self, topic: str, agent_results: Dict[str, Any], task_id: str) -> Dict[str, Any]:
        """Record consensus between agents"""
        try:
            # Analyze agent agreement
            confidence_scores = [result.get('confidence', 0.5) for result in agent_results.values()]
            reliability_scores = [result.get('reliability_score', 0.5) for result in agent_results.values()]
            
            consensus_score = (sum(confidence_scores) + sum(reliability_scores)) / (2 * len(agent_results))
            
            consensus = {
                'topic': topic,
                'participating_agents': list(agent_results.keys()),
                'consensus_score': consensus_score,
                'agreement_level': 'high' if consensus_score > 0.8 else 'medium' if consensus_score > 0.6 else 'low',
                'task_id': task_id,
                'recorded_at': datetime.utcnow().isoformat()
            }
            
            return consensus
            
        except Exception as e:
            return {'error': str(e), 'topic': topic}

    def _calculate_overall_confidence(self, beacon_result: Dict[str, Any], theory_result: Dict[str, Any]) -> float:
        """Calculate overall confidence from Beacon and Theory results"""
        beacon_conf = beacon_result.get('confidence', 0.5)
        theory_rel = theory_result.get('reliability_score', 0.5)
        
        # Weighted average: Beacon confidence 40%, Theory reliability 60%
        overall = (beacon_conf * 0.4) + (theory_rel * 0.6)
        return round(overall, 3)

    async def _store_processing_result(self, task_id: str, result: Dict[str, Any]):
        """Store processing result for future reference"""
        try:
            self.processing_history[task_id] = result
            
            # Also save to persistent storage
            processing_file = self.logs_path / f"processing_{task_id}.json"
            with open(processing_file, 'w') as f:
                json.dump(result, f, indent=2)
                
        except Exception as e:
            await self.security_log_risk(f"Failed to store processing result: {e}")

    def _generate_synthesis_summary(self, insights: List[Dict[str, Any]], topic: str) -> str:
        """Generate a synthesized summary from multiple insights"""
        summaries = []
        for insight in insights:
            agent = insight.get('agent', 'unknown')
            summary = insight.get('summary', insight.get('synthesized_content', ''))
            if summary:
                summaries.append(f"{agent}: {summary[:100]}...")
        
        return f"Synthesized insights for {topic}: " + " | ".join(summaries)


# =============================================================================
# USAGE EXAMPLE
# =============================================================================

async def main():
    """Example usage of the enhanced Core agent with tool calling"""
    config = {
        'max_concurrent_tasks': 5,
        'consensus_threshold': 0.7
    }
    
    async with CoreAgentEnhanced(config) as core:
        # Test the tool calling system
        print("🔧 Available tools:")
        tools = core.get_available_tools()
        for tool in tools:
            print(f"  - {tool['name']}: {tool['description']}")
        
        print("\n🔄 Testing insight processing...")
        result = await core.execute_tool(
            'core_process_insight_request',
            topic="artificial intelligence in autonomous vehicles",
            processing_type="comprehensive",
            priority=8
        )
        
        if 'error' not in result:
            print(f"✅ Processing completed for: {result['topic']}")
            print(f"   Task ID: {result['task_id']}")
            print(f"   Overall Confidence: {result['overall_confidence']:.2f}")
            print(f"   Status: {result['status']}")
        else:
            print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    asyncio.run(main()) 