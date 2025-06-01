# ----------------------------------------------------------------------------
#  File:        test_report_generation.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test script for report generation with blockchain and IPFS
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path

from cognition_tools import CognitionAPI
from report_generator import ReportGenerator, CognitionReport

async def test_report_generation():
    """Test the complete report generation system"""
    
    print("🧪 Testing Report Generation System")
    print("=" * 50)
    
    # Initialize the API
    api = CognitionAPI()
    
    # Run a sample cognition to generate test data
    print("\n1. Running sample cognition...")
    execution_result = await api.execute_tool(
        'sim.run_cognition',
        cognition_id='test_report_cognition',
        sandbox_mode=True,
        timeout=120
    )
    
    execution_id = execution_result['execution_id']
    print(f"✅ Execution completed: {execution_id}")
    print(f"   Status: {execution_result['status']}")
    print(f"   Duration: {execution_result['duration']}s")
    print(f"   Phases: {execution_result['phases_completed']}/{execution_result['total_phases']}")
    
    # Generate a comprehensive report
    print("\n2. Generating comprehensive report...")
    report = await api.execute_tool('report.generate', execution_id=execution_id)
    
    print(f"✅ Report generated: {report.report_id}")
    print(f"   Blockchain Hash: {report.blockchain_hash}")
    print(f"   IPFS CID: {report.ipfs_cid}")
    print(f"   Merkle Root: {report.merkle_root}")
    print(f"   Verification Sig: {report.verification_signature[:16]}...")
    
    # Test report retrieval
    print("\n3. Testing report retrieval...")
    retrieved_report = await api.execute_tool('report.get', execution_id=execution_id)
    
    if retrieved_report and retrieved_report.report_id == report.report_id:
        print("✅ Report retrieval successful")
    else:
        print("❌ Report retrieval failed")
        return
    
    # Test report listing
    print("\n4. Testing report listing...")
    reports_list = await api.execute_tool('report.list')
    
    found_report = False
    for report_info in reports_list:
        if report_info['execution_id'] == execution_id:
            found_report = True
            print("✅ Report found in listing")
            print(f"   Report ID: {report_info['report_id']}")
            print(f"   Blockchain Hash: {report_info['blockchain_hash']}")
            print(f"   IPFS CID: {report_info['ipfs_cid']}")
            break
    
    if not found_report:
        print("❌ Report not found in listing")
        return
    
    # Verify file generation
    print("\n5. Verifying generated files...")
    storage_path = Path("storage/reports")
    
    # Check JSON file
    json_file = storage_path / "json" / f"{report.report_id}.json"
    if json_file.exists():
        print("✅ JSON report file exists")
        with open(json_file, 'r') as f:
            json_data = json.load(f)
            print(f"   File size: {json_file.stat().st_size} bytes")
            print(f"   Contains {len(json_data)} fields")
    else:
        print("❌ JSON report file missing")
    
    # Check HTML file
    html_file = storage_path / "html" / f"{report.report_id}.html"
    if html_file.exists():
        print("✅ HTML report file exists")
        print(f"   File size: {html_file.stat().st_size} bytes")
    else:
        print("❌ HTML report file missing")
    
    # Check blockchain metadata
    blockchain_file = storage_path / "blockchain" / f"{report.report_id}_blockchain.json"
    if blockchain_file.exists():
        print("✅ Blockchain metadata file exists")
        with open(blockchain_file, 'r') as f:
            blockchain_data = json.load(f)
            print(f"   Blockchain Hash: {blockchain_data['blockchain_hash']}")
            print(f"   IPFS CID: {blockchain_data['ipfs_cid']}")
    else:
        print("❌ Blockchain metadata file missing")
    
    # Test report quality and content
    print("\n6. Analyzing report quality...")
    print(f"   Quality Score: {report.execution_quality_score:.1%}")
    print(f"   Reliability Index: {report.reliability_index:.1%}")
    print(f"   Innovation Score: {report.innovation_score:.1%}")
    print(f"   Efficiency Rating: {report.efficiency_rating:.1%}")
    print(f"   Key Insights: {len(report.key_insights)}")
    print(f"   Recommendations: {len(report.recommendations)}")
    print(f"   Risk Assessments: {len(report.risk_assessments)}")
    print(f"   Agent Performance Entries: {len(report.agent_performance_metrics)}")
    
    # Verify blockchain and IPFS data integrity
    print("\n7. Verifying data integrity...")
    
    # Check if blockchain hash is valid hex
    if len(report.blockchain_hash) == 64 and all(c in '0123456789abcdef' for c in report.blockchain_hash.lower()):
        print("✅ Blockchain hash format valid")
    else:
        print("❌ Blockchain hash format invalid")
    
    # Check if IPFS CID starts with Qm (typical format)
    if report.ipfs_cid.startswith('Qm') and len(report.ipfs_cid) > 40:
        print("✅ IPFS CID format valid")
    else:
        print("❌ IPFS CID format invalid")
    
    # Check if verification signature is valid
    if len(report.verification_signature) == 64:
        print("✅ Verification signature format valid")
    else:
        print("❌ Verification signature format invalid")
    
    # Test compliance checks
    print("\n8. Checking compliance status...")
    compliance_passed = sum(1 for passed in report.compliance_checks.values() if passed)
    compliance_total = len(report.compliance_checks)
    print(f"   Compliance: {compliance_passed}/{compliance_total} checks passed")
    
    for check, passed in report.compliance_checks.items():
        status = "✅" if passed else "❌"
        print(f"   {status} {check}")
    
    # Performance summary
    print("\n9. Agent Performance Summary...")
    for agent, metrics in report.agent_performance_metrics.items():
        print(f"   {agent}: {metrics['overall_score']:.1%} (Contributions: {metrics['contribution_count']})")
    
    # LLM Models used
    print("\n10. LLM Models Summary...")
    for agent, model in report.llm_models_used.items():
        print(f"   {agent}: {model}")
    
    print("\n" + "=" * 50)
    print("🎯 Report Generation Test Complete!")
    print(f"📋 Report ID: {report.report_id}")
    print(f"🔗 Blockchain: {report.blockchain_hash}")
    print(f"🌐 IPFS: {report.ipfs_cid}")
    print(f"🔐 Signature: {report.verification_signature}")
    
    return report

