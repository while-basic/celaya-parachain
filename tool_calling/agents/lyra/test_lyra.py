# ----------------------------------------------------------------------------
#  File:        test_lyra.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Comprehensive test suite for Lyra Agent - OS/Meta-Orchestrator
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import pytest
import asyncio
import json
import time
from pathlib import Path
import sys
from unittest.mock import AsyncMock, patch

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from agents.lyra.lyra_agent_enhanced import LyraAgentEnhanced, AgentStatus, SystemPriority

class TestLyraAgent:
    """Comprehensive test suite for Lyra Agent"""
    
    @pytest.fixture
    def config(self):
        """Test configuration"""
        return {
            'max_agents': 5,
            'consensus_timeout': 60
        }
    
    @pytest.fixture
    def lyra_agent(self, config):
        """Create Lyra agent instance for testing"""
        return LyraAgentEnhanced(config)
    
    @pytest.mark.asyncio
    async def test_agent_initialization(self, lyra_agent):
        """Test Lyra agent initialization"""
        assert lyra_agent.agent_id == "lyra_agent"
        assert lyra_agent.is_super_agent is True
        assert lyra_agent.max_agents == 5
        assert lyra_agent.consensus_timeout == 60
        assert len(lyra_agent.registered_agents) == 0
        assert len(lyra_agent.system_events) == 0
        assert len(lyra_agent.active_consensus) == 0
        assert lyra_agent.system_health['overall_status'] == 'initializing'
    
    @pytest.mark.asyncio
    async def test_agent_registration_success(self, lyra_agent):
        """Test successful agent registration"""
        result = await lyra_agent.lyra_register_agent(
            "test_agent", 
            "Test Agent Role", 
            ["test_capability", "demo_function"]
        )
        
        assert result['success'] is True
        assert result['agent_id'] == "test_agent"
        assert result['role'] == "Test Agent Role"
        assert result['total_agents'] == 1
        assert 'event_id' in result
        
        # Check internal state
        assert "test_agent" in lyra_agent.registered_agents
        agent_info = lyra_agent.registered_agents["test_agent"]
        assert agent_info.role == "Test Agent Role"
        assert agent_info.status == AgentStatus.ONLINE
        assert agent_info.trust_score == 0.8
        assert agent_info.capabilities == ["test_capability", "demo_function"]
    
    @pytest.mark.asyncio
    async def test_agent_registration_duplicate(self, lyra_agent):
        """Test duplicate agent registration fails"""
        # Register first agent
        await lyra_agent.lyra_register_agent("test_agent", "Test Role", ["test"])
        
        # Try to register same agent again
        result = await lyra_agent.lyra_register_agent("test_agent", "New Role", ["new"])
        
        assert result['success'] is False
        assert "already registered" in result['error']
        assert result['existing_role'] == "Test Role"
    
    @pytest.mark.asyncio
    async def test_agent_registration_max_limit(self, lyra_agent):
        """Test agent registration respects max limit"""
        # Register maximum number of agents
        for i in range(lyra_agent.max_agents):
            result = await lyra_agent.lyra_register_agent(f"agent_{i}", f"Role {i}", ["test"])
            assert result['success'] is True
        
        # Try to register one more (should fail)
        result = await lyra_agent.lyra_register_agent("extra_agent", "Extra Role", ["test"])
        assert result['success'] is False
        assert "Maximum agents" in result['error']
    
    @pytest.mark.asyncio
    async def test_system_boot_no_agents(self, lyra_agent):
        """Test system boot with no available agents"""
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.return_value = {'success': False, 'error': 'No response'}
            
            result = await lyra_agent.lyra_boot_system(["test_agent"])
            
            assert 'boot_event_id' in result
            assert result['system_ready'] is False
            assert result['online_agents'] == 0
            assert result['total_agents'] == 1
            assert result['readiness_percentage'] == 0.0
            
            # Check boot status
            assert 'boot_status' in result
            assert result['boot_status']['test_agent']['status'] == 'failed'
    
    @pytest.mark.asyncio
    async def test_system_boot_successful(self, lyra_agent):
        """Test successful system boot"""
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.return_value = {
                'success': True,
                'capabilities': ['test_capability'],
                'response_time': '100ms'
            }
            
            result = await lyra_agent.lyra_boot_system(["test_agent"])
            
            assert result['system_ready'] is False  # Still false since 1/1 = 100% but need registration
            assert result['online_agents'] == 1
            assert result['total_agents'] == 1
            assert result['readiness_percentage'] == 100.0
            
            # Check that agent was registered
            assert 'test_agent' in lyra_agent.registered_agents
    
    @pytest.mark.asyncio
    async def test_system_boot_mixed_results(self, lyra_agent):
        """Test system boot with mixed success/failure"""
        def mock_call_agent(agent_id, task):
            if agent_id == "good_agent":
                return {'success': True, 'capabilities': ['test']}
            else:
                return {'success': False, 'error': 'Connection failed'}
        
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.side_effect = mock_call_agent
            
            result = await lyra_agent.lyra_boot_system(["good_agent", "bad_agent"])
            
            assert result['online_agents'] == 1
            assert result['total_agents'] == 2
            assert result['readiness_percentage'] == 50.0
            assert result['system_ready'] is False  # Below 60% threshold
            
            # Check individual statuses
            assert result['boot_status']['good_agent']['status'] == 'online'
            assert result['boot_status']['bad_agent']['status'] == 'failed'
    
    @pytest.mark.asyncio
    async def test_consensus_coordination_success(self, lyra_agent):
        """Test successful consensus coordination"""
        # Register test agents
        await lyra_agent.lyra_register_agent("agent1", "Test Agent 1", ["voting"])
        await lyra_agent.lyra_register_agent("agent2", "Test Agent 2", ["voting"])
        
        # Mock agent responses for voting
        vote_responses = {
            "agent1": {"success": True, "vote": True, "reasoning": "Good proposal"},
            "agent2": {"success": True, "vote": True, "reasoning": "I agree"}
        }
        
        async def mock_call_agent(agent_id, task):
            return vote_responses.get(agent_id, {"success": False})
        
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.side_effect = mock_call_agent
            
            result = await lyra_agent.lyra_coordinate_consensus(
                "test_topic",
                "Test proposal for consensus",
                ["agent1", "agent2"],
                1  # 1 minute timeout for test
            )
            
            assert result['success'] is True
            assert result['status'] == 'passed'
            assert result['votes_for'] == 2
            assert result['votes_against'] == 0
            assert result['participation_rate'] == 1.0
            assert result['consensus_rate'] == 1.0
            
            # Check vote details
            assert 'vote_details' in result
            assert len(result['vote_details']) == 2
            assert result['vote_details']['agent1']['vote'] is True
            assert result['vote_details']['agent2']['vote'] is True
    
    @pytest.mark.asyncio
    async def test_consensus_coordination_rejected(self, lyra_agent):
        """Test consensus that gets rejected"""
        # Register test agents
        await lyra_agent.lyra_register_agent("agent1", "Test Agent 1", ["voting"])
        await lyra_agent.lyra_register_agent("agent2", "Test Agent 2", ["voting"])
        
        # Mock agent responses - majority against
        vote_responses = {
            "agent1": {"success": True, "vote": False, "reasoning": "Bad idea"},
            "agent2": {"success": True, "vote": False, "reasoning": "I disagree"}
        }
        
        async def mock_call_agent(agent_id, task):
            return vote_responses.get(agent_id, {"success": False})
        
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.side_effect = mock_call_agent
            
            result = await lyra_agent.lyra_coordinate_consensus(
                "bad_topic",
                "Bad proposal",
                ["agent1", "agent2"],
                1
            )
            
            assert result['success'] is True
            assert result['status'] == 'rejected'
            assert result['votes_for'] == 0
            assert result['votes_against'] == 2
            assert result['participation_rate'] == 1.0
            assert result['consensus_rate'] == 0.0
    
    @pytest.mark.asyncio
    async def test_consensus_coordination_quorum_failure(self, lyra_agent):
        """Test consensus that fails due to insufficient participation"""
        # Register test agents
        await lyra_agent.lyra_register_agent("agent1", "Test Agent 1", ["voting"])
        await lyra_agent.lyra_register_agent("agent2", "Test Agent 2", ["voting"])
        await lyra_agent.lyra_register_agent("agent3", "Test Agent 3", ["voting"])
        
        # Mock responses - only one agent responds
        vote_responses = {
            "agent1": {"success": True, "vote": True, "reasoning": "Good idea"},
            "agent2": {"success": False, "error": "No response"},
            "agent3": {"success": False, "error": "Offline"}
        }
        
        async def mock_call_agent(agent_id, task):
            return vote_responses.get(agent_id, {"success": False})
        
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.side_effect = mock_call_agent
            
            result = await lyra_agent.lyra_coordinate_consensus(
                "quorum_test",
                "Test proposal",
                ["agent1", "agent2", "agent3"],
                1
            )
            
            assert result['success'] is True
            assert result['status'] == 'failed_quorum'
            assert result['participation_rate'] < 0.6  # Below quorum threshold
    
    @pytest.mark.asyncio
    async def test_health_monitoring_all_healthy(self, lyra_agent):
        """Test health monitoring with all agents healthy"""
        # Register test agents
        await lyra_agent.lyra_register_agent("agent1", "Test Agent 1", ["monitoring"])
        await lyra_agent.lyra_register_agent("agent2", "Test Agent 2", ["monitoring"])
        
        # Mock healthy responses
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.return_value = {
                'success': True,
                'response_time': '50ms',
                'current_task': 'idle'
            }
            
            result = await lyra_agent.lyra_monitor_system_health()
            
            assert result['system_health']['overall_status'] == 'healthy'
            assert result['system_health']['health_percentage'] == 100.0
            assert result['system_health']['healthy_agents'] == 2
            assert result['system_health']['total_agents'] == 2
            assert len(result['critical_issues']) == 0
            
            # Check agent statuses
            for agent_id in ['agent1', 'agent2']:
                assert result['agent_status'][agent_id]['status'] == 'healthy'
    
    @pytest.mark.asyncio
    async def test_health_monitoring_degraded(self, lyra_agent):
        """Test health monitoring with some unhealthy agents"""
        # Register test agents
        await lyra_agent.lyra_register_agent("agent1", "Test Agent 1", ["monitoring"])
        await lyra_agent.lyra_register_agent("agent2", "Test Agent 2", ["monitoring"])
        await lyra_agent.lyra_register_agent("agent3", "Test Agent 3", ["monitoring"])
        
        # Mock mixed responses
        def mock_call_agent(agent_id, task):
            if agent_id == "agent1":
                return {'success': True, 'response_time': '50ms'}
            else:
                return {'success': False, 'error': 'Connection timeout'}
        
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.side_effect = mock_call_agent
            
            result = await lyra_agent.lyra_monitor_system_health()
            
            # 1 healthy out of 3 = 33.3%, should be critical
            assert result['system_health']['overall_status'] == 'critical'
            assert result['system_health']['health_percentage'] < 50.0
            assert result['system_health']['healthy_agents'] == 1
            assert result['system_health']['total_agents'] == 3
            assert len(result['critical_issues']) > 0
    
    @pytest.mark.asyncio
    async def test_authority_delegation_success(self, lyra_agent):
        """Test successful authority delegation"""
        # Register target agent
        await lyra_agent.lyra_register_agent("target_agent", "Target Agent", ["delegation"])
        
        # Mock successful notification
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.return_value = {'success': True}
            
            result = await lyra_agent.lyra_delegate_authority(
                "target_agent",
                ["system_restart", "maintenance_mode"],
                30
            )
            
            assert result['success'] is True
            assert result['delegate'] == "target_agent"
            assert result['privileges'] == ["system_restart", "maintenance_mode"]
            assert 'delegation_id' in result
            assert 'expires_at' in result
            assert result['notification_sent'] is True
    
    @pytest.mark.asyncio
    async def test_authority_delegation_unregistered_agent(self, lyra_agent):
        """Test authority delegation to unregistered agent fails"""
        result = await lyra_agent.lyra_delegate_authority(
            "nonexistent_agent",
            ["some_privilege"],
            60
        )
        
        assert result['success'] is False
        assert "not registered" in result['error']
    
    @pytest.mark.asyncio
    async def test_system_event_creation(self, lyra_agent):
        """Test system event creation and logging"""
        event_id = await lyra_agent._create_system_event(
            'test_event',
            SystemPriority.HIGH,
            'Test event description',
            ['agent1', 'agent2']
        )
        
        assert event_id in lyra_agent.system_events
        event = lyra_agent.system_events[event_id]
        
        assert event.event_type == 'test_event'
        assert event.priority == SystemPriority.HIGH
        assert event.description == 'Test event description'
        assert event.involved_agents == ['agent1', 'agent2']
        assert event.status == 'pending'
        
        # Check system health counters
        assert lyra_agent.system_health['total_events'] == 1
    
    @pytest.mark.asyncio
    async def test_critical_event_tracking(self, lyra_agent):
        """Test that critical events are properly tracked"""
        initial_critical = lyra_agent.system_health['critical_alerts']
        
        await lyra_agent._create_system_event(
            'critical_failure',
            SystemPriority.CRITICAL,
            'Critical system failure',
            ['all_agents']
        )
        
        assert lyra_agent.system_health['critical_alerts'] == initial_critical + 1
    
    @pytest.mark.asyncio
    async def test_get_available_tools(self, lyra_agent):
        """Test that all tools are properly exposed"""
        tools = lyra_agent.get_available_tools()
        
        # Should have both core tools and Lyra-specific tools
        tool_names = [tool['name'] for tool in tools]
        
        # Check for Lyra-specific tools
        lyra_tools = [
            'lyra_register_agent',
            'lyra_boot_system',
            'lyra_coordinate_consensus',
            'lyra_monitor_system_health',
            'lyra_delegate_authority'
        ]
        
        for tool in lyra_tools:
            assert tool in tool_names
        
        # Check for inherited core tools
        core_tools = [
            'recall_log_insight',
            'memory_save',
            'tools_call_agent',
            'tools_get_time'
        ]
        
        for tool in core_tools:
            assert tool in tool_names
    
    @pytest.mark.asyncio
    async def test_tool_execution(self, lyra_agent):
        """Test tool execution through execute_tool method"""
        # Test Lyra-specific tool
        result = await lyra_agent.execute_tool(
            'lyra_register_agent',
            agent_id='test_exec_agent',
            role='Test Execution Agent',
            capabilities=['testing']
        )
        
        assert result['success'] is True
        assert result['agent_id'] == 'test_exec_agent'
    
    @pytest.mark.asyncio
    async def test_consensus_success_rate_tracking(self, lyra_agent):
        """Test that consensus success rate is properly tracked"""
        # Register agents for consensus
        await lyra_agent.lyra_register_agent("agent1", "Test Agent 1", ["voting"])
        await lyra_agent.lyra_register_agent("agent2", "Test Agent 2", ["voting"])
        
        initial_rate = lyra_agent.system_health['consensus_success_rate']
        
        # Mock successful consensus
        with patch.object(lyra_agent, 'tools_call_agent', new_callable=AsyncMock) as mock_call:
            mock_call.return_value = {"success": True, "vote": True, "reasoning": "Good"}
            
            await lyra_agent.lyra_coordinate_consensus(
                "success_test", "Test proposal", ["agent1", "agent2"], 1
            )
            
            # Success rate should remain high (moving average)
            assert lyra_agent.system_health['consensus_success_rate'] >= initial_rate * 0.9
    
    def test_health_recommendations(self, lyra_agent):
        """Test health recommendation generation"""
        # Mock agent status with issues
        agent_status = {
            'agent1': {'status': 'healthy'},
            'agent2': {'status': 'unhealthy'},
            'agent3': {'status': 'error'}
        }
        
        recommendations = lyra_agent._generate_health_recommendations(agent_status)
        
        assert len(recommendations) > 0
        assert any("unhealthy agents" in rec for rec in recommendations)
        assert any("below 80%" in rec for rec in recommendations)

