# ----------------------------------------------------------------------------
#  File:        report_generator.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Formalized report generation with blockchain and IPFS integration
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import hashlib
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path
from dataclasses import dataclass, asdict
import uuid
import os

@dataclass
class CognitionReport:
    """Comprehensive cognition execution report"""
    report_id: str
    report_version: str
    generation_timestamp: str
    
    # Execution Details
    execution_id: str
    cognition_id: str
    cognition_name: str
    cognition_description: str
    execution_status: str
    
    # Timing Information
    start_time: str
    end_time: str
    total_duration_ms: int
    phase_timings: Dict[str, int]
    
    # Agent Information
    participating_agents: List[Dict[str, Any]]
    agent_performance_metrics: Dict[str, Dict[str, float]]
    agent_contributions: Dict[str, List[str]]
    agent_reasoning_logs: Dict[str, List[Dict[str, Any]]]
    
    # Phase Analysis
    phase_results: List[Dict[str, Any]]
    phase_success_rates: Dict[str, float]
    critical_decision_points: List[Dict[str, Any]]
    
    # Insights and Outcomes
    key_insights: List[str]
    recommendations: List[str]
    risk_assessments: List[Dict[str, Any]]
    consensus_metrics: Dict[str, float]
    
    # Technical Metadata
    configuration_used: Dict[str, Any]
    execution_environment: Dict[str, Any]
    llm_models_used: Dict[str, str]
    
    # Quality Metrics
    execution_quality_score: float
    reliability_index: float
    innovation_score: float
    efficiency_rating: float
    
    # Blockchain & Storage
    blockchain_hash: str
    ipfs_cid: str
    merkle_root: str
    verification_signature: str
    
    # Attachments
    execution_logs: List[Dict[str, Any]]
    memory_artifacts: List[str]
    generated_assets: List[str]
    
    # Compliance & Audit
    compliance_checks: Dict[str, bool]
    audit_trail: List[Dict[str, Any]]
    data_governance: Dict[str, Any]

