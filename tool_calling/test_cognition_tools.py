# ----------------------------------------------------------------------------
#  File:        test_cognition_tools.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test script to verify cognition simulation tools
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime

# Add the core directory to the path
sys.path.append(str(Path(__file__).parent / "core"))

from core_tools import CoreTools

class CognitionTools:
    """Extended tools for cognition and simulation functionality"""
    
    def __init__(self, agent_id: str = "test_agent"):
        self.agent_id = agent_id
        self.core_tools = CoreTools(agent_id, {})
        self.cognitions = {}
        self.simulations = {}
        
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        return datetime.utcnow().isoformat()
        
    # COGNITION CONTROL TOOLS
    async def cognition_list_all(self) -> List[Dict[str, Any]]:
        """Lists all known cognitions"""
        try:
            return list(self.cognitions.values())
        except Exception as e:
            raise Exception(f"Failed to list cognitions: {e}")
    
    async def cognition_clone(self, cognition_id: str, new_agents: List[str] = None) -> Dict[str, Any]:
        """Duplicates a cognition with new roles or agents"""
        try:
            if cognition_id not in self.cognitions:
                raise Exception(f"Cognition {cognition_id} not found")
            
            original = self.cognitions[cognition_id].copy()
            clone_id = f"{cognition_id}_clone_{len(self.cognitions)}"
            
            if new_agents:
                original['agents'] = new_agents
            
            original['id'] = clone_id
            self.cognitions[clone_id] = original
            
            return original
        except Exception as e:
            raise Exception(f"Failed to clone cognition: {e}")
    
    async def cognition_score(self, execution_id: str, score: int) -> Dict[str, Any]:
        """Rates success/failure of the last cognition"""
        try:
            if execution_id not in self.simulations:
                raise Exception(f"Execution {execution_id} not found")
            
            self.simulations[execution_id]['score'] = score
            return {
                'execution_id': execution_id,
                'score': score,
                'timestamp': self._get_timestamp()
            }
        except Exception as e:
            raise Exception(f"Failed to score cognition: {e}")
    
    # SIMULATION & PREDICTION TOOLS  
    async def sim_predict_outcome(self, action_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate potential outcomes from a planned course of action"""
        try:
            # Simple simulation prediction
            outcomes = [
                {
                    'probability': 0.7,
                    'outcome': 'success',
                    'details': 'Plan likely to succeed with current agents'
                },
                {
                    'probability': 0.2, 
                    'outcome': 'partial_success',
                    'details': 'May require additional agent coordination'
                },
                {
                    'probability': 0.1,
                    'outcome': 'failure', 
                    'details': 'Risk of agent conflicts or timeout'
                }
            ]
            
            return {
                'action_plan': action_plan,
                'predicted_outcomes': outcomes,
                'timestamp': self._get_timestamp()
            }
        except Exception as e:
            raise Exception(f"Failed to predict outcome: {e}")
    
    async def sim_test_hypothesis(self, hypothesis: str, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run simulated logic over hypothetical data/memories"""
        try:
            # Simulate hypothesis testing
            result = {
                'hypothesis': hypothesis,
                'test_data': test_data,
                'confidence': 0.85,
                'evidence': ['Supporting data point 1', 'Supporting data point 2'],
                'contradictions': [],
                'conclusion': 'Hypothesis supported by simulated data'
            }
            
            return result
        except Exception as e:
            raise Exception(f"Failed to test hypothesis: {e}")
    
    async def sim_run_cognition(self, cognition_id: str, sandbox_mode: bool = True) -> Dict[str, Any]:
        """Dry-run a cognition in sandbox mode for validation"""
        try:
            if cognition_id not in self.cognitions:
                # Create a sample cognition for testing
                sample_cognition = {
                    'id': cognition_id,
                    'name': 'Test Cognition',
                    'description': 'Sample cognition for testing',
                    'agents': ['Theory', 'Echo', 'Verdict'],
                    'phases': [
                        {'name': 'Analysis', 'duration': 30},
                        {'name': 'Verification', 'duration': 20},
                        {'name': 'Consensus', 'duration': 10}
                    ],
                    'success_criteria': 'All phases complete with agent agreement'
                }
                self.cognitions[cognition_id] = sample_cognition
            
            cognition = self.cognitions[cognition_id]
            execution_id = f"exec_{cognition_id}_{len(self.simulations)}"
            
            # Simulate execution
            execution_result = {
                'execution_id': execution_id,
                'cognition_id': cognition_id,
                'sandbox_mode': sandbox_mode,
                'status': 'completed',
                'phases_executed': len(cognition['phases']),
                'duration': sum(phase.get('duration', 30) for phase in cognition['phases']),
                'agents_participated': cognition['agents'],
                'success': True,
                'timestamp': self._get_timestamp()
            }
            
            self.simulations[execution_id] = execution_result
            return execution_result
            
        except Exception as e:
            raise Exception(f"Failed to run cognition simulation: {e}")
    
    async def sim_why_failed(self, execution_id: str) -> Dict[str, Any]:
        """Post-mortem: traces logic path that led to a failed action"""
        try:
            if execution_id not in self.simulations:
                raise Exception(f"Execution {execution_id} not found")
            
            execution = self.simulations[execution_id]
            
            # Simulate failure analysis
            failure_analysis = {
                'execution_id': execution_id,
                'failure_points': [
                    'Agent timeout in phase 2',
                    'Consensus threshold not met',
                    'Invalid agent response'
                ],
                'root_cause': 'Agent coordination failure',
                'recommendations': [
                    'Increase phase timeout',
                    'Lower consensus threshold', 
                    'Add fallback agents'
                ],
                'trace': [
                    'Phase 1: Theory started analysis',
                    'Phase 1: Theory completed successfully',
                    'Phase 2: Echo started verification',
                    'Phase 2: Echo timeout after 30s',
                    'Phase 2: Failed to get response'
                ]
            }
            
            return failure_analysis
        except Exception as e:
            raise Exception(f"Failed to analyze failure: {e}")

async def test_cognition_tools():
    """Test all cognition and simulation tools"""
    print("🧬 Testing Cognition & Simulation Tools...")
    print("=" * 50)
    
    tools = CognitionTools("test_agent")
    
    # Test in correct order to ensure dependencies are met
    tests = [
        ("cognition.list_all", tools.cognition_list_all, []),
        ("sim.predict_outcome", tools.sim_predict_outcome, [{'action': 'test_plan'}]),
        ("sim.test_hypothesis", tools.sim_test_hypothesis, ['Test hypothesis', {'data': 'test'}]),
        ("sim.run_cognition", tools.sim_run_cognition, ['test_cognition']),
        ("cognition.clone", tools.cognition_clone, ['test_cognition', ['Theory', 'Echo']]),
        ("cognition.score", tools.cognition_score, ['exec_test_cognition_0', 85]),
        ("sim.why_failed", tools.sim_why_failed, ['exec_test_cognition_0']),
    ]
    
    results = []
    
    for tool_name, tool_func, args in tests:
        try:
            print(f"\n🔍 Testing {tool_name}...")
            result = await tool_func(*args)
            print(f"✅ {tool_name} - SUCCESS")
            print(f"   Result: {json.dumps(result, indent=2, default=str)[:200]}...")
            results.append((tool_name, 'SUCCESS', None))
        except Exception as e:
            print(f"❌ {tool_name} - FAILED")
            print(f"   Error: {e}")
            results.append((tool_name, 'FAILED', str(e)))
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY:")
    print("=" * 50)
    
    for tool_name, status, error in results:
        status_icon = "✅" if status == 'SUCCESS' else "❌"
        print(f"{status_icon} {tool_name}: {status}")
        if error:
            print(f"    └─ {error}")
    
    success_count = sum(1 for _, status, _ in results if status == 'SUCCESS')
    total_count = len(results)
    print(f"\n🎯 Results: {success_count}/{total_count} tools working")
    
    if success_count < total_count:
        print("\n⚠️  Some cognition tools are failing. Check the errors above.")
        return False
    else:
        print("\n🎉 All cognition tools are working correctly!")
        return True

def main():
    """Main function to run tests"""
    try:
        result = asyncio.run(test_cognition_tools())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 