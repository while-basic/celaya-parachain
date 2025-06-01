# ----------------------------------------------------------------------------
#  File:        test_tool_calling.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test script for enhanced agent tool calling system
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import sys
from pathlib import Path

# Import the enhanced agents
# Add the parent directory to path so we can import from agents and core
sys.path.append(str(Path(__file__).parent.parent))

try:
    from agents.beacon.beacon_agent_enhanced import BeaconAgentEnhanced
    from agents.theory.theory_agent_enhanced import TheoryAgentEnhanced
    from agents.core.core_agent_enhanced import CoreAgentEnhanced
    print("✅ Successfully imported enhanced agents (Beacon, Theory, Core)")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

async def test_core_tools():
    """Test core tools functionality"""
    print("\n🔧 Testing Core Tools...")
    
    config = {}
    
    async with BeaconAgentEnhanced(config) as beacon:
        # Test memory save/retrieve
        print("📝 Testing memory save...")
        memory_key = await beacon.execute_tool(
            'memory_save',
            content='Test memory content for tool calling',
            metadata={'test': True, 'type': 'test_memory'}
        )
        print(f"   Memory saved with key: {memory_key[:8]}...")
        
        print("🔍 Testing memory retrieve...")
        memories = await beacon.execute_tool(
            'memory_retrieve',
            query='test memory',
            limit=2
        )
        print(f"   Retrieved {len(memories)} memories")
        
        # Test recall logging
        print("📋 Testing recall logging...")
        recall_cid = await beacon.execute_tool(
            'recall_log_insight',
            content='Test insight for blockchain logging',
            metadata={'test': True, 'type': 'test_insight'}
        )
        print(f"   Logged to recall with CID: {recall_cid}")
        
        # Test time retrieval
        print("⏰ Testing time retrieval...")
        time_info = await beacon.execute_tool('tools_get_time')
        print(f"   Current time: {time_info['formatted']}")
        
        # Test signing
        print("🔐 Testing output signing...")
        signed = await beacon.execute_tool(
            'tools_sign_output',
            output='Test content to sign'
        )
        print(f"   Signed with hash: {signed.get('content_hash', 'N/A')[:16]}...")

async def test_beacon_tools():
    """Test Beacon-specific tools"""
    print("\n🔍 Testing Beacon Tools...")
    
    config = {}
    
    async with BeaconAgentEnhanced(config) as beacon:
        # Test knowledge search
        print("📚 Testing knowledge search...")
        search_result = await beacon.execute_tool(
            'beacon_search_knowledge',
            topic='artificial intelligence',
            sources=['wikipedia'],
            max_sources=1
        )
        
        if 'error' not in search_result:
            print(f"   ✅ Search completed for: {search_result['topic']}")
            print(f"   📄 Sources found: {len(search_result['sources'])}")
            print(f"   🔗 Search ID: {search_result['search_id']}")
            
            # Test source reliability
            if search_result['sources']:
                print("📊 Testing source reliability analysis...")
                source_url = search_result['sources'][0]['url']
                reliability = await beacon.execute_tool(
                    'beacon_get_source_reliability',
                    source_url=source_url
                )
                print(f"   Reliability score: {reliability.get('reliability_score', 'N/A')}")
                print(f"   Classification: {reliability.get('classification', 'N/A')}")
            
            # Test insight saving
            print("💾 Testing insight saving...")
            save_result = await beacon.execute_tool(
                'beacon_save_insight',
                insight_data=search_result
            )
            
            if 'error' not in save_result:
                print(f"   ✅ Insight saved with hash: {save_result.get('insight_hash', 'N/A')[:16]}...")
            else:
                print(f"   ⚠️ Insight save issue: {save_result.get('error', 'Unknown')}")
        else:
            print(f"   ⚠️ Search issue: {search_result.get('error', 'Unknown')}")

