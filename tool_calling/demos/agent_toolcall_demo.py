# ----------------------------------------------------------------------------
#  File:        agent_toolcall_demo.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Demo CLI showcasing enhanced agents with tool calling capabilities
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import sys
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path

# Add the parent directory to path so we can import from agents and core
sys.path.append(str(Path(__file__).parent.parent))

# Import our enhanced agents
from agents.beacon.beacon_agent_enhanced import BeaconAgentEnhanced
from agents.theory.theory_agent_enhanced import TheoryAgentEnhanced
from agents.core.core_agent_enhanced import CoreAgentEnhanced

class ToolCallingDemo:
    """
    Demonstration CLI for C-Suite Agent Tool Calling System
    
    Shows how agents can use their tools for knowledge retrieval, validation,
    and blockchain logging with full transparency.
    """
    
    def __init__(self):
        self.config = {
            'news_api_key': None,
            'wolfram_api_key': None,
        }
        
        # Demo scenarios
        self.demo_scenarios = {
            '1': {
                'name': 'Knowledge Search & Validation',
                'description': 'Beacon searches for knowledge, Theory validates it',
                'topic': 'artificial intelligence in medical diagnosis'
            },
            '2': {
                'name': 'Fact-Checking Pipeline',
                'description': 'Theory fact-checks claims and analyzes bias',
                'claim': 'AI systems can diagnose diseases with 100% accuracy in all cases'
            },
            '3': {
                'name': 'Core Orchestration',
                'description': 'Core orchestrates Beacon + Theory for comprehensive insights',
                'topic': 'blockchain technology for supply chain transparency'
            },
            '4': {
                'name': 'Three-Agent Collaboration',
                'description': 'All agents work together on complex analysis',
                'topic': 'environmental impact of cryptocurrency mining'
            },
            '5': {
                'name': 'Inter-Agent Communication',
                'description': 'Agents call each other and share information',
                'topic': 'blockchain technology for healthcare records'
            },
            '6': {
                'name': 'Memory & Recall System',
                'description': 'Agents save and retrieve information from memory',
                'query': 'previous searches about healthcare AI'
            }
        }

    async def run_demo(self):
        """Main demo runner"""
        print("🚀 C-Suite Agent Tool Calling System Demo")
        print("=" * 50)
        
        while True:
            self.show_menu()
            choice = input("\nEnter your choice (1-6, or 'q' to quit): ").strip()
            
            if choice.lower() == 'q':
                print("👋 Goodbye!")
                break
            elif choice in self.demo_scenarios:
                await self.run_scenario(choice)
            else:
                print("❌ Invalid choice. Please try again.")
            
            input("\nPress Enter to continue...")

    def show_menu(self):
        """Display the demo menu"""
        print("\n🔧 Available Demo Scenarios:")
        print("-" * 30)
        
        for key, scenario in self.demo_scenarios.items():
            print(f"{key}. {scenario['name']}")
            print(f"   {scenario['description']}")
        
        print("\nq. Quit Demo")

    async def run_scenario(self, scenario_key: str):
        """Run a specific demo scenario"""
        scenario = self.demo_scenarios[scenario_key]
        print(f"\n🎯 Running Scenario: {scenario['name']}")
        print(f"📝 {scenario['description']}")
        print("-" * 50)
        
        if scenario_key == '1':
            await self.demo_knowledge_search_validation()
        elif scenario_key == '2':
            await self.demo_fact_checking()
        elif scenario_key == '3':
            await self.demo_core_orchestration()
        elif scenario_key == '4':
            await self.demo_three_agent_collaboration()
        elif scenario_key == '5':
            await self.demo_inter_agent_collaboration()
        elif scenario_key == '6':
            await self.demo_memory_recall()

    async def demo_knowledge_search_validation(self):
        """Demo: Knowledge search with validation"""
        topic = self.demo_scenarios['1']['topic']
        
        print(f"🔍 Step 1: Beacon searches for knowledge on '{topic}'")
        
        # Initialize Beacon agent
        async with BeaconAgentEnhanced(self.config) as beacon:
            # Show available tools
            print("\n🔧 Beacon's Available Tools:")
            beacon_tools = beacon.get_available_tools()
            for tool in beacon_tools[:5]:  # Show first 5 tools
                print(f"   • {tool['name']}: {tool['description']}")
            print(f"   ... and {len(beacon_tools) - 5} more tools")
            
            # Search for knowledge
            print(f"\n📊 Executing: beacon_search_knowledge")
            search_result = await beacon.execute_tool(
                'beacon_search_knowledge',
                topic=topic,
                sources=['wikipedia', 'pubmed'],
                max_sources=2
            )
            
            if 'error' not in search_result:
                print(f"✅ Knowledge search completed!")
                print(f"   📄 Topic: {search_result['topic']}")
                print(f"   📚 Sources found: {len(search_result['sources'])}")
                print(f"   🔗 Search ID: {search_result['search_id']}")
                print(f"   💾 Memory key: {search_result['memory_key']}")
                
                # Show summary preview
                summary_preview = search_result['summary'][:200] + "..." if len(search_result['summary']) > 200 else search_result['summary']
                print(f"   📝 Summary: {summary_preview}")
                
                # Save insight with blockchain logging
                print(f"\n💎 Saving insight to blockchain...")
                save_result = await beacon.execute_tool(
                    'beacon_save_insight',
                    insight_data=search_result
                )
                
                if 'error' not in save_result:
                    print(f"✅ Insight saved!")
                    print(f"   🔐 Insight hash: {save_result['insight_hash']}")
                    print(f"   ⛓️  Blockchain CID: {save_result['blockchain_cid']}")
                
                # Step 2: Theory validates the insight
                print(f"\n🧠 Step 2: Theory validates Beacon's insight")
                
                async with TheoryAgentEnhanced(self.config) as theory:
                    print("\n🔧 Theory's Available Tools:")
                    theory_tools = theory.get_available_tools()
                    theory_specific = [t for t in theory_tools if t['name'].startswith('theory_')]
                    for tool in theory_specific:
                        print(f"   • {tool['name']}: {tool['description']}")
                    
                    print(f"\n🔍 Executing: theory_validate_insight")
                    validation_result = await theory.execute_tool(
                        'theory_validate_insight',
                        insight_data=search_result
                    )
                    
                    if 'error' not in validation_result:
                        print(f"✅ Validation completed!")
                        print(f"   📊 Reliability Score: {validation_result['overall_reliability_score']:.2f}")
                        print(f"   ⚖️  Recommendation: {validation_result['consensus_recommendation']}")
                        print(f"   🔍 Fact checks performed: {len(validation_result['fact_checks'])}")
                        print(f"   📈 Bias level: {validation_result['bias_analysis']['bias_level']}")
                        print(f"   🔗 Validation ID: {validation_result['validation_id']}")
                        
                        # Show fact check results
                        if validation_result['fact_checks']:
                            print(f"\n📋 Fact Check Results:")
                            for i, fact_check in enumerate(validation_result['fact_checks'][:3], 1):
                                print(f"   {i}. Status: {fact_check['verification_status']}")
                                print(f"      Confidence: {fact_check['confidence_score']:.2f}")
                                print(f"      Claim: {fact_check['claim'][:100]}...")
                    else:
                        print(f"❌ Validation error: {validation_result['error']}")
            else:
                print(f"❌ Knowledge search error: {search_result['error']}")

    async def demo_fact_checking(self):
        """Demo: Fact-checking pipeline"""
        claim = self.demo_scenarios['2']['claim']
        
        print(f"🕵️ Fact-checking claim: '{claim}'")
        
        async with TheoryAgentEnhanced(self.config) as theory:
            # Single claim fact-check
            print(f"\n🔍 Executing: theory_check_single_claim")
            fact_check_result = await theory.execute_tool(
                'theory_check_single_claim',
                claim=claim,
                context="Medical AI systems claim"
            )
            
            if 'error' not in fact_check_result:
                print(f"✅ Fact-check completed!")
                print(f"   📊 Status: {fact_check_result['verification_status']}")
                print(f"   🎯 Confidence: {fact_check_result['confidence_score']:.2f}")
                print(f"   📝 Reasoning: {fact_check_result['reasoning']}")
                print(f"   🔗 Check ID: {fact_check_result['check_id']}")
            
            # Bias analysis
            print(f"\n🎭 Executing: theory_analyze_bias")
            bias_result = await theory.execute_tool(
                'theory_analyze_bias',
                content=claim
            )
            
            if 'error' not in bias_result:
                print(f"✅ Bias analysis completed!")
                print(f"   📊 Overall bias score: {bias_result['overall_bias_score']:.2f}")
                print(f"   📈 Bias level: {bias_result['bias_level']}")
                print(f"   🔍 Indicators found: {bias_result['total_indicators_found']}")
                
                # Show bias categories
                for category, data in bias_result['category_scores'].items():
                    if data['count'] > 0:
                        print(f"   • {category}: {data['found']}")

    async def demo_core_orchestration(self):
        """Demo: Core orchestration"""
        topic = self.demo_scenarios['3']['topic']
        
        print(f"⚙️ Demonstrating Core orchestration on '{topic}'")
        
        async with CoreAgentEnhanced(self.config) as core:
            # Show available Core tools
            print("\n🔧 Core's Available Tools:")
            core_tools = core.get_available_tools()
            core_specific = [t for t in core_tools if t['name'].startswith('core_')]
            for tool in core_specific:
                print(f"   • {tool['name']}: {tool['description']}")
            
            # Core orchestrates comprehensive insight processing
            print(f"\n🔄 Core executing comprehensive insight processing...")
            processing_result = await core.execute_tool(
                'core_process_insight_request',
                topic=topic,
                processing_type='comprehensive',
                priority=8
            )
            
            if 'error' not in processing_result:
                print(f"✅ Core orchestration completed!")
                print(f"   📝 Topic: {processing_result['topic']}")
                print(f"   🆔 Task ID: {processing_result['task_id']}")
                print(f"   📊 Status: {processing_result['status']}")
                print(f"   🎯 Overall Confidence: {processing_result['overall_confidence']:.3f}")
                
                # Show the orchestration phases
                print(f"\n📋 Orchestration Phases:")
                print(f"   1️⃣ Beacon Knowledge: {processing_result['beacon_insights']['confidence']:.2f} confidence")
                print(f"   2️⃣ Theory Validation: {processing_result['theory_validation']['reliability_score']:.2f} reliability")
                print(f"   3️⃣ Core Synthesis: {processing_result['core_synthesis']['overall_confidence']:.2f} synthesis score")
                print(f"   4️⃣ Consensus: {processing_result['consensus']['consensus_score']:.2f} agreement")
                
                # Test consensus management
                print(f"\n🤝 Testing consensus management...")
                consensus_result = await core.execute_tool(
                    'core_manage_consensus',
                    topic=topic,
                    agent_inputs={
                        'beacon': processing_result['beacon_insights'],
                        'theory': processing_result['theory_validation']
                    }
                )
                
                if 'error' not in consensus_result:
                    print(f"✅ Consensus achieved!")
                    print(f"   📊 Consensus Score: {consensus_result['consensus_score']:.3f}")
                    print(f"   🏆 Consensus Type: {consensus_result['consensus_type']}")
                    
            else:
                print(f"❌ Core orchestration error: {processing_result['error']}")

    async def demo_three_agent_collaboration(self):
        """Demo: Three-agent collaboration"""
        topic = self.demo_scenarios['4']['topic']
        
        print(f"🤝 Demonstrating three-agent collaboration on '{topic}'")
        
        async with BeaconAgentEnhanced(self.config) as beacon:
            # Beacon calls Theory for validation assistance
            print(f"\n📞 Beacon calling Theory agent for assistance...")
            call_result = await beacon.execute_tool(
                'tools_call_agent',
                agent_id='theory_agent',
                task=f'Prepare validation criteria for topic: {topic}'
            )
            
            if 'error' not in call_result:
                print(f"✅ Agent call completed!")
                print(f"   📞 Caller: {call_result['caller']}")
                print(f"   🎯 Target: {call_result['target']}")
                print(f"   📝 Task: {call_result['task']}")
                print(f"   🔄 Status: {call_result['status']}")
                print(f"   💬 Response: {call_result['response'][:100]}...")
            
            # Search for knowledge
            print(f"\n🔍 Beacon searching for knowledge...")
            search_result = await beacon.execute_tool(
                'beacon_search_knowledge',
                topic=topic,
                sources=['wikipedia'],
                max_sources=1
            )
            
            if 'error' not in search_result:
                # Ask user a clarifying question
                print(f"\n❓ Beacon asking for user clarification...")
                user_question = await beacon.execute_tool(
                    'tools_ask_user',
                    question=f"Should I include technical details about {topic} in the summary?"
                )
                print(f"   📝 Question logged: {user_question}")
                
                # Cross-reference sources
                async with TheoryAgentEnhanced(self.config) as theory:
                    print(f"\n🔗 Theory cross-referencing sources...")
                    cross_ref_result = await theory.execute_tool(
                        'theory_cross_reference_sources',
                        sources=search_result['sources']
                    )
                    
                    if 'error' not in cross_ref_result:
                        print(f"✅ Cross-reference completed!")
                        print(f"   📊 Average reliability: {cross_ref_result['average_reliability']:.2f}")
                        print(f"   🎯 Consensus strength: {cross_ref_result['consensus_strength']:.2f}")
                        print(f"   ⚠️  Conflicts detected: {len(cross_ref_result['conflicts'])}")

    async def demo_inter_agent_collaboration(self):
        """Demo: Inter-agent collaboration"""
        topic = self.demo_scenarios['5']['topic']
        
        print(f"🤝 Demonstrating inter-agent collaboration on '{topic}'")
        
        async with BeaconAgentEnhanced(self.config) as beacon:
            # Beacon calls Theory for validation assistance
            print(f"\n📞 Beacon calling Theory agent for assistance...")
            call_result = await beacon.execute_tool(
                'tools_call_agent',
                agent_id='theory_agent',
                task=f'Prepare validation criteria for topic: {topic}'
            )
            
            if 'error' not in call_result:
                print(f"✅ Agent call completed!")
                print(f"   📞 Caller: {call_result['caller']}")
                print(f"   🎯 Target: {call_result['target']}")
                print(f"   📝 Task: {call_result['task']}")
                print(f"   🔄 Status: {call_result['status']}")
                print(f"   💬 Response: {call_result['response'][:100]}...")
            
            # Search for knowledge
            print(f"\n🔍 Beacon searching for knowledge...")
            search_result = await beacon.execute_tool(
                'beacon_search_knowledge',
                topic=topic,
                sources=['wikipedia'],
                max_sources=1
            )
            
            if 'error' not in search_result:
                # Ask user a clarifying question
                print(f"\n❓ Beacon asking for user clarification...")
                user_question = await beacon.execute_tool(
                    'tools_ask_user',
                    question=f"Should I include technical details about {topic} in the summary?"
                )
                print(f"   📝 Question logged: {user_question}")
                
                # Cross-reference sources
                async with TheoryAgentEnhanced(self.config) as theory:
                    print(f"\n🔗 Theory cross-referencing sources...")
                    cross_ref_result = await theory.execute_tool(
                        'theory_cross_reference_sources',
                        sources=search_result['sources']
                    )
                    
                    if 'error' not in cross_ref_result:
                        print(f"✅ Cross-reference completed!")
                        print(f"   📊 Average reliability: {cross_ref_result['average_reliability']:.2f}")
                        print(f"   🎯 Consensus strength: {cross_ref_result['consensus_strength']:.2f}")
                        print(f"   ⚠️  Conflicts detected: {len(cross_ref_result['conflicts'])}")

    async def demo_memory_recall(self):
        """Demo: Memory and recall system"""
        query = self.demo_scenarios['6']['query']
        
        print(f"🧠 Demonstrating memory and recall system with query: '{query}'")
        
        async with BeaconAgentEnhanced(self.config) as beacon:
            # Save some sample memories first
            print(f"\n💾 Saving sample memories...")
            
            sample_memories = [
                {
                    'content': 'Healthcare AI research shows promising results in radiology',
                    'metadata': {'type': 'research_finding', 'domain': 'healthcare_ai'}
                },
                {
                    'content': 'Previous search about AI in medical diagnosis yielded 5 sources',
                    'metadata': {'type': 'search_result', 'domain': 'healthcare_ai'}
                },
                {
                    'content': 'Machine learning models achieve 95% accuracy in chest X-ray analysis',
                    'metadata': {'type': 'performance_metric', 'domain': 'healthcare_ai'}
                }
            ]
            
            memory_keys = []
            for memory in sample_memories:
                key = await beacon.execute_tool(
                    'memory_save',
                    content=memory['content'],
                    metadata=memory['metadata']
                )
                memory_keys.append(key)
                print(f"   ✅ Saved: {memory['content'][:50]}... (Key: {key[:8]}...)")
            
            # Retrieve memories
            print(f"\n🔍 Retrieving memories for query: '{query}'")
            retrieved_memories = await beacon.execute_tool(
                'memory_retrieve',
                query=query,
                limit=3
            )
            
            if retrieved_memories and 'error' not in retrieved_memories[0]:
                print(f"✅ Found {len(retrieved_memories)} relevant memories:")
                for i, memory in enumerate(retrieved_memories, 1):
                    print(f"   {i}. {memory['content'][:80]}...")
                    print(f"      Score: {memory['relevance_score']:.2f}")
                    print(f"      Key: {memory['key'][:8]}...")
            
            # Get current time for logging
            print(f"\n⏰ Getting current time for logging...")
            time_result = await beacon.execute_tool('tools_get_time')
            print(f"   🕐 Current time: {time_result['formatted']}")
            print(f"   🏷️  Agent ID: {time_result['agent_id']}")
            
            # Sign output for blockchain
            output_to_sign = f"Memory retrieval completed for query: {query}"
            print(f"\n🔐 Signing output for blockchain...")
            signed_result = await beacon.execute_tool(
                'tools_sign_output',
                output=output_to_sign
            )
            
            if 'error' not in signed_result:
                print(f"✅ Output signed!")
                print(f"   🔐 Content hash: {signed_result['content_hash'][:16]}...")
                print(f"   ✍️  Signature: {signed_result['signature'][:16]}...")
                print(f"   ⛓️  Blockchain CID: {signed_result['cid']}")

    async def show_tool_summary(self):
        """Show summary of all available tools"""
        print("\n📋 Tool Summary Report")
        print("=" * 50)
        
        async with BeaconAgentEnhanced(self.config) as beacon:
            beacon_tools = beacon.get_available_tools()
            
        async with TheoryAgentEnhanced(self.config) as theory:
            theory_tools = theory.get_available_tools()
        
        # Count tool types
        core_tools = [t for t in beacon_tools if not t['name'].startswith(('beacon_', 'theory_'))]
        beacon_specific = [t for t in beacon_tools if t['name'].startswith('beacon_')]
        theory_specific = [t for t in theory_tools if t['name'].startswith('theory_')]
        
        print(f"🔧 Core Tools (available to all agents): {len(core_tools)}")
        for tool in core_tools:
            print(f"   • {tool['name']}")
        
        print(f"\n🔍 Beacon-Specific Tools: {len(beacon_specific)}")
        for tool in beacon_specific:
            print(f"   • {tool['name']}")
        
        print(f"\n🧠 Theory-Specific Tools: {len(theory_specific)}")
        for tool in theory_specific:
            print(f"   • {tool['name']}")
        
        print(f"\n📊 Total Tools Available: {len(core_tools) + len(beacon_specific) + len(theory_specific)}")


async def main():
    """Main entry point"""
    try:
        demo = ToolCallingDemo()
        
        # Show initial banner
        print("🌟 Welcome to the C-Suite Agent Tool Calling Demo!")
        print("This demo showcases how AI agents can use tools for:")
        print("• Knowledge retrieval and validation")
        print("• Blockchain logging and cryptographic signing")
        print("• Inter-agent communication")
        print("• Memory management and recall")
        print("• Fact-checking and bias analysis")
        
        # Check if user wants to see tool summary first
        show_summary = input("\nShow tool summary first? (y/n): ").strip().lower()
        if show_summary == 'y':
            await demo.show_tool_summary()
            input("\nPress Enter to continue to demos...")
        
        # Run the main demo
        await demo.run_demo()
        
    except KeyboardInterrupt:
        print("\n\n👋 Demo interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ Demo error: {e}")
        print("Please check your setup and try again.")

if __name__ == "__main__":
    asyncio.run(main()) 