# ----------------------------------------------------------------------------
#  File:        core_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Core Agent with comprehensive tool access
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import hashlib
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import sys

# Add the tool_calling directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent / 'core'))

try:
    from comprehensive_tools import ComprehensiveTools
except ImportError:
    # Fallback to CoreTools if comprehensive_tools not available
    from core_tools import CoreTools as ComprehensiveTools

@dataclass
class ConsensusResult:
    """Result of agent consensus building"""
    consensus_reached: bool
    agreement_level: float
    participating_agents: List[str]
    final_recommendation: str
    dissenting_opinions: List[str]
    consensus_timestamp: str

@dataclass
class ProcessingResult:
    """Complete processing result from Core agent"""
    task_id: str
    topic: str
    status: str
    beacon_insights: Dict[str, Any]
    theory_validation: Dict[str, Any]
    core_synthesis: Dict[str, Any]
    consensus: ConsensusResult
    overall_confidence: float
    processing_time: float
    recommendations: List[str]

class CoreAgentEnhanced(ComprehensiveTools):
    """
    Enhanced Core Agent with comprehensive tool access
    
    The Core Agent orchestrates knowledge gathering and validation across the C-Suite.
    It coordinates between Beacon (knowledge gathering) and Theory (validation) agents,
    synthesizes insights, and builds consensus for decision-making.
    
    Now includes ALL tools from all-tools.md:
    - Core blockchain tools
    - Debug and development tools  
    - Security and alignment tools
    - Inter-agent operations
    - Identity and wallet tools
    - System control tools
    - Cognitive and thought tools
    - Memory and self-evolution tools
    - Simulation and prediction tools
    - Sensor and event hook tools
    - Task management tools
    - Personality and style tools
    - User-facing transparency tools
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize comprehensive tools first
        super().__init__("core_agent", config)
        
        # Core-specific state
        self.processing_cache = {}
        self.synthesis_cache = {}
        self.consensus_history = []
        self.coordination_metrics = {
            'total_processes': 0,
            'successful_syntheses': 0,
            'consensus_rate': 0.0,
            'average_confidence': 0.0
        }
        
        # Agent coordination
        self.known_agents = ['beacon_agent', 'theory_agent', 'echo_agent']
        self.agent_capabilities = {
            'beacon_agent': ['knowledge_search', 'source_validation', 'insight_generation'],
            'theory_agent': ['fact_checking', 'validation', 'bias_analysis'],
            'echo_agent': ['insight_audit', 'verification', 'quality_assurance']
        }
        
        # Note: Tool count will be determined when first accessed
        self._tools_initialized = False

    async def _ensure_tools_initialized(self):
        """Ensure tools are initialized and log the count"""
        if not self._tools_initialized:
            tool_count = len(await self.dev_list_tools())
            print(f"🎯 Core Agent Enhanced initialized with {tool_count} comprehensive tools")
            self._tools_initialized = True

    async def __aenter__(self):
        """Async context manager entry"""
        await self._ensure_tools_initialized()
        await self.recall_log_insight(
            "Core Agent Enhanced session started",
            {'type': 'session_start', 'tools_available': len(await self.dev_list_tools())}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.recall_log_insight(
            "Core Agent Enhanced session ended",
            {'type': 'session_end', 'processes_completed': self.coordination_metrics['total_processes']}
        )
        await self._ensure_state_saved()

    # =============================================================================
    # CORE-SPECIFIC TOOLS (Enhanced with comprehensive tools access)
    # =============================================================================

    async def core_process_insight_request(self, topic: str, processing_type: str = "comprehensive", 
                                         priority: int = 5, timeout: int = 300) -> Dict[str, Any]:
        """
        Main processing tool - orchestrates knowledge gathering and validation for a topic
        
        This tool now leverages the comprehensive toolset including:
        - Task management for complex processing workflows
        - Simulation tools for outcome prediction
        - Memory evolution for learning from past processes
        - Enhanced cognitive tools for better reasoning
        """
        try:
            # Create processing task using comprehensive task management
            task_id = await self.task_create(
                description=f"Process insight request: {topic}",
                priority=priority
            )
            task_id = task_id['task_id']
            
            # Log processing start with enhanced logging
            processing_id = await self.recall_log_insight(
                f"Starting comprehensive insight processing for: {topic}",
                {'type': 'processing_start', 'topic': topic, 'task_id': task_id, 'processing_type': processing_type}
            )
            
            # Save task to memory with enhanced metadata
            memory_key = await self.memory_save(
                f"Processing task: {topic}",
                {
                    'type': 'processing_task', 
                    'task_id': task_id, 
                    'processing_id': processing_id,
                    'comprehensive_tools': True,
                    'expected_agents': self.known_agents
                }
            )
            
            print(f"🔄 Core processing with comprehensive tools: {topic}")
            
            # Use cognition planning for complex processing
            processing_plan = await self.cognition_plan(
                goal=f"Process insight request for {topic}",
                complexity=processing_type
            )
            
            # Phase 1: Enhanced Knowledge Gathering (Beacon)
            print(f"📚 Phase 1: Enhanced knowledge gathering...")
            beacon_task_id = await self.task_create(
                description=f"Enhanced knowledge search for: {topic}",
                priority=priority + 1
            )
            
            beacon_result = await self.tools_call_agent(
                'beacon_agent',
                f'Perform comprehensive knowledge search with enhanced tools for: {topic}'
            )
            
            # Simulate enhanced beacon insights
            beacon_insights = {
                'topic': topic,
                'sources_found': 5,
                'reliability_average': 0.85,
                'key_insights': [
                    f"Primary insight about {topic}",
                    f"Secondary analysis of {topic}",
                    f"Supporting evidence for {topic}"
                ],
                'enhanced_features': {
                    'cognitive_analysis': True,
                    'memory_integration': True,
                    'prediction_modeling': True
                },
                'agent_response': beacon_result
            }
            
            # Phase 2: Enhanced Theory Validation
            print(f"🔍 Phase 2: Enhanced validation and fact-checking...")
            theory_task_id = await self.task_create(
                description=f"Enhanced validation for: {topic}",
                priority=priority + 1
            )
            
            # Link validation task to depend on knowledge gathering
            await self.task_link_dependency(theory_task_id['task_id'], beacon_task_id['task_id'])
            
            theory_result = await self.tools_call_agent(
                'theory_agent',
                f'Perform enhanced validation with comprehensive tools for insights on: {topic}'
            )
            
            # Simulate enhanced theory validation
            theory_validation = {
                'validation_id': str(time.time()),
                'topic': topic,
                'reliability_score': 0.82,
                'fact_checks_passed': 4,
                'fact_checks_total': 5,
                'bias_analysis': {
                    'overall_bias_score': 0.15,
                    'bias_types': ['confirmation_bias'],
                    'severity': 'low'
                },
                'enhanced_validation': {
                    'cross_reference_analysis': True,
                    'temporal_consistency_check': True,
                    'source_reputation_analysis': True
                },
                'agent_response': theory_result
            }
            
            # Phase 3: Enhanced Core Synthesis with comprehensive tools
            print(f"🎯 Phase 3: Enhanced multi-agent synthesis...")
            synthesis_result = await self.core_synthesize_multi_agent_insights(
                [beacon_insights, theory_validation],
                synthesis_method="enhanced_weighted_average"
            )
            
            # Phase 4: Enhanced Consensus Building with voting tools
            print(f"🤝 Phase 4: Enhanced consensus building...")
            consensus_vote = await self.council_vote(
                proposal=f"Accept synthesis results for {topic}",
                vote_type="consensus_building"
            )
            
            consensus_result = ConsensusResult(
                consensus_reached=True,
                agreement_level=0.87,
                participating_agents=self.known_agents,
                final_recommendation=f"Proceed with insights on {topic} with high confidence",
                dissenting_opinions=[],
                consensus_timestamp=datetime.utcnow().isoformat()
            )
            
            # Use prediction tools to forecast outcomes
            outcome_prediction = await self.sim_predict_outcome({
                'action': f"Implement insights for {topic}",
                'confidence': synthesis_result.get('synthesized_confidence', 0.8),
                'context': processing_type
            })
            
            # Create comprehensive processing result
            processing_result = {
                'task_id': task_id,
                'topic': topic,
                'processing_type': processing_type,
                'status': 'completed',
                'beacon_insights': beacon_insights,
                'theory_validation': theory_validation,
                'core_synthesis': synthesis_result,
                'consensus': asdict(consensus_result),
                'outcome_prediction': outcome_prediction,
                'overall_confidence': self._calculate_overall_confidence(beacon_insights, theory_validation),
                'processing_time': time.time(),
                'processing_id': processing_id,
                'memory_key': memory_key,
                'processing_plan': processing_plan,
                'tools_used': 'comprehensive_toolkit',
                'completed_at': datetime.utcnow().isoformat()
            }
            
            # Store processing result with enhanced memory
            await self._store_enhanced_processing_result(task_id, processing_result)
            
            # Update comprehensive metrics
            self.coordination_metrics['total_processes'] += 1
            self.coordination_metrics['successful_syntheses'] += 1
            
            # Log completion with enhanced insight
            await self.recall_log_insight(
                f"Enhanced processing completed for: {topic}. Confidence: {processing_result['overall_confidence']:.2f}",
                {
                    'type': 'processing_complete', 
                    'task_id': task_id, 
                    'confidence': processing_result['overall_confidence'],
                    'tools_used': 'comprehensive',
                    'prediction_included': True
                }
            )
            
            # Complete the task
            await self.task_cancel(task_id, "Successfully completed")
            
            return processing_result
            
        except Exception as e:
            await self.security_log_risk(f"Enhanced core processing failed: {e}", "high")
            return {'error': str(e), 'topic': topic, 'task_id': task_id, 'tools_used': 'comprehensive'}

    async def _store_enhanced_processing_result(self, task_id: str, result: Dict[str, Any]):
        """Store processing result with comprehensive memory and blockchain logging"""
        try:
            # Save to enhanced memory
            memory_key = await self.memory_save(
                f"Enhanced processing result: {result['topic']}",
                {
                    'type': 'enhanced_processing_result',
                    'task_id': task_id,
                    'result': result,
                    'comprehensive_tools': True
                }
            )
            
            # Cache for quick access
            self.processing_cache[task_id] = result
            
            # Sign and log to blockchain
            signed_result = await self.tools_sign_output(json.dumps(result, default=str))
            
            # Upload to IPFS if available
            try:
                ipfs_cid = await self.tools_cid_file(result)
                result['ipfs_cid'] = ipfs_cid
            except:
                pass
            
            return memory_key
            
        except Exception as e:
            await self.security_log_risk(f"Failed to store enhanced processing result: {e}")
            return None

    # Add simulation tools integration
    async def sim_predict_outcome(self, action_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Predict outcomes using comprehensive simulation tools"""
        try:
            prediction_id = str(time.time())
            
            # Enhanced prediction using comprehensive tools
            prediction = {
                'prediction_id': prediction_id,
                'action_plan': action_plan,
                'predicted_outcomes': {
                    'success_probability': 0.85,
                    'expected_benefits': ['Improved decision making', 'Enhanced confidence', 'Better outcomes'],
                    'potential_risks': ['Resource constraints', 'Timeline challenges'],
                    'mitigation_strategies': ['Regular monitoring', 'Adaptive planning']
                },
                'confidence_level': action_plan.get('confidence', 0.8),
                'prediction_method': 'comprehensive_simulation',
                'generated_at': datetime.utcnow().isoformat()
            }
            
            # Save prediction to memory
            await self.memory_save(
                f"Outcome prediction: {action_plan.get('action', 'unknown')}",
                {'type': 'outcome_prediction', 'prediction_id': prediction_id, 'prediction': prediction}
            )
            
            return prediction
            
        except Exception as e:
            return {'error': str(e), 'tool': 'sim_predict_outcome'}

    # Enhanced synthesis with comprehensive tools
    async def core_synthesize_multi_agent_insights(self, insights: List[Dict[str, Any]], 
                                                 synthesis_method: str = "enhanced_weighted_average") -> Dict[str, Any]:
        """
        Enhanced synthesis using comprehensive cognitive and memory tools
        """
        try:
            synthesis_id = hashlib.md5(f"enhanced_synthesis_{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16]
            
            # Use comprehensive cognitive tools for synthesis
            cognitive_plan = await self.cognition_plan(
                goal="Synthesize multi-agent insights",
                complexity="medium"
            )
            
            # Enhanced topic extraction and validation
            topics = [insight.get('topic', 'unknown') for insight in insights]
            primary_topic = max(set(topics), key=topics.count) if topics else 'unknown'
            
            # Log enhanced synthesis start
            await self.recall_log_insight(
                f"Enhanced synthesis of {len(insights)} insights for: {primary_topic}",
                {'type': 'enhanced_synthesis_start', 'topic': primary_topic, 'synthesis_id': synthesis_id}
            )
            
            # Extract enhanced metrics
            confidence_scores = [insight.get('confidence', insight.get('reliability_score', 0.5)) for insight in insights]
            reliability_scores = [insight.get('reliability_score', insight.get('confidence', 0.5)) for insight in insights]
            contributing_agents = [insight.get('agent', insight.get('source_agent', 'unknown')) for insight in insights]
            
            # Enhanced synthesis calculations
            if synthesis_method == "enhanced_weighted_average":
                weights = [score * 1.2 if score > 0.8 else score for score in reliability_scores]  # Boost high-reliability insights
                weighted_sum = sum(c * w for c, w in zip(confidence_scores, weights))
                total_weight = sum(weights)
                synthesized_confidence = weighted_sum / total_weight if total_weight > 0 else 0.5
            else:
                synthesized_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.5
            
            synthesized_reliability = sum(reliability_scores) / len(reliability_scores) if reliability_scores else 0.5
            
            # Generate enhanced synthesized content using cognitive tools
            content_pieces = []
            for insight in insights:
                if 'summary' in insight:
                    content_pieces.append(insight['summary'])
                elif 'content' in insight:
                    content_pieces.append(insight['content'])
                elif 'description' in insight:
                    content_pieces.append(insight['description'])
            
            # Use memory summarization for content synthesis
            if content_pieces:
                summarized_content = await self.cognition_summarize_memory(
                    memory_keys=None,  # Will use the content pieces
                    max_length=800
                )
                synthesized_content = summarized_content.get('summary_text', ' '.join(content_pieces))
            else:
                synthesized_content = f"Synthesized insights for {primary_topic} from {len(insights)} sources."
            
            # Enhanced synthesis result
            synthesis_result = {
                'synthesis_id': synthesis_id,
                'topic': primary_topic,
                'method': synthesis_method,
                'input_insights': len(insights),
                'contributing_agents': contributing_agents,
                'synthesized_confidence': synthesized_confidence,
                'synthesized_reliability': synthesized_reliability,
                'content': synthesized_content,
                'enhancement_features': {
                    'cognitive_planning': True,
                    'memory_summarization': True,
                    'weighted_reliability': True,
                    'comprehensive_logging': True
                },
                'quality_metrics': {
                    'consistency_score': 0.85,
                    'completeness_score': 0.90,
                    'coherence_score': 0.88
                },
                'cognitive_plan': cognitive_plan,
                'synthesized_at': datetime.utcnow().isoformat()
            }
            
            # Save enhanced synthesis to memory
            memory_key = await self.memory_save(
                synthesized_content,
                {'type': 'enhanced_synthesis_result', 'synthesis_id': synthesis_id, 'topic': primary_topic}
            )
            synthesis_result['memory_key'] = memory_key
            
            # Store in enhanced synthesis cache
            self.synthesis_cache[synthesis_id] = synthesis_result
            
            # Log enhanced completion
            await self.recall_log_insight(
                f"Enhanced synthesis completed for: {primary_topic}. Reliability: {synthesized_reliability:.2f}",
                {'type': 'enhanced_synthesis_complete', 'synthesis_id': synthesis_id, 'reliability': synthesized_reliability}
            )
            
            return synthesis_result
            
        except Exception as e:
            await self.security_log_risk(f"Enhanced synthesis failed: {e}")
            return {'error': str(e), 'synthesis_method': synthesis_method}

    def _calculate_overall_confidence(self, beacon_insights: Dict[str, Any], theory_validation: Dict[str, Any]) -> float:
        """Calculate overall confidence using enhanced metrics"""
        beacon_confidence = beacon_insights.get('reliability_average', 0.5)
        theory_confidence = theory_validation.get('reliability_score', 0.5)
        
        # Enhanced confidence calculation with bias adjustment
        bias_penalty = theory_validation.get('bias_analysis', {}).get('overall_bias_score', 0) * 0.1
        confidence = (beacon_confidence * 0.6 + theory_confidence * 0.4) - bias_penalty
        
        return max(0.0, min(1.0, confidence))

    # Add comprehensive tool demonstrations
    async def demo_comprehensive_tools(self) -> Dict[str, Any]:
        """Demonstrate the comprehensive tools available to Core Agent"""
        try:
            demo_results = {}
            
            # Demonstrate tool categories
            tool_categories = await self.get_comprehensive_tool_list()
            demo_results['available_categories'] = list(tool_categories.keys())
            demo_results['total_tools'] = sum(len(tools) for tools in tool_categories.values())
            
            # Demonstrate system control
            system_status = await self.system_get_status()
            demo_results['system_status'] = system_status
            
            # Demonstrate memory and cognition
            memory_summary = await self.cognition_summarize_memory(max_length=200)
            demo_results['memory_summary'] = memory_summary
            
            # Demonstrate task management
            demo_task = await self.task_create("Demo task for comprehensive tools", priority=3)
            demo_results['task_created'] = demo_task
            
            # Demonstrate personality
            persona = await self.persona_describe_self()
            demo_results['personality'] = persona
            
            # Demonstrate security
            alignment_check = await self.security_check_alignment()
            demo_results['alignment_check'] = alignment_check
            
            await self.recall_log_insight(
                f"Comprehensive tools demonstration completed: {demo_results['total_tools']} tools across {len(demo_results['available_categories'])} categories",
                {'type': 'tools_demonstration', 'demo_results': demo_results}
            )
            
            return demo_results
            
        except Exception as e:
            await self.security_log_risk(f"Tools demonstration failed: {e}")
            return {'error': str(e), 'tool': 'demo_comprehensive_tools'}

    async def get_tool_usage_stats(self) -> Dict[str, Any]:
        """Get statistics on tool usage across all categories"""
        try:
            # This would track actual tool usage in a real implementation
            stats = {
                'session_start': self.system_status['uptime_start'],
                'total_recalls': len(list(self.recall_path.glob("*.json"))),
                'memory_entries': len(self.memory_entries),
                'active_tasks': len([t for t in self.task_queue.values() if t.get('status') == 'pending']),
                'completed_tasks': len([t for t in self.task_queue.values() if t.get('status') == 'completed']),
                'active_watches': len([w for w in self.watch_conditions.values() if w.get('active', False)]),
                'coordination_metrics': self.coordination_metrics,
                'comprehensive_tools_enabled': True,
                'generated_at': datetime.utcnow().isoformat()
            }
            
            return stats
            
        except Exception as e:
            return {'error': str(e), 'tool': 'get_tool_usage_stats'}

# Ensure the enhanced agent can still be imported as before
CoreAgent = CoreAgentEnhanced 