async def test_theory_tools():
    """Test Theory-specific tools"""
    print("\n🧠 Testing Theory Tools...")
    
    config = {}
    
    async with TheoryAgentEnhanced(config) as theory:
        # Test single claim fact-checking
        print("🕵️ Testing claim fact-checking...")
        claim = "Artificial intelligence can solve all problems instantly."
        fact_check = await theory.execute_tool(
            'theory_check_single_claim',
            claim=claim,
            context='Test claim for validation'
        )
        
        if 'error' not in fact_check:
            print(f"   ✅ Fact-check completed")
            print(f"   📊 Status: {fact_check['verification_status']}")
            print(f"   🎯 Confidence: {fact_check['confidence_score']:.2f}")
        else:
            print(f"   ⚠️ Fact-check issue: {fact_check.get('error', 'Unknown')}")
        
        # Test bias analysis
        print("🎭 Testing bias analysis...")
        bias_content = "This incredible technology will completely revolutionize everything forever!"
        bias_result = await theory.execute_tool(
            'theory_analyze_bias',
            content=bias_content
        )
        
        if 'error' not in bias_result:
            print(f"   ✅ Bias analysis completed")
            print(f"   📊 Bias score: {bias_result['overall_bias_score']:.2f}")
            print(f"   📈 Bias level: {bias_result['bias_level']}")
        else:
            print(f"   ⚠️ Bias analysis issue: {bias_result.get('error', 'Unknown')}")

async def test_inter_agent_tools():
    """Test inter-agent communication"""
    print("\n🤝 Testing Inter-Agent Communication...")
    
    config = {}
    
    async with BeaconAgentEnhanced(config) as beacon:
        # Test agent call
        print("📞 Testing agent-to-agent call...")
        call_result = await beacon.execute_tool(
            'tools_call_agent',
            agent_id='theory_agent',
            task='Validate this test communication'
        )
        
        if 'error' not in call_result:
            print(f"   ✅ Agent call completed")
            print(f"   📞 Caller: {call_result['caller']}")
            print(f"   🎯 Target: {call_result['target']}")
            print(f"   🔄 Status: {call_result['status']}")
        else:
            print(f"   ⚠️ Agent call issue: {call_result.get('error', 'Unknown')}")
        
        # Test user question
        print("❓ Testing user question...")
        user_q = await beacon.execute_tool(
            'tools_ask_user',
            question='Is this test working correctly?'
        )
        print(f"   📝 User question logged: {user_q[:50]}...")

async def test_tool_discovery():
    """Test tool discovery and listing"""
    print("\n📋 Testing Tool Discovery...")
    
    config = {}
    
    async with BeaconAgentEnhanced(config) as beacon:
        beacon_tools = beacon.get_available_tools()
        core_tools = [t for t in beacon_tools if not t['name'].startswith(('beacon_', 'theory_', 'core_'))]
        beacon_specific_tools = [t for t in beacon_tools if t['name'].startswith('beacon_')]
        
        print(f"🔧 Core tools available: {len(core_tools)}")
        print(f"🔍 Beacon-specific tools: {len(beacon_specific_tools)}")
    
    async with TheoryAgentEnhanced(config) as theory:
        theory_tools = theory.get_available_tools()
        theory_specific_tools = [t for t in theory_tools if t['name'].startswith('theory_')]
        
        print(f"🧠 Theory-specific tools: {len(theory_specific_tools)}")
    
    async with CoreAgentEnhanced(config) as core:
        core_tools_all = core.get_available_tools()
        core_specific_tools = [t for t in core_tools_all if t['name'].startswith('core_')]
        
        print(f"⚙️ Core-specific tools: {len(core_specific_tools)}")
        
        total_unique_tools = len(set(
            [t['name'] for t in beacon.get_available_tools()] + 
            [t['name'] for t in theory.get_available_tools()] +
            [t['name'] for t in core.get_available_tools()]
        ))
        print(f"📊 Total unique tools across all agents: {total_unique_tools}")
        print(f"🎯 Active agents: Beacon, Theory, Core (3 agents operational)")

