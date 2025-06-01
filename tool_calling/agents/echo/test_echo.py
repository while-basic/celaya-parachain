# ----------------------------------------------------------------------------
#  File:        test_echo.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test suite for the Echo Insight Relay & Auditing Agent
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import pytest
from pathlib import Path
from datetime import datetime, timedelta
from echo_agent_enhanced import (
    EchoAgentEnhanced, AuditStatus, RelayMethod, InsightPriority,
    InsightAudit, RelayRecord, ComplianceCheck
)

class TestEchoAgent:
    """Test suite for Echo agent functionality"""
    
    @pytest.fixture
    async def echo_agent(self):
        """Create an Echo agent for testing"""
        config = {
            'audit_threshold': 0.7,
            'relay_timeout': 30,
            'compliance_rules': [
                'source_verification',
                'content_integrity',
                'authorization_check'
            ]
        }
        
        async with EchoAgentEnhanced(config) as agent:
            yield agent

    @pytest.fixture
    def sample_insight_data(self):
        """Sample insight data for testing"""
        return {
            'topic': 'blockchain_performance',
            'summary': 'System running at optimal performance with 99.9% uptime',
            'timestamp': datetime.utcnow().isoformat(),
            'sources': ['system_monitor', 'performance_metrics'],
            'agent_id': 'beacon_agent',
            'confidence': 0.95,
            'metadata': {
                'processing_time': 0.5,
                'data_points': 1000
            }
        }

    @pytest.fixture
    def sample_biased_insight(self):
        """Sample biased insight for testing bias detection"""
        return {
            'topic': 'market_analysis',
            'summary': 'The market will definitely crash tomorrow and everyone should panic sell immediately',
            'timestamp': datetime.utcnow().isoformat(),
            'sources': ['random_blog', 'social_media'],
            'agent_id': 'theory_agent',
            'confidence': 0.3
        }

    # =============================================================================
    # BASIC FUNCTIONALITY TESTS
    # =============================================================================

    async def test_agent_initialization(self, echo_agent):
        """Test Echo agent initialization"""
        assert echo_agent.agent_id == "echo_agent"
        assert echo_agent.audit_threshold == 0.7
        assert echo_agent.relay_timeout == 30
        assert len(echo_agent.compliance_rules) >= 3
        assert echo_agent.audit_metrics['total_audits'] == 0

    async def test_tool_discovery(self, echo_agent):
        """Test tool discovery and listing"""
        tools = echo_agent.get_available_tools()
        
        # Check for Echo-specific tools
        echo_tools = [t for t in tools if t['name'].startswith('echo_')]
        assert len(echo_tools) == 5
        
        expected_tools = [
            'echo_audit_insight',
            'echo_relay_insight', 
            'echo_compliance_check',
            'echo_monitor_agents',
            'echo_generate_audit_report'
        ]
        
        tool_names = [t['name'] for t in echo_tools]
        for expected in expected_tools:
            assert expected in tool_names

    # =============================================================================
    # INSIGHT AUDITING TESTS
    # =============================================================================

    async def test_audit_insight_basic(self, echo_agent, sample_insight_data):
        """Test basic insight auditing"""
        result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        
        assert 'audit_id' in result
        assert 'insight_hash' in result
        assert 'audit_status' in result
        assert 'confidence_score' in result
        assert 'risk_assessment' in result
        
        # Check audit status is valid
        assert result['audit_status'] in ['verified', 'pending', 'flagged', 'rejected']
        
        # Check confidence score is reasonable
        assert 0 <= result['confidence_score'] <= 1

    async def test_audit_high_quality_insight(self, echo_agent, sample_insight_data):
        """Test auditing of high-quality insight"""
        result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        
        # High-quality insight should be verified
        assert result['confidence_score'] >= 0.7
        assert result['audit_status'] in ['verified', 'pending']
        assert result['risk_assessment'] in ['low', 'medium']

    async def test_audit_biased_insight(self, echo_agent, sample_biased_insight):
        """Test auditing of biased/low-quality insight"""
        result = await echo_agent.echo_audit_insight(sample_biased_insight, 'theory_agent')
        
        # Biased insight should be flagged or rejected
        assert result['confidence_score'] < 0.7
        assert result['audit_status'] in ['flagged', 'rejected']
        assert result['risk_assessment'] in ['medium', 'high']

    async def test_audit_metrics_tracking(self, echo_agent, sample_insight_data):
        """Test audit metrics are properly tracked"""
        initial_audits = echo_agent.audit_metrics['total_audits']
        
        await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        
        assert echo_agent.audit_metrics['total_audits'] == initial_audits + 1
        assert echo_agent.audit_metrics['average_audit_time'] > 0

    async def test_audit_verification_checks(self, echo_agent, sample_insight_data):
        """Test verification checks are performed"""
        result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        
        assert 'verification_checks' in result
        checks = result['verification_checks']
        
        # Should have performed multiple verification checks
        assert isinstance(checks, dict)
        assert len(checks) > 0

    # =============================================================================
    # COMPLIANCE CHECKING TESTS
    # =============================================================================

    async def test_compliance_check_basic(self, echo_agent, sample_insight_data):
        """Test basic compliance checking"""
        result = await echo_agent.echo_compliance_check(sample_insight_data)
        
        assert 'check_id' in result
        assert 'is_compliant' in result
        assert 'compliance_score' in result
        assert 'passed_checks' in result
        assert 'failed_checks' in result
        
        # Check compliance score is valid
        assert 0 <= result['compliance_score'] <= 1

    async def test_compliance_with_custom_rules(self, echo_agent, sample_insight_data):
        """Test compliance checking with custom rules"""
        custom_rules = ['source_verification', 'content_integrity']
        result = await echo_agent.echo_compliance_check(sample_insight_data, custom_rules)
        
        assert result['is_compliant'] is not None
        
        # Should check only the specified rules
        total_checks = len(result['passed_checks']) + len(result['failed_checks'])
        assert total_checks <= len(custom_rules)

    async def test_compliance_recommendations(self, echo_agent, sample_biased_insight):
        """Test compliance recommendations generation"""
        result = await echo_agent.echo_compliance_check(sample_biased_insight)
        
        if not result['is_compliant']:
            assert 'recommendations' in result
            assert isinstance(result['recommendations'], list)

    # =============================================================================
    # INSIGHT RELAY TESTS
    # =============================================================================

    async def test_relay_insight_basic(self, echo_agent, sample_insight_data):
        """Test basic insight relay"""
        # First audit the insight
        audit_result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        insight_hash = audit_result['insight_hash']
        
        # Then relay it
        relay_result = await echo_agent.echo_relay_insight(
            insight_hash, ['theory_agent', 'core_agent']
        )
        
        assert 'relay_id' in relay_result
        assert 'success' in relay_result
        assert 'delivery_status' in relay_result
        assert 'success_rate' in relay_result

    async def test_relay_different_methods(self, echo_agent, sample_insight_data):
        """Test different relay methods"""
        audit_result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        insight_hash = audit_result['insight_hash']
        
        methods = ['broadcast', 'targeted', 'secure', 'emergency']
        
        for method in methods:
            relay_result = await echo_agent.echo_relay_insight(
                insight_hash, ['theory_agent'], method
            )
            assert relay_result['success'] is not None

    async def test_relay_different_priorities(self, echo_agent, sample_insight_data):
        """Test different relay priorities"""
        audit_result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        insight_hash = audit_result['insight_hash']
        
        priorities = ['low', 'medium', 'high', 'critical']
        
        for priority in priorities:
            relay_result = await echo_agent.echo_relay_insight(
                insight_hash, ['theory_agent'], 'broadcast', priority
            )
            assert relay_result['success'] is not None

    async def test_relay_delivery_tracking(self, echo_agent, sample_insight_data):
        """Test relay delivery status tracking"""
        audit_result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        insight_hash = audit_result['insight_hash']
        
        target_agents = ['theory_agent', 'core_agent', 'beacon_agent']
        relay_result = await echo_agent.echo_relay_insight(insight_hash, target_agents)
        
        delivery_status = relay_result['delivery_status']
        assert len(delivery_status) == len(target_agents)
        
        for agent in target_agents:
            assert agent in delivery_status

    # =============================================================================
    # AGENT MONITORING TESTS
    # =============================================================================

    async def test_monitor_agents_basic(self, echo_agent):
        """Test basic agent monitoring"""
        agent_ids = ['beacon_agent', 'theory_agent']
        result = await echo_agent.echo_monitor_agents(agent_ids)
        
        assert 'success' in result
        assert 'total_monitored' in result
        assert 'monitored_agents' in result
        assert 'status' in result

    async def test_monitor_agents_tracking(self, echo_agent):
        """Test agent monitoring tracking"""
        agent_ids = ['beacon_agent', 'theory_agent', 'core_agent']
        result = await echo_agent.echo_monitor_agents(agent_ids)
        
        if result['success']:
            assert result['total_monitored'] == len(agent_ids)
            assert len(result['monitored_agents']) == len(agent_ids)

    async def test_monitor_agents_limits(self, echo_agent):
        """Test agent monitoring limits"""
        # Try to monitor more agents than the limit
        many_agents = [f'agent_{i}' for i in range(15)]
        result = await echo_agent.echo_monitor_agents(many_agents)
        
        # Should respect the monitoring limit
        max_monitored = echo_agent.config.get('monitoring_settings', {}).get('max_monitored_agents', 10)
        if result['success']:
            assert result['total_monitored'] <= max_monitored

    # =============================================================================
    # AUDIT REPORTING TESTS
    # =============================================================================

    async def test_generate_audit_report_basic(self, echo_agent):
        """Test basic audit report generation"""
        result = await echo_agent.echo_generate_audit_report(1)  # 1 hour
        
        assert 'success' in result
        assert 'report' in result
        
        if result['success']:
            report = result['report']
            assert 'audit_summary' in report
            assert 'time_period' in report
            assert 'generated_at' in report

    async def test_audit_report_with_data(self, echo_agent, sample_insight_data):
        """Test audit report generation with actual data"""
        # Generate some audit data
        await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        await echo_agent.echo_compliance_check(sample_insight_data)
        
        result = await echo_agent.echo_generate_audit_report(24)
        
        if result['success']:
            report = result['report']
            audit_summary = report['audit_summary']
            
            assert audit_summary['total_audits'] >= 1
            assert 'verification_rate' in audit_summary

    async def test_audit_report_recommendations(self, echo_agent, sample_biased_insight):
        """Test audit report recommendations"""
        # Generate some problematic audit data
        await echo_agent.echo_audit_insight(sample_biased_insight, 'theory_agent')
        
        result = await echo_agent.echo_generate_audit_report(1)
        
        if result['success']:
            report = result['report']
            if 'recommendations' in report:
                assert isinstance(report['recommendations'], list)

    # =============================================================================
    # INTEGRATION TESTS
    # =============================================================================

    async def test_full_audit_relay_workflow(self, echo_agent, sample_insight_data):
        """Test complete audit -> compliance -> relay workflow"""
        # Step 1: Audit insight
        audit_result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        assert audit_result['audit_status'] in ['verified', 'pending']
        
        # Step 2: Compliance check
        compliance_result = await echo_agent.echo_compliance_check(sample_insight_data)
        assert 'is_compliant' in compliance_result
        
        # Step 3: Relay if verified and compliant
        if (audit_result['audit_status'] == 'verified' and 
            compliance_result.get('is_compliant', False)):
            
            relay_result = await echo_agent.echo_relay_insight(
                audit_result['insight_hash'], ['theory_agent']
            )
            assert relay_result['success'] is not None

    async def test_multi_agent_audit_workflow(self, echo_agent, sample_insight_data):
        """Test auditing insights from multiple agents"""
        agents = ['beacon_agent', 'theory_agent', 'core_agent']
        
        for agent in agents:
            audit_result = await echo_agent.echo_audit_insight(sample_insight_data, agent)
            assert 'audit_id' in audit_result
            assert audit_result['source_agent'] == agent

    async def test_concurrent_operations(self, echo_agent, sample_insight_data):
        """Test concurrent audit and compliance operations"""
        # Run multiple operations concurrently
        tasks = [
            echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent'),
            echo_agent.echo_compliance_check(sample_insight_data),
            echo_agent.echo_monitor_agents(['theory_agent'])
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All operations should complete without exceptions
        for result in results:
            assert not isinstance(result, Exception)

    # =============================================================================
    # ERROR HANDLING TESTS
    # =============================================================================

    async def test_audit_invalid_insight(self, echo_agent):
        """Test auditing invalid insight data"""
        invalid_insight = {'invalid': 'data'}
        
        result = await echo_agent.echo_audit_insight(invalid_insight, 'test_agent')
        
        # Should handle gracefully
        assert 'audit_id' in result
        assert result['confidence_score'] <= 0.5  # Low confidence for invalid data

    async def test_relay_nonexistent_hash(self, echo_agent):
        """Test relaying non-existent insight hash"""
        fake_hash = 'nonexistent_hash_12345'
        
        result = await echo_agent.echo_relay_insight(fake_hash, ['theory_agent'])
        
        # Should handle gracefully
        assert 'success' in result
        assert result['success'] is False

    async def test_compliance_empty_rules(self, echo_agent, sample_insight_data):
        """Test compliance check with empty rules"""
        result = await echo_agent.echo_compliance_check(sample_insight_data, [])
        
        # Should handle gracefully
        assert 'is_compliant' in result
        assert result['compliance_score'] >= 0

    # =============================================================================
    # PERFORMANCE TESTS
    # =============================================================================

    async def test_audit_performance(self, echo_agent, sample_insight_data):
        """Test audit performance with multiple insights"""
        import time
        
        start_time = time.time()
        
        # Audit multiple insights
        tasks = [
            echo_agent.echo_audit_insight(sample_insight_data, f'agent_{i}')
            for i in range(5)
        ]
        
        results = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Should complete reasonably quickly
        assert total_time < 10  # Less than 10 seconds for 5 audits
        assert len(results) == 5
        
        # All audits should succeed
        for result in results:
            assert 'audit_id' in result

    async def test_relay_performance(self, echo_agent, sample_insight_data):
        """Test relay performance with multiple targets"""
        # First audit an insight
        audit_result = await echo_agent.echo_audit_insight(sample_insight_data, 'beacon_agent')
        insight_hash = audit_result['insight_hash']
        
        # Relay to multiple agents
        many_targets = [f'agent_{i}' for i in range(10)]
        
        import time
        start_time = time.time()
        
        relay_result = await echo_agent.echo_relay_insight(insight_hash, many_targets)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Should complete reasonably quickly
        assert total_time < 15  # Less than 15 seconds for 10 relays
        assert 'delivery_status' in relay_result

# =============================================================================
# INTEGRATION TESTS
# =============================================================================

async def test_echo_tool_execution():
    """Test Echo agent tool execution"""
    config = {
        'audit_threshold': 0.7,
        'relay_timeout': 30,
        'compliance_rules': ['source_verification']
    }
    
    async with EchoAgentEnhanced(config) as echo:
        # Test tool execution
        sample_insight = {
            'topic': 'test_topic',
            'summary': 'Test summary',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        result = await echo.execute_tool(
            'echo_audit_insight',
            insight_data=sample_insight,
            source_agent='test_agent'
        )
        
        assert 'audit_id' in result
        print(f"✅ Echo tool execution successful: {result['audit_id']}")

async def test_echo_comprehensive_workflow():
    """Test comprehensive Echo agent workflow"""
    config = {
        'audit_threshold': 0.7,
        'relay_timeout': 30,
        'compliance_rules': [
            'source_verification',
            'content_integrity',
            'authorization_check'
        ]
    }
    
    async with EchoAgentEnhanced(config) as echo:
        print("🔍 Testing comprehensive Echo workflow...")
        
        # Sample insight
        insight_data = {
            'topic': 'blockchain_security',
            'summary': 'Security audit completed with no critical vulnerabilities found',
            'timestamp': datetime.utcnow().isoformat(),
            'sources': ['security_scanner', 'manual_review'],
            'confidence': 0.92
        }
        
        # Step 1: Audit insight
        print("1. 🔍 Auditing insight...")
        audit_result = await echo.echo_audit_insight(insight_data, 'security_agent')
        print(f"   Status: {audit_result['audit_status']}")
        print(f"   Confidence: {audit_result['confidence_score']:.2f}")
        
        # Step 2: Compliance check
        print("2. ✅ Checking compliance...")
        compliance_result = await echo.echo_compliance_check(insight_data)
        print(f"   Compliant: {compliance_result['is_compliant']}")
        print(f"   Score: {compliance_result['compliance_score']:.2%}")
        
        # Step 3: Relay if approved
        if (audit_result['audit_status'] == 'verified' and 
            compliance_result['is_compliant']):
            print("3. 📡 Relaying insight...")
            relay_result = await echo.echo_relay_insight(
                audit_result['insight_hash'],
                ['core_agent', 'beacon_agent'],
                'secure',
                'high'
            )
            print(f"   Success Rate: {relay_result.get('success_rate', 0):.1%}")
        
        # Step 4: Generate report
        print("4. 📊 Generating report...")
        report_result = await echo.echo_generate_audit_report(1)
        if report_result['success']:
            report = report_result['report']
            print(f"   Total Audits: {report['audit_summary']['total_audits']}")
        
        print(f"✅ Echo comprehensive workflow completed")
        print(f"   Tools Available: {len(echo.get_available_tools())}")

# =============================================================================
# MAIN TEST RUNNER
# =============================================================================

async def main():
    """Run all Echo agent tests"""
    print("🔍 Echo Agent Test Suite")
    print("=" * 50)
    
    # Run integration tests
    await test_echo_tool_execution()
    await test_echo_comprehensive_workflow()
    
    print(f"\n🎯 Echo Agent testing completed successfully!")

if __name__ == "__main__":
    asyncio.run(main()) 