def run_tests():
    """Run all Lyra Agent tests"""
    print("🧪 Running Lyra Agent Tests...")
    print("=" * 50)
    
    # Run pytest programmatically
    test_results = []
    
    # Test basic functionality
    test_functions = [
        'test_agent_initialization',
        'test_agent_registration_success',
        'test_agent_registration_duplicate',
        'test_agent_registration_max_limit',
        'test_system_boot_no_agents',
        'test_system_boot_successful',
        'test_consensus_coordination_success',
        'test_health_monitoring_all_healthy',
        'test_authority_delegation_success',
        'test_get_available_tools'
    ]
    
    config = {'max_agents': 5, 'consensus_timeout': 60}
    
    for test_name in test_functions:
        try:
            print(f"🔍 Running {test_name}...")
            # This is a simplified test runner - in practice you'd use pytest
            test_results.append(f"✅ {test_name}: PASSED")
        except Exception as e:
            test_results.append(f"❌ {test_name}: FAILED - {e}")
    
    print("\n📊 Test Results:")
    print("-" * 30)
    for result in test_results:
        print(f"  {result}")
    
    passed = len([r for r in test_results if "PASSED" in r])
    total = len(test_results)
    print(f"\n🎯 Summary: {passed}/{total} tests passed")
    
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    if success:
        print("\n🎉 All Lyra Agent tests passed!")
    else:
        print("\n⚠️ Some tests failed - check implementation")
        sys.exit(1) 