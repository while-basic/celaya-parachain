# ----------------------------------------------------------------------------
#  File:        test_core.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test suite for Core Agent enhanced functionality
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import sys
from pathlib import Path

# Add the parent directory to path so we can import from agents and core
sys.path.append(str(Path(__file__).parent.parent.parent))

try:
    from agents.core.core_agent_enhanced import CoreAgentEnhanced
    print("✅ Successfully imported Core agent")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

async def test_core_initialization():
    """Test Core agent initialization and basic functionality"""
    print("\n⚙️ Testing Core Agent Initialization...")
    
    config = {
        'max_concurrent_tasks': 3,
        'consensus_threshold': 0.75,
        'insight_retention_days': 30
    }
    
    async with CoreAgentEnhanced(config) as core:
        # Test basic properties
        assert core.agent_id == "core_agent"
        assert core.max_concurrent_tasks == 3
        assert core.consensus_threshold == 0.75
        
        print(f"   ✅ Agent ID: {core.agent_id}")
        print(f"   ✅ Max concurrent tasks: {core.max_concurrent_tasks}")
        print(f"   ✅ Consensus threshold: {core.consensus_threshold}")

async def test_core_tools_discovery():
    """Test Core agent tool discovery"""
    print("\n🔧 Testing Core Agent Tool Discovery...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        tools = core.get_available_tools()
        
        # Check for core tools
        core_tool_names = [t['name'] for t in tools if not t['name'].startswith('core_')]
        core_specific_tools = [t['name'] for t in tools if t['name'].startswith('core_')]
        
        print(f"   🔧 Core tools available: {len(core_tool_names)}")
        print(f"   ⚙️ Core-specific tools: {len(core_specific_tools)}")
        
        # Verify key Core-specific tools exist
        expected_tools = [
            'core_process_insight_request',
            'core_manage_consensus',
            'core_synthesize_multi_agent_insights',
            'core_coordinate_agents'
        ]
        
        for tool_name in expected_tools:
            assert tool_name in core_specific_tools, f"Missing tool: {tool_name}"
            print(f"   ✅ {tool_name}")
        
        print(f"   📊 Total tools available: {len(tools)}")

async def test_insight_processing():
    """Test the main insight processing functionality"""
    print("\n🔄 Testing Insight Processing...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        # Test comprehensive insight processing
        print("   📊 Testing comprehensive processing...")
        result = await core.execute_tool(
            'core_process_insight_request',
            topic='quantum computing applications in cybersecurity',
            processing_type='comprehensive',
            priority=7
        )
        
        if 'error' not in result:
            print(f"   ✅ Processing completed")
            print(f"      📝 Topic: {result['topic']}")
            print(f"      🆔 Task ID: {result['task_id']}")
            print(f"      📊 Status: {result['status']}")
            print(f"      🎯 Overall Confidence: {result['overall_confidence']:.3f}")
            print(f"      ⏱️ Processing Type: {result['processing_type']}")
            
            # Verify structure
            assert 'beacon_insights' in result
            assert 'theory_validation' in result
            assert 'core_synthesis' in result
            assert 'consensus' in result
            
            print(f"      ✅ Beacon insights included")
            print(f"      ✅ Theory validation included")
            print(f"      ✅ Core synthesis included")
            print(f"      ✅ Consensus recording included")
        else:
            print(f"   ❌ Processing error: {result['error']}")

async def test_consensus_management():
    """Test consensus management between agents"""
    print("\n🤝 Testing Consensus Management...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        # Sample agent inputs for consensus
        agent_inputs = {
            'beacon_agent': {
                'confidence': 0.85,
                'reliability_score': 0.82,
                'recommendation': 'accept',
                'summary': 'Strong evidence from multiple sources'
            },
            'theory_agent': {
                'confidence': 0.78,
                'reliability_score': 0.80,
                'recommendation': 'accept_with_caution',
                'summary': 'Some bias detected but overall reliable'
            }
        }
        
        result = await core.execute_tool(
            'core_manage_consensus',
            topic='blockchain adoption in supply chain',
            agent_inputs=agent_inputs,
            consensus_type='weighted'
        )
        
        if 'error' not in result:
            print(f"   ✅ Consensus completed")
            print(f"      🆔 Consensus ID: {result['consensus_id']}")
            print(f"      📊 Consensus Score: {result['consensus_score']:.3f}")
            print(f"      🏆 Consensus Type: {result['consensus_type']}")
            print(f"      👥 Participating Agents: {len(result['participating_agents'])}")
            print(f"      💡 Dominant Recommendation: {result['dominant_recommendation']}")
            
            # Verify consensus logic
            assert result['consensus_score'] > 0.0
            assert result['consensus_type'] in ['unanimous', 'majority', 'split']
            assert len(result['participating_agents']) == 2
            
        else:
            print(f"   ❌ Consensus error: {result['error']}")

async def test_insight_synthesis():
    """Test multi-agent insight synthesis"""
    print("\n🧠 Testing Insight Synthesis...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        # Sample insights from different agents
        insights = [
            {
                'topic': 'artificial intelligence in finance',
                'summary': 'AI applications in finance show promising ROI potential',
                'confidence': 0.87,
                'reliability_score': 0.85,
                'agent': 'beacon_agent'
            },
            {
                'topic': 'artificial intelligence in finance',
                'summary': 'AI in finance requires careful regulatory compliance',
                'confidence': 0.82,
                'reliability_score': 0.88,
                'agent': 'theory_agent'
            }
        ]
        
        result = await core.execute_tool(
            'core_synthesize_multi_agent_insights',
            insights=insights,
            synthesis_method='weighted_average'
        )
        
        if 'error' not in result:
            print(f"   ✅ Synthesis completed")
            print(f"      🆔 Synthesis ID: {result['synthesis_id']}")
            print(f"      📝 Topic: {result['topic']}")
            print(f"      🎯 Synthesized Confidence: {result['synthesized_confidence']:.3f}")
            print(f"      📊 Synthesized Reliability: {result['synthesized_reliability']:.3f}")
            print(f"      👥 Contributing Agents: {len(result['contributing_agents'])}")
            print(f"      📄 Insight Count: {result['insight_count']}")
            
            # Verify synthesis structure
            assert result['insight_count'] == 2
            assert len(result['contributing_agents']) == 2
            assert 'synthesized_content' in result
            assert 'blockchain_hash' in result
            
        else:
            print(f"   ❌ Synthesis error: {result['error']}")

async def test_agent_coordination():
    """Test agent coordination functionality"""
    print("\n🤝 Testing Agent Coordination...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        # Test sequential coordination
        print("   🔄 Testing sequential coordination...")
        result = await core.execute_tool(
            'core_coordinate_agents',
            task_description='Research environmental impact of electric vehicles',
            required_agents=['beacon_agent', 'theory_agent'],
            coordination_type='sequential'
        )
        
        if 'error' not in result:
            print(f"   ✅ Sequential coordination completed")
            print(f"      🆔 Coordination ID: {result['coordination_id']}")
            print(f"      📊 Success Rate: {result['success_rate']:.2f}")
            print(f"      📝 Status: {result['status']}")
            print(f"      👥 Required Agents: {len(result['required_agents'])}")
            print(f"      ⚡ Execution Order: {result['execution_order']}")
            
            # Verify coordination structure
            assert result['status'] == 'completed'
            assert len(result['agent_results']) == 2
            assert result['coordination_type'] == 'sequential'
            
        else:
            print(f"   ❌ Coordination error: {result['error']}")
        
        # Test parallel coordination
        print("   ⚡ Testing parallel coordination...")
        result2 = await core.execute_tool(
            'core_coordinate_agents',
            task_description='Analyze market trends in renewable energy',
            required_agents=['beacon_agent', 'theory_agent'],
            coordination_type='parallel'
        )
        
        if 'error' not in result2:
            print(f"   ✅ Parallel coordination completed")
            print(f"      📊 Success Rate: {result2['success_rate']:.2f}")
            print(f"      🔄 Coordination Type: {result2['coordination_type']}")

async def test_memory_and_recall():
    """Test Core agent memory and recall functionality"""
    print("\n🧠 Testing Memory and Recall...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        # Test memory save
        print("   💾 Testing memory save...")
        memory_key = await core.execute_tool(
            'memory_save',
            content='Core processing completed for renewable energy analysis',
            metadata={'type': 'processing_complete', 'topic': 'renewable_energy'}
        )
        print(f"      ✅ Memory saved with key: {memory_key[:16]}...")
        
        # Test memory retrieve
        print("   🔍 Testing memory retrieve...")
        memories = await core.execute_tool(
            'memory_retrieve',
            query='renewable energy processing',
            limit=2
        )
        
        if memories and 'error' not in memories[0]:
            print(f"      ✅ Retrieved {len(memories)} memories")
            for i, memory in enumerate(memories[:2], 1):
                print(f"         {i}. {memory['content'][:50]}...")
        
        # Test recall logging
        print("   📋 Testing recall logging...")
        recall_cid = await core.execute_tool(
            'recall_log_insight',
            content='Core agent test completed successfully',
            metadata={'type': 'test_completion', 'agent': 'core_agent'}
        )
        print(f"      ✅ Logged to recall with CID: {recall_cid}")

async def test_time_and_signing():
    """Test time retrieval and output signing"""
    print("\n⏰ Testing Time and Signing...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        # Test time retrieval
        print("   🕐 Testing time retrieval...")
        time_info = await core.execute_tool('tools_get_time')
        print(f"      ✅ Current time: {time_info['formatted']}")
        print(f"      🆔 Agent ID: {time_info['agent_id']}")
        
        # Test output signing
        print("   🔐 Testing output signing...")
        test_content = "Core agent processing result for blockchain verification"
        signed_result = await core.execute_tool(
            'tools_sign_output',
            output=test_content
        )
        
        if 'error' not in signed_result:
            print(f"      ✅ Content signed successfully")
            print(f"         📋 Content hash: {signed_result.get('content_hash', 'N/A')[:16]}...")
            print(f"         ✍️ Signature: {signed_result.get('signature', 'N/A')[:16]}...")
            print(f"         ⛓️ Blockchain CID: {signed_result.get('cid', 'N/A')}")

async def main():
    """Main test runner for Core agent"""
    print("🧪 Core Agent Enhanced Functionality Tests")
    print("=" * 60)
    
    try:
        await test_core_initialization()
        await test_core_tools_discovery()
        await test_insight_processing()
        await test_consensus_management()
        await test_insight_synthesis()
        await test_agent_coordination()
        await test_memory_and_recall()
        await test_time_and_signing()
        
        print("\n✅ All Core agent tests completed successfully!")
        print("🎉 Core Agent is ready for orchestrating C-Suite operations!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        print("🔧 Please check the Core agent implementation.")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 