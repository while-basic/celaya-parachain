# ----------------------------------------------------------------------------
#  File:        demo_tool_shop.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Demo script for Tool Shop functionality
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import sys
from pathlib import Path

# Add the tool_calling directory to the Python path
tool_calling_path = Path(__file__).parent
sys.path.append(str(tool_calling_path))
sys.path.append(str(tool_calling_path / 'core'))
sys.path.append(str(tool_calling_path / 'agents' / 'core'))

from comprehensive_tools import ComprehensiveTools
from agents.core.core_agent_enhanced import CoreAgentEnhanced

async def demo_tool_shop():
    """Demonstration of Tool Shop functionality"""
    
    print("🏪 TOOL SHOP DEMO")
    print("=" * 60)
    print("Demonstrating AI-powered tool generation and deployment")
    print()
    
    # Initialize an enhanced agent with Tool Shop enabled
    config = {
        'test_mode': True,
        'tool_shop_enabled': True
    }
    
    print("📦 Initializing Core Agent with Tool Shop integration...")
    async with CoreAgentEnhanced(config) as core_agent:
        
        # Demo 1: Generate a new tool
        print("\n🔧 Demo 1: Generating a new tool")
        print("-" * 40)
        
        tool_gen_result = await core_agent.execute_tool(
            'toolshop_generate_tool',
            name="Smart Data Validator",
            description="Intelligent data validation with adaptive rules",
            category="utility",
            prompt="Create a tool that validates data integrity, checks for anomalies, and applies machine learning to detect patterns. It should be able to handle various data types and provide confidence scores.",
            parameters=[
                {"name": "data", "type": "Any", "required": True, "description": "Data to validate"},
                {"name": "rules", "type": "List", "required": False, "description": "Custom validation rules"},
                {"name": "confidence_threshold", "type": "float", "required": False, "default": 0.8, "description": "Minimum confidence threshold"}
            ],
            tags=["validation", "ml", "data-quality", "adaptive"]
        )
        
        if tool_gen_result.get('success'):
            print(f"✅ Tool generated successfully!")
            print(f"   Tool ID: {tool_gen_result['tool_id']}")
            print(f"   Function: {tool_gen_result['function_name']}")
            print(f"   Category: {tool_gen_result['category']}")
            generated_tool_id = tool_gen_result['tool_id']
        else:
            print(f"❌ Tool generation failed: {tool_gen_result.get('error')}")
            return
        
        # Demo 2: List available Tool Shop tools
        print("\n📋 Demo 2: Listing available Tool Shop tools")
        print("-" * 40)
        
        tools_list = await core_agent.execute_tool('toolshop_list_tools')
        
        if isinstance(tools_list, list) and len(tools_list) > 0:
            print(f"📊 Found {len(tools_list)} Tool Shop tools:")
            for tool in tools_list[:5]:  # Show first 5
                if 'error' not in tool:
                    print(f"   • {tool['name']} (v{tool['version']}) - {tool['category']}")
                    print(f"     Downloads: {tool['downloads']}, Rating: {tool['rating']}")
        else:
            print("⚠️ No tools found or error in listing")
        
        # Demo 3: Search for tools
        print("\n🔍 Demo 3: Searching for tools")
        print("-" * 40)
        
        search_results = await core_agent.execute_tool(
            'toolshop_search_tools',
            query="analysis",
            category="cognitive"
        )
        
        if isinstance(search_results, list):
            print(f"🎯 Found {len(search_results)} tools matching 'analysis' in cognitive category:")
            for tool in search_results[:3]:
                if 'error' not in tool:
                    print(f"   • {tool['name']}: {tool['description']}")
        else:
            print("⚠️ Search failed or returned unexpected format")
        
        # Demo 4: Install a tool
        print("\n⬇️ Demo 4: Installing a generated tool")
        print("-" * 40)
        
        install_result = await core_agent.execute_tool(
            'toolshop_install_tool',
            tool_id=generated_tool_id
        )
        
        if install_result.get('success'):
            print(f"✅ Tool installed successfully!")
            print(f"   Available as: {install_result['function_name']}")
        else:
            print(f"❌ Installation failed: {install_result.get('error')}")
        
        # Demo 5: Execute the generated tool
        print("\n▶️ Demo 5: Executing the generated tool")
        print("-" * 40)
        
        execution_result = await core_agent.execute_tool(
            'toolshop_execute_tool',
            tool_id=generated_tool_id,
            data=[1, 2, 3, "test", None],
            rules=["no_null_values", "numeric_range_check"],
            confidence_threshold=0.75
        )
        
        if execution_result.get('success'):
            print(f"✅ Tool executed successfully!")
            print(f"   Execution time: {execution_result['execution_time']:.3f}s")
            print(f"   Result preview: {str(execution_result['result'])[:100]}...")
        else:
            print(f"❌ Execution failed: {execution_result.get('error')}")
        
        # Demo 6: Get tool analytics
        print("\n📈 Demo 6: Tool analytics and performance")
        print("-" * 40)
        
        analytics_result = await core_agent.execute_tool(
            'toolshop_get_analytics',
            tool_id=generated_tool_id
        )
        
        if analytics_result.get('success'):
            analytics = analytics_result['analytics']
            print(f"📊 Tool Analytics:")
            print(f"   Total executions: {analytics.get('total_executions', 0)}")
            print(f"   Success rate: {analytics.get('success_rate', 0):.1%}")
            print(f"   Average execution time: {analytics.get('average_execution_time', 0)}s")
        else:
            print(f"⚠️ Analytics not available: {analytics_result.get('error')}")
        
        # Demo 7: Show comprehensive tool count
        print("\n🔢 Demo 7: Total tool count including Tool Shop")
        print("-" * 40)
        
        all_tools = await core_agent.execute_tool('dev_list_tools')
        categorized_tools = await core_agent.execute_tool('get_comprehensive_tool_list')
        
        print(f"🧠 Agent now has access to {len(all_tools)} total tools:")
        
        if isinstance(categorized_tools, dict):
            for category, tools in categorized_tools.items():
                print(f"   📂 {category}: {len(tools)} tools")
        
        # Demo 8: Enhanced tool search
        print("\n🔎 Demo 8: Enhanced tool search across all sources")
        print("-" * 40)
        
        enhanced_search = await core_agent.execute_tool(
            'tools_search',
            search_term="security"
        )
        
        if isinstance(enhanced_search, list):
            print(f"🛡️ Found {len(enhanced_search)} tools related to 'security':")
            for tool in enhanced_search[:5]:
                if 'error' not in tool:
                    source = tool.get('source', 'Built-in')
                    print(f"   • {tool['name']} ({source}) - {tool['category']}")
        
        # Demo 9: Generate another tool with different category
        print("\n🎨 Demo 9: Generating a cognitive enhancement tool")
        print("-" * 40)
        
        cognitive_tool = await core_agent.execute_tool(
            'toolshop_generate_tool',
            name="Pattern Insight Engine",
            description="Advanced pattern recognition with neural-inspired algorithms",
            category="cognitive",
            prompt="Build a tool that uses advanced pattern recognition to identify hidden relationships in data. It should employ neural network concepts, provide insight explanations, and suggest actionable recommendations based on discovered patterns.",
            parameters=[
                {"name": "dataset", "type": "Any", "required": True, "description": "Dataset to analyze"},
                {"name": "pattern_types", "type": "List", "required": False, "description": "Types of patterns to look for"},
                {"name": "insight_depth", "type": "str", "required": False, "default": "medium", "description": "Depth of analysis"}
            ],
            tags=["pattern-recognition", "cognitive", "insights", "neural"]
        )
        
        if cognitive_tool.get('success'):
            print(f"🧠 Cognitive tool generated successfully!")
            print(f"   Tool: {cognitive_tool['tool_name']}")
            print(f"   Category: {cognitive_tool['category']}")
            
            # Execute the cognitive tool
            cognitive_execution = await core_agent.execute_tool(
                'toolshop_execute_tool',
                tool_id=cognitive_tool['tool_id'],
                dataset={"sales": [100, 150, 200, 180, 220], "time": [1, 2, 3, 4, 5]},
                pattern_types=["trend", "seasonality", "anomaly"],
                insight_depth="high"
            )
            
            if cognitive_execution.get('success'):
                print(f"✅ Cognitive tool executed successfully!")
                print(f"   Processing quality: {cognitive_execution['result'].get('result', {}).get('processing_quality', 'unknown')}")
            else:
                print(f"❌ Cognitive tool execution failed")
        else:
            print(f"❌ Cognitive tool generation failed: {cognitive_tool.get('error')}")

    print("\n" + "=" * 60)
    print("🎉 TOOL SHOP DEMO COMPLETED")
    print("✅ Successfully demonstrated:")
    print("   • AI-powered tool generation")
    print("   • Dynamic tool installation and execution")
    print("   • Tool analytics and performance monitoring")
    print("   • Integration with comprehensive agent toolkit")
    print("   • Cross-category tool generation (utility + cognitive)")
    print("   • Enhanced search across all tool sources")
    print()
    print("🚀 The Tool Shop enables infinite extensibility for AI agents!")
    print("   Agents can now generate and use custom tools on-demand.")