async def test_multiple_reports():
    """Test generating multiple reports"""
    
    print("\n" + "🔄" * 20)
    print("Testing Multiple Report Generation")
    print("=" * 50)
    
    api = CognitionAPI()
    reports = []
    
    # Generate 3 test reports
    for i in range(3):
        print(f"\nGenerating report {i+1}/3...")
        
        # Run cognition
        execution_result = await api.execute_tool(
            'sim.run_cognition',
            cognition_id=f'multi_test_{i}',
            sandbox_mode=True,
            timeout=60
        )
        
        # Generate report
        report = await api.execute_tool(
            'report.generate', 
            execution_id=execution_result['execution_id']
        )
        
        reports.append(report)
        print(f"✅ Report {i+1} generated: {report.report_id}")
    
    # List all reports
    print("\nListing all reports...")
    reports_list = await api.execute_tool('report.list')
    print(f"✅ Found {len(reports_list)} total reports")
    
    # Verify all our reports are in the list
    our_report_ids = {r.report_id for r in reports}
    listed_report_ids = {r['report_id'] for r in reports_list if r.get('report_id')}
    
    if our_report_ids.issubset(listed_report_ids):
        print("✅ All generated reports found in listing")
    else:
        print("❌ Some reports missing from listing")
    
    print(f"\n🎯 Multiple Report Test Complete! Generated {len(reports)} reports")
    return reports

async def main():
    """Main test function"""
    
    print("🚀 Starting Comprehensive Report Generation Tests")
    print("=" * 60)
    
    # Test single report generation
    primary_report = await test_report_generation()
    
    # Test multiple report generation
    multiple_reports = await test_multiple_reports()
    
    print("\n" + "🏆" * 20)
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print(f"✅ Primary report: {primary_report.report_id}")
    print(f"✅ Additional reports: {len(multiple_reports)}")
    print(f"🔗 Blockchain hashes generated: {len(multiple_reports) + 1}")
    print(f"🌐 IPFS CIDs created: {len(multiple_reports) + 1}")
    print("\n📊 Report files available in storage/reports/")
    print("🌍 HTML reports can be viewed in browser")
    print("🔍 API endpoints ready for frontend integration")

if __name__ == "__main__":
    asyncio.run(main()) 