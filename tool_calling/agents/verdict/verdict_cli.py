# ----------------------------------------------------------------------------
#  File:        verdict_cli.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Verdict Agent CLI - Interactive Legal & Compliance Interface
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from agents.verdict.verdict_agent_enhanced import VerdictAgentEnhanced

class VerdictCLI:
    """Command Line Interface for Verdict Agent - Legal & Compliance"""
    
    def __init__(self):
        self.agent = None
        self.config = {
            'compliance_threshold': 0.8,
            'risk_tolerance': 'medium',
            'auto_approve_threshold': 0.95
        }
        
    async def start(self):
        """Start the CLI session"""
        print("⚖️ Verdict Agent - Legal & Compliance")
        print("=" * 60)
        print("Your comprehensive legal analysis and compliance management system")
        print("Commands: analyze, contract, compliance, litigation, report, status, tools, help, exit")
        print("=" * 60)
        
        self.agent = VerdictAgentEnhanced(self.config)
        
        while True:
            try:
                command = input("\nverdict> ").strip().lower()
                
                if command == "exit":
                    print("⚖️ Verdict Agent shutting down...")
                    break
                elif command == "help":
                    self.show_help()
                elif command == "analyze":
                    await self.handle_analyze()
                elif command == "contract":
                    await self.handle_contract()
                elif command == "compliance":
                    await self.handle_compliance()
                elif command == "litigation":
                    await self.handle_litigation()
                elif command == "report":
                    await self.handle_report()
                elif command == "status":
                    await self.handle_status()
                elif command == "tools":
                    self.show_tools()
                elif command == "":
                    continue
                else:
                    print(f"❌ Unknown command: {command}")
                    print("Type 'help' for available commands")
                    
            except KeyboardInterrupt:
                print("\n⚖️ Verdict Agent shutting down...")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

    def show_help(self):
        """Show available commands"""
        commands = {
            "analyze": "Perform legal document analysis",
            "contract": "Review and analyze contracts",
            "compliance": "Check regulatory compliance",
            "litigation": "Assess litigation risk",
            "report": "Generate legal and compliance reports",
            "status": "Show agent status and metrics",
            "tools": "List all available tools",
            "help": "Show this help message",
            "exit": "Exit Verdict CLI"
        }
        
        print("\n⚖️ Verdict Agent Commands:")
        print("-" * 40)
        for cmd, desc in commands.items():
            print(f"  {cmd:12} - {desc}")

    def show_tools(self):
        """Show all available tools"""
        if not self.agent:
            print("❌ Agent not initialized")
            return
            
        tools = self.agent.get_available_tools()
        print(f"\n🔧 Available Tools ({len(tools)} total):")
        print("-" * 50)
        
        for tool in tools:
            print(f"  📋 {tool['name']}")
            print(f"     {tool['description']}")
            if 'parameters' in tool and tool['parameters']:
                print("     Parameters:")
                for param, desc in tool['parameters'].items():
                    print(f"       - {param}: {desc}")
            print()

    async def handle_analyze(self):
        """Handle legal document analysis"""
        print("\n📄 Legal Document Analysis")
        
        try:
            print("Enter document content (type 'END' on a new line to finish):")
            content_lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                content_lines.append(line)
            
            document_content = '\n'.join(content_lines)
            if not document_content.strip():
                print("❌ Document content required")
                return
            
            document_type = input("Document type (contract/policy/agreement/general): ").strip()
            if not document_type:
                document_type = "general"
            
            print(f"\n🔍 Analyzing {document_type} document...")
            
            result = await self.agent.verdict_analyze_document(document_content, document_type)
            
            if result['success']:
                print(f"✅ Analysis completed successfully!")
                print(f"   📊 Analysis ID: {result['analysis_id']}")
                print(f"   🏛️ Compliance Level: {result['compliance_level'].upper()}")
                print(f"   ⚠️ Legal Risk: {result['legal_risk'].upper()}")
                print(f"   🎯 Confidence Score: {result['confidence_score']:.2%}")
                
                if result.get('applicable_laws'):
                    print(f"   📜 Applicable Laws: {', '.join(result['applicable_laws'])}")
                
                if result.get('violations_found'):
                    print(f"\n⚠️ Violations Found:")
                    for violation in result['violations_found']:
                        print(f"     - {violation}")
                
                if result.get('recommendations'):
                    print(f"\n💡 Recommendations:")
                    for rec in result['recommendations']:
                        print(f"     - {rec}")
            else:
                print(f"❌ Analysis failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Analysis error: {e}")

    async def handle_contract(self):
        """Handle contract review"""
        print("\n📋 Contract Review & Analysis")
        
        try:
            print("Enter contract content (type 'END' on a new line to finish):")
            content_lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                content_lines.append(line)
            
            contract_content = '\n'.join(content_lines)
            if not contract_content.strip():
                print("❌ Contract content required")
                return
            
            contract_types = [
                'service_agreement', 'employment', 'vendor', 
                'license', 'partnership', 'lease'
            ]
            print(f"Available contract types: {', '.join(contract_types)}")
            contract_type = input("Contract type: ").strip()
            if not contract_type:
                contract_type = "service_agreement"
            
            print(f"\n📝 Reviewing {contract_type} contract...")
            
            result = await self.agent.verdict_review_contract(contract_content, contract_type)
            
            if result['success']:
                print(f"✅ Contract review completed!")
                print(f"   📊 Review ID: {result['review_id']}")
                print(f"   📄 Contract Type: {result['contract_type']}")
                print(f"   📈 Status: {result['status'].upper()}")
                print(f"   ✅ Approval Status: {result['approval_status'].upper()}")
                
                if result.get('key_terms'):
                    print(f"\n🔑 Key Terms:")
                    for term, value in result['key_terms'].items():
                        print(f"     - {term}: {value}")
                
                if result.get('risk_factors'):
                    print(f"\n⚠️ Risk Factors ({len(result['risk_factors'])}):")
                    for risk in result['risk_factors']:
                        print(f"     - {risk}")
                
                if result.get('compliance_issues'):
                    print(f"\n🚨 Compliance Issues ({len(result['compliance_issues'])}):")
                    for issue in result['compliance_issues']:
                        print(f"     - {issue}")
                
                if result.get('recommended_changes'):
                    print(f"\n💡 Recommended Changes:")
                    for change in result['recommended_changes']:
                        print(f"     - {change}")
            else:
                print(f"❌ Contract review failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Contract review error: {e}")

    async def handle_compliance(self):
        """Handle regulatory compliance check"""
        print("\n🏛️ Regulatory Compliance Check")
        
        try:
            industries = [
                'general', 'financial', 'healthcare', 'technology',
                'manufacturing', 'retail', 'education', 'government'
            ]
            print(f"Available industries: {', '.join(industries)}")
            industry = input("Industry: ").strip()
            if not industry:
                industry = "general"
            
            print("\nBusiness data configuration:")
            business_data = {}
            
            # Common business attributes
            questions = [
                ("processes_payments", "Does your business process payments? (y/n): "),
                ("stores_personal_data", "Do you store personal data? (y/n): "),
                ("international_operations", "Do you have international operations? (y/n): "),
                ("handles_healthcare_data", "Do you handle healthcare data? (y/n): "),
                ("financial_services", "Do you provide financial services? (y/n): "),
                ("government_contracts", "Do you have government contracts? (y/n): ")
            ]
            
            for key, question in questions:
                response = input(question).strip().lower()
                business_data[key] = response in ['y', 'yes', 'true']
            
            # Numeric inputs
            try:
                employee_count = input("Employee count (optional): ").strip()
                if employee_count:
                    business_data['employee_count'] = int(employee_count)
            except ValueError:
                pass
            
            try:
                annual_revenue = input("Annual revenue in USD (optional): ").strip()
                if annual_revenue:
                    business_data['annual_revenue'] = int(annual_revenue)
            except ValueError:
                pass
            
            print(f"\n🔍 Checking compliance for {industry} industry...")
            
            result = await self.agent.verdict_check_regulatory_compliance(business_data, industry)
            
            if result['success']:
                print(f"✅ Compliance check completed!")
                print(f"   📊 Check ID: {result['check_id']}")
                print(f"   🏭 Industry: {result['industry']}")
                print(f"   🏛️ Compliance Status: {result['compliance_status'].upper()}")
                print(f"   🌍 Jurisdiction: {result['jurisdiction'].upper()}")
                
                if result.get('applicable_regulations'):
                    print(f"\n📜 Applicable Regulations:")
                    for reg_type, regulations in result['applicable_regulations'].items():
                        print(f"     - {reg_type}: {', '.join(regulations)}")
                
                if result.get('compliance_gaps'):
                    print(f"\n⚠️ Compliance Gaps ({len(result['compliance_gaps'])}):")
                    for gap in result['compliance_gaps']:
                        print(f"     - {gap}")
                
                if result.get('remediation_steps'):
                    print(f"\n🔧 Remediation Steps:")
                    for step in result['remediation_steps']:
                        print(f"     - {step}")
                
                if result.get('deadline'):
                    print(f"\n⏰ Deadline: {result['deadline']}")
            else:
                print(f"❌ Compliance check failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Compliance check error: {e}")

    async def handle_litigation(self):
        """Handle litigation risk assessment"""
        print("\n⚡ Litigation Risk Assessment")
        
        try:
            print("Case data configuration:")
            case_data = {}
            
            case_types = [
                'contract_dispute', 'employment', 'intellectual_property',
                'tort', 'regulatory', 'shareholder', 'product_liability'
            ]
            print(f"Available case types: {', '.join(case_types)}")
            case_type = input("Case type: ").strip()
            if case_type:
                case_data['case_type'] = case_type
            
            # Claim amount
            try:
                claim_amount = input("Claim amount in USD: ").strip()
                if claim_amount:
                    case_data['claim_amount'] = int(claim_amount)
            except ValueError:
                pass
            
            # Categorical assessments
            clarity_levels = ['low', 'medium', 'high']
            strength_levels = ['weak', 'medium', 'strong']
            resource_levels = ['low', 'medium', 'high']
            
            print(f"Contract clarity ({'/'.join(clarity_levels)}): ", end="")
            clarity = input().strip()
            if clarity in clarity_levels:
                case_data['contract_clarity'] = clarity
            
            print(f"Evidence strength ({'/'.join(strength_levels)}): ", end="")
            evidence = input().strip()
            if evidence in strength_levels:
                case_data['evidence_strength'] = evidence
            
            print(f"Opposing party resources ({'/'.join(resource_levels)}): ", end="")
            resources = input().strip()
            if resources in resource_levels:
                case_data['opposing_party_resources'] = resources
            
            # Additional context
            case_summary = input("Case summary (optional): ").strip()
            if case_summary:
                case_data['case_summary'] = case_summary
            
            print(f"\n⚖️ Assessing litigation risk...")
            
            result = await self.agent.verdict_assess_litigation_risk(case_data)
            
            if result['success']:
                print(f"✅ Risk assessment completed!")
                print(f"   📊 Assessment ID: {result['assessment_id']}")
                print(f"   ⚠️ Risk Level: {result['risk_level'].upper()}")
                print(f"   📈 Risk Score: {result['risk_score']:.2f}/10")
                
                if result.get('case_merits'):
                    print(f"\n📋 Case Merits:")
                    for merit, value in result['case_merits'].items():
                        print(f"     - {merit}: {value}")
                
                if result.get('risk_factors'):
                    print(f"\n⚠️ Risk Factors:")
                    for factor, score in result['risk_factors'].items():
                        print(f"     - {factor}: {score}")
                
                if result.get('damage_estimates'):
                    print(f"\n💰 Damage Estimates:")
                    for estimate, amount in result['damage_estimates'].items():
                        print(f"     - {estimate}: ${amount:,}")
                
                if result.get('strategy_recommendations'):
                    print(f"\n🎯 Strategy Recommendations:")
                    for strategy in result['strategy_recommendations']:
                        print(f"     - {strategy}")
            else:
                print(f"❌ Risk assessment failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Litigation risk error: {e}")

    async def handle_report(self):
        """Handle legal report generation"""
        print("\n📊 Legal & Compliance Report")
        
        try:
            time_periods = {
                '1': 1,      # 1 hour
                '24': 24,    # 1 day
                '168': 168,  # 1 week
                '720': 720   # 1 month
            }
            
            print("Available time periods:")
            for key, hours in time_periods.items():
                period_name = {1: '1 hour', 24: '1 day', 168: '1 week', 720: '1 month'}[hours]
                print(f"  {key}: {period_name}")
            
            period_choice = input("Select time period (default 24h): ").strip()
            time_period_hours = time_periods.get(period_choice, 24)
            
            print(f"\n📋 Generating legal report for {time_period_hours} hours...")
            
            result = await self.agent.verdict_generate_legal_report(time_period_hours)
            
            if result['success']:
                report = result['report']
                
                print(f"✅ Legal report generated!")
                print(f"   📊 Report ID: {report['report_id']}")
                print(f"   ⏰ Time Period: {report['time_period']['hours']} hours")
                
                # Legal analysis summary
                legal_summary = report['legal_analysis_summary']
                print(f"\n📄 Legal Analysis Summary:")
                print(f"   Total Analyses: {legal_summary['total_analyses']}")
                print(f"   Compliant Documents: {legal_summary['compliant_documents']}")
                print(f"   Critical Violations: {legal_summary['critical_violations']}")
                print(f"   Compliance Rate: {legal_summary['compliance_rate']:.1%}")
                print(f"   Avg Review Time: {legal_summary['average_review_time']:.2f}s")
                
                # Contract review summary
                contract_summary = report['contract_review_summary']
                print(f"\n📋 Contract Review Summary:")
                print(f"   Total Contracts: {contract_summary['total_contracts']}")
                print(f"   Approved Contracts: {contract_summary['approved_contracts']}")
                print(f"   Approval Rate: {contract_summary['approval_rate']:.1%}")
                
                # Regulatory compliance summary
                regulatory_summary = report['regulatory_compliance_summary']
                print(f"\n🏛️ Regulatory Compliance Summary:")
                print(f"   Total Checks: {regulatory_summary['total_checks']}")
                print(f"   Pending Remediation: {regulatory_summary['pending_remediation']}")
                
                # Risk analysis
                risk_analysis = report['risk_analysis']
                print(f"\n⚠️ Risk Analysis:")
                print(f"   Total Risk Assessments: {risk_analysis['total_risk_assessments']}")
                print(f"   High Risk Items: {risk_analysis['high_risk_items']}")
                
                if risk_analysis.get('risk_distribution'):
                    print(f"   Risk Distribution:")
                    for risk_level, count in risk_analysis['risk_distribution'].items():
                        print(f"     - {risk_level}: {count}")
                
                # Recommendations
                if report.get('recommendations'):
                    print(f"\n💡 Recommendations:")
                    for rec in report['recommendations']:
                        print(f"     - {rec}")
            else:
                print(f"❌ Report generation failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Report generation error: {e}")

    async def handle_status(self):
        """Handle status display"""
        print("\n📊 Verdict Agent Status")
        
        try:
            print(f"\n⚖️ Legal & Compliance Agent:")
            print(f"   Agent ID: {self.agent.agent_id}")
            print(f"   Compliance Threshold: {self.agent.compliance_threshold}")
            print(f"   Risk Tolerance: {self.agent.risk_tolerance}")
            print(f"   Auto-Approve Threshold: {self.agent.auto_approve_threshold}")
            
            # Performance metrics
            metrics = self.agent.legal_metrics
            print(f"\n📊 Performance Metrics:")
            print(f"   Total Analyses: {metrics['total_analyses']}")
            print(f"   Compliant Documents: {metrics['compliant_documents']}")
            print(f"   Critical Violations: {metrics['critical_violations']}")
            print(f"   Contracts Reviewed: {metrics['contracts_reviewed']}")
            print(f"   Risk Assessments: {metrics['risk_assessments']}")
            print(f"   Average Review Time: {metrics['average_review_time']:.2f}s")
            
            # Current workload
            print(f"\n💼 Current Workload:")
            print(f"   Legal Analyses: {len(self.agent.legal_analyses)}")
            print(f"   Contract Reviews: {len(self.agent.contract_reviews)}")
            print(f"   Regulatory Checks: {len(self.agent.regulatory_checks)}")
            
            # Regulatory frameworks
            print(f"\n🏛️ Known Regulatory Frameworks:")
            for category, frameworks in self.agent.regulatory_frameworks.items():
                print(f"   {category}: {len(frameworks)} regulations")
            
            # Contract types
            print(f"\n📋 Supported Contract Types:")
            for contract_type, terms in self.agent.contract_types.items():
                print(f"   {contract_type}: {len(terms)} key terms")
                
        except Exception as e:
            print(f"❌ Status error: {e}")

async def main():
    """Main CLI entry point"""
    cli = VerdictCLI()
    await cli.start()

if __name__ == "__main__":
    asyncio.run(main()) 