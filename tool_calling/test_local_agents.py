# ----------------------------------------------------------------------------
#  File:        test_local_agents.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test local Ollama LLM agent integration
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

from llm_agents import LLMAgentEngine
import asyncio

async def test_local_models():
    """Test local Ollama model integration"""
    print("🔧 Testing Local Ollama Agent Integration")
    print("=" * 50)
    
    engine = LLMAgentEngine()
    print(f"🔧 Available agents: {list(engine.agents.keys())}")
    print(f"🌐 Ollama URL: {engine.ollama_base_url}")
    
    # Test a few key agents
    test_agents = ['Theory', 'Echo', 'Verdict']
    
    for agent_name in test_agents:
        if agent_name in engine.agents:
            agent = engine.agents[agent_name]
            print(f"\n🧠 Testing {agent_name} agent...")
            print(f"   Model: {agent.model}")
            print(f"   Personality: {agent.personality}")
            
            try:
                result = await engine.generate_agent_reasoning(
                    agent_name, 
                    'Analysis', 
                    'Test reasoning with local Ollama model', 
                    'test_001'
                )
                
                print(f"✅ Success! Generated {len(result)} reasoning steps")
                
                for step in result:
                    step_type = step['type']
                    content = step['content']
                    if step_type == 'thinking':
                        print(f"   💭 Thinking: {content[:60]}...")
                    elif step_type == 'thought':
                        print(f"   🤖 Thought: {content[:60]}...")
                        
            except Exception as e:
                print(f"❌ Error testing {agent_name}: {e}")
                print("💡 Make sure Ollama is running: ollama serve")
                print("💡 And that the model exists: ollama pull theory:latest")
    
    print("\n" + "=" * 50)
    print("🎯 Test completed!")

if __name__ == "__main__":
    asyncio.run(test_local_models()) 