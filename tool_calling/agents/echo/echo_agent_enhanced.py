# ----------------------------------------------------------------------------
#  File:        echo_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Echo Agent - Insight Relay & Auditing with Real-time Processing
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
import time
from datetime import datetime, timedelta, timezone
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

class AuditStatus(Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FLAGGED = "flagged"
    REJECTED = "rejected"

class InsightPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RelayMethod(Enum):
    BROADCAST = "broadcast"
    TARGETED = "targeted"
    SECURE = "secure"
    EMERGENCY = "emergency"

@dataclass
class InsightAudit:
    """Audit record for an insight"""
    audit_id: str
    insight_hash: str
    source_agent: str
    audit_status: AuditStatus
    confidence_score: float
    risk_assessment: str
    audit_timestamp: str
    reviewer_agent: str = "echo_agent"
    audit_notes: List[str] = None
    verification_checks: Dict[str, bool] = None

@dataclass
class RelayRecord:
    """Record of insight relay operation"""
    relay_id: str
    insight_hash: str
    source_agent: str
    target_agents: List[str]
    relay_method: RelayMethod
    relay_timestamp: str
    delivery_status: Dict[str, str]
    priority: InsightPriority = InsightPriority.MEDIUM

@dataclass
class ComplianceCheck:
    """Compliance verification record"""
    check_id: str
    insight_hash: str
    compliance_rules: List[str]
    passed_checks: List[str]
    failed_checks: List[str]
    compliance_score: float
    check_timestamp: str
    recommendations: List[str] = None

class EchoAgentEnhanced(CoreTools):
    """
    Enhanced Echo - Insight Relay & Auditing Agent
    
    Responsible for:
    - Auditing all insights and decisions from other agents
    - Relaying verified insights across the agent network
    - Ensuring compliance with governance standards
    - Maintaining audit trails and verification records
    - Real-time monitoring of agent communications
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize core tools
        super().__init__("echo_agent", config)
        
        # Echo-specific configuration
        self.audit_threshold = config.get('audit_threshold', 0.7)
        self.relay_timeout = config.get('relay_timeout', 30)
        self.compliance_rules = config.get('compliance_rules', [])
        
        # Audit and relay tracking
        self.audit_records: Dict[str, InsightAudit] = {}
        self.relay_records: Dict[str, RelayRecord] = {}
        self.compliance_checks: Dict[str, ComplianceCheck] = {}
        
        # Performance metrics
        self.audit_metrics = {
            'total_audits': 0,
            'verified_insights': 0,
            'flagged_insights': 0,
            'rejected_insights': 0,
            'average_audit_time': 0.0,
            'compliance_rate': 1.0
        }
        
        # Real-time monitoring
        self.monitored_agents = set()
        self.active_relays = {}
        
        # Known compliance rules
        self.default_compliance_rules = [
            'source_verification',
            'content_integrity',
            'authorization_check',
            'privacy_protection',
            'data_classification',
            'retention_policy'
        ]

    async def __aenter__(self):
        """Async context manager entry"""
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        # Cleanup any resources if needed
        pass

    # =============================================================================
    # ECHO-SPECIFIC AUDITING TOOLS
    # =============================================================================

    async def echo_audit_insight(self, insight_data: Dict[str, Any], 
                                source_agent: str) -> Dict[str, Any]:
        """
        Audit an insight from another agent for verification and compliance
        """
        try:
            audit_start = time.time()
            
            # Generate audit ID and insight hash
            insight_content = json.dumps(insight_data, sort_keys=True)
            insight_hash = hashlib.sha256(insight_content.encode()).hexdigest()
            audit_id = f"audit_{int(time.time())}_{insight_hash[:8]}"
            
            # Perform verification checks
            verification_checks = await self._perform_verification_checks(
                insight_data, source_agent
            )
            
            # Calculate confidence score
            confidence_score = await self._calculate_confidence_score(
                insight_data, verification_checks
            )
            
            # Perform risk assessment
            risk_assessment = await self._assess_risk_level(insight_data, source_agent)
            
            # Determine audit status
            audit_status = self._determine_audit_status(confidence_score, risk_assessment)
            
            # Create audit record
            audit_record = InsightAudit(
                audit_id=audit_id,
                insight_hash=insight_hash,
                source_agent=source_agent,
                audit_status=audit_status,
                confidence_score=confidence_score,
                risk_assessment=risk_assessment,
                audit_timestamp=datetime.now(timezone.utc).isoformat(),
                audit_notes=verification_checks.get('notes', []),
                verification_checks=verification_checks.get('checks', {})
            )
            
            # Store audit record
            self.audit_records[audit_id] = audit_record
            
            # Update metrics
            self.audit_metrics['total_audits'] += 1
            if audit_status == AuditStatus.VERIFIED:
                self.audit_metrics['verified_insights'] += 1
            elif audit_status == AuditStatus.FLAGGED:
                self.audit_metrics['flagged_insights'] += 1
            elif audit_status == AuditStatus.REJECTED:
                self.audit_metrics['rejected_insights'] += 1
            
            # Update average audit time
            audit_time = time.time() - audit_start
            self.audit_metrics['average_audit_time'] = (
                self.audit_metrics['average_audit_time'] * 0.9 + audit_time * 0.1
            )
            
            # Log audit to blockchain
            await self.recall_log_insight(
                f'Insight audit completed: {audit_status.value} for {source_agent}',
                {
                    'type': 'insight_audit',
                    'audit_id': audit_id,
                    'insight_hash': insight_hash,
                    'source_agent': source_agent,
                    'audit_status': audit_status.value,
                    'confidence_score': confidence_score,
                    'risk_assessment': risk_assessment
                }
            )
            
            result = {
                'success': True,
                'audit_id': audit_id,
                'insight_hash': insight_hash,
                'audit_status': audit_status.value,
                'confidence_score': confidence_score,
                'risk_assessment': risk_assessment,
                'verification_checks': verification_checks,
                'audit_timestamp': audit_record.audit_timestamp,
                'audit_time_seconds': audit_time
            }
            
            return result
            
        except Exception as e:
            await self.security_log_risk(f"Insight audit failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'audit_status': AuditStatus.REJECTED.value
            }

    async def echo_relay_insight(self, insight_hash: str, target_agents: List[str],
                               relay_method: str = "broadcast",
                               priority: str = "medium") -> Dict[str, Any]:
        """
        Relay a verified insight to specified target agents
        """
        try:
            # Validate insight exists and is verified
            audit_record = next(
                (audit for audit in self.audit_records.values() 
                 if audit.insight_hash == insight_hash), None
            )
            
            if not audit_record:
                return {
                    'success': False,
                    'error': 'Insight not found in audit records',
                    'insight_hash': insight_hash
                }
            
            if audit_record.audit_status != AuditStatus.VERIFIED:
                return {
                    'success': False,
                    'error': f'Insight not verified (status: {audit_record.audit_status.value})',
                    'insight_hash': insight_hash
                }
            
            # Create relay record
            relay_id = f"relay_{int(time.time())}_{insight_hash[:8]}"
            relay_method_enum = RelayMethod(relay_method.lower())
            priority_enum = InsightPriority(priority.lower())
            
            relay_record = RelayRecord(
                relay_id=relay_id,
                insight_hash=insight_hash,
                source_agent=audit_record.source_agent,
                target_agents=target_agents,
                relay_method=relay_method_enum,
                relay_timestamp=datetime.now(timezone.utc).isoformat(),
                delivery_status={},
                priority=priority_enum
            )
            
            # Prepare relay message
            relay_message = await self._prepare_relay_message(
                insight_hash, audit_record, relay_method_enum, priority_enum
            )
            
            # Relay to target agents
            delivery_results = await self._relay_to_targets(
                target_agents, relay_message, relay_method_enum
            )
            
            relay_record.delivery_status = delivery_results
            self.relay_records[relay_id] = relay_record
            
            # Log relay operation
            await self.recall_log_insight(
                f'Insight relayed: {insight_hash[:12]} to {len(target_agents)} agents',
                {
                    'type': 'insight_relay',
                    'relay_id': relay_id,
                    'insight_hash': insight_hash,
                    'source_agent': audit_record.source_agent,
                    'target_agents': target_agents,
                    'relay_method': relay_method,
                    'priority': priority,
                    'delivery_status': delivery_results
                }
            )
            
            # Calculate success rate
            successful_deliveries = sum(1 for status in delivery_results.values() 
                                      if status == 'delivered')
            success_rate = successful_deliveries / len(target_agents) if target_agents else 0
            
            return {
                'success': True,
                'relay_id': relay_id,
                'insight_hash': insight_hash,
                'target_agents': target_agents,
                'delivery_status': delivery_results,
                'success_rate': success_rate,
                'relay_timestamp': relay_record.relay_timestamp
            }
            
        except Exception as e:
            await self.security_log_risk(f"Insight relay failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'insight_hash': insight_hash
            }

    async def echo_compliance_check(self, insight_data: Dict[str, Any],
                                  rules: List[str] = None) -> Dict[str, Any]:
        """
        Perform comprehensive compliance check on an insight
        """
        try:
            # Use provided rules or default
            compliance_rules = rules or self.default_compliance_rules
            
            # Generate check ID and insight hash
            insight_content = json.dumps(insight_data, sort_keys=True)
            insight_hash = hashlib.sha256(insight_content.encode()).hexdigest()
            check_id = f"compliance_{int(time.time())}_{insight_hash[:8]}"
            
            # Perform compliance checks
            check_results = await self._perform_compliance_checks(
                insight_data, compliance_rules
            )
            
            passed_checks = [rule for rule, passed in check_results.items() if passed]
            failed_checks = [rule for rule, passed in check_results.items() if not passed]
            
            # Calculate compliance score
            compliance_score = len(passed_checks) / len(compliance_rules) if compliance_rules else 1.0
            
            # Generate recommendations
            recommendations = await self._generate_compliance_recommendations(
                failed_checks, insight_data
            )
            
            # Create compliance check record
            compliance_check = ComplianceCheck(
                check_id=check_id,
                insight_hash=insight_hash,
                compliance_rules=compliance_rules,
                passed_checks=passed_checks,
                failed_checks=failed_checks,
                compliance_score=compliance_score,
                check_timestamp=datetime.now(timezone.utc).isoformat(),
                recommendations=recommendations
            )
            
            self.compliance_checks[check_id] = compliance_check
            
            # Update compliance rate
            self.audit_metrics['compliance_rate'] = (
                self.audit_metrics['compliance_rate'] * 0.9 + compliance_score * 0.1
            )
            
            # Log compliance check
            await self.recall_log_insight(
                f'Compliance check completed: {compliance_score:.2%} compliance',
                {
                    'type': 'compliance_check',
                    'check_id': check_id,
                    'insight_hash': insight_hash,
                    'compliance_score': compliance_score,
                    'passed_checks': passed_checks,
                    'failed_checks': failed_checks,
                    'recommendations': recommendations
                }
            )
            
            return {
                'success': True,
                'check_id': check_id,
                'insight_hash': insight_hash,
                'compliance_score': compliance_score,
                'passed_checks': passed_checks,
                'failed_checks': failed_checks,
                'recommendations': recommendations,
                'is_compliant': compliance_score >= self.audit_threshold,
                'check_timestamp': compliance_check.check_timestamp
            }
            
        except Exception as e:
            await self.security_log_risk(f"Compliance check failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'is_compliant': False
            }

    async def echo_monitor_agents(self, agent_ids: List[str]) -> Dict[str, Any]:
        """
        Start real-time monitoring of specified agents
        """
        try:
            # Add agents to monitoring set
            self.monitored_agents.update(agent_ids)
            
            # Initialize monitoring for each agent
            monitoring_results = {}
            for agent_id in agent_ids:
                try:
                    # Test communication with agent
                    response = await self.tools_call_agent(
                        agent_id,
                        "Echo monitoring - please confirm communication and current status"
                    )
                    
                    if response.get('success'):
                        monitoring_results[agent_id] = {
                            'status': 'monitored',
                            'last_contact': datetime.now(timezone.utc).isoformat(),
                            'response': response
                        }
                    else:
                        monitoring_results[agent_id] = {
                            'status': 'unreachable',
                            'error': response.get('error', 'No response')
                        }
                        
                except Exception as e:
                    monitoring_results[agent_id] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            # Log monitoring start
            await self.recall_log_insight(
                f'Agent monitoring started for {len(agent_ids)} agents',
                {
                    'type': 'monitoring_start',
                    'monitored_agents': agent_ids,
                    'monitoring_results': monitoring_results
                }
            )
            
            return {
                'success': True,
                'monitored_agents': list(self.monitored_agents),
                'monitoring_results': monitoring_results,
                'total_monitored': len(self.monitored_agents)
            }
            
        except Exception as e:
            await self.security_log_risk(f"Agent monitoring failed: {e}", "high")
            return {
                'success': False,
                'error': str(e)
            }

    async def echo_generate_audit_report(self, time_period_hours: int = 24) -> Dict[str, Any]:
        """
        Generate comprehensive audit report for specified time period
        """
        try:
            # Calculate time range
            end_time = datetime.now(timezone.utc)
            start_time = end_time - timedelta(hours=time_period_hours)
            
            # Filter records by time period
            recent_audits = [
                audit for audit in self.audit_records.values()
                if datetime.fromisoformat(audit.audit_timestamp) >= start_time
            ]
            
            recent_relays = [
                relay for relay in self.relay_records.values()
                if datetime.fromisoformat(relay.relay_timestamp) >= start_time
            ]
            
            recent_compliance = [
                check for check in self.compliance_checks.values()
                if datetime.fromisoformat(check.check_timestamp) >= start_time
            ]
            
            # Calculate statistics
            total_audits = len(recent_audits)
            verified_count = len([a for a in recent_audits if a.audit_status == AuditStatus.VERIFIED])
            flagged_count = len([a for a in recent_audits if a.audit_status == AuditStatus.FLAGGED])
            rejected_count = len([a for a in recent_audits if a.audit_status == AuditStatus.REJECTED])
            
            verification_rate = verified_count / total_audits if total_audits > 0 else 0
            
            # Agent activity analysis
            agent_activity = {}
            for audit in recent_audits:
                agent = audit.source_agent
                if agent not in agent_activity:
                    agent_activity[agent] = {
                        'total_insights': 0,
                        'verified': 0,
                        'flagged': 0,
                        'rejected': 0
                    }
                agent_activity[agent]['total_insights'] += 1
                if audit.audit_status == AuditStatus.VERIFIED:
                    agent_activity[agent]['verified'] += 1
                elif audit.audit_status == AuditStatus.FLAGGED:
                    agent_activity[agent]['flagged'] += 1
                elif audit.audit_status == AuditStatus.REJECTED:
                    agent_activity[agent]['rejected'] += 1
            
            # Compliance analysis
            avg_compliance = sum(c.compliance_score for c in recent_compliance) / len(recent_compliance) if recent_compliance else 1.0
            
            # Risk analysis
            risk_distribution = {}
            for audit in recent_audits:
                risk = audit.risk_assessment
                risk_distribution[risk] = risk_distribution.get(risk, 0) + 1
            
            # Generate report
            report = {
                'report_id': f"audit_report_{int(time.time())}",
                'time_period': {
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'hours': time_period_hours
                },
                'audit_summary': {
                    'total_audits': total_audits,
                    'verified_insights': verified_count,
                    'flagged_insights': flagged_count,
                    'rejected_insights': rejected_count,
                    'verification_rate': verification_rate,
                    'average_audit_time': self.audit_metrics['average_audit_time']
                },
                'relay_summary': {
                    'total_relays': len(recent_relays),
                    'successful_relays': len([r for r in recent_relays if all(
                        status == 'delivered' for status in r.delivery_status.values()
                    )])
                },
                'compliance_summary': {
                    'total_checks': len(recent_compliance),
                    'average_compliance_score': avg_compliance,
                    'compliant_insights': len([c for c in recent_compliance if c.compliance_score >= self.audit_threshold])
                },
                'agent_activity': agent_activity,
                'risk_distribution': risk_distribution,
                'recommendations': self._generate_audit_recommendations(
                    recent_audits, recent_relays, recent_compliance
                ),
                'system_metrics': self.audit_metrics.copy(),
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Log report generation
            await self.recall_log_insight(
                f'Audit report generated for {time_period_hours}h period',
                {
                    'type': 'audit_report',
                    'report_id': report['report_id'],
                    'time_period_hours': time_period_hours,
                    'total_audits': total_audits,
                    'verification_rate': verification_rate
                }
            )
            
            return {
                'success': True,
                'report': report
            }
            
        except Exception as e:
            await self.security_log_risk(f"Audit report generation failed: {e}", "high")
            return {
                'success': False,
                'error': str(e)
            }

    # =============================================================================
    # HELPER METHODS
    # =============================================================================

    async def _perform_verification_checks(self, insight_data: Dict[str, Any], 
                                         source_agent: str) -> Dict[str, Any]:
        """Perform verification checks on insight data"""
        checks = {}
        notes = []
        
        # Source agent verification
        if source_agent in ['beacon_agent', 'theory_agent', 'core_agent']:
            checks['trusted_source'] = True
        else:
            checks['trusted_source'] = False
            notes.append(f"Unknown source agent: {source_agent}")
        
        # Content integrity check
        required_fields = ['topic', 'summary', 'timestamp']
        checks['content_integrity'] = all(field in insight_data for field in required_fields)
        if not checks['content_integrity']:
            missing = [f for f in required_fields if f not in insight_data]
            notes.append(f"Missing required fields: {missing}")
        
        # Timestamp validation
        if 'timestamp' in insight_data:
            try:
                insight_time = datetime.fromisoformat(insight_data['timestamp'])
                age_hours = (datetime.now(timezone.utc) - insight_time).total_seconds() / 3600
                checks['timestamp_valid'] = age_hours <= 24  # Must be less than 24 hours old
                if not checks['timestamp_valid']:
                    notes.append(f"Insight too old: {age_hours:.1f} hours")
            except:
                checks['timestamp_valid'] = False
                notes.append("Invalid timestamp format")
        else:
            checks['timestamp_valid'] = False
        
        # Data size check
        insight_size = len(json.dumps(insight_data))
        checks['reasonable_size'] = insight_size <= 50000  # 50KB limit
        if not checks['reasonable_size']:
            notes.append(f"Insight too large: {insight_size} bytes")
        
        # Security content scan
        content_str = json.dumps(insight_data).lower()
        security_flags = ['password', 'secret', 'private_key', 'token']
        checks['security_scan'] = not any(flag in content_str for flag in security_flags)
        if not checks['security_scan']:
            notes.append("Security-sensitive content detected")
        
        return {'checks': checks, 'notes': notes}

    async def _calculate_confidence_score(self, insight_data: Dict[str, Any],
                                        verification_checks: Dict[str, Any]) -> float:
        """Calculate confidence score based on verification results"""
        checks = verification_checks.get('checks', {})
        
        # Base score from verification checks
        passed_checks = sum(1 for passed in checks.values() if passed)
        total_checks = len(checks)
        base_score = passed_checks / total_checks if total_checks > 0 else 0
        
        # Bonus for source reliability
        if 'sources' in insight_data and isinstance(insight_data['sources'], list):
            source_bonus = min(len(insight_data['sources']) * 0.1, 0.3)  # Up to 30% bonus
        else:
            source_bonus = 0
        
        # Penalty for missing critical information
        if 'summary' not in insight_data or len(insight_data.get('summary', '')) < 10:
            summary_penalty = 0.2
        else:
            summary_penalty = 0
        
        final_score = min(1.0, max(0.0, base_score + source_bonus - summary_penalty))
        return final_score

    async def _assess_risk_level(self, insight_data: Dict[str, Any], source_agent: str) -> str:
        """Assess risk level of the insight"""
        risk_factors = 0
        
        # Source agent risk
        if source_agent not in ['beacon_agent', 'theory_agent', 'core_agent']:
            risk_factors += 1
        
        # Content risk indicators
        content_str = json.dumps(insight_data).lower()
        high_risk_terms = ['error', 'fail', 'critical', 'urgent', 'security', 'breach']
        risk_factors += sum(1 for term in high_risk_terms if term in content_str)
        
        # Size risk
        if len(json.dumps(insight_data)) > 20000:
            risk_factors += 1
        
        # Age risk
        if 'timestamp' in insight_data:
            try:
                insight_time = datetime.fromisoformat(insight_data['timestamp'])
                age_hours = (datetime.now(timezone.utc) - insight_time).total_seconds() / 3600
                if age_hours > 12:
                    risk_factors += 1
            except:
                risk_factors += 1
        
        # Determine risk level
        if risk_factors >= 3:
            return "high"
        elif risk_factors >= 2:
            return "medium"
        else:
            return "low"

    def _determine_audit_status(self, confidence_score: float, risk_assessment: str) -> AuditStatus:
        """Determine audit status based on confidence and risk"""
        if confidence_score >= self.audit_threshold:
            if risk_assessment == "low":
                return AuditStatus.VERIFIED
            elif risk_assessment == "medium":
                return AuditStatus.FLAGGED if confidence_score < 0.9 else AuditStatus.VERIFIED
            else:  # high risk
                return AuditStatus.FLAGGED
        else:
            return AuditStatus.REJECTED

    async def _perform_compliance_checks(self, insight_data: Dict[str, Any],
                                       compliance_rules: List[str]) -> Dict[str, bool]:
        """Perform compliance checks against specified rules"""
        results = {}
        
        for rule in compliance_rules:
            if rule == 'source_verification':
                results[rule] = 'source' in insight_data or 'agent_id' in insight_data
            elif rule == 'content_integrity':
                results[rule] = all(key in insight_data for key in ['topic', 'summary'])
            elif rule == 'authorization_check':
                results[rule] = 'authorized' in insight_data or 'signature' in insight_data
            elif rule == 'privacy_protection':
                content = json.dumps(insight_data).lower()
                privacy_terms = ['ssn', 'credit_card', 'password', 'private']
                results[rule] = not any(term in content for term in privacy_terms)
            elif rule == 'data_classification':
                results[rule] = 'classification' in insight_data or 'sensitivity' in insight_data
            elif rule == 'retention_policy':
                results[rule] = 'timestamp' in insight_data
            else:
                results[rule] = True  # Unknown rules pass by default
        
        return results

    async def _generate_compliance_recommendations(self, failed_checks: List[str],
                                                 insight_data: Dict[str, Any]) -> List[str]:
        """Generate recommendations for failed compliance checks"""
        recommendations = []
        
        for check in failed_checks:
            if check == 'source_verification':
                recommendations.append("Add source attribution or agent identification")
            elif check == 'content_integrity':
                recommendations.append("Ensure topic and summary fields are present")
            elif check == 'authorization_check':
                recommendations.append("Include authorization or signature verification")
            elif check == 'privacy_protection':
                recommendations.append("Remove or redact sensitive personal information")
            elif check == 'data_classification':
                recommendations.append("Add data classification or sensitivity level")
            elif check == 'retention_policy':
                recommendations.append("Include timestamp for retention tracking")
        
        return recommendations

    async def _prepare_relay_message(self, insight_hash: str, audit_record: InsightAudit,
                                   relay_method: RelayMethod, priority: InsightPriority) -> Dict[str, Any]:
        """Prepare message for insight relay"""
        message = {
            'relay_type': 'insight_delivery',
            'insight_hash': insight_hash,
            'source_agent': audit_record.source_agent,
            'audit_status': audit_record.audit_status.value,
            'confidence_score': audit_record.confidence_score,
            'risk_assessment': audit_record.risk_assessment,
            'relay_method': relay_method.value,
            'priority': priority.value,
            'relay_timestamp': datetime.now(timezone.utc).isoformat(),
            'echo_signature': await self._sign_relay_message(insight_hash)
        }
        
        return message

    async def _relay_to_targets(self, target_agents: List[str], message: Dict[str, Any],
                              relay_method: RelayMethod) -> Dict[str, str]:
        """Relay message to target agents"""
        delivery_results = {}
        
        for agent_id in target_agents:
            try:
                if relay_method == RelayMethod.EMERGENCY:
                    relay_task = f"🚨 EMERGENCY RELAY: {json.dumps(message)}"
                elif relay_method == RelayMethod.SECURE:
                    relay_task = f"🔒 SECURE RELAY: {json.dumps(message)}"
                else:
                    relay_task = f"📡 INSIGHT RELAY: {json.dumps(message)}"
                
                response = await self.tools_call_agent(agent_id, relay_task)
                
                if response.get('success'):
                    delivery_results[agent_id] = 'delivered'
                else:
                    delivery_results[agent_id] = f"failed: {response.get('error', 'unknown')}"
                    
            except Exception as e:
                delivery_results[agent_id] = f"error: {str(e)}"
        
        return delivery_results

    async def _sign_relay_message(self, insight_hash: str) -> str:
        """Generate signature for relay message"""
        signature_content = f"echo_relay_{insight_hash}_{datetime.now(timezone.utc).isoformat()}"
        return self._sign_content(signature_content)

    def _generate_audit_recommendations(self, audits: List[InsightAudit],
                                      relays: List[RelayRecord],
                                      compliance: List[ComplianceCheck]) -> List[str]:
        """Generate recommendations based on audit analysis"""
        recommendations = []
        
        if audits:
            verification_rate = len([a for a in audits if a.audit_status == AuditStatus.VERIFIED]) / len(audits)
            if verification_rate < 0.8:
                recommendations.append(f"Low verification rate ({verification_rate:.1%}) - review agent training")
        
        if compliance:
            avg_compliance = sum(c.compliance_score for c in compliance) / len(compliance)
            if avg_compliance < 0.9:
                recommendations.append(f"Compliance score below target ({avg_compliance:.1%}) - review policies")
        
        # Agent-specific recommendations
        agent_issues = {}
        for audit in audits:
            if audit.audit_status in [AuditStatus.FLAGGED, AuditStatus.REJECTED]:
                agent = audit.source_agent
                agent_issues[agent] = agent_issues.get(agent, 0) + 1
        
        for agent, issues in agent_issues.items():
            if issues > 2:
                recommendations.append(f"Agent {agent} has {issues} audit issues - needs review")
        
        return recommendations

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get all available tools including inherited core tools"""
        echo_tools = [
            {
                'name': 'echo_audit_insight',
                'description': 'Audit an insight from another agent for verification and compliance',
                'parameters': {
                    'insight_data': 'dict - The insight data to audit',
                    'source_agent': 'string - The agent that created the insight'
                }
            },
            {
                'name': 'echo_relay_insight',
                'description': 'Relay a verified insight to specified target agents',
                'parameters': {
                    'insight_hash': 'string - Hash of the insight to relay',
                    'target_agents': 'list - List of target agent IDs',
                    'relay_method': 'string - Relay method (broadcast, targeted, secure, emergency)',
                    'priority': 'string - Priority level (low, medium, high, critical)'
                }
            },
            {
                'name': 'echo_compliance_check',
                'description': 'Perform comprehensive compliance check on an insight',
                'parameters': {
                    'insight_data': 'dict - The insight data to check',
                    'rules': 'list - Optional list of compliance rules to check'
                }
            },
            {
                'name': 'echo_monitor_agents',
                'description': 'Start real-time monitoring of specified agents',
                'parameters': {
                    'agent_ids': 'list - List of agent IDs to monitor'
                }
            },
            {
                'name': 'echo_generate_audit_report',
                'description': 'Generate comprehensive audit report for specified time period',
                'parameters': {
                    'time_period_hours': 'int - Time period in hours for the report (default 24)'
                }
            }
        ]
        
        # Combine with inherited core tools
        core_tools = super().get_available_tools()
        return core_tools + echo_tools

    async def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """Execute a tool by name with given parameters"""
        # First try Echo-specific tools
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
    """Demo Echo Agent functionality"""
    
    config = {
        'audit_threshold': 0.7,
        'relay_timeout': 30,
        'compliance_rules': [
            'source_verification',
            'content_integrity',
            'privacy_protection'
        ]
    }
    
    echo = EchoAgentEnhanced(config)
    print("🔍 Echo Agent - Insight Relay & Auditing")
    print("=" * 50)
    
    # Demo 1: Insight Audit
    print("\n1. 🔍 Insight Audit")
    test_insight = {
        'topic': 'blockchain_performance',
        'summary': 'System running at optimal performance with 99.9% uptime',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'sources': ['system_monitor', 'performance_metrics'],
        'agent_id': 'beacon_agent'
    }
    
    audit_result = await echo.echo_audit_insight(test_insight, 'beacon_agent')
    print(f"Audit Status: {audit_result['audit_status']}")
    print(f"Confidence: {audit_result.get('confidence_score', 0):.2f}")
    print(f"Risk Level: {audit_result.get('risk_assessment', 'unknown')}")
    
    # Demo 2: Compliance Check
    print("\n2. ✅ Compliance Check")
    compliance_result = await echo.echo_compliance_check(test_insight)
    print(f"Compliance Score: {compliance_result.get('compliance_score', 0):.2%}")
    print(f"Is Compliant: {compliance_result.get('is_compliant', False)}")
    
    # Demo 3: Insight Relay
    if audit_result.get('audit_status') == 'verified':
        print("\n3. 📡 Insight Relay")
        relay_result = await echo.echo_relay_insight(
            audit_result['insight_hash'],
            ['theory_agent', 'core_agent'],
            'broadcast',
            'medium'
        )
        print(f"Relay Success: {relay_result['success']}")
        print(f"Success Rate: {relay_result.get('success_rate', 0):.1%}")
    
    # Demo 4: Agent Monitoring
    print("\n4. 👀 Agent Monitoring")
    monitor_result = await echo.echo_monitor_agents(['beacon_agent', 'theory_agent'])
    print(f"Monitoring Agents: {monitor_result.get('total_monitored', 0)}")
    
    # Demo 5: Audit Report
    print("\n5. 📊 Audit Report")
    report_result = await echo.echo_generate_audit_report(1)  # 1 hour
    if report_result['success']:
        report = report_result['report']
        print(f"Total Audits: {report['audit_summary']['total_audits']}")
        print(f"Verification Rate: {report['audit_summary']['verification_rate']:.1%}")
    
    print(f"\n🎯 Echo Agent Tools: {len(echo.get_available_tools())}")

if __name__ == "__main__":
    asyncio.run(main()) 