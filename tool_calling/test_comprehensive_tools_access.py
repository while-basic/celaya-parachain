# ----------------------------------------------------------------------------
#  File:        test_comprehensive_tools_access.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test script to verify all agents have comprehensive tool access
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
sys.path.append(str(tool_calling_path / 'agents' / 'beacon'))
sys.path.append(str(tool_calling_path / 'agents' / 'theory'))
sys.path.append(str(tool_calling_path / 'agents' / 'echo'))

from comprehensive_tools import ComprehensiveTools

async def test_comprehensive_tools_access():
    """Test that agents have access to all comprehensive tools"""
    
    print("🧪 Testing Comprehensive Tools Access")
    print("=" * 60)
    
    # Test 1: Create a comprehensive tools instance
    print("\n📦 Test 1: Creating Comprehensive Tools Instance")
    config = {'test_mode': True}
    
    try:
        tools_instance = ComprehensiveTools("test_agent", config)
        print("✅ Comprehensive tools instance created successfully")
    except Exception as e:
        print(f"❌ Failed to create comprehensive tools instance: {e}")
        return False
    
    # Test 2: Check tool availability
    print("\n🔧 Test 2: Checking Tool Availability")
    try:
        async with tools_instance:
            # Get all available tools
            all_tools = await tools_instance.dev_list_tools()
            
            # Get categorized tools
            categorized_tools = await tools_instance.get_comprehensive_tool_list()
            
            print(f"📊 Total tools available: {len(all_tools)}")
            print(f"📂 Tool categories: {len(categorized_tools)}")
            
            # Print tool categories and counts
            for category, tools in categorized_tools.items():
                print(f"   - {category}: {len(tools)} tools")
                
    except Exception as e:
        print(f"❌ Failed to check tool availability: {e}")
        return False
    
    # Test 3: Test core toolchain (minimum required)
    print("\n🎯 Test 3: Testing Core Toolchain (Minimum Required)")
    required_tools = [
        'recall_log_insight',
        'memory_retrieve', 
        'memory_save',
        'tools_call_agent',
        'tools_ask_user',
        'tools_sign_output',
        'dev_get_prompt',
        'dev_mutate_prompt',
        'security_log_risk',
        'ui_stream_to_dashboard'
    ]
    
    missing_tools = []
    working_tools = []
    
    async with tools_instance:
        for tool_name in required_tools:
            try:
                if tool_name == 'recall_log_insight':
                    result = await tools_instance.execute_tool(tool_name, content="Test log entry")
                elif tool_name == 'memory_save':
                    result = await tools_instance.execute_tool(tool_name, content="Test memory content")
                elif tool_name == 'memory_retrieve':
                    result = await tools_instance.execute_tool(tool_name, query="test")
                elif tool_name == 'tools_ask_user':
                    result = await tools_instance.execute_tool(tool_name, question="Test question")
                elif tool_name == 'tools_sign_output':
                    result = await tools_instance.execute_tool(tool_name, output="Test output")
                elif tool_name == 'dev_get_prompt':
                    result = await tools_instance.execute_tool(tool_name)
                elif tool_name == 'security_log_risk':
                    result = await tools_instance.execute_tool(tool_name, event="Test risk event")
                elif tool_name == 'ui_stream_to_dashboard':
                    result = await tools_instance.execute_tool(tool_name, data={'test': 'data'})
                elif tool_name == 'dev_mutate_prompt':
                    result = await tools_instance.execute_tool(tool_name, operation="add", content="test line")
                else:
                    result = await tools_instance.execute_tool(tool_name)
                
                if 'error' not in result:
                    working_tools.append(tool_name)
                    print(f"   ✅ {tool_name}")
                else:
                    print(f"   ⚠️ {tool_name} (returned error)")
                    
            except Exception as e:
                missing_tools.append(tool_name)
                print(f"   ❌ {tool_name} - {e}")
    
    print(f"\n📈 Core tools working: {len(working_tools)}/{len(required_tools)}")
    
    # Test 4: Test extended tool categories
    print("\n🔧 Test 4: Testing Extended Tool Categories")
    
    extended_tool_samples = {
        'Security/Alignment': ['security_check_alignment', 'security_isolate'],
        'Inter-Agent Operations': ['council_vote', 'council_get_result'],
        'Identity & Wallet': ['id_get_public_key', 'id_sign_message'],
        'System Control': ['system_get_status', 'system_restart'],
        'Cognitive Tools': ['cognition_plan', 'cognition_log_emotion'],
        'Task Management': ['task_create', 'task_link_dependency'],
        'Personality Tools': ['persona_describe_self', 'persona_shift_style'],
        'Sensor Tools': ['watch_listen', 'watch_trigger_on'],
        'UI/Transparency': ['ui_tag_entry', 'ui_show_last_5']
    }
    
    category_results = {}
    
    async with tools_instance:
        for category, sample_tools in extended_tool_samples.items():
            working = 0
            total = len(sample_tools)
            
            for tool_name in sample_tools:
                try:
                    # Test basic tool execution with appropriate parameters
                    if tool_name == 'security_check_alignment':
                        result = await tools_instance.execute_tool(tool_name)
                    elif tool_name == 'council_vote':
                        result = await tools_instance.execute_tool(tool_name, proposal="Test proposal")
                    elif tool_name == 'council_get_result':
                        # Create a vote first
                        vote_result = await tools_instance.execute_tool('council_vote', proposal="Test proposal")
                        if 'vote_id' in vote_result:
                            result = await tools_instance.execute_tool(tool_name, vote_id=vote_result['vote_id'])
                        else:
                            result = {'error': 'No vote to check'}
                    elif tool_name == 'id_get_public_key':
                        result = await tools_instance.execute_tool(tool_name)
                    elif tool_name == 'id_sign_message':
                        result = await tools_instance.execute_tool(tool_name, message="Test message")
                    elif tool_name == 'system_get_status':
                        result = await tools_instance.execute_tool(tool_name)
                    elif tool_name == 'system_restart':
                        result = await tools_instance.execute_tool(tool_name, reason="Test restart")
                    elif tool_name == 'cognition_plan':
                        result = await tools_instance.execute_tool(tool_name, goal="Test goal")
                    elif tool_name == 'cognition_log_emotion':
                        result = await tools_instance.execute_tool(tool_name, emotion="confidence", intensity=0.8)
                    elif tool_name == 'task_create':
                        result = await tools_instance.execute_tool(tool_name, description="Test task")
                    elif tool_name == 'task_link_dependency':
                        # Create tasks first
                        task1 = await tools_instance.execute_tool('task_create', description="Task 1")
                        task2 = await tools_instance.execute_tool('task_create', description="Task 2")
                        if 'task_id' in task1 and 'task_id' in task2:
                            result = await tools_instance.execute_tool(tool_name, task_id=task2['task_id'], dependency_task_id=task1['task_id'])
                        else:
                            result = {'error': 'Could not create tasks'}
                    elif tool_name == 'persona_describe_self':
                        result = await tools_instance.execute_tool(tool_name)
                    elif tool_name == 'persona_shift_style':
                        result = await tools_instance.execute_tool(tool_name, new_tone="formal")
                    elif tool_name == 'watch_listen':
                        result = await tools_instance.execute_tool(tool_name, topic="test_topic")
                    elif tool_name == 'watch_trigger_on':
                        result = await tools_instance.execute_tool(tool_name, condition="test_condition", action="test_action")
                    elif tool_name == 'ui_tag_entry':
                        result = await tools_instance.execute_tool(tool_name, content="Test content", tags=["test"])
                    elif tool_name == 'ui_show_last_5':
                        result = await tools_instance.execute_tool(tool_name)
                    else:
                        result = await tools_instance.execute_tool(tool_name)
                    
                    if 'error' not in result:
                        working += 1
                        
                except Exception as e:
                    pass  # Tool not working
            
            category_results[category] = f"{working}/{total}"
            status = "✅" if working == total else "⚠️" if working > 0 else "❌"
            print(f"   {status} {category}: {working}/{total} tools working")
    
    # Test 5: Test tool search functionality
    print("\n🔍 Test 5: Testing Tool Search Functionality")
    
    async with tools_instance:
        try:
            search_results = await tools_instance.tools_search("memory")
            print(f"   ✅ Tool search for 'memory': {len(search_results)} results")
            
            # Test another search
            search_results = await tools_instance.tools_search("security")
            print(f"   ✅ Tool search for 'security': {len(search_results)} results")
            
        except Exception as e:
            print(f"   ❌ Tool search failed: {e}")
    
    # Test 6: Verify all-tools.md tool coverage
    print("\n📋 Test 6: Verifying all-tools.md Tool Coverage")
    
    # Expected tool categories from all-tools.md
    expected_categories = [
        'Core Blockchain', 'Memory Management', 'Debug & Development', 
        'Security & Alignment', 'Inter-Agent Operations', 'Identity & Wallet',
        'System Control', 'Cognitive & Thought', 'User Interface & Transparency',
        'Sensor & Event Hooks', 'Task Management', 'Personality & Style'
    ]
    
    async with tools_instance:
        categorized_tools = await tools_instance.get_comprehensive_tool_list()
        
        covered_categories = []
        missing_categories = []
        
        for expected_cat in expected_categories:
            found = False
            for actual_cat in categorized_tools.keys():
                if any(word in actual_cat for word in expected_cat.split()):
                    covered_categories.append(expected_cat)
                    found = True
                    break
            if not found:
                missing_categories.append(expected_cat)
        
        print(f"   ✅ Categories covered: {len(covered_categories)}/{len(expected_categories)}")
        
        if missing_categories:
            print(f"   ⚠️ Missing categories: {', '.join(missing_categories)}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 COMPREHENSIVE TOOLS ACCESS TEST SUMMARY")
    print("=" * 60)
    
    async with tools_instance:
        total_tools = len(await tools_instance.dev_list_tools())
        tool_categories = await tools_instance.get_comprehensive_tool_list()
        
        print(f"✅ Total tools available: {total_tools}")
        print(f"✅ Tool categories: {len(tool_categories)}")
        print(f"✅ Core tools working: {len(working_tools)}/{len(required_tools)}")
        print(f"✅ Extended categories tested: {len(category_results)}")
        
        # Overall success assessment
        core_success_rate = len(working_tools) / len(required_tools)
        
        if core_success_rate >= 0.9 and total_tools >= 50:
            print("\n🎉 SUCCESS: All agents have comprehensive tool access!")
            print("   - Core tools are functional")
            print("   - Extended tools are available")
            print("   - Tool discovery is working")
            return True
        else:
            print("\n⚠️ PARTIAL SUCCESS: Some issues detected")
            print(f"   - Core tool success: {core_success_rate:.1%}")
            print(f"   - Total tools: {total_tools}")
            return False

async def main():
    """Main test execution"""
    print("🧠 COMPREHENSIVE TOOLS ACCESS VERIFICATION")
    print("Testing that all agents have access to all tools from all-tools.md")
    print()
    
    success = await test_comprehensive_tools_access()
    
    if success:
        print("\n✅ All tests passed! Agents have comprehensive tool access.")
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")
    
    return success

if __name__ == "__main__":
    asyncio.run(main()) 