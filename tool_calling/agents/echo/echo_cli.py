# ----------------------------------------------------------------------------
#  File:        echo_cli.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: CLI interface for the Echo Insight Relay & Auditing Agent
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
from echo_agent_enhanced import EchoAgentEnhanced, AuditStatus, RelayMethod, InsightPriority

class EchoCLI:
    """Command-line interface for the Echo agent"""
    
    def __init__(self):
        self.config = self._load_config()
        
    def _load_config(self) -> dict:
        """Load configuration from echo_config.json or create default"""
        config_file = Path("echo_config.json")
        
        if config_file.exists():
            with open(config_file, 'r') as f:
                return json.load(f)
        else:
            # Create default config
            default_config = {
                "audit_threshold": 0.7,
                "relay_timeout": 30,
                "compliance_rules": [
                    "source_verification",
                    "content_integrity",
                    "authorization_check"
                ]
            }
            
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
                
            print(f"Created default Echo config: {config_file}")
            return default_config

    async def audit_insight(self, insight_file: str, source_agent: str):
        """Audit an insight from a JSON file"""
        print(f"🔍 Echo auditing insight from: {insight_file}")
        print(f"📋 Source Agent: {source_agent}")
        print("=" * 50)
        
        # Load insight data
        try:
            with open(insight_file, 'r') as f:
                insight_data = json.load(f)
        except FileNotFoundError:
            print(f"❌ Error: File {insight_file} not found")
            return
        except json.JSONDecodeError:
            print(f"❌ Error: Invalid JSON in {insight_file}")
            return
        
        async with EchoAgentEnhanced(self.config) as echo:
            # Perform audit
            audit_result = await echo.echo_audit_insight(insight_data, source_agent)
            
            # Display results
            self._display_audit_results(audit_result)
            
            return audit_result

    async def relay_insight(self, insight_hash: str, target_agents: list, 
                          relay_method: str = "broadcast", priority: str = "medium"):
        """Relay an insight to target agents"""
        print(f"📡 Echo relaying insight: {insight_hash[:16]}...")
        print(f"🎯 Target Agents: {', '.join(target_agents)}")
        print(f"📊 Method: {relay_method.upper()}, Priority: {priority.upper()}")
        print("=" * 50)
        
        async with EchoAgentEnhanced(self.config) as echo:
            # Perform relay
            relay_result = await echo.echo_relay_insight(
                insight_hash, target_agents, relay_method, priority
            )
            
            # Display results
            self._display_relay_results(relay_result)
            
            return relay_result

    async def compliance_check(self, insight_file: str, rules: list = None):
        """Perform compliance check on an insight"""
        print(f"✅ Echo compliance check: {insight_file}")
        if rules:
            print(f"📋 Custom Rules: {', '.join(rules)}")
        print("=" * 50)
        
        # Load insight data
        try:
            with open(insight_file, 'r') as f:
                insight_data = json.load(f)
        except FileNotFoundError:
            print(f"❌ Error: File {insight_file} not found")
            return
        except json.JSONDecodeError:
            print(f"❌ Error: Invalid JSON in {insight_file}")
            return
        
        async with EchoAgentEnhanced(self.config) as echo:
            # Perform compliance check
            compliance_result = await echo.echo_compliance_check(insight_data, rules)
            
            # Display results
            self._display_compliance_results(compliance_result)
            
            return compliance_result

    async def monitor_agents(self, agent_ids: list, duration_minutes: int = 60):
        """Start monitoring specified agents"""
        print(f"👀 Echo monitoring agents: {', '.join(agent_ids)}")
        print(f"⏱️ Duration: {duration_minutes} minutes")
        print("=" * 50)
        
        async with EchoAgentEnhanced(self.config) as echo:
            # Start monitoring
            monitor_result = await echo.echo_monitor_agents(agent_ids)
            
            # Display initial results
            print(f"✅ Monitoring started for {monitor_result.get('total_monitored', 0)} agents")
            print(f"📊 Monitoring Status: {monitor_result.get('status', 'unknown')}")
            
            if monitor_result.get('success'):
                print(f"\n📈 Real-time monitoring active...")
                print(f"   Monitored Agents: {', '.join(monitor_result.get('monitored_agents', []))}")
                print(f"   Monitoring Interval: {monitor_result.get('monitoring_interval', 30)}s")
                
                # Simulate monitoring duration
                print(f"\n⏳ Monitoring for {duration_minutes} minutes...")
                await asyncio.sleep(min(duration_minutes * 60, 300))  # Max 5 minutes for demo
                print(f"✅ Monitoring session completed")
            
            return monitor_result

    async def generate_report(self, time_period_hours: int = 24, output_file: str = None):
        """Generate comprehensive audit report"""
        print(f"📊 Echo generating audit report")
        print(f"⏱️ Time Period: {time_period_hours} hours")
        print("=" * 50)
        
        async with EchoAgentEnhanced(self.config) as echo:
            # Generate report
            report_result = await echo.echo_generate_audit_report(time_period_hours)
            
            if report_result.get('success'):
                report = report_result['report']
                
                # Display report summary
                self._display_report_summary(report)
                
                # Save to file if requested
                if output_file:
                    self._save_report_to_file(report, output_file)
                    print(f"\n💾 Report saved to: {output_file}")
            else:
                print(f"❌ Report generation failed: {report_result.get('error', 'unknown error')}")
            
            return report_result

    def _display_audit_results(self, audit_result: dict):
        """Display audit results in a formatted way"""
        print(f"\n🔍 AUDIT RESULTS:")
        print("-" * 30)
        print(f"Audit ID: {audit_result.get('audit_id', 'unknown')}")
        print(f"Status: {self._format_status(audit_result.get('audit_status', 'unknown'))}")
        print(f"Confidence Score: {audit_result.get('confidence_score', 0):.2f}")
        print(f"Risk Assessment: {audit_result.get('risk_assessment', 'unknown').upper()}")
        
        # Verification checks
        checks = audit_result.get('verification_checks', {})
        if checks:
            print(f"\n✅ VERIFICATION CHECKS:")
            print("-" * 30)
            for check, passed in checks.items():
                status = "✅" if passed else "❌"
                print(f"{status} {check.replace('_', ' ').title()}")
        
        # Audit notes
        notes = audit_result.get('audit_notes', [])
        if notes:
            print(f"\n📝 AUDIT NOTES:")
            print("-" * 30)
            for note in notes[:3]:  # Show first 3 notes
                print(f"• {note}")
        
        print(f"\n🔒 Audit Hash: {audit_result.get('insight_hash', 'unknown')[:16]}...")

    def _display_relay_results(self, relay_result: dict):
        """Display relay results in a formatted way"""
        print(f"\n📡 RELAY RESULTS:")
        print("-" * 30)
        print(f"Relay ID: {relay_result.get('relay_id', 'unknown')}")
        print(f"Success: {relay_result.get('success', False)}")
        print(f"Success Rate: {relay_result.get('success_rate', 0):.1%}")
        
        # Delivery status
        delivery_status = relay_result.get('delivery_status', {})
        if delivery_status:
            print(f"\n📋 DELIVERY STATUS:")
            print("-" * 30)
            for agent, status in delivery_status.items():
                icon = "✅" if status == "delivered" else "❌"
                print(f"{icon} {agent}: {status}")
        
        print(f"\n🔒 Relay Signature: {relay_result.get('relay_signature', 'unknown')[:16]}...")

    def _display_compliance_results(self, compliance_result: dict):
        """Display compliance results in a formatted way"""
        print(f"\n✅ COMPLIANCE RESULTS:")
        print("-" * 30)
        print(f"Check ID: {compliance_result.get('check_id', 'unknown')}")
        print(f"Is Compliant: {compliance_result.get('is_compliant', False)}")
        print(f"Compliance Score: {compliance_result.get('compliance_score', 0):.2%}")
        
        # Passed checks
        passed = compliance_result.get('passed_checks', [])
        if passed:
            print(f"\n✅ PASSED CHECKS ({len(passed)}):")
            print("-" * 30)
            for check in passed:
                print(f"✅ {check.replace('_', ' ').title()}")
        
        # Failed checks
        failed = compliance_result.get('failed_checks', [])
        if failed:
            print(f"\n❌ FAILED CHECKS ({len(failed)}):")
            print("-" * 30)
            for check in failed:
                print(f"❌ {check.replace('_', ' ').title()}")
        
        # Recommendations
        recommendations = compliance_result.get('recommendations', [])
        if recommendations:
            print(f"\n💡 RECOMMENDATIONS:")
            print("-" * 30)
            for rec in recommendations[:3]:  # Show first 3 recommendations
                print(f"• {rec}")

    def _display_report_summary(self, report: dict):
        """Display report summary"""
        print(f"\n📊 AUDIT REPORT SUMMARY:")
        print("-" * 30)
        
        # Audit summary
        audit_summary = report.get('audit_summary', {})
        print(f"Total Audits: {audit_summary.get('total_audits', 0)}")
        print(f"Verified Insights: {audit_summary.get('verified_insights', 0)}")
        print(f"Flagged Insights: {audit_summary.get('flagged_insights', 0)}")
        print(f"Rejected Insights: {audit_summary.get('rejected_insights', 0)}")
        print(f"Verification Rate: {audit_summary.get('verification_rate', 0):.1%}")
        
        # Compliance summary
        compliance_summary = report.get('compliance_summary', {})
        if compliance_summary:
            print(f"\n✅ COMPLIANCE SUMMARY:")
            print("-" * 30)
            print(f"Total Checks: {compliance_summary.get('total_checks', 0)}")
            print(f"Compliance Rate: {compliance_summary.get('compliance_rate', 0):.1%}")
        
        # Relay summary
        relay_summary = report.get('relay_summary', {})
        if relay_summary:
            print(f"\n📡 RELAY SUMMARY:")
            print("-" * 30)
            print(f"Total Relays: {relay_summary.get('total_relays', 0)}")
            print(f"Success Rate: {relay_summary.get('success_rate', 0):.1%}")
        
        # Recommendations
        recommendations = report.get('recommendations', [])
        if recommendations:
            print(f"\n💡 RECOMMENDATIONS:")
            print("-" * 30)
            for rec in recommendations[:3]:  # Show first 3 recommendations
                print(f"• {rec}")

    def _save_report_to_file(self, report: dict, output_file: str):
        """Save report to JSON file"""
        try:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2, default=str)
        except Exception as e:
            print(f"❌ Error saving report: {e}")

    def _format_status(self, status: str) -> str:
        """Format audit status with appropriate emoji"""
        status_map = {
            'verified': '✅ VERIFIED',
            'pending': '⏳ PENDING',
            'flagged': '⚠️ FLAGGED',
            'rejected': '❌ REJECTED'
        }
        return status_map.get(status.lower(), f"❓ {status.upper()}")

    def list_audit_logs(self):
        """List available audit log files"""
        log_dir = Path("audit_logs")
        
        if not log_dir.exists():
            print("📁 No audit logs found")
            return
            
        log_files = list(log_dir.glob("*.jsonl"))
        
        if not log_files:
            print("📁 No audit logs found")
            return
            
        print("📊 AVAILABLE AUDIT LOGS:")
        print("-" * 30)
        
        for log_file in sorted(log_files):
            try:
                with open(log_file, 'r') as f:
                    entries = len(f.readlines())
                print(f"📄 {log_file.name}: {entries} audits")
            except Exception as e:
                print(f"📄 {log_file.name}: Error reading file - {e}")

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description="Echo Agent CLI - Insight Relay & Auditing")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Audit command
    audit_parser = subparsers.add_parser('audit', help='Audit an insight')
    audit_parser.add_argument('--insight-file', required=True, help='Path to insight JSON file')
    audit_parser.add_argument('--source', required=True, help='Source agent name')
    
    # Relay command
    relay_parser = subparsers.add_parser('relay', help='Relay insight to agents')
    relay_parser.add_argument('--hash', required=True, help='Insight hash to relay')
    relay_parser.add_argument('--targets', required=True, help='Comma-separated target agents')
    relay_parser.add_argument('--method', default='broadcast', 
                            choices=['broadcast', 'targeted', 'secure', 'emergency'],
                            help='Relay method')
    relay_parser.add_argument('--priority', default='medium',
                            choices=['low', 'medium', 'high', 'critical'],
                            help='Priority level')
    
    # Compliance command
    compliance_parser = subparsers.add_parser('compliance', help='Check compliance')
    compliance_parser.add_argument('--insight-file', required=True, help='Path to insight JSON file')
    compliance_parser.add_argument('--rules', help='Comma-separated compliance rules')
    
    # Monitor command
    monitor_parser = subparsers.add_parser('monitor', help='Monitor agents')
    monitor_parser.add_argument('--agents', required=True, help='Comma-separated agent IDs')
    monitor_parser.add_argument('--duration', type=int, default=60, help='Duration in minutes')
    
    # Report command
    report_parser = subparsers.add_parser('report', help='Generate audit report')
    report_parser.add_argument('--hours', type=int, default=24, help='Time period in hours')
    report_parser.add_argument('--output', help='Output file path')
    
    # Logs command
    subparsers.add_parser('logs', help='List audit log files')
    
    # Interactive mode
    subparsers.add_parser('interactive', help='Start interactive mode')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    cli = EchoCLI()
    
    try:
        if args.command == 'audit':
            asyncio.run(cli.audit_insight(args.insight_file, args.source))
        
        elif args.command == 'relay':
            targets = [agent.strip() for agent in args.targets.split(',')]
            asyncio.run(cli.relay_insight(args.hash, targets, args.method, args.priority))
        
        elif args.command == 'compliance':
            rules = [rule.strip() for rule in args.rules.split(',')] if args.rules else None
            asyncio.run(cli.compliance_check(args.insight_file, rules))
        
        elif args.command == 'monitor':
            agents = [agent.strip() for agent in args.agents.split(',')]
            asyncio.run(cli.monitor_agents(agents, args.duration))
        
        elif args.command == 'report':
            asyncio.run(cli.generate_report(args.hours, args.output))
        
        elif args.command == 'logs':
            cli.list_audit_logs()
        
        elif args.command == 'interactive':
            print("🔍 Echo Agent Interactive Mode")
            print("Type 'help' for commands, 'exit' to quit")
            # Interactive mode implementation would go here
            
    except KeyboardInterrupt:
        print("\n👋 Echo CLI interrupted by user")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 