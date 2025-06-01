# ----------------------------------------------------------------------------
#  File:        verify_local_setup.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Verify local Ollama integration is working properly
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import requests
from llm_agents import LLMAgentEngine

async def test_ollama_integration():
    """Comprehensive test of local Ollama integration"""
    print("🔧 C-Suite Local Ollama Integration Verification")
    print("=" * 60)
    
    # Test 1: LLM Agent Engine
    print("\n1️⃣ Testing LLM Agent Engine...")
    engine = LLMAgentEngine()
    
    print(f"   ✓ Available agents: {len(engine.agents)}")
    for agent_name, agent_config in engine.agents.items():
        print(f"   • {agent_name}: {agent_config.model}")
    
    # Test 2: Ollama Connectivity
    print(f"\n2️⃣ Testing Ollama connectivity ({engine.ollama_base_url})...")
    try:
        response = requests.get(f"{engine.ollama_base_url}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"   ✓ Ollama is running with {len(models)} models")
            
            # Check which agent models are available
            available_models = [model['name'] for model in models]
            print(f"   Available models: {', '.join(available_models[:5])}{'...' if len(available_models) > 5 else ''}")
            
            # Verify agent models exist
            missing_models = []
            for agent_name, agent_config in engine.agents.items():
                if agent_config.model not in available_models:
                    missing_models.append(f"{agent_name}:{agent_config.model}")
            
            if missing_models:
                print(f"   ⚠️  Missing models: {', '.join(missing_models)}")
            else:
                print(f"   ✓ All agent models are available")
        else:
            print(f"   ❌ Ollama API error: {response.status_code}")
    except requests.RequestException as e:
        print(f"   ❌ Cannot connect to Ollama: {e}")
        print("   💡 Make sure Ollama is running: ollama serve")
        return False
    
    # Test 3: Agent Reasoning (quick test)
    print(f"\n3️⃣ Testing agent reasoning...")
    test_agent = 'Echo'  # Use Echo as it should be available
    
    try:
        result = await engine.generate_agent_reasoning(
            test_agent, 
            'Test', 
            'Quick verification test', 
            'verify_001'
        )
        
        print(f"   ✓ {test_agent} generated {len(result)} reasoning steps")
        
        # Show sample output
        for step in result[:2]:
            if step['type'] == 'thinking':
                print(f"   💭 Thinking: {step['content'][:50]}...")
            elif step['type'] == 'thought':
                print(f"   🤖 Thought: {step['content'][:50]}...")
                
    except Exception as e:
        print(f"   ❌ Agent reasoning failed: {e}")
        return False
    
    # Test 4: API Server
    print(f"\n4️⃣ Testing API server...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✓ API server is healthy")
            print(f"   Available tools: {len(health_data.get('available_tools', []))}")
        else:
            print(f"   ⚠️  API server responding but not healthy: {response.status_code}")
    except requests.RequestException as e:
        print(f"   ❌ Cannot connect to API server: {e}")
        print("   💡 Make sure API server is running: python api_server.py")
        return False
    
    print("\n" + "=" * 60)
    print("✅ Local Ollama integration verification COMPLETE!")
    print("🚀 System is ready for C-Suite cognition execution")
    print("\n💡 Next steps:")
    print("   • Navigate to frontend: cd ../c-suite-dashboard-v2")
    print("   • Start frontend: npm run dev")
    print("   • Test cognitions with real local LLM reasoning!")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_ollama_integration()) 