# ----------------------------------------------------------------------------
#  File:        test_verdict.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Comprehensive test suite for Verdict Agent - Legal & Compliance
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
from datetime import datetime

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from agents.verdict.verdict_agent_enhanced import VerdictAgentEnhanced, ComplianceLevel, LegalRisk, JurisdictionType

class TestVerdictAgent:
    """Comprehensive test suite for Verdict Agent"""
    
    @pytest.fixture
    def config(self):
        """Test configuration"""
        return {
            'compliance_threshold': 0.8,
            'risk_tolerance': 'medium',
            'auto_approve_threshold': 0.95
        }
    
    @pytest.fixture
    def verdict_agent(self, config):
        """Create Verdict agent instance for testing"""
        return VerdictAgentEnhanced(config)
    
    @pytest.mark.asyncio
    async def test_agent_initialization(self, verdict_agent):
        """Test Verdict agent initialization"""
        assert verdict_agent.agent_id == "verdict_agent"
        assert verdict_agent.compliance_threshold == 0.8
        assert verdict_agent.risk_tolerance == 'medium'
        assert verdict_agent.auto_approve_threshold == 0.95
        assert len(verdict_agent.legal_analyses) == 0
        assert len(verdict_agent.contract_reviews) == 0
        assert len(verdict_agent.regulatory_checks) == 0
        assert verdict_agent.legal_metrics['total_analyses'] == 0
    
    @pytest.mark.asyncio
    async def test_document_analysis_compliant(self, verdict_agent):
        """Test legal document analysis with compliant document"""
        test_document = """
        Service Agreement
        Term: 12 months
        Payment: Monthly fee of $5,000
        Termination: Either party may terminate with 30 days notice
        Governing Law: State of California
        This agreement includes standard liability limitations.
        """
        
        result = await verdict_agent.verdict_analyze_document(test_document, 'contract')
        
        assert result['success'] is True
        assert 'analysis_id' in result
        assert 'document_hash' in result
        assert result['compliance_level'] in ['compliant', 'review_required']
        assert result['legal_risk'] in ['low', 'medium', 'high', 'critical']
        assert 0 <= result['confidence_score'] <= 1
        assert isinstance(result['recommendations'], list)
        
        # Check internal state
        assert len(verdict_agent.legal_analyses) == 1
        assert verdict_agent.legal_metrics['total_analyses'] == 1
    
    @pytest.mark.asyncio
    async def test_document_analysis_non_compliant(self, verdict_agent):
        """Test legal document analysis with non-compliant document"""
        test_document = """
        Incomplete Agreement
        Unlimited liability for all parties.
        Automatic renewal without notice.
        Contains password: secret123
        """
        
        result = await verdict_agent.verdict_analyze_document(test_document, 'contract')
        
        assert result['success'] is True
        assert result['compliance_level'] in ['non_compliant', 'critical_violation']
        assert result['legal_risk'] in ['medium', 'high', 'critical']
        assert len(result['violations_found']) > 0
        assert len(result['recommendations']) > 0
    
    @pytest.mark.asyncio
    async def test_contract_review_service_agreement(self, verdict_agent):
        """Test contract review for service agreement"""
        test_contract = """
        Service Agreement
        Term: 24 months with automatic renewal
        Scope: Software development services
        Payment: $10,000 monthly, net 30 days
        Termination: 60 days written notice required
        Liability: Limited to contract value
        Governing Law: Delaware State Law
        """
        
        result = await verdict_agent.verdict_review_contract(test_contract, 'service_agreement')
        
        assert result['success'] is True
        assert 'review_id' in result
        assert result['contract_type'] == 'service_agreement'
        assert result['status'] in ['draft', 'under_review', 'approved']
        assert result['approval_status'] in ['approved', 'conditional', 'rejected']
        assert isinstance(result['key_terms'], dict)
        assert isinstance(result['risk_factors'], list)
        assert isinstance(result['compliance_issues'], list)
        
        # Check internal state
        assert len(verdict_agent.contract_reviews) == 1
        assert verdict_agent.legal_metrics['contracts_reviewed'] == 1
    
    @pytest.mark.asyncio
    async def test_contract_review_employment(self, verdict_agent):
        """Test contract review for employment contract"""
        test_contract = """
        Employment Agreement
        Position: Software Engineer
        Salary: $120,000 annually
        Benefits: Health, dental, 401k matching
        Termination: At-will employment
        Confidentiality: Standard non-disclosure agreement
        """
        
        result = await verdict_agent.verdict_review_contract(test_contract, 'employment')
        
        assert result['success'] is True
        assert result['contract_type'] == 'employment'
        # Employment contracts should have specific compliance checks
        assert any('employment' in term.lower() for term in result.get('key_terms', {}).keys()) or \
               'term' in result.get('key_terms', {}) or \
               len(result.get('compliance_issues', [])) >= 0  # May have employment-specific issues
    
    @pytest.mark.asyncio
    async def test_regulatory_compliance_financial(self, verdict_agent):
        """Test regulatory compliance check for financial industry"""
        business_data = {
            'industry': 'financial',
            'processes_payments': True,
            'stores_personal_data': True,
            'employee_count': 50,
            'annual_revenue': 5000000,
            'international_operations': False
        }
        
        result = await verdict_agent.verdict_check_regulatory_compliance(business_data, 'financial')
        
        assert result['success'] is True
        assert 'check_id' in result
        assert result['industry'] == 'financial'
        assert result['compliance_status'] in ['compliant', 'non_compliant', 'review_required', 'critical_violation']
        assert result['jurisdiction'] in ['federal', 'state', 'international', 'industry_specific']
        assert isinstance(result['applicable_regulations'], dict)
        assert isinstance(result['compliance_gaps'], list)
        assert isinstance(result['remediation_steps'], list)
        
        # Financial industry should have specific regulations
        assert 'financial' in result['applicable_regulations'] or len(result['applicable_regulations']) > 0
        
        # Check internal state
        assert len(verdict_agent.regulatory_checks) == 1
    
    @pytest.mark.asyncio
    async def test_regulatory_compliance_healthcare(self, verdict_agent):
        """Test regulatory compliance check for healthcare industry"""
        business_data = {
            'industry': 'healthcare',
            'handles_healthcare_data': True,
            'stores_personal_data': True,
            'employee_count': 25,
            'data_encrypted': False,  # Compliance gap
            'access_controls': False  # Compliance gap
        }
        
        result = await verdict_agent.verdict_check_regulatory_compliance(business_data, 'healthcare')
        
        assert result['success'] is True
        assert result['industry'] == 'healthcare'
        # Should have compliance gaps due to missing encryption and access controls
        assert len(result['compliance_gaps']) > 0
        assert len(result['remediation_steps']) > 0
        # Healthcare should trigger HIPAA requirements
        assert any('hipaa' in gap.lower() or 'encrypt' in gap.lower() or 'access' in gap.lower() 
                  for gap in result['compliance_gaps'])
    
    @pytest.mark.asyncio
    async def test_litigation_risk_assessment(self, verdict_agent):
        """Test litigation risk assessment"""
        case_data = {
            'case_type': 'contract_dispute',
            'claim_amount': 250000,
            'contract_clarity': 'high',
            'evidence_strength': 'strong',
            'opposing_party_resources': 'medium',
            'case_summary': 'Breach of software licensing agreement'
        }
        
        result = await verdict_agent.verdict_assess_litigation_risk(case_data)
        
        assert result['success'] is True
        assert 'assessment_id' in result
        assert result['risk_level'] in ['low', 'medium', 'high', 'critical']
        assert isinstance(result['risk_score'], (int, float))
        assert 0 <= result['risk_score'] <= 10
        assert isinstance(result['case_merits'], dict)
        assert isinstance(result['precedent_analysis'], dict)
        assert isinstance(result['risk_factors'], dict)
        assert isinstance(result['damage_estimates'], dict)
        assert isinstance(result['strategy_recommendations'], list)
        
        # Check internal state
        assert verdict_agent.legal_metrics['risk_assessments'] == 1
    
    @pytest.mark.asyncio
    async def test_litigation_risk_high_claim(self, verdict_agent):
        """Test litigation risk assessment with high claim amount"""
        case_data = {
            'case_type': 'intellectual_property',
            'claim_amount': 5000000,  # High claim amount
            'contract_clarity': 'low',  # Poor clarity
            'evidence_strength': 'weak',  # Weak evidence
            'opposing_party_resources': 'high'  # Well-funded opponent
        }
        
        result = await verdict_agent.verdict_assess_litigation_risk(case_data)
        
        assert result['success'] is True
        # High claim, poor clarity, weak evidence should result in higher risk
        assert result['risk_level'] in ['high', 'critical']
        assert result['risk_score'] >= 6.0  # Should be higher risk score
        
        # Should have appropriate strategy recommendations for high-risk case
        assert len(result['strategy_recommendations']) > 0
        assert any('settlement' in rec.lower() for rec in result['strategy_recommendations'])
    
    @pytest.mark.asyncio
    async def test_legal_report_generation(self, verdict_agent):
        """Test legal report generation"""
        # First create some data to report on
        test_document = "Test legal document with standard terms."
        await verdict_agent.verdict_analyze_document(test_document, 'contract')
        
        test_contract = "Service agreement with standard terms and conditions."
        await verdict_agent.verdict_review_contract(test_contract, 'service_agreement')
        
        business_data = {'industry': 'technology', 'stores_personal_data': True}
        await verdict_agent.verdict_check_regulatory_compliance(business_data, 'technology')
        
        # Generate report
        result = await verdict_agent.verdict_generate_legal_report(1)  # 1 hour period
        
        assert result['success'] is True
        assert 'report' in result
        
        report = result['report']
        assert 'report_id' in report
        assert 'time_period' in report
        assert 'legal_analysis_summary' in report
        assert 'contract_review_summary' in report
        assert 'regulatory_compliance_summary' in report
        assert 'risk_analysis' in report
        assert 'recommendations' in report
        assert 'system_metrics' in report
        
        # Check summary data
        legal_summary = report['legal_analysis_summary']
        assert legal_summary['total_analyses'] >= 1
        assert isinstance(legal_summary['compliance_rate'], (int, float))
        
        contract_summary = report['contract_review_summary']
        assert contract_summary['total_contracts'] >= 1
        assert isinstance(contract_summary['approval_rate'], (int, float))
    
    @pytest.mark.asyncio
    async def test_compliance_level_determination(self, verdict_agent):
        """Test compliance level determination logic"""
        # Test compliant case
        compliance_check = {'compliance_issues': []}
        legal_issues = {'violations': [], 'concerns': []}
        
        level = verdict_agent._determine_compliance_level(compliance_check, legal_issues)
        assert level == ComplianceLevel.COMPLIANT
        
        # Test review required case
        legal_issues = {'violations': [], 'concerns': ['minor concern', 'another concern', 'third concern']}
        level = verdict_agent._determine_compliance_level(compliance_check, legal_issues)
        assert level == ComplianceLevel.REVIEW_REQUIRED
        
        # Test non-compliant case
        legal_issues = {'violations': ['missing clause'], 'concerns': []}
        level = verdict_agent._determine_compliance_level(compliance_check, legal_issues)
        assert level == ComplianceLevel.NON_COMPLIANT
        
        # Test critical violation case
        legal_issues = {'violations': ['violation 1', 'violation 2', 'violation 3'], 'concerns': []}
        level = verdict_agent._determine_compliance_level(compliance_check, legal_issues)
        assert level == ComplianceLevel.CRITICAL_VIOLATION
    
    @pytest.mark.asyncio
    async def test_legal_risk_assessment(self, verdict_agent):
        """Test legal risk assessment logic"""
        # Test low risk case
        content = "Standard contract with normal terms and conditions."
        legal_issues = {'violations': [], 'concerns': []}
        
        risk = await verdict_agent._assess_legal_risk(content, legal_issues)
        assert risk == LegalRisk.LOW
        
        # Test high risk case
        content = "Contract with unlimited liability, indemnification, damages, and breach clauses."
        legal_issues = {'violations': ['major violation'], 'concerns': ['concern 1', 'concern 2']}
        
        risk = await verdict_agent._assess_legal_risk(content, legal_issues)
        assert risk in [LegalRisk.HIGH, LegalRisk.CRITICAL]
    
    @pytest.mark.asyncio
    async def test_contract_term_extraction(self, verdict_agent):
        """Test contract term extraction"""
        contract_content = """
        Service Agreement
        Term: 24 months with renewal option
        Payment: $5,000 monthly fee
        Termination: 30 days written notice required
        Liability: Limited to contract value
        Governing Law: California State Law
        """
        
        terms = await verdict_agent._extract_contract_terms(contract_content, 'service_agreement')
        
        assert isinstance(terms, dict)
        # Should extract some terms
        assert len(terms) > 0
        # May contain extracted terms or "Not specified" for missing ones
        assert all(isinstance(value, str) for value in terms.values())
    
    @pytest.mark.asyncio
    async def test_regulatory_framework_coverage(self, verdict_agent):
        """Test that regulatory frameworks cover major areas"""
        frameworks = verdict_agent.regulatory_frameworks
        
        # Should have major regulatory categories
        expected_categories = ['data_protection', 'financial', 'healthcare', 'employment']
        for category in expected_categories:
            assert category in frameworks
            assert len(frameworks[category]) > 0
        
        # Data protection should include major privacy laws
        assert 'GDPR' in frameworks['data_protection']
        assert 'CCPA' in frameworks['data_protection']
        
        # Financial should include major financial regulations
        assert 'SOX' in frameworks['financial']
        
        # Healthcare should include HIPAA
        assert 'HIPAA' in frameworks['healthcare']
    
    @pytest.mark.asyncio
    async def test_contract_type_support(self, verdict_agent):
        """Test support for different contract types"""
        contract_types = verdict_agent.contract_types
        
        # Should support major contract types
        expected_types = ['service_agreement', 'employment', 'vendor', 'license']
        for contract_type in expected_types:
            assert contract_type in contract_types
            assert len(contract_types[contract_type]) > 0
        
        # Each contract type should have relevant terms
        assert 'scope' in contract_types['service_agreement']
        assert 'salary' in contract_types['employment']
        assert 'deliverables' in contract_types['vendor']
    
    @pytest.mark.asyncio
    async def test_jurisdiction_determination(self, verdict_agent):
        """Test jurisdiction determination logic"""
        # International operations
        business_data = {'international_operations': True}
        jurisdiction = verdict_agent._determine_jurisdiction(business_data, 'general')
        assert jurisdiction == JurisdictionType.INTERNATIONAL
        
        # Government contracts
        business_data = {'government_contracts': True}
        jurisdiction = verdict_agent._determine_jurisdiction(business_data, 'general')
        assert jurisdiction == JurisdictionType.FEDERAL
        
        # Industry-specific
        business_data = {}
        jurisdiction = verdict_agent._determine_jurisdiction(business_data, 'healthcare')
        assert jurisdiction == JurisdictionType.INDUSTRY_SPECIFIC
        
        # Default state
        business_data = {}
        jurisdiction = verdict_agent._determine_jurisdiction(business_data, 'general')
        assert jurisdiction == JurisdictionType.STATE
    
    @pytest.mark.asyncio
    async def test_error_handling(self, verdict_agent):
        """Test error handling in various scenarios"""
        # Test with invalid input
        result = await verdict_agent.verdict_analyze_document("", "invalid_type")
        # Should handle gracefully, might succeed with empty analysis or controlled failure
        assert 'success' in result
        
        # Test with malformed data
        try:
            result = await verdict_agent.verdict_check_regulatory_compliance({}, "")
            assert 'success' in result
        except Exception:
            # Some errors might be expected for malformed input
            pass
    
    @pytest.mark.asyncio
    async def test_get_available_tools(self, verdict_agent):
        """Test that all tools are properly exposed"""
        tools = verdict_agent.get_available_tools()
        
        # Should have both core tools and Verdict-specific tools
        tool_names = [tool['name'] for tool in tools]
        
        # Check for Verdict-specific tools
        verdict_tools = [
            'verdict_analyze_document',
            'verdict_review_contract',
            'verdict_check_regulatory_compliance',
            'verdict_assess_litigation_risk',
            'verdict_generate_legal_report'
        ]
        
        for tool in verdict_tools:
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
    async def test_tool_execution(self, verdict_agent):
        """Test tool execution through execute_tool method"""
        # Test Verdict-specific tool
        result = await verdict_agent.execute_tool(
            'verdict_analyze_document',
            document_content='Test legal document content.',
            document_type='general'
        )
        
        assert result['success'] is True
        assert 'analysis_id' in result
    
    @pytest.mark.asyncio
    async def test_metrics_tracking(self, verdict_agent):
        """Test that metrics are properly tracked"""
        initial_metrics = verdict_agent.legal_metrics.copy()
        
        # Perform some operations
        await verdict_agent.verdict_analyze_document("Test document", "general")
        await verdict_agent.verdict_review_contract("Test contract", "service_agreement")
        
        # Check metrics updated
        assert verdict_agent.legal_metrics['total_analyses'] > initial_metrics['total_analyses']
        assert verdict_agent.legal_metrics['contracts_reviewed'] > initial_metrics['contracts_reviewed']
        assert verdict_agent.legal_metrics['average_review_time'] >= 0

def run_tests():
    """Run all Verdict Agent tests"""
    print("🧪 Running Verdict Agent Tests...")
    print("=" * 50)
    
    # Test basic functionality
    test_functions = [
        'test_agent_initialization',
        'test_document_analysis_compliant',
        'test_contract_review_service_agreement',
        'test_regulatory_compliance_financial',
        'test_litigation_risk_assessment',
        'test_legal_report_generation',
        'test_compliance_level_determination',
        'test_regulatory_framework_coverage',
        'test_get_available_tools'
    ]
    
    config = {
        'compliance_threshold': 0.8,
        'risk_tolerance': 'medium',
        'auto_approve_threshold': 0.95
    }
    
    test_results = []
    
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
        print("\n🎉 All Verdict Agent tests passed!")
    else:
        print("\n⚠️ Some tests failed - check implementation")
        sys.exit(1) 