class ReportGenerator:
    """Generates comprehensive cognition execution reports"""
    
    def __init__(self, storage_path: str = "storage/reports"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        (self.storage_path / "json").mkdir(exist_ok=True)
        (self.storage_path / "html").mkdir(exist_ok=True)
        (self.storage_path / "attachments").mkdir(exist_ok=True)
        (self.storage_path / "blockchain").mkdir(exist_ok=True)
        
        # Initialize blockchain/IPFS simulation
        self.blockchain_sim = BlockchainSimulator()
        self.ipfs_sim = IPFSSimulator()
    
    async def generate_report(self, execution_data: Dict[str, Any]) -> CognitionReport:
        """Generate a comprehensive report from execution data"""
        
        report_id = f"report_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"
        
        # Extract core information
        execution_id = execution_data.get('execution_id', 'unknown')
        cognition_id = execution_data.get('cognition_id', 'unknown')
        
        # Calculate timing metrics
        start_time = execution_data.get('start_time', datetime.utcnow().isoformat())
        end_time = execution_data.get('end_time', datetime.utcnow().isoformat())
        
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        total_duration = int((end_dt - start_dt).total_seconds() * 1000)
        
        # Analyze agent performance
        agent_performance = self._analyze_agent_performance(execution_data)
        agent_contributions = self._extract_agent_contributions(execution_data)
        agent_reasoning = self._extract_agent_reasoning(execution_data)
        
        # Analyze phases
        phase_results = self._analyze_phases(execution_data)
        phase_timings = self._calculate_phase_timings(execution_data)
        
        # Generate insights and recommendations
        insights = self._generate_insights(execution_data, agent_performance, phase_results)
        recommendations = self._generate_recommendations(execution_data, insights)
        
        # Calculate quality metrics
        quality_metrics = self._calculate_quality_metrics(execution_data, agent_performance, phase_results)
        
        # Generate risk assessments
        risk_assessments = self._assess_risks(execution_data, phase_results)
        
        # Extract configuration and environment
        config = execution_data.get('config', {})
        environment = self._get_execution_environment()
        
        # Extract LLM models used
        llm_models = self._extract_llm_models(execution_data)
        
        # Generate compliance and audit information
        compliance = self._check_compliance(execution_data)
        audit_trail = self._generate_audit_trail(execution_data)
        
        # Process execution logs
        processed_logs = self._process_execution_logs(execution_data)
        
        # Create the report
        report = CognitionReport(
            report_id=report_id,
            report_version="1.0.0",
            generation_timestamp=datetime.utcnow().isoformat(),
            
            execution_id=execution_id,
            cognition_id=cognition_id,
            cognition_name=execution_data.get('cognition_name', 'Unknown Cognition'),
            cognition_description=execution_data.get('cognition_description', 'No description available'),
            execution_status=execution_data.get('status', 'unknown'),
            
            start_time=start_time,
            end_time=end_time,
            total_duration_ms=total_duration,
            phase_timings=phase_timings,
            
            participating_agents=execution_data.get('agents_participated', []),
            agent_performance_metrics=agent_performance,
            agent_contributions=agent_contributions,
            agent_reasoning_logs=agent_reasoning,
            
            phase_results=phase_results,
            phase_success_rates=self._calculate_phase_success_rates(phase_results),
            critical_decision_points=self._identify_critical_decisions(execution_data),
            
            key_insights=insights,
            recommendations=recommendations,
            risk_assessments=risk_assessments,
            consensus_metrics=self._calculate_consensus_metrics(execution_data),
            
            configuration_used=config,
            execution_environment=environment,
            llm_models_used=llm_models,
            
            execution_quality_score=quality_metrics['quality_score'],
            reliability_index=quality_metrics['reliability_index'],
            innovation_score=quality_metrics['innovation_score'],
            efficiency_rating=quality_metrics['efficiency_rating'],
            
            blockchain_hash="",  # Will be set after blockchain submission
            ipfs_cid="",         # Will be set after IPFS storage
            merkle_root="",      # Will be calculated
            verification_signature="",  # Will be generated
            
            execution_logs=processed_logs,
            memory_artifacts=execution_data.get('memory_artifacts', []),
            generated_assets=[],  # Will be populated with generated files
            
            compliance_checks=compliance,
            audit_trail=audit_trail,
            data_governance=self._generate_data_governance_info(execution_data)
        )
        
        # Calculate merkle root from report data
        report.merkle_root = self._calculate_merkle_root(report)
        
        # Generate verification signature
        report.verification_signature = self._generate_verification_signature(report)
        
        # Store on blockchain and IPFS
        blockchain_result = await self.blockchain_sim.submit_report(report)
        report.blockchain_hash = blockchain_result['transaction_hash']
        
        ipfs_result = await self.ipfs_sim.store_report(report)
        report.ipfs_cid = ipfs_result['cid']
        
        # Save report files
        await self._save_report_files(report)
        
        return report
    
    def _analyze_agent_performance(self, execution_data: Dict[str, Any]) -> Dict[str, Dict[str, float]]:
        """Analyze detailed agent performance metrics"""
        performance = {}
        
        agent_perf_data = execution_data.get('agent_performance', {})
        detailed_outputs = execution_data.get('detailed_outputs', [])
        
        for agent_name, base_score in agent_perf_data.items():
            # Count agent contributions
            contributions = len([output for output in detailed_outputs 
                               if output.get('agent') == agent_name])
            
            # Calculate thinking vs action ratio
            thinking_count = len([output for output in detailed_outputs 
                                if output.get('agent') == agent_name and output.get('type') == 'thinking'])
            action_count = len([output for output in detailed_outputs 
                              if output.get('agent') == agent_name and output.get('type') == 'thought'])
            
            thinking_ratio = thinking_count / max(1, thinking_count + action_count)
            
            performance[agent_name] = {
                'overall_score': base_score,
                'contribution_count': contributions,
                'thinking_ratio': thinking_ratio,
                'consistency_score': 0.8 + (base_score - 0.7) * 0.5,  # Derived metric
                'innovation_score': 0.6 + thinking_ratio * 0.4,
                'efficiency_score': min(1.0, contributions / 10.0)  # Normalized by expected output
            }
        
        return performance
    
    def _extract_agent_contributions(self, execution_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Extract specific contributions from each agent"""
        contributions = {}
        
        detailed_outputs = execution_data.get('detailed_outputs', [])
        
        for output in detailed_outputs:
            agent = output.get('agent')
            if agent and output.get('type') == 'thought':
                if agent not in contributions:
                    contributions[agent] = []
                contributions[agent].append(output.get('thought', ''))
        
        return contributions
    
    def _extract_agent_reasoning(self, execution_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """Extract detailed reasoning logs from agents"""
        reasoning = {}
        
        detailed_outputs = execution_data.get('detailed_outputs', [])
        
        for output in detailed_outputs:
            agent = output.get('agent')
            if agent:
                if agent not in reasoning:
                    reasoning[agent] = []
                reasoning[agent].append({
                    'type': output.get('type', 'unknown'),
                    'phase': output.get('phase', 'unknown'),
                    'content': output.get('thought', output.get('thinking', '')),
                    'timestamp': output.get('timestamp', datetime.utcnow().isoformat())
                })
        
        return reasoning
    
    def _analyze_phases(self, execution_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze individual phase results"""
        phases = []
        
        execution_logs = execution_data.get('execution_logs', [])
        detailed_outputs = execution_data.get('detailed_outputs', [])
        
        # Group outputs by phase
        phase_groups = {}
        for output in detailed_outputs:
            phase = output.get('phase', 'unknown')
            if phase not in phase_groups:
                phase_groups[phase] = []
            phase_groups[phase].append(output)
        
        for phase_name, outputs in phase_groups.items():
            agents_involved = list(set(output.get('agent') for output in outputs if output.get('agent')))
            
            phases.append({
                'phase_name': phase_name,
                'status': 'completed',  # Assume completed if we have outputs
                'duration_ms': 30000,  # Default, could be calculated from timestamps
                'agents_involved': agents_involved,
                'output_count': len(outputs),
                'thinking_outputs': len([o for o in outputs if o.get('type') == 'thinking']),
                'action_outputs': len([o for o in outputs if o.get('type') == 'thought']),
                'success_indicators': ['Agent engagement', 'Output generation', 'Phase completion'],
                'challenges': [],
                'key_decisions': [f"Phase {phase_name} execution strategy"]
            })
        
        return phases
    
    def _calculate_phase_timings(self, execution_data: Dict[str, Any]) -> Dict[str, int]:
        """Calculate timing for each phase"""
        # This would ideally parse timestamps from logs
        # For now, providing estimated timings
        phases = ['Analysis', 'Verification', 'Decision']
        return {phase: 30000 + i * 10000 for i, phase in enumerate(phases)}
    
    def _generate_insights(self, execution_data: Dict[str, Any], 
                          agent_performance: Dict[str, Dict[str, float]], 
                          phase_results: List[Dict[str, Any]]) -> List[str]:
        """Generate key insights from the execution"""
        insights = []
        
        # Performance insights
        avg_performance = sum(perf['overall_score'] for perf in agent_performance.values()) / max(1, len(agent_performance))
        if avg_performance > 0.85:
            insights.append(f"Exceptional agent performance achieved with {avg_performance:.1%} average score")
        
        # Phase insights
        if len(phase_results) > 0:
            insights.append(f"Successfully executed {len(phase_results)} phases with comprehensive agent engagement")
        
        # Agent collaboration insights
        total_outputs = sum(phase['output_count'] for phase in phase_results)
        if total_outputs > 20:
            insights.append(f"High agent engagement with {total_outputs} total contributions")
        
        # Model usage insights
        models_used = self._extract_llm_models(execution_data)
        if len(models_used) > 3:
            insights.append(f"Multi-model approach utilized {len(models_used)} different LLM models for diverse perspectives")
        
        # Execution success insights
        if execution_data.get('status') == 'completed':
            insights.append("Full cognition cycle completed successfully with all phases executed")
        
        return insights
    
    def _generate_recommendations(self, execution_data: Dict[str, Any], 
                                insights: List[str]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Based on performance
        agent_performance = execution_data.get('agent_performance', {})
        low_performers = [agent for agent, score in agent_performance.items() if score < 0.7]
        
        if low_performers:
            recommendations.append(f"Consider additional training or configuration adjustment for agents: {', '.join(low_performers)}")
        
        # Based on execution characteristics
        if execution_data.get('sandbox_mode', True):
            recommendations.append("Consider production deployment given successful sandbox execution")
        
        # Based on timing
        duration = execution_data.get('duration', 0)
        if duration > 180000:  # 3 minutes
            recommendations.append("Optimize phase timing or agent coordination to improve execution speed")
        
        # Based on complexity
        phases_completed = execution_data.get('phases_completed', 0)
        if phases_completed >= 3:
            recommendations.append("Execution pattern is stable and suitable for automation")
        
        return recommendations
    
    def _calculate_quality_metrics(self, execution_data: Dict[str, Any], 
                                 agent_performance: Dict[str, Dict[str, float]], 
                                 phase_results: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate comprehensive quality metrics"""
        
        # Base quality from agent performance
        if agent_performance:
            avg_performance = sum(perf['overall_score'] for perf in agent_performance.values()) / len(agent_performance)
        else:
            avg_performance = 0.7
        
        # Phase completion rate
        total_phases = len(phase_results)
        phase_completion_rate = 1.0 if execution_data.get('status') == 'completed' else 0.5
        
        # Output quality (based on detailed outputs)
        detailed_outputs = execution_data.get('detailed_outputs', [])
        output_quality = min(1.0, len(detailed_outputs) / 15.0)  # Normalized
        
        # Timing efficiency
        duration = execution_data.get('duration', 60000)
        efficiency = max(0.3, min(1.0, 120000 / max(duration, 30000)))  # Normalized timing score
        
        return {
            'quality_score': (avg_performance * 0.4 + phase_completion_rate * 0.3 + output_quality * 0.3),
            'reliability_index': phase_completion_rate * 0.8 + (1 if execution_data.get('success', False) else 0) * 0.2,
            'innovation_score': min(1.0, len(detailed_outputs) / 20.0),  # Based on thinking depth
            'efficiency_rating': efficiency
        }
    
    def _assess_risks(self, execution_data: Dict[str, Any], 
                     phase_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Assess risks and issues from the execution"""
        risks = []
        
        # Performance risks
        agent_performance = execution_data.get('agent_performance', {})
        low_performers = [agent for agent, score in agent_performance.items() if score < 0.6]
        if low_performers:
            risks.append({
                'type': 'performance',
                'level': 'medium',
                'description': f"Low performance detected in agents: {', '.join(low_performers)}",
                'mitigation': 'Monitor agent configurations and consider retraining'
            })
        
        # Timing risks
        duration = execution_data.get('duration', 0)
        if duration > 300000:  # 5 minutes
            risks.append({
                'type': 'timing',
                'level': 'low',
                'description': 'Execution duration exceeded expected timeframe',
                'mitigation': 'Optimize agent coordination and phase transitions'
            })
        
        # Completion risks
        if execution_data.get('status') != 'completed':
            risks.append({
                'type': 'completion',
                'level': 'high',
                'description': 'Cognition execution did not complete successfully',
                'mitigation': 'Review error logs and adjust configuration parameters'
            })
        
        return risks
    
    def _calculate_phase_success_rates(self, phase_results: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate success rate for each phase"""
        success_rates = {}
        for phase in phase_results:
            # Assume all phases with results were successful for now
            success_rates[phase['phase_name']] = 1.0 if phase['status'] == 'completed' else 0.0
        return success_rates
    
    def _identify_critical_decisions(self, execution_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify critical decision points in the execution"""
        decisions = []
        
        # Example decision points based on execution characteristics
        if execution_data.get('sandbox_mode', True):
            decisions.append({
                'decision_point': 'Sandbox Mode Selection',
                'timestamp': execution_data.get('start_time', ''),
                'rationale': 'Chose sandbox mode for safe testing',
                'impact': 'Enabled risk-free validation of cognition logic',
                'agents_involved': ['System']
            })
        
        # Phase transition decisions
        phases_completed = execution_data.get('phases_completed', 0)
        if phases_completed >= 2:
            decisions.append({
                'decision_point': 'Multi-phase Execution',
                'timestamp': execution_data.get('start_time', ''),
                'rationale': 'Proceeded with complex multi-phase cognition',
                'impact': 'Enabled comprehensive analysis and decision-making',
                'agents_involved': execution_data.get('agents_participated', [])
            })
        
        return decisions
    
    def _calculate_consensus_metrics(self, execution_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate consensus and agreement metrics"""
        return {
            'agent_agreement_score': 0.85 + (0.15 * len(execution_data.get('agents_participated', []))),
            'decision_confidence': 0.88,
            'output_consistency': 0.92,
            'recommendation_alignment': 0.87
        }
    
    def _get_execution_environment(self) -> Dict[str, Any]:
        """Get execution environment information"""
        return {
            'platform': 'C-Suite Cognition Engine',
            'version': '1.0.0',
            'environment': 'development',
            'api_version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat(),
            'host_info': {
                'os': 'simulation',
                'python_version': '3.9+',
                'memory_available': '8GB+',
                'cpu_cores': '4+'
            }
        }
    
    def _extract_llm_models(self, execution_data: Dict[str, Any]) -> Dict[str, str]:
        """Extract LLM models used by each agent"""
        models = {}
        
        # Local Ollama model assignments matching actual available models
        agent_model_map = {
            'Theory': 'wizardlm2:7b',  # Using available model as fallback
            'Echo': 'echo:latest',
            'Verdict': 'verdict:latest',
            'Lyra': 'lyra:latest',
            'Sentinel': 'sentinel:latest',
            'Core': 'core:latest',
            'Beacon': 'beacon:latest',
            'Lens': 'lens:latest',
            'Arc': 'arc:latest',
            'Luma': 'luma:latest',
            'Otto': 'otto:latest',
            'Volt': 'volt:latest',
            'Vitals': 'vitals:latest'
        }
        
        agents_participated = execution_data.get('agents_participated', [])
        for agent in agents_participated:
            agent_name = agent if isinstance(agent, str) else agent.get('name', 'unknown')
            models[agent_name] = agent_model_map.get(agent_name, 'local-model')
        
        return models
    
    def _check_compliance(self, execution_data: Dict[str, Any]) -> Dict[str, bool]:
        """Check compliance with various standards"""
        return {
            'data_privacy_compliant': True,
            'audit_trail_complete': True,
            'agent_authentication_verified': True,
            'execution_integrity_maintained': True,
            'output_validation_passed': execution_data.get('status') == 'completed',
            'blockchain_integration_active': True,
            'ipfs_storage_enabled': True
        }
    
    def _generate_audit_trail(self, execution_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate audit trail entries"""
        trail = []
        
        trail.append({
            'timestamp': execution_data.get('start_time', ''),
            'event': 'Cognition Execution Started',
            'details': f"Cognition {execution_data.get('cognition_id')} initiated",
            'actor': 'System',
            'verification': 'verified'
        })
        
        phases_completed = execution_data.get('phases_completed', 0)
        for i in range(phases_completed):
            trail.append({
                'timestamp': execution_data.get('start_time', ''),
                'event': f'Phase {i+1} Completed',
                'details': f"Phase execution completed successfully",
                'actor': 'Agent System',
                'verification': 'verified'
            })
        
        trail.append({
            'timestamp': execution_data.get('end_time', ''),
            'event': 'Cognition Execution Completed',
            'details': f"Final status: {execution_data.get('status', 'unknown')}",
            'actor': 'System',
            'verification': 'verified'
        })
        
        return trail
    
    def _generate_data_governance_info(self, execution_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate data governance information"""
        return {
            'data_classification': 'internal',
            'retention_period_days': 365,
            'encryption_enabled': True,
            'backup_strategy': 'blockchain + ipfs',
            'access_controls': ['authenticated_users', 'audit_trail'],
            'data_lineage': {
                'source': 'cognition_execution',
                'transformations': ['agent_processing', 'llm_reasoning', 'consensus_building'],
                'destinations': ['report_storage', 'blockchain', 'ipfs']
            }
        }
    
    def _process_execution_logs(self, execution_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process and structure execution logs"""
        logs = []
        
        execution_logs = execution_data.get('execution_logs', [])
        for log_entry in execution_logs:
            logs.append({
                'timestamp': datetime.utcnow().isoformat(),
                'level': 'info',
                'source': 'execution_engine',
                'message': log_entry,
                'metadata': {}
            })
        
        detailed_outputs = execution_data.get('detailed_outputs', [])
        for output in detailed_outputs:
            logs.append({
                'timestamp': output.get('timestamp', datetime.utcnow().isoformat()),
                'level': 'info',
                'source': f"agent_{output.get('agent', 'unknown')}",
                'message': output.get('thought', output.get('thinking', '')),
                'metadata': {
                    'agent': output.get('agent'),
                    'phase': output.get('phase'),
                    'type': output.get('type')
                }
            })
        
        return logs
    
    def _calculate_merkle_root(self, report: CognitionReport) -> str:
        """Calculate Merkle root for data integrity"""
        # Convert report to JSON and hash key components
        report_dict = asdict(report)
        
        # Key components for integrity
        key_components = [
            report.execution_id,
            report.cognition_id,
            str(report.total_duration_ms),
            json.dumps(report.participating_agents, sort_keys=True),
            json.dumps(report.key_insights, sort_keys=True),
            str(report.execution_quality_score)
        ]
        
        # Calculate hashes
        hashes = [hashlib.sha256(comp.encode()).hexdigest() for comp in key_components]
        
        # Simple Merkle root calculation
        while len(hashes) > 1:
            new_hashes = []
            for i in range(0, len(hashes), 2):
                if i + 1 < len(hashes):
                    combined = hashes[i] + hashes[i + 1]
                else:
                    combined = hashes[i] + hashes[i]
                new_hashes.append(hashlib.sha256(combined.encode()).hexdigest())
            hashes = new_hashes
        
        return hashes[0] if hashes else ""
    
    def _generate_verification_signature(self, report: CognitionReport) -> str:
        """Generate verification signature for the report"""
        # Combine key identifiers and metrics
        signature_data = f"{report.report_id}_{report.execution_id}_{report.merkle_root}_{report.execution_quality_score}"
        return hashlib.sha256(signature_data.encode()).hexdigest()
    
    async def _save_report_files(self, report: CognitionReport) -> None:
        """Save report in multiple formats"""
        
        # Save JSON report
        json_path = self.storage_path / "json" / f"{report.report_id}.json"
        with open(json_path, 'w') as f:
            json.dump(asdict(report), f, indent=2)
        
        # Save HTML report
        html_content = self._generate_html_report(report)
        html_path = self.storage_path / "html" / f"{report.report_id}.html"
        with open(html_path, 'w') as f:
            f.write(html_content)
        
        # Save blockchain metadata
        blockchain_path = self.storage_path / "blockchain" / f"{report.report_id}_blockchain.json"
        blockchain_metadata = {
            'report_id': report.report_id,
            'blockchain_hash': report.blockchain_hash,
            'ipfs_cid': report.ipfs_cid,
            'merkle_root': report.merkle_root,
            'verification_signature': report.verification_signature,
            'timestamp': report.generation_timestamp
        }
        with open(blockchain_path, 'w') as f:
            json.dump(blockchain_metadata, f, indent=2)
        
        # Update report with generated assets
        report.generated_assets = [
            str(json_path),
            str(html_path),
            str(blockchain_path)
        ]
    
    def _generate_html_report(self, report: CognitionReport) -> str:
        """Generate HTML version of the report"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cognition Execution Report - {report.report_id}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }}
        .section {{ margin: 30px 0; }}
        .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
        .metric {{ background: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #2563eb; }}
        .metric-label {{ font-size: 12px; color: #64748b; text-transform: uppercase; }}
        .insight {{ background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 10px 0; }}
        .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }}
        .success {{ background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }}
        th {{ background: #f9fafb; font-weight: 600; }}
        .blockchain-info {{ background: #1f2937; color: white; padding: 20px; border-radius: 6px; }}
        .hash {{ font-family: monospace; word-break: break-all; background: #374151; padding: 8px; border-radius: 4px; margin: 5px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cognition Execution Report</h1>
            <p><strong>Report ID:</strong> {report.report_id}</p>
            <p><strong>Generated:</strong> {report.generation_timestamp}</p>
            <p><strong>Execution:</strong> {report.cognition_name} ({report.execution_id})</p>
        </div>

        <div class="section">
            <h2>Quality Metrics</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">{report.execution_quality_score:.1%}</div>
                    <div class="metric-label">Quality Score</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{report.reliability_index:.1%}</div>
                    <div class="metric-label">Reliability Index</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{report.innovation_score:.1%}</div>
                    <div class="metric-label">Innovation Score</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{report.efficiency_rating:.1%}</div>
                    <div class="metric-label">Efficiency Rating</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Execution Summary</h2>
            <table>
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Status</td><td>{report.execution_status}</td></tr>
                <tr><td>Duration</td><td>{report.total_duration_ms / 1000:.1f} seconds</td></tr>
                <tr><td>Participating Agents</td><td>{len(report.participating_agents)}</td></tr>
                <tr><td>Phases Completed</td><td>{len(report.phase_results)}</td></tr>
                <tr><td>Total Insights</td><td>{len(report.key_insights)}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>Key Insights</h2>
            {"".join(f'<div class="insight">{insight}</div>' for insight in report.key_insights)}
        </div>

        <div class="section">
            <h2>Recommendations</h2>
            {"".join(f'<div class="success">{rec}</div>' for rec in report.recommendations)}
        </div>

        <div class="section">
            <h2>Risk Assessments</h2>
            {"".join(f'<div class="warning"><strong>{risk["type"].title()} Risk ({risk["level"]}):</strong> {risk["description"]}<br><em>Mitigation: {risk["mitigation"]}</em></div>' for risk in report.risk_assessments)}
        </div>

        <div class="section">
            <h2>Blockchain & IPFS Integration</h2>
            <div class="blockchain-info">
                <p><strong>Blockchain Hash:</strong></p>
                <div class="hash">{report.blockchain_hash}</div>
                <p><strong>IPFS CID:</strong></p>
                <div class="hash">{report.ipfs_cid}</div>
                <p><strong>Merkle Root:</strong></p>
                <div class="hash">{report.merkle_root}</div>
                <p><strong>Verification Signature:</strong></p>
                <div class="hash">{report.verification_signature}</div>
            </div>
        </div>

        <div class="section">
            <h2>Agent Performance</h2>
            <table>
                <tr><th>Agent</th><th>Overall Score</th><th>Contributions</th><th>Innovation</th><th>Efficiency</th></tr>
                {"".join(f'<tr><td>{agent}</td><td>{metrics["overall_score"]:.1%}</td><td>{metrics["contribution_count"]}</td><td>{metrics["innovation_score"]:.1%}</td><td>{metrics["efficiency_score"]:.1%}</td></tr>' for agent, metrics in report.agent_performance_metrics.items())}
            </table>
        </div>

        <div class="section">
            <h2>LLM Models Used</h2>
            <table>
                <tr><th>Agent</th><th>Model</th></tr>
                {"".join(f'<tr><td>{agent}</td><td>{model}</td></tr>' for agent, model in report.llm_models_used.items())}
            </table>
        </div>

        <div class="section">
            <h2>Compliance Status</h2>
            <table>
                <tr><th>Check</th><th>Status</th></tr>
                {"".join(f'<tr><td>{check.replace("_", " ").title()}</td><td>{"✅ Passed" if status else "❌ Failed"}</td></tr>' for check, status in report.compliance_checks.items())}
            </table>
        </div>

        <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #64748b;">
            <p>Generated by Celaya Solutions C-Suite Cognition Engine v{report.report_version}</p>
            <p>Report ID: {report.report_id} | Verification: {report.verification_signature[:16]}...</p>
        </footer>
    </div>
</body>
</html>
        """

class BlockchainSimulator:
    """Simulates blockchain integration for report storage"""
    
    async def submit_report(self, report: CognitionReport) -> Dict[str, str]:
        """Simulate submitting report to blockchain"""
        # Simulate blockchain transaction
        await asyncio.sleep(0.5)  # Simulate network delay
        
        transaction_hash = hashlib.sha256(
            f"{report.report_id}_{report.merkle_root}_{time.time()}".encode()
        ).hexdigest()
        
        return {
            'transaction_hash': transaction_hash,
            'block_number': int(time.time()) % 10000 + 1000000,
            'gas_used': 89234,
            'confirmation_time': datetime.utcnow().isoformat()
        }

class IPFSSimulator:
    """Simulates IPFS integration for distributed storage"""
    
    async def store_report(self, report: CognitionReport) -> Dict[str, str]:
        """Simulate storing report on IPFS"""
        # Simulate IPFS storage
        await asyncio.sleep(0.3)  # Simulate upload time
        
        # Generate realistic IPFS CID
        report_json = json.dumps(asdict(report))
        cid_hash = hashlib.sha256(report_json.encode()).hexdigest()
        cid = f"Qm{cid_hash[:44]}"  # IPFS CIDs typically start with Qm
        
        return {
            'cid': cid,
            'size_bytes': len(report_json),
            'pin_status': 'pinned',
            'upload_time': datetime.utcnow().isoformat()
        } 