#!/usr/bin/env python3

import asyncio
import sys
from pathlib import Path

# Add paths
tool_calling_path = Path.cwd()
sys.path.append(str(tool_calling_path))
sys.path.append(str(tool_calling_path / 'core'))
sys.path.append(str(tool_calling_path / 'agents' / 'core'))

from comprehensive_tools import ComprehensiveTools
from agents.core.core_agent_enhanced import CoreAgentEnhanced

async def quick_test():
    config = {'test_mode': True, 'tool_shop_enabled': True}
    async with CoreAgentEnhanced(config) as agent:
        print("🧪 Quick Tool Shop Test")
        print("=" * 30)
        
        result = await agent.execute_tool(
            'toolshop_generate_tool',
            name='Quick Test Tool',
            description='A simple test tool',
            category='utility',
            prompt='Create a simple tool that returns a success message'
        )
        print(f'✅ Generation success: {result.get("success", False)}')
        
        if result.get('success'):
            exec_result = await agent.execute_tool(
                'toolshop_execute_tool',
                tool_id=result['tool_id']
            )
            print(f'✅ Execution success: {exec_result.get("success", False)}')
            
            if exec_result.get('success'):
                print(f'📊 Execution time: {exec_result.get("execution_time", 0):.3f}s')
                print("🎉 Tool Shop is working correctly!")
            else:
                print(f"❌ Execution failed: {exec_result.get('error')}")
        else:
            print(f"❌ Generation failed: {result.get('error')}")

if __name__ == "__main__":
    asyncio.run(quick_test()) 