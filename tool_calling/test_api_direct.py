#!/usr/bin/env python3

import asyncio
from cognition_tools import CognitionAPI

async def test_api():
    """Test the cognition API directly"""
    print("🧬 Testing Cognition API directly...")
    
    api = CognitionAPI()
    
    # Test sim.run_cognition
    result = await api.execute_tool('sim.run_cognition', cognition_id='test_api')
    print(f"✅ Cognition API working: {result['execution_id']}")
    
    # Test cognition.list_all
    cognitions = await api.execute_tool('cognition.list_all')
    print(f"✅ Found {len(cognitions)} cognitions")
    
    # Test reputation.get
    reputation = await api.execute_tool('reputation.get', agent_id='Theory')
    print(f"✅ Theory reputation: {reputation['reputation_score']:.1f}")
    
    print("🎉 All API tests passed!")

if __name__ == "__main__":
    asyncio.run(test_api()) 