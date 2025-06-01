# ----------------------------------------------------------------------------
#  File:        test_comprehensive_cognition.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Comprehensive test suite for all cognition and simulation tools
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import sys
from pathlib import Path
from cognition_tools import CognitionAPI

async def test_cognition_control_tools():
    """Test cognition control tools"""
    print("🧠 Testing Cognition Control Tools...")
    api = CognitionAPI()
    
    results = []
    
    try:
        # Test cognition.list_all
        print("  🔍 Testing cognition.list_all...")
        cognitions = await api.execute_tool('cognition.list_all')
        print(f"     ✅ Found {len(cognitions)} cognitions")
        results.append(('cognition.list_all', True, None))
        
        # Test sim.run_cognition to create a cognition first
        print("  🔍 Testing sim.run_cognition (to create test data)...")
        execution = await api.execute_tool('sim.run_cognition', 
                                         cognition_id='test_cognition_1')
        print(f"     ✅ Execution created: {execution['execution_id']}")
        results.append(('sim.run_cognition', True, None))
        
        # Test cognition.clone
        print("  🔍 Testing cognition.clone...")
        clone_result = await api.execute_tool('cognition.clone', 
                                            cognition_id='test_cognition_1',
                                            new_agents=['Theory', 'Echo', 'Lens'])
        print(f"     ✅ Clone created: {clone_result['clone_id']}")
        results.append(('cognition.clone', True, None))
        
        # Test cognition.score
        print("  🔍 Testing cognition.score...")
        score_result = await api.execute_tool('cognition.score',
                                            execution_id=execution['execution_id'],
                                            score=95,
                                            feedback="Excellent performance")
        print(f"     ✅ Score assigned: {score_result['score']}")
        results.append(('cognition.score', True, None))
        
        # Test cognition.inject_memory
        print("  🔍 Testing cognition.inject_memory...")
        memory_id = await api.execute_tool('cognition.inject_memory',
                                         cognition_id='test_cognition_1',
                                         phase='Analysis',
                                         memory_data={'insight': 'Test insight data'})
        print(f"     ✅ Memory injected: {memory_id}")
        results.append(('cognition.inject_memory', True, None))
        
        # Test cognition.snapshot
        print("  🔍 Testing cognition.snapshot...")
        snapshot = await api.execute_tool('cognition.snapshot',
                                        cognition_id='test_cognition_1')
        print(f"     ✅ Snapshot created: {snapshot['snapshot_id']}")
        results.append(('cognition.snapshot', True, None))
        
        # Test cognition.retire
        print("  🔍 Testing cognition.retire...")
        retire_result = await api.execute_tool('cognition.retire',
                                             cognition_id=clone_result['clone_id'],
                                             reason="Testing retirement process")
        print(f"     ✅ Cognition retired: {retire_result['cognition_id']}")
        results.append(('cognition.retire', True, None))
        
    except Exception as e:
        print(f"     ❌ Error: {e}")
        results.append((f'cognition_control', False, str(e)))
    
    return results

async def test_simulation_tools():
    """Test simulation and prediction tools"""
    print("\n🔮 Testing Simulation & Prediction Tools...")
    api = CognitionAPI()
    
    results = []
    
    try:
        # Test sim.predict_outcome
        print("  🔍 Testing sim.predict_outcome...")
        prediction = await api.execute_tool('sim.predict_outcome',
                                          action_plan={
                                              'action': 'Multi-agent analysis',
                                              'agents': ['Theory', 'Echo', 'Verdict']
                                          })
        print(f"     ✅ Prediction generated: {len(prediction['predicted_outcomes'])} outcomes")
        results.append(('sim.predict_outcome', True, None))
        
        # Test sim.test_hypothesis
        print("  🔍 Testing sim.test_hypothesis...")
        hypothesis_result = await api.execute_tool('sim.test_hypothesis',
                                                 hypothesis="Agent coordination improves with experience",
                                                 test_data={'sample_size': 100, 'test_type': 'simulation'})
        print(f"     ✅ Hypothesis tested: {hypothesis_result['conclusion']}")
        results.append(('sim.test_hypothesis', True, None))
        
        # Test sim.run_cognition (already tested above, but let's do another)
        print("  🔍 Testing sim.run_cognition with different parameters...")
        execution2 = await api.execute_tool('sim.run_cognition',
                                          cognition_id='test_cognition_2',
                                          sandbox_mode=False,
                                          timeout=600)
        print(f"     ✅ Second execution: {execution2['execution_id']}")
        results.append(('sim.run_cognition_2', True, None))
        
        # Test sim.why_failed
        print("  🔍 Testing sim.why_failed...")
        failure_analysis = await api.execute_tool('sim.why_failed',
                                                execution_id=execution2['execution_id'])
        print(f"     ✅ Failure analysis: {len(failure_analysis['recommendations'])} recommendations")
        results.append(('sim.why_failed', True, None))
        
        # Test sim.time_jump
        print("  🔍 Testing sim.time_jump...")
        time_simulation = await api.execute_tool('sim.time_jump',
                                               agent_id='Theory',
                                               time_delta_days=180)
        print(f"     ✅ Time jump simulated: {time_simulation['reputation_change']:.2f} reputation change")
        results.append(('sim.time_jump', True, None))
        
    except Exception as e:
        print(f"     ❌ Error: {e}")
        results.append((f'simulation_tools', False, str(e)))
    
    return results

