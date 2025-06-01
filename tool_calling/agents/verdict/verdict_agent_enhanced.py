# ----------------------------------------------------------------------------
#  File:        verdict_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Verdict Agent - Legal & Compliance with Real-time Analysis
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import sys
from enum import Enum
import asyncio
import re

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from core.core_tools import CoreTools

class ComplianceLevel(Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    REVIEW_REQUIRED = "review_required"
    CRITICAL_VIOLATION = "critical_violation"

class LegalRisk(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class JurisdictionType(Enum):
    FEDERAL = "federal"
    STATE = "state"
    INTERNATIONAL = "international"
    INDUSTRY_SPECIFIC = "industry_specific"

class ContractStatus(Enum):
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    EXECUTED = "executed"
    EXPIRED = "expired"
    TERMINATED = "terminated"

@dataclass
class LegalAnalysis:
    """Legal analysis record"""
    analysis_id: str
    document_hash: str
    analysis_type: str
    compliance_level: ComplianceLevel
    legal_risk: LegalRisk
    applicable_laws: List[str]
    violations_found: List[str]
    recommendations: List[str]
    confidence_score: float
    analysis_timestamp: str
    reviewer: str = "verdict_agent"

@dataclass
class ContractReview:
    """Contract review record"""
    review_id: str
    contract_hash: str
    contract_type: str
    status: ContractStatus
    key_terms: Dict[str, Any]
    risk_factors: List[str]
    compliance_issues: List[str]
    recommended_changes: List[str]
    approval_status: str
    review_timestamp: str

@dataclass
class RegulatoryCheck:
    """Regulatory compliance check"""
    check_id: str
    regulation_type: str
    jurisdiction: JurisdictionType
    compliance_status: ComplianceLevel
    regulatory_requirements: List[str]
    compliance_gaps: List[str]
    remediation_steps: List[str]
    deadline: Optional[str]
    check_timestamp: str

class VerdictAgentEnhanced(CoreTools):
    """
    Enhanced Verdict - Legal & Compliance Agent
    
    Responsible for:
    - Legal document analysis and review
    - Contract compliance verification
    - Regulatory compliance monitoring
    - Legal risk assessment and management
    - Policy compliance auditing
    - Litigation risk evaluation
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize core tools
        super().__init__("verdict_agent", config)
        
        # Verdict-specific configuration
        self.compliance_threshold = config.get('compliance_threshold', 0.8)
        self.risk_tolerance = config.get('risk_tolerance', 'medium')
        self.auto_approve_threshold = config.get('auto_approve_threshold', 0.95)
        
        # Legal tracking
        self.legal_analyses: Dict[str, LegalAnalysis] = {}
        self.contract_reviews: Dict[str, ContractReview] = {}
        self.regulatory_checks: Dict[str, RegulatoryCheck] = {}
        
        # Performance metrics
        self.legal_metrics = {
            'total_analyses': 0,
            'compliant_documents': 0,
            'critical_violations': 0,
            'contracts_reviewed': 0,
            'risk_assessments': 0,
            'average_review_time': 0.0
        }
        
        # Known regulations and laws
        self.regulatory_frameworks = {
            'data_protection': ['GDPR', 'CCPA', 'PIPEDA', 'DPA'],
            'financial': ['SOX', 'GLBA', 'PCI_DSS', 'BASEL_III'],
            'healthcare': ['HIPAA', 'HITECH', 'FDA_21CFR'],
            'blockchain': ['SEC_CRYPTO', 'CFTC_DIGITAL', 'AML_BSA'],
            'employment': ['FLSA', 'ADA', 'FMLA', 'EEOC'],
            'environmental': ['EPA_CLEAN_AIR', 'CERCLA', 'RCRA']
        }
        
        # Contract types and templates
        self.contract_types = {
            'service_agreement': ['term', 'scope', 'payment', 'termination'],
            'employment': ['salary', 'benefits', 'confidentiality', 'termination'],
            'vendor': ['deliverables', 'payment_terms', 'warranties', 'indemnity'],
            'license': ['scope_of_use', 'restrictions', 'royalties', 'termination'],
            'partnership': ['profit_sharing', 'responsibilities', 'dissolution'],
            'lease': ['rent', 'term', 'maintenance', 'renewal']
        }

    # =============================================================================
    # VERDICT-SPECIFIC LEGAL TOOLS
    # =============================================================================

    async def verdict_analyze_document(self, document_content: str, 
                                     document_type: str = "general") -> Dict[str, Any]:
        """
        Perform comprehensive legal analysis of a document
        """
        try:
            analysis_start = time.time()
            
            # Generate analysis ID and document hash
            document_hash = hashlib.sha256(document_content.encode()).hexdigest()
            analysis_id = f"legal_{int(time.time())}_{document_hash[:8]}"
            
            # Analyze document content
            legal_issues = await self._identify_legal_issues(document_content, document_type)
            compliance_check = await self._check_regulatory_compliance(document_content, document_type)
            risk_assessment = await self._assess_legal_risk(document_content, legal_issues)
            
            # Determine compliance level
            compliance_level = self._determine_compliance_level(compliance_check, legal_issues)
            
            # Generate recommendations
            recommendations = await self._generate_legal_recommendations(
                legal_issues, compliance_check, document_type
            )
            
            # Calculate confidence score
            confidence_score = await self._calculate_legal_confidence(
                document_content, legal_issues, compliance_check
            )
            
            # Create analysis record
            analysis = LegalAnalysis(
                analysis_id=analysis_id,
                document_hash=document_hash,
                analysis_type=document_type,
                compliance_level=compliance_level,
                legal_risk=risk_assessment,
                applicable_laws=compliance_check.get('applicable_laws', []),
                violations_found=legal_issues.get('violations', []),
                recommendations=recommendations,
                confidence_score=confidence_score,
                analysis_timestamp=datetime.utcnow().isoformat()
            )
            
            self.legal_analyses[analysis_id] = analysis
            
            # Update metrics
            self.legal_metrics['total_analyses'] += 1
            if compliance_level == ComplianceLevel.COMPLIANT:
                self.legal_metrics['compliant_documents'] += 1
            elif compliance_level == ComplianceLevel.CRITICAL_VIOLATION:
                self.legal_metrics['critical_violations'] += 1
            
            analysis_time = time.time() - analysis_start
            self.legal_metrics['average_review_time'] = (
                self.legal_metrics['average_review_time'] * 0.9 + analysis_time * 0.1
            )
            
            # Log analysis to blockchain
            await self.recall_log_insight(
                f'Legal analysis completed: {compliance_level.value} for {document_type}',
                {
                    'type': 'legal_analysis',
                    'analysis_id': analysis_id,
                    'document_hash': document_hash,
                    'document_type': document_type,
                    'compliance_level': compliance_level.value,
                    'legal_risk': risk_assessment.value,
                    'confidence_score': confidence_score
                }
            )
            
            return {
                'success': True,
                'analysis_id': analysis_id,
                'document_hash': document_hash,
                'compliance_level': compliance_level.value,
                'legal_risk': risk_assessment.value,
                'confidence_score': confidence_score,
                'applicable_laws': compliance_check.get('applicable_laws', []),
                'violations_found': legal_issues.get('violations', []),
                'recommendations': recommendations,
                'analysis_timestamp': analysis.analysis_timestamp,
                'analysis_time_seconds': analysis_time
            }
            
        except Exception as e:
            await self.security_log_risk(f"Legal analysis failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'compliance_level': ComplianceLevel.REVIEW_REQUIRED.value
            }

    async def verdict_review_contract(self, contract_content: str,
                                    contract_type: str = "service_agreement") -> Dict[str, Any]:
        """
        Perform comprehensive contract review and analysis
        """
        try:
            # Generate review ID and contract hash
            contract_hash = hashlib.sha256(contract_content.encode()).hexdigest()
            review_id = f"contract_{int(time.time())}_{contract_hash[:8]}"
            
            # Extract key terms
            key_terms = await self._extract_contract_terms(contract_content, contract_type)
            
            # Identify risk factors
            risk_factors = await self._identify_contract_risks(contract_content, contract_type)
            
            # Check compliance issues
            compliance_issues = await self._check_contract_compliance(contract_content, contract_type)
            
            # Generate recommended changes
            recommended_changes = await self._generate_contract_recommendations(
                contract_content, risk_factors, compliance_issues, contract_type
            )
            
            # Determine status and approval
            status = self._determine_contract_status(risk_factors, compliance_issues)
            approval_status = self._determine_approval_status(risk_factors, compliance_issues)
            
            # Create contract review record
            review = ContractReview(
                review_id=review_id,
                contract_hash=contract_hash,
                contract_type=contract_type,
                status=status,
                key_terms=key_terms,
                risk_factors=risk_factors,
                compliance_issues=compliance_issues,
                recommended_changes=recommended_changes,
                approval_status=approval_status,
                review_timestamp=datetime.utcnow().isoformat()
            )
            
            self.contract_reviews[review_id] = review
            self.legal_metrics['contracts_reviewed'] += 1
            
            # Log contract review
            await self.recall_log_insight(
                f'Contract review completed: {approval_status} for {contract_type}',
                {
                    'type': 'contract_review',
                    'review_id': review_id,
                    'contract_hash': contract_hash,
                    'contract_type': contract_type,
                    'status': status.value,
                    'approval_status': approval_status,
                    'risk_count': len(risk_factors),
                    'compliance_issues': len(compliance_issues)
                }
            )
            
            return {
                'success': True,
                'review_id': review_id,
                'contract_hash': contract_hash,
                'contract_type': contract_type,
                'status': status.value,
                'approval_status': approval_status,
                'key_terms': key_terms,
                'risk_factors': risk_factors,
                'compliance_issues': compliance_issues,
                'recommended_changes': recommended_changes,
                'review_timestamp': review.review_timestamp
            }
            
        except Exception as e:
            await self.security_log_risk(f"Contract review failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'approval_status': 'rejected'
            }

    async def verdict_check_regulatory_compliance(self, business_data: Dict[str, Any],
                                                industry: str = "general") -> Dict[str, Any]:
        """
        Check regulatory compliance for business operations
        """
        try:
            # Generate check ID
            data_hash = hashlib.sha256(json.dumps(business_data, sort_keys=True).encode()).hexdigest()
            check_id = f"regulatory_{int(time.time())}_{data_hash[:8]}"
            
            # Determine applicable regulations
            applicable_regulations = self._get_applicable_regulations(industry, business_data)
            
            # Check each regulatory framework
            compliance_results = {}
            overall_gaps = []
            
            for regulation_type, regulations in applicable_regulations.items():
                for regulation in regulations:
                    compliance_check = await self._check_specific_regulation(
                        business_data, regulation, regulation_type
                    )
                    compliance_results[regulation] = compliance_check
                    if compliance_check['gaps']:
                        overall_gaps.extend(compliance_check['gaps'])
            
            # Determine overall compliance status
            compliance_status = self._determine_overall_compliance_status(compliance_results)
            
            # Generate remediation steps
            remediation_steps = await self._generate_remediation_steps(overall_gaps, industry)
            
            # Calculate deadline for critical issues
            deadline = self._calculate_compliance_deadline(compliance_status, overall_gaps)
            
            # Determine jurisdiction
            jurisdiction = self._determine_jurisdiction(business_data, industry)
            
            # Create regulatory check record
            regulatory_check = RegulatoryCheck(
                check_id=check_id,
                regulation_type=industry,
                jurisdiction=jurisdiction,
                compliance_status=compliance_status,
                regulatory_requirements=list(applicable_regulations.keys()),
                compliance_gaps=overall_gaps,
                remediation_steps=remediation_steps,
                deadline=deadline,
                check_timestamp=datetime.utcnow().isoformat()
            )
            
            self.regulatory_checks[check_id] = regulatory_check
            
            # Log regulatory check
            await self.recall_log_insight(
                f'Regulatory compliance check: {compliance_status.value} for {industry}',
                {
                    'type': 'regulatory_check',
                    'check_id': check_id,
                    'industry': industry,
                    'compliance_status': compliance_status.value,
                    'jurisdiction': jurisdiction.value,
                    'gaps_count': len(overall_gaps),
                    'deadline': deadline
                }
            )
            
            return {
                'success': True,
                'check_id': check_id,
                'industry': industry,
                'compliance_status': compliance_status.value,
                'jurisdiction': jurisdiction.value,
                'applicable_regulations': applicable_regulations,
                'compliance_results': compliance_results,
                'compliance_gaps': overall_gaps,
                'remediation_steps': remediation_steps,
                'deadline': deadline,
                'check_timestamp': regulatory_check.check_timestamp
            }
            
        except Exception as e:
            await self.security_log_risk(f"Regulatory compliance check failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'compliance_status': ComplianceLevel.REVIEW_REQUIRED.value
            }

    async def verdict_assess_litigation_risk(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess litigation risk based on case data and precedents
        """
        try:
            # Generate assessment ID
            case_hash = hashlib.sha256(json.dumps(case_data, sort_keys=True).encode()).hexdigest()
            assessment_id = f"litigation_{int(time.time())}_{case_hash[:8]}"
            
            # Analyze case merits
            case_merits = await self._analyze_case_merits(case_data)
            
            # Research precedents
            precedent_analysis = await self._research_precedents(case_data)
            
            # Calculate risk factors
            risk_factors = await self._calculate_litigation_risk_factors(case_data, precedent_analysis)
            
            # Estimate potential damages
            damage_estimates = await self._estimate_potential_damages(case_data, precedent_analysis)
            
            # Determine litigation strategy
            strategy_recommendations = await self._generate_litigation_strategy(
                case_data, case_merits, precedent_analysis, risk_factors
            )
            
            # Calculate overall risk score
            risk_score = self._calculate_overall_litigation_risk(risk_factors, damage_estimates)
            risk_level = self._categorize_risk_level(risk_score)
            
            self.legal_metrics['risk_assessments'] += 1
            
            # Log litigation risk assessment
            await self.recall_log_insight(
                f'Litigation risk assessment: {risk_level.value} risk level',
                {
                    'type': 'litigation_risk',
                    'assessment_id': assessment_id,
                    'case_hash': case_hash,
                    'risk_level': risk_level.value,
                    'risk_score': risk_score,
                    'estimated_damages': damage_estimates.get('total_estimate', 0)
                }
            )
            
            return {
                'success': True,
                'assessment_id': assessment_id,
                'case_hash': case_hash,
                'risk_level': risk_level.value,
                'risk_score': risk_score,
                'case_merits': case_merits,
                'precedent_analysis': precedent_analysis,
                'risk_factors': risk_factors,
                'damage_estimates': damage_estimates,
                'strategy_recommendations': strategy_recommendations,
                'assessment_timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            await self.security_log_risk(f"Litigation risk assessment failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'risk_level': LegalRisk.HIGH.value
            }

    async def verdict_generate_legal_report(self, time_period_hours: int = 24) -> Dict[str, Any]:
        """
        Generate comprehensive legal and compliance report
        """
        try:
            # Calculate time range
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=time_period_hours)
            
            # Filter records by time period
            recent_analyses = [
                analysis for analysis in self.legal_analyses.values()
                if datetime.fromisoformat(analysis.analysis_timestamp) >= start_time
            ]
            
            recent_contracts = [
                review for review in self.contract_reviews.values()
                if datetime.fromisoformat(review.review_timestamp) >= start_time
            ]
            
            recent_regulatory = [
                check for check in self.regulatory_checks.values()
                if datetime.fromisoformat(check.check_timestamp) >= start_time
            ]
            
            # Calculate statistics
            total_analyses = len(recent_analyses)
            compliant_docs = len([a for a in recent_analyses if a.compliance_level == ComplianceLevel.COMPLIANT])
            critical_violations = len([a for a in recent_analyses if a.compliance_level == ComplianceLevel.CRITICAL_VIOLATION])
            
            compliance_rate = compliant_docs / total_analyses if total_analyses > 0 else 1.0
            
            # Contract analysis
            approved_contracts = len([c for c in recent_contracts if c.approval_status == 'approved'])
            contract_approval_rate = approved_contracts / len(recent_contracts) if recent_contracts else 1.0
            
            # Risk distribution
            risk_distribution = {}
            for analysis in recent_analyses:
                risk = analysis.legal_risk.value
                risk_distribution[risk] = risk_distribution.get(risk, 0) + 1
            
            # Regulatory compliance summary
            regulatory_summary = {}
            for check in recent_regulatory:
                status = check.compliance_status.value
                regulatory_summary[status] = regulatory_summary.get(status, 0) + 1
            
            # Generate recommendations
            recommendations = self._generate_legal_report_recommendations(
                recent_analyses, recent_contracts, recent_regulatory
            )
            
            # Create comprehensive report
            report = {
                'report_id': f"legal_report_{int(time.time())}",
                'time_period': {
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'hours': time_period_hours
                },
                'legal_analysis_summary': {
                    'total_analyses': total_analyses,
                    'compliant_documents': compliant_docs,
                    'critical_violations': critical_violations,
                    'compliance_rate': compliance_rate,
                    'average_review_time': self.legal_metrics['average_review_time']
                },
                'contract_review_summary': {
                    'total_contracts': len(recent_contracts),
                    'approved_contracts': approved_contracts,
                    'approval_rate': contract_approval_rate,
                    'contracts_by_type': self._group_contracts_by_type(recent_contracts)
                },
                'regulatory_compliance_summary': {
                    'total_checks': len(recent_regulatory),
                    'compliance_distribution': regulatory_summary,
                    'pending_remediation': len([c for c in recent_regulatory if c.compliance_gaps])
                },
                'risk_analysis': {
                    'risk_distribution': risk_distribution,
                    'total_risk_assessments': self.legal_metrics['risk_assessments'],
                    'high_risk_items': len([a for a in recent_analyses if a.legal_risk in [LegalRisk.HIGH, LegalRisk.CRITICAL]])
                },
                'recommendations': recommendations,
                'system_metrics': self.legal_metrics.copy(),
                'generated_at': datetime.utcnow().isoformat()
            }
            
            # Log report generation
            await self.recall_log_insight(
                f'Legal report generated for {time_period_hours}h period',
                {
                    'type': 'legal_report',
                    'report_id': report['report_id'],
                    'time_period_hours': time_period_hours,
                    'total_analyses': total_analyses,
                    'compliance_rate': compliance_rate
                }
            )
            
            return {
                'success': True,
                'report': report
            }
            
        except Exception as e:
            await self.security_log_risk(f"Legal report generation failed: {e}", "high")
            return {
                'success': False,
                'error': str(e)
            }

    # =============================================================================
    # HELPER METHODS
    # =============================================================================

    async def _identify_legal_issues(self, content: str, document_type: str) -> Dict[str, Any]:
        """Identify potential legal issues in document content"""
        issues = {'violations': [], 'concerns': [], 'recommendations': []}
        
        content_lower = content.lower()
        
        # Common legal red flags
        red_flags = [
            'unlimited liability', 'perpetual term', 'automatic renewal',
            'indemnification', 'liquidated damages', 'non-compete',
            'intellectual property', 'confidential information'
        ]
        
        for flag in red_flags:
            if flag in content_lower:
                issues['concerns'].append(f"Contains {flag} clause - requires review")
        
        # Document-specific checks
        if document_type == 'contract':
            if 'termination' not in content_lower:
                issues['violations'].append("Missing termination clause")
            if 'governing law' not in content_lower:
                issues['violations'].append("Missing governing law provision")
        
        elif document_type == 'privacy_policy':
            if 'data collection' not in content_lower:
                issues['violations'].append("Missing data collection disclosure")
            if 'third party' not in content_lower:
                issues['concerns'].append("Third-party data sharing not addressed")
        
        # Generate recommendations
        if issues['violations']:
            issues['recommendations'].append("Address all legal violations before proceeding")
        if len(issues['concerns']) > 3:
            issues['recommendations'].append("Consider legal review due to multiple concerns")
        
        return issues

    async def _check_regulatory_compliance(self, content: str, document_type: str) -> Dict[str, Any]:
        """Check document against applicable regulations"""
        applicable_laws = []
        compliance_issues = []
        
        content_lower = content.lower()
        
        # GDPR compliance
        if any(term in content_lower for term in ['personal data', 'data subject', 'processing']):
            applicable_laws.append('GDPR')
            if 'lawful basis' not in content_lower:
                compliance_issues.append("GDPR: Missing lawful basis for processing")
            if 'data subject rights' not in content_lower:
                compliance_issues.append("GDPR: Data subject rights not addressed")
        
        # SOX compliance for financial documents
        if any(term in content_lower for term in ['financial', 'audit', 'internal controls']):
            applicable_laws.append('SOX')
            if 'internal controls' not in content_lower:
                compliance_issues.append("SOX: Internal controls not documented")
        
        # Employment law compliance
        if any(term in content_lower for term in ['employee', 'employment', 'wages']):
            applicable_laws.append('FLSA')
            if 'overtime' in content_lower and 'exempt' not in content_lower:
                compliance_issues.append("FLSA: Overtime provisions unclear")
        
        return {
            'applicable_laws': applicable_laws,
            'compliance_issues': compliance_issues
        }

    async def _assess_legal_risk(self, content: str, legal_issues: Dict[str, Any]) -> LegalRisk:
        """Assess overall legal risk level"""
        risk_score = 0
        
        # Count violations and concerns
        violations = len(legal_issues.get('violations', []))
        concerns = len(legal_issues.get('concerns', []))
        
        risk_score += violations * 3  # Violations are more serious
        risk_score += concerns * 1
        
        # Content-based risk factors
        content_lower = content.lower()
        high_risk_terms = ['liability', 'indemnify', 'damages', 'breach', 'termination']
        risk_score += sum(1 for term in high_risk_terms if term in content_lower)
        
        # Categorize risk
        if risk_score >= 10:
            return LegalRisk.CRITICAL
        elif risk_score >= 6:
            return LegalRisk.HIGH
        elif risk_score >= 3:
            return LegalRisk.MEDIUM
        else:
            return LegalRisk.LOW

    def _determine_compliance_level(self, compliance_check: Dict[str, Any], 
                                   legal_issues: Dict[str, Any]) -> ComplianceLevel:
        """Determine overall compliance level"""
        violations = len(legal_issues.get('violations', []))
        compliance_issues = len(compliance_check.get('compliance_issues', []))
        
        if violations > 0 or compliance_issues > 2:
            if violations > 2 or compliance_issues > 4:
                return ComplianceLevel.CRITICAL_VIOLATION
            else:
                return ComplianceLevel.NON_COMPLIANT
        elif compliance_issues > 0 or len(legal_issues.get('concerns', [])) > 2:
            return ComplianceLevel.REVIEW_REQUIRED
        else:
            return ComplianceLevel.COMPLIANT

    async def _generate_legal_recommendations(self, legal_issues: Dict[str, Any],
                                            compliance_check: Dict[str, Any],
                                            document_type: str) -> List[str]:
        """Generate legal recommendations based on analysis"""
        recommendations = []
        
        # Address violations first
        for violation in legal_issues.get('violations', []):
            recommendations.append(f"CRITICAL: {violation}")
        
        # Address compliance issues
        for issue in compliance_check.get('compliance_issues', []):
            recommendations.append(f"COMPLIANCE: {issue}")
        
        # General recommendations based on document type
        if document_type == 'contract':
            recommendations.append("Review termination and dispute resolution clauses")
            recommendations.append("Ensure intellectual property rights are clearly defined")
        elif document_type == 'privacy_policy':
            recommendations.append("Verify compliance with applicable data protection laws")
            recommendations.append("Include clear opt-out mechanisms")
        
        # Risk mitigation
        if len(legal_issues.get('concerns', [])) > 0:
            recommendations.append("Consider legal counsel review for identified concerns")
        
        return recommendations

    async def _calculate_legal_confidence(self, content: str, legal_issues: Dict[str, Any],
                                        compliance_check: Dict[str, Any]) -> float:
        """Calculate confidence score for legal analysis"""
        base_score = 0.8
        
        # Reduce confidence for issues found
        violations = len(legal_issues.get('violations', []))
        concerns = len(legal_issues.get('concerns', []))
        compliance_issues = len(compliance_check.get('compliance_issues', []))
        
        confidence_reduction = (violations * 0.2) + (concerns * 0.05) + (compliance_issues * 0.1)
        
        # Increase confidence for comprehensive content
        content_length = len(content)
        if content_length > 1000:
            base_score += 0.1
        
        # Applicable laws increase confidence
        if compliance_check.get('applicable_laws'):
            base_score += 0.05
        
        final_confidence = max(0.1, min(1.0, base_score - confidence_reduction))
        return final_confidence

    async def _extract_contract_terms(self, contract_content: str, 
                                    contract_type: str) -> Dict[str, Any]:
        """Extract key terms from contract content"""
        terms = {}
        content_lower = contract_content.lower()
        
        # Common term extraction patterns
        term_patterns = {
            'term': r'term[s]?\s*[:\-]\s*([^\n.]+)',
            'payment': r'payment[s]?\s*[:\-]\s*([^\n.]+)',
            'termination': r'terminat[e|ion]+\s*[:\-]\s*([^\n.]+)',
            'liability': r'liabilit[y|ies]+\s*[:\-]\s*([^\n.]+)',
            'governing_law': r'governing\s+law\s*[:\-]\s*([^\n.]+)'
        }
        
        for term_name, pattern in term_patterns.items():
            matches = re.findall(pattern, content_lower)
            if matches:
                terms[term_name] = matches[0].strip()
        
        # Contract type specific terms
        if contract_type in self.contract_types:
            expected_terms = self.contract_types[contract_type]
            for expected_term in expected_terms:
                if expected_term not in terms:
                    terms[expected_term] = "Not specified"
        
        return terms

    async def _identify_contract_risks(self, contract_content: str, 
                                     contract_type: str) -> List[str]:
        """Identify risk factors in contract"""
        risks = []
        content_lower = contract_content.lower()
        
        # Standard risk factors
        risk_indicators = {
            'unlimited liability': 'Unlimited liability exposure',
            'perpetual': 'Perpetual or indefinite term',
            'automatic renewal': 'Automatic renewal without notice',
            'indemnification': 'Broad indemnification obligations',
            'liquidated damages': 'Liquidated damages clause',
            'non-compete': 'Non-compete restrictions',
            'exclusive': 'Exclusivity requirements'
        }
        
        for indicator, risk_description in risk_indicators.items():
            if indicator in content_lower:
                risks.append(risk_description)
        
        # Missing essential terms
        essential_terms = ['termination', 'governing law', 'dispute resolution']
        for term in essential_terms:
            if term.replace(' ', '_') not in content_lower and term not in content_lower:
                risks.append(f"Missing {term} clause")
        
        return risks

    async def _check_contract_compliance(self, contract_content: str,
                                       contract_type: str) -> List[str]:
        """Check contract for compliance issues"""
        issues = []
        content_lower = contract_content.lower()
        
        # Employment contract compliance
        if contract_type == 'employment':
            if 'at-will' not in content_lower and 'term' not in content_lower:
                issues.append("Employment relationship type not specified")
            if 'equal opportunity' not in content_lower:
                issues.append("Equal opportunity statement missing")
        
        # Service agreement compliance
        elif contract_type == 'service_agreement':
            if 'service level' not in content_lower and 'sla' not in content_lower:
                issues.append("Service level agreements not defined")
            if 'warranty' not in content_lower:
                issues.append("Warranty provisions missing")
        
        # Data processing compliance
        if any(term in content_lower for term in ['data', 'personal information', 'privacy']):
            if 'gdpr' not in content_lower and 'data protection' not in content_lower:
                issues.append("Data protection compliance not addressed")
        
        return issues

    async def _generate_contract_recommendations(self, contract_content: str,
                                               risk_factors: List[str],
                                               compliance_issues: List[str],
                                               contract_type: str) -> List[str]:
        """Generate recommendations for contract improvements"""
        recommendations = []
        
        # Risk-based recommendations
        if risk_factors:
            for risk in risk_factors:
                if "unlimited liability" in risk.lower():
                    recommendations.append("Add liability caps and limitations")
                elif "perpetual" in risk.lower():
                    recommendations.append("Define specific contract term with renewal options")
                elif "automatic renewal" in risk.lower():
                    recommendations.append("Add advance notice requirements for renewal opt-out")
                elif "indemnification" in risk.lower():
                    recommendations.append("Limit indemnification scope and add mutual indemnity")
        
        # Compliance-based recommendations
        if compliance_issues:
            for issue in compliance_issues:
                if "service level" in issue.lower():
                    recommendations.append("Define clear SLAs with performance metrics")
                elif "warranty" in issue.lower():
                    recommendations.append("Include appropriate warranty and disclaimer provisions")
                elif "data protection" in issue.lower():
                    recommendations.append("Add GDPR/privacy compliance clauses")
        
        # Contract type specific recommendations
        if contract_type == 'employment':
            recommendations.append("Ensure compliance with local employment law")
            recommendations.append("Include clear job description and performance expectations")
        elif contract_type == 'service_agreement':
            recommendations.append("Define deliverables and acceptance criteria")
            recommendations.append("Include change management process")
        
        return recommendations

    def _determine_contract_status(self, risk_factors: List[str], 
                                 compliance_issues: List[str]) -> ContractStatus:
        """Determine contract status based on review findings"""
        total_issues = len(risk_factors) + len(compliance_issues)
        
        if total_issues == 0:
            return ContractStatus.APPROVED
        elif total_issues <= 2:
            return ContractStatus.UNDER_REVIEW
        else:
            return ContractStatus.DRAFT

    def _determine_approval_status(self, risk_factors: List[str], 
                                 compliance_issues: List[str]) -> str:
        """Determine approval status for contract"""
        high_risk_indicators = ['unlimited liability', 'perpetual', 'critical']
        
        # Check for high-risk factors
        has_high_risk = any(
            any(indicator in risk.lower() for indicator in high_risk_indicators)
            for risk in risk_factors
        )
        
        critical_compliance = any(
            'gdpr' in issue.lower() or 'violation' in issue.lower()
            for issue in compliance_issues
        )
        
        if has_high_risk or critical_compliance:
            return 'rejected'
        elif len(risk_factors) + len(compliance_issues) <= 2:
            return 'approved'
        else:
            return 'conditional'

    def _get_applicable_regulations(self, industry: str, 
                                  business_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Get applicable regulations based on industry and business data"""
        applicable = {}
        
        # Always applicable
        if business_data.get('stores_personal_data', False):
            applicable['data_protection'] = self.regulatory_frameworks['data_protection']
        
        if business_data.get('employee_count', 0) > 0:
            applicable['employment'] = self.regulatory_frameworks['employment']
        
        # Industry-specific
        if industry == 'financial' or business_data.get('processes_payments', False):
            applicable['financial'] = self.regulatory_frameworks['financial']
        
        if industry == 'healthcare' or business_data.get('handles_healthcare_data', False):
            applicable['healthcare'] = self.regulatory_frameworks['healthcare']
        
        if business_data.get('processes_payments', False):
            applicable['blockchain'] = self.regulatory_frameworks['blockchain']
        
        # Environmental for manufacturing
        if industry == 'manufacturing':
            applicable['environmental'] = self.regulatory_frameworks['environmental']
        
        return applicable

    async def _check_specific_regulation(self, business_data: Dict[str, Any],
                                       regulation: str, regulation_type: str) -> Dict[str, Any]:
        """Check compliance with a specific regulation"""
        gaps = []
        requirements = []
        
        if regulation == 'GDPR':
            requirements = ['lawful_basis', 'data_subject_rights', 'privacy_policy', 'data_retention']
            if not business_data.get('privacy_policy', False):
                gaps.append('Missing privacy policy')
            if not business_data.get('data_retention_policy', False):
                gaps.append('Missing data retention policy')
            if business_data.get('international_operations', False):
                gaps.append('International data transfer mechanisms needed')
        
        elif regulation == 'SOX':
            requirements = ['internal_controls', 'financial_reporting', 'audit_procedures']
            if not business_data.get('internal_controls_documented', False):
                gaps.append('Internal controls not documented')
            if not business_data.get('regular_audits', False):
                gaps.append('Regular audit procedures not established')
        
        elif regulation == 'HIPAA':
            requirements = ['data_encryption', 'access_controls', 'breach_notification']
            if not business_data.get('data_encrypted', False):
                gaps.append('Healthcare data not encrypted')
            if not business_data.get('access_controls', False):
                gaps.append('Access controls not implemented')
        
        elif regulation == 'PCI_DSS':
            requirements = ['secure_network', 'cardholder_data_protection', 'vulnerability_management']
            if business_data.get('processes_payments', False):
                if not business_data.get('pci_compliant', False):
                    gaps.append('PCI DSS compliance not verified')
        
        return {
            'regulation': regulation,
            'requirements': requirements,
            'gaps': gaps,
            'compliant': len(gaps) == 0
        }

    def _determine_overall_compliance_status(self, compliance_results: Dict[str, Dict[str, Any]]) -> ComplianceLevel:
        """Determine overall compliance status from individual checks"""
        total_checks = len(compliance_results)
        if total_checks == 0:
            return ComplianceLevel.COMPLIANT
        
        compliant_count = sum(1 for result in compliance_results.values() if result['compliant'])
        compliance_rate = compliant_count / total_checks
        
        critical_violations = any(
            'critical' in str(result['gaps']).lower() or 'violation' in str(result['gaps']).lower()
            for result in compliance_results.values()
        )
        
        if critical_violations:
            return ComplianceLevel.CRITICAL_VIOLATION
        elif compliance_rate >= 0.9:
            return ComplianceLevel.COMPLIANT
        elif compliance_rate >= 0.7:
            return ComplianceLevel.REVIEW_REQUIRED
        else:
            return ComplianceLevel.NON_COMPLIANT

    async def _generate_remediation_steps(self, gaps: List[str], industry: str) -> List[str]:
        """Generate remediation steps for compliance gaps"""
        steps = []
        
        for gap in gaps:
            gap_lower = gap.lower()
            if 'privacy policy' in gap_lower:
                steps.append('Draft comprehensive privacy policy with legal review')
            elif 'data retention' in gap_lower:
                steps.append('Establish data retention and deletion procedures')
            elif 'internal controls' in gap_lower:
                steps.append('Document internal controls and procedures')
            elif 'encryption' in gap_lower:
                steps.append('Implement data encryption for sensitive information')
            elif 'access controls' in gap_lower:
                steps.append('Deploy role-based access control systems')
            elif 'pci' in gap_lower:
                steps.append('Engage PCI DSS compliance consultant')
            else:
                steps.append(f'Address compliance gap: {gap}')
        
        # Industry-specific steps
        if industry == 'financial':
            steps.append('Schedule annual compliance audit')
        elif industry == 'healthcare':
            steps.append('Conduct HIPAA risk assessment')
        
        return steps

    def _calculate_compliance_deadline(self, status: ComplianceLevel, gaps: List[str]) -> Optional[str]:
        """Calculate deadline for compliance remediation"""
        if status == ComplianceLevel.COMPLIANT:
            return None
        
        # Critical violations need immediate attention
        if status == ComplianceLevel.CRITICAL_VIOLATION:
            deadline = datetime.utcnow() + timedelta(days=30)
        elif status == ComplianceLevel.NON_COMPLIANT:
            deadline = datetime.utcnow() + timedelta(days=90)
        else:  # REVIEW_REQUIRED
            deadline = datetime.utcnow() + timedelta(days=180)
        
        return deadline.isoformat()

    def _determine_jurisdiction(self, business_data: Dict[str, Any], industry: str) -> JurisdictionType:
        """Determine applicable jurisdiction"""
        if business_data.get('international_operations', False):
            return JurisdictionType.INTERNATIONAL
        elif business_data.get('government_contracts', False):
            return JurisdictionType.FEDERAL
        elif industry in ['healthcare', 'financial', 'education']:
            return JurisdictionType.INDUSTRY_SPECIFIC
        else:
            return JurisdictionType.STATE

    async def _analyze_case_merits(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the merits of a legal case"""
        merits = {}
        
        # Contract clarity assessment
        clarity = case_data.get('contract_clarity', 'medium')
        merits['contract_clarity_score'] = {'low': 3, 'medium': 6, 'high': 9}.get(clarity, 6)
        
        # Evidence strength
        evidence = case_data.get('evidence_strength', 'medium')
        merits['evidence_strength_score'] = {'weak': 2, 'medium': 5, 'strong': 8}.get(evidence, 5)
        
        # Case type considerations
        case_type = case_data.get('case_type', 'general')
        if case_type == 'contract_dispute':
            merits['contract_dispute_factors'] = 'Well-defined legal framework'
        elif case_type == 'employment':
            merits['employment_law_complexity'] = 'Complex regulatory environment'
        elif case_type == 'intellectual_property':
            merits['ip_protection_strength'] = 'Depends on patent/trademark validity'
        
        # Overall merit score
        total_score = merits['contract_clarity_score'] + merits['evidence_strength_score']
        merits['overall_merit_score'] = min(10, total_score)
        
        return merits

    async def _research_precedents(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Research legal precedents for the case"""
        precedents = {
            'similar_cases_found': 0,
            'favorable_precedents': 0,
            'unfavorable_precedents': 0,
            'precedent_strength': 'medium'
        }
        
        case_type = case_data.get('case_type', 'general')
        
        # Simulate precedent research based on case type
        if case_type == 'contract_dispute':
            precedents['similar_cases_found'] = 15
            precedents['favorable_precedents'] = 8
            precedents['unfavorable_precedents'] = 7
        elif case_type == 'employment':
            precedents['similar_cases_found'] = 25
            precedents['favorable_precedents'] = 10
            precedents['unfavorable_precedents'] = 15
        elif case_type == 'intellectual_property':
            precedents['similar_cases_found'] = 8
            precedents['favorable_precedents'] = 5
            precedents['unfavorable_precedents'] = 3
        
        # Determine precedent strength
        if precedents['similar_cases_found'] > 0:
            favor_ratio = precedents['favorable_precedents'] / precedents['similar_cases_found']
            if favor_ratio > 0.7:
                precedents['precedent_strength'] = 'strong'
            elif favor_ratio < 0.3:
                precedents['precedent_strength'] = 'weak'
        
        return precedents

    async def _calculate_litigation_risk_factors(self, case_data: Dict[str, Any],
                                               precedent_analysis: Dict[str, Any]) -> Dict[str, float]:
        """Calculate various litigation risk factors"""
        risk_factors = {}
        
        # Financial risk
        claim_amount = case_data.get('claim_amount', 0)
        if claim_amount > 1000000:
            risk_factors['financial_exposure'] = 9.0
        elif claim_amount > 100000:
            risk_factors['financial_exposure'] = 6.0
        else:
            risk_factors['financial_exposure'] = 3.0
        
        # Opposing party resources
        resources = case_data.get('opposing_party_resources', 'medium')
        risk_factors['opposing_resources'] = {'low': 2.0, 'medium': 5.0, 'high': 8.0}.get(resources, 5.0)
        
        # Case complexity
        case_type = case_data.get('case_type', 'general')
        complexity_scores = {
            'contract_dispute': 4.0,
            'employment': 6.0,
            'intellectual_property': 8.0,
            'tort': 5.0,
            'regulatory': 7.0,
            'shareholder': 8.5,
            'product_liability': 7.5
        }
        risk_factors['case_complexity'] = complexity_scores.get(case_type, 5.0)
        
        # Precedent risk
        precedent_strength = precedent_analysis.get('precedent_strength', 'medium')
        risk_factors['precedent_risk'] = {'strong': 2.0, 'medium': 5.0, 'weak': 8.0}.get(precedent_strength, 5.0)
        
        return risk_factors

    async def _estimate_potential_damages(self, case_data: Dict[str, Any],
                                        precedent_analysis: Dict[str, Any]) -> Dict[str, float]:
        """Estimate potential damages and costs"""
        estimates = {}
        
        # Base claim amount
        claim_amount = case_data.get('claim_amount', 0)
        estimates['claimed_amount'] = claim_amount
        
        # Legal costs estimate
        case_complexity = case_data.get('case_type', 'general')
        complexity_multipliers = {
            'contract_dispute': 0.15,
            'employment': 0.20,
            'intellectual_property': 0.30,
            'tort': 0.18,
            'regulatory': 0.25,
            'shareholder': 0.35,
            'product_liability': 0.28
        }
        
        base_legal_cost = 50000  # Base legal cost
        complexity_factor = complexity_multipliers.get(case_complexity, 0.20)
        estimates['legal_costs'] = base_legal_cost + (claim_amount * complexity_factor)
        
        # Settlement estimate (typically 30-70% of claim)
        precedent_strength = precedent_analysis.get('precedent_strength', 'medium')
        settlement_factors = {'strong': 0.3, 'medium': 0.5, 'weak': 0.7}
        estimates['settlement_estimate'] = claim_amount * settlement_factors.get(precedent_strength, 0.5)
        
        # Total potential exposure
        estimates['total_exposure'] = estimates['settlement_estimate'] + estimates['legal_costs']
        
        # Best case (win completely)
        estimates['best_case'] = estimates['legal_costs'] * 0.5  # Only partial legal costs
        
        # Worst case (lose completely)
        estimates['worst_case'] = claim_amount + estimates['legal_costs'] * 1.5
        
        return estimates

    async def _generate_litigation_strategy(self, case_data: Dict[str, Any],
                                          case_merits: Dict[str, Any],
                                          precedent_analysis: Dict[str, Any],
                                          risk_factors: Dict[str, float]) -> List[str]:
        """Generate litigation strategy recommendations"""
        strategies = []
        
        # Overall merit assessment
        merit_score = case_merits.get('overall_merit_score', 5)
        
        if merit_score >= 7:
            strategies.append('Strong case merits - proceed with confidence')
            strategies.append('Consider early motion for summary judgment')
        elif merit_score <= 3:
            strategies.append('Weak case merits - explore settlement options')
            strategies.append('Consider alternative dispute resolution')
        else:
            strategies.append('Mixed case merits - prepare for protracted litigation')
        
        # Precedent-based strategy
        precedent_strength = precedent_analysis.get('precedent_strength', 'medium')
        if precedent_strength == 'strong':
            strategies.append('Leverage favorable precedents in motion practice')
        elif precedent_strength == 'weak':
            strategies.append('Distinguish unfavorable precedents or seek new jurisdiction')
        
        # Risk-based strategy
        financial_risk = risk_factors.get('financial_exposure', 5.0)
        if financial_risk >= 8.0:
            strategies.append('High financial exposure - prioritize settlement negotiations')
            strategies.append('Consider litigation funding or insurance options')
        
        # Case type specific strategies
        case_type = case_data.get('case_type', 'general')
        if case_type == 'contract_dispute':
            strategies.append('Focus on contract interpretation and performance')
        elif case_type == 'employment':
            strategies.append('Review personnel files and employment practices')
        elif case_type == 'intellectual_property':
            strategies.append('Conduct prior art search and validity analysis')
        
        return strategies

    def _calculate_overall_litigation_risk(self, risk_factors: Dict[str, float],
                                         damage_estimates: Dict[str, float]) -> float:
        """Calculate overall litigation risk score"""
        # Weight different risk factors
        weights = {
            'financial_exposure': 0.3,
            'opposing_resources': 0.2,
            'case_complexity': 0.2,
            'precedent_risk': 0.3
        }
        
        weighted_score = 0
        for factor, score in risk_factors.items():
            weight = weights.get(factor, 0.1)
            weighted_score += score * weight
        
        # Adjust for financial impact
        total_exposure = damage_estimates.get('total_exposure', 0)
        if total_exposure > 5000000:  # $5M+
            weighted_score *= 1.2
        elif total_exposure > 1000000:  # $1M+
            weighted_score *= 1.1
        
        return min(10.0, weighted_score)

    def _categorize_risk_level(self, risk_score: float) -> LegalRisk:
        """Categorize risk level based on score"""
        if risk_score >= 8.0:
            return LegalRisk.CRITICAL
        elif risk_score >= 6.0:
            return LegalRisk.HIGH
        elif risk_score >= 4.0:
            return LegalRisk.MEDIUM
        else:
            return LegalRisk.LOW

    def _generate_legal_report_recommendations(self, analyses: List[LegalAnalysis],
                                             contracts: List[ContractReview],
                                             regulatory: List[RegulatoryCheck]) -> List[str]:
        """Generate recommendations for legal report"""
        recommendations = []
        
        # Analysis-based recommendations
        if analyses:
            critical_violations = len([a for a in analyses if a.compliance_level == ComplianceLevel.CRITICAL_VIOLATION])
            if critical_violations > 0:
                recommendations.append(f"Address {critical_violations} critical compliance violations immediately")
            
            avg_confidence = sum(a.confidence_score for a in analyses) / len(analyses)
            if avg_confidence < 0.7:
                recommendations.append("Low confidence scores indicate need for additional legal review")
        
        # Contract-based recommendations
        if contracts:
            rejected_contracts = len([c for c in contracts if c.approval_status == 'rejected'])
            if rejected_contracts > 0:
                recommendations.append(f"Review and revise {rejected_contracts} rejected contracts")
        
        # Regulatory recommendations
        if regulatory:
            pending_remediation = len([r for r in regulatory if r.compliance_gaps])
            if pending_remediation > 0:
                recommendations.append(f"Complete remediation for {pending_remediation} compliance gaps")
        
        # General recommendations
        recommendations.append("Schedule quarterly compliance review")
        recommendations.append("Update legal training materials based on recent findings")
        
        return recommendations

    def _group_contracts_by_type(self, contracts: List[ContractReview]) -> Dict[str, int]:
        """Group contracts by type for reporting"""
        contract_types = {}
        for contract in contracts:
            contract_type = contract.contract_type
            contract_types[contract_type] = contract_types.get(contract_type, 0) + 1
        return contract_types

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get all available tools including inherited core tools"""
        verdict_tools = [
            {
                'name': 'verdict_analyze_document',
                'description': 'Perform comprehensive legal analysis of a document',
                'parameters': {
                    'document_content': 'string - The document content to analyze',
                    'document_type': 'string - Type of document (contract, policy, agreement, etc.)'
                }
            },
            {
                'name': 'verdict_review_contract',
                'description': 'Perform comprehensive contract review and analysis',
                'parameters': {
                    'contract_content': 'string - The contract content to review',
                    'contract_type': 'string - Type of contract (service_agreement, employment, etc.)'
                }
            },
            {
                'name': 'verdict_check_regulatory_compliance',
                'description': 'Check regulatory compliance for business operations',
                'parameters': {
                    'business_data': 'dict - Business operation data to check',
                    'industry': 'string - Industry type for relevant regulations'
                }
            },
            {
                'name': 'verdict_assess_litigation_risk',
                'description': 'Assess litigation risk based on case data and precedents',
                'parameters': {
                    'case_data': 'dict - Case data and details for risk assessment'
                }
            },
            {
                'name': 'verdict_generate_legal_report',
                'description': 'Generate comprehensive legal and compliance report',
                'parameters': {
                    'time_period_hours': 'int - Time period in hours for the report (default 24)'
                }
            }
        ]
        
        # Combine with inherited core tools
        core_tools = super().get_available_tools()
        return core_tools + verdict_tools

    async def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """Execute a tool by name with given parameters"""
        # First try Verdict-specific tools
        if hasattr(self, tool_name):
            method = getattr(self, tool_name)
            if callable(method):
                return await method(**kwargs)
        
        # Fall back to core tools
        return await super().execute_tool(tool_name, **kwargs)

# =============================================================================
# STANDALONE EXECUTION
# =============================================================================

async def main():
    """Demo Verdict Agent functionality"""
    
    config = {
        'compliance_threshold': 0.8,
        'risk_tolerance': 'medium',
        'auto_approve_threshold': 0.95
    }
    
    verdict = VerdictAgentEnhanced(config)
    print("⚖️ Verdict Agent - Legal & Compliance")
    print("=" * 50)
    
    # Demo 1: Document Analysis
    print("\n1. 📄 Legal Document Analysis")
    test_contract = """
    Service Agreement
    Term: 12 months with automatic renewal
    Payment: Monthly fee of $10,000
    Termination: Either party may terminate with 30 days notice
    Governing Law: State of California
    The Service Provider agrees to indemnify the Client against all claims.
    """
    
    analysis_result = await verdict.verdict_analyze_document(test_contract, 'contract')
    print(f"Compliance Level: {analysis_result['compliance_level']}")
    print(f"Legal Risk: {analysis_result['legal_risk']}")
    print(f"Confidence: {analysis_result.get('confidence_score', 0):.2f}")
    
    # Demo 2: Contract Review
    print("\n2. 📋 Contract Review")
    contract_result = await verdict.verdict_review_contract(test_contract, 'service_agreement')
    print(f"Approval Status: {contract_result['approval_status']}")
    print(f"Risk Factors: {len(contract_result.get('risk_factors', []))}")
    
    # Demo 3: Regulatory Compliance
    print("\n3. 🏛️ Regulatory Compliance Check")
    business_data = {
        'industry': 'fintech',
        'processes_payments': True,
        'stores_personal_data': True,
        'international_operations': True,
        'employee_count': 150
    }
    
    regulatory_result = await verdict.verdict_check_regulatory_compliance(business_data, 'financial')
    print(f"Compliance Status: {regulatory_result['compliance_status']}")
    print(f"Compliance Gaps: {len(regulatory_result.get('compliance_gaps', []))}")
    
    # Demo 4: Litigation Risk Assessment
    print("\n4. ⚡ Litigation Risk Assessment")
    case_data = {
        'case_type': 'contract_dispute',
        'claim_amount': 500000,
        'contract_clarity': 'high',
        'evidence_strength': 'medium',
        'opposing_party_resources': 'high'
    }
    
    litigation_result = await verdict.verdict_assess_litigation_risk(case_data)
    print(f"Risk Level: {litigation_result['risk_level']}")
    print(f"Risk Score: {litigation_result.get('risk_score', 0):.2f}")
    
    # Demo 5: Legal Report
    print("\n5. 📊 Legal Report Generation")
    report_result = await verdict.verdict_generate_legal_report(1)  # 1 hour
    if report_result['success']:
        report = report_result['report']
        print(f"Total Analyses: {report['legal_analysis_summary']['total_analyses']}")
        print(f"Compliance Rate: {report['legal_analysis_summary']['compliance_rate']:.1%}")
    
    print(f"\n🎯 Verdict Agent Tools: {len(verdict.get_available_tools())}")

if __name__ == "__main__":
    asyncio.run(main()) 