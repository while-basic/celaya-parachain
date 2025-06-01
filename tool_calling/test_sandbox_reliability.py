#!/usr/bin/env python3

import asyncio
from cognition_tools import CognitionAPI

async def test_sandbox_reliability():
    """Test that sandbox mode is 100% reliable"""
    print("🧪 Testing Sandbox Mode Reliability...")
    
    api = CognitionAPI()
    
    # Test 10 cognitions in sandbox mode - they should ALL succeed
    successes = 0
    failures = 0
    
    for i in range(10):
        result = await api.execute_tool('sim.run_cognition', 
                                      cognition_id=f'reliability_test_{i}',
                                      sandbox_mode=True)
        
        if result['success']:
            successes += 1
            print(f"  ✅ Test {i+1}: SUCCESS - {result['phases_completed']}/{result['total_phases']} phases")
        else:
            failures += 1
            print(f"  ❌ Test {i+1}: FAILED - {result['phases_completed']}/{result['total_phases']} phases")
            print(f"      Status: {result['status']}")
            if 'execution_logs' in result:
                print(f"      Logs: {result['execution_logs']}")
    
    print(f"\n📊 Results: {successes}/{successes + failures} cognitions succeeded")
    
    if successes == 10:
        print("🎉 SANDBOX MODE IS 100% RELIABLE!")
        return True
    else:
        print("❌ Sandbox mode still has reliability issues")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_sandbox_reliability())
    exit(0 if success else 1) 