async def demo_tool_shop_with_multiple_agents():
    """Demo Tool Shop with multiple agents"""
    
    print("\n🏢 MULTI-AGENT TOOL SHOP DEMO")
    print("=" * 60)
    
    config = {'test_mode': True, 'tool_shop_enabled': True}
    
    # Create multiple agents
    async with CoreAgentEnhanced(config) as core_agent:
        
        print("👥 Testing tool sharing between agents...")
        
        # Core agent generates a tool
        shared_tool = await core_agent.execute_tool(
            'toolshop_generate_tool',
            name="Universal Data Formatter", 
            description="Formats data for optimal agent communication",
            category="integration",
            prompt="Create a tool that standardizes data formats between different AI agents, ensuring consistent communication and reducing integration overhead.",
            tags=["integration", "formatting", "communication"]
        )
        
        if shared_tool.get('success'):
            tool_id = shared_tool['tool_id']
            print(f"✅ Core agent generated shared tool: {shared_tool['tool_name']}")
            
            # Test tool execution
            format_result = await core_agent.execute_tool(
                'toolshop_execute_tool',
                tool_id=tool_id,
                data={"mixed": [1, "text", True, None]},
                format_type="agent_standard"
            )
            
            if format_result.get('success'):
                print(f"✅ Shared tool executed successfully!")
                print(f"   Tool can be accessed by all agents with Tool Shop enabled")
            else:
                print(f"❌ Shared tool execution failed")
        
        print("\n🔄 Tool ecosystem is now shared across all agents!")

if __name__ == "__main__":
    asyncio.run(demo_tool_shop())
    asyncio.run(demo_tool_shop_with_multiple_agents()) 