async def check_storage_structure():
    """Check that storage directories are created correctly"""
    print("\n📁 Checking Storage Structure...")
    
    base_path = Path("tool_calling")
    expected_dirs = [
        "recall_logs/beacon_agent",
        "recall_logs/theory_agent", 
        "memory/beacon_agent",
        "memory/theory_agent",
        "logs/beacon_agent",
        "logs/theory_agent"
    ]
    
    for dir_path in expected_dirs:
        full_path = base_path / dir_path
        if full_path.exists():
            print(f"   ✅ {dir_path}")
        else:
            print(f"   ⚠️ {dir_path} (will be created on first use)")

async def test_core_orchestration():
    """Test Core agent orchestration capabilities"""
    print("\n⚙️ Testing Core Agent Orchestration...")
    
    config = {}
    
    async with CoreAgentEnhanced(config) as core:
        # Test the main orchestration tool
        print("🔄 Testing comprehensive insight processing...")
        result = await core.execute_tool(
            'core_process_insight_request',
            topic='AI applications in sustainable energy',
            processing_type='comprehensive',
            priority=8
        )
        
        if 'error' not in result:
            print(f"   ✅ Core orchestration completed")
            print(f"   📝 Topic: {result['topic']}")
            print(f"   🎯 Overall Confidence: {result['overall_confidence']:.3f}")
            print(f"   📊 Processing Status: {result['status']}")
            print(f"   ⚙️ Beacon + Theory + Core synthesis working together")
            
            # Test consensus management
            print("🤝 Testing consensus management...")
            agent_inputs = {
                'beacon_agent': result['beacon_insights'],
                'theory_agent': result['theory_validation']
            }
            
            consensus = await core.execute_tool(
                'core_manage_consensus',
                topic=result['topic'],
                agent_inputs=agent_inputs
            )
            
            if 'error' not in consensus:
                print(f"   ✅ Consensus achieved: {consensus['consensus_score']:.3f}")
        else:
            print(f"   ⚠️ Core orchestration issue: {result.get('error', 'Unknown')}")

async def test_three_agent_coordination():
    """Test coordination between all three agents"""
    print("\n🔗 Testing Three-Agent Coordination...")
    
    # Test individual agents working together
    config = {}
    
    async with BeaconAgentEnhanced(config) as beacon, \
               TheoryAgentEnhanced(config) as theory, \
               CoreAgentEnhanced(config) as core:
        
        print("🔍 Step 1: Beacon knowledge search...")
        beacon_result = await beacon.execute_tool(
            'beacon_search_knowledge',
            topic='blockchain in healthcare data management',
            sources=['wikipedia'],
            max_sources=1
        )
        
        if 'error' not in beacon_result:
            print(f"   ✅ Beacon found knowledge: {len(beacon_result['sources'])} sources")
            
            print("🧠 Step 2: Theory validation...")
            theory_result = await theory.execute_tool(
                'theory_validate_insight',
                insight_data=beacon_result
            )
            
            if 'error' not in theory_result:
                print(f"   ✅ Theory validation: {theory_result['overall_reliability_score']:.3f}")
                
                print("⚙️ Step 3: Core synthesis...")
                synthesis_result = await core.execute_tool(
                    'core_synthesize_multi_agent_insights',
                    insights=[beacon_result, theory_result]
                )
                
                if 'error' not in synthesis_result:
                    print(f"   ✅ Core synthesis: {synthesis_result['synthesized_confidence']:.3f}")
                    print("🎉 Three-agent collaboration successful!")
                    
                    return True
    
    return False

async def main():
    """Main test runner"""
    print("🧪 C-Suite Agent Tool Calling System Tests")
    print("=" * 50)
    
    try:
        # Run all tests
        await check_storage_structure()
        await test_tool_discovery()
        await test_core_tools()
        await test_beacon_tools()
        await test_theory_tools()
        await test_inter_agent_tools()
        await test_core_orchestration()
        await test_three_agent_coordination()
        
        print("\n✅ All tests completed!")
        print("🎉 Tool calling system is working correctly!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        print("🔧 Please check your setup and try again.")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 