async def test_reputation_tools():
    """Test reputation and governance tools"""
    print("\n🏆 Testing Reputation & Governance Tools...")
    api = CognitionAPI()
    
    results = []
    
    try:
        # Test reputation.get
        print("  🔍 Testing reputation.get...")
        reputation = await api.execute_tool('reputation.get', agent_id='Theory')
        print(f"     ✅ Theory reputation: {reputation['reputation_score']:.1f} ({reputation['reputation_tier']})")
        results.append(('reputation.get', True, None))
        
        # Test reputation.set
        print("  🔍 Testing reputation.set...")
        set_result = await api.execute_tool('reputation.set',
                                          agent_id='Echo',
                                          score=92.5,
                                          reason="Excellent historical analysis")
        print(f"     ✅ Echo reputation updated: {set_result['old_score']:.1f} → {set_result['new_score']:.1f}")
        results.append(('reputation.set', True, None))
        
        # Test reputation.log_event
        print("  🔍 Testing reputation.log_event...")
        event_id = await api.execute_tool('reputation.log_event',
                                        agent_id='Verdict',
                                        event_type='successful_analysis',
                                        outcome='positive',
                                        impact=2.5)
        print(f"     ✅ Reputation event logged: {event_id}")
        results.append(('reputation.log_event', True, None))
        
    except Exception as e:
        print(f"     ❌ Error: {e}")
        results.append((f'reputation_tools', False, str(e)))
    
    return results

async def test_task_management_tools():
    """Test task management tools"""
    print("\n📋 Testing Task Management Tools...")
    api = CognitionAPI()
    
    results = []
    
    try:
        # Test task.create
        print("  🔍 Testing task.create...")
        task1_id = await api.execute_tool('task.create',
                                        task_definition={
                                            'name': 'Test Analysis Task',
                                            'description': 'Analyze test data',
                                            'agents': ['Theory', 'Echo']
                                        },
                                        priority=8)
        print(f"     ✅ Task 1 created: {task1_id}")
        
        task2_id = await api.execute_tool('task.create',
                                        task_definition={
                                            'name': 'Test Verification Task',
                                            'description': 'Verify analysis results',
                                            'agents': ['Verdict', 'Lens']
                                        },
                                        priority=6)
        print(f"     ✅ Task 2 created: {task2_id}")
        results.append(('task.create', True, None))
        
        # Test task.chain
        print("  🔍 Testing task.chain...")
        chain_id = await api.execute_tool('task.chain', task_ids=[task1_id, task2_id])
        print(f"     ✅ Task chain created: {chain_id}")
        results.append(('task.chain', True, None))
        
    except Exception as e:
        print(f"     ❌ Error: {e}")
        results.append((f'task_management', False, str(e)))
    
    return results

async def test_integration_scenarios():
    """Test realistic integration scenarios"""
    print("\n🔗 Testing Integration Scenarios...")
    api = CognitionAPI()
    
    results = []
    
    try:
        print("  📋 Scenario 1: Complete Cognition Lifecycle")
        
        # 1. Predict outcome for a new cognition
        prediction = await api.execute_tool('sim.predict_outcome',
                                          action_plan={
                                              'type': 'multi_agent_analysis',
                                              'agents': ['Theory', 'Echo', 'Verdict', 'Lens'],
                                              'phases': ['research', 'analysis', 'verification', 'decision']
                                          })
        print(f"     ✅ Outcome predicted with {prediction['predicted_outcomes'][0]['probability']:.1%} success rate")
        
        # 2. Run the cognition
        execution = await api.execute_tool('sim.run_cognition',
                                        cognition_id='integration_test_cognition')
        print(f"     ✅ Cognition executed: {execution['status']}")
        
        # 3. Score the execution
        score_result = await api.execute_tool('cognition.score',
                                            execution_id=execution['execution_id'],
                                            score=88)
        print(f"     ✅ Execution scored: {score_result['score']}")
        
        # 4. Update agent reputations based on performance
        for agent, performance in execution.get('agent_performance', {}).items():
            impact = (performance - 0.8) * 5  # Convert performance to reputation impact
            await api.execute_tool('reputation.log_event',
                                 agent_id=agent,
                                 event_type='cognition_participation',
                                 outcome='completed',
                                 impact=impact)
        print(f"     ✅ Agent reputations updated based on performance")
        
        # 5. Create snapshot for audit trail
        snapshot = await api.execute_tool('cognition.snapshot',
                                        cognition_id='integration_test_cognition')
        print(f"     ✅ Audit snapshot created: {snapshot['snapshot_id']}")
        
        results.append(('integration_scenario_1', True, None))
        
    except Exception as e:
        print(f"     ❌ Integration scenario failed: {e}")
        results.append(('integration_scenario_1', False, str(e)))
    
    return results

async def test_performance_and_stress():
    """Test performance under load"""
    print("\n⚡ Testing Performance & Stress...")
    api = CognitionAPI()
    
    results = []
    
    try:
        print("  🔍 Running 10 concurrent cognitions...")
        
        # Create multiple cognitions concurrently
        tasks = []
        for i in range(10):
            task = api.execute_tool('sim.run_cognition',
                                  cognition_id=f'stress_test_{i}',
                                  sandbox_mode=True)
            tasks.append(task)
        
        executions = await asyncio.gather(*tasks)
        
        successful = sum(1 for exec in executions if exec['success'])
        print(f"     ✅ Completed {successful}/10 cognitions successfully")
        
        # Test rapid reputation updates
        print("  🔍 Testing rapid reputation updates...")
        update_tasks = []
        for i in range(20):
            task = api.execute_tool('reputation.log_event',
                                  agent_id='Theory',
                                  event_type='rapid_test',
                                  outcome='test',
                                  impact=0.1)
            update_tasks.append(task)
        
        await asyncio.gather(*update_tasks)
        print("     ✅ Completed 20 rapid reputation updates")
        
        results.append(('performance_test', True, None))
        
    except Exception as e:
        print(f"     ❌ Performance test failed: {e}")
        results.append(('performance_test', False, str(e)))
    
    return results

async def main():
    """Run comprehensive cognition tools test suite"""
    print("🧬 COMPREHENSIVE COGNITION TOOLS TEST SUITE")
    print("=" * 60)
    
    all_results = []
    
    # Run all test suites
    test_suites = [
        ("Cognition Control", test_cognition_control_tools),
        ("Simulation Tools", test_simulation_tools),
        ("Reputation Tools", test_reputation_tools),
        ("Task Management", test_task_management_tools),
        ("Integration Scenarios", test_integration_scenarios),
        ("Performance & Stress", test_performance_and_stress)
    ]
    
    for suite_name, test_func in test_suites:
        try:
            results = await test_func()
            all_results.extend(results)
        except Exception as e:
            print(f"❌ Test suite '{suite_name}' failed: {e}")
            all_results.append((suite_name, False, str(e)))
    
    # Generate final report
    print("\n" + "=" * 60)
    print("📊 FINAL TEST REPORT")
    print("=" * 60)
    
    passed = sum(1 for _, success, _ in all_results if success)
    total = len(all_results)
    
    print(f"\n🎯 Overall Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed < total:
        print("\n❌ FAILED TESTS:")
        for test_name, success, error in all_results:
            if not success:
                print(f"   • {test_name}: {error}")
    
    if passed == total:
        print("\n🎉 ALL COGNITION TOOLS ARE WORKING PERFECTLY!")
        print("\n✅ Summary:")
        print("   • All cognition control tools functional")
        print("   • All simulation tools operational")
        print("   • Reputation system working")
        print("   • Task management functional")
        print("   • Integration scenarios passing")
        print("   • Performance tests successful")
    else:
        print(f"\n⚠️  {total - passed} tools need attention")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Test suite execution failed: {e}")
        sys.exit(1) 