# ----------------------------------------------------------------------------
#  File:        theory_cli.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: CLI interface for the Theory Fact-Checking & Validation Agent
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import argparse
import json
import sys
from pathlib import Path
from theory_agent import TheoryAgent, ValidationReport
from beacon_agent import BeaconAgent

class TheoryCLI:
    """Command-line interface for the Theory agent"""
    
    def __init__(self):
        self.config = self._load_config()
        
    def _load_config(self) -> dict:
        """Load configuration from beacon config or create default"""
        beacon_config_file = Path("beacon_config.json")
        theory_config_file = Path("theory_config.json")
        
        if theory_config_file.exists():
            with open(theory_config_file, 'r') as f:
                return json.load(f)
        elif beacon_config_file.exists():
            # Use beacon config as base
            with open(beacon_config_file, 'r') as f:
                config = json.load(f)
                return config
        else:
            # Create default config
            default_config = {
                "factcheck_api_keys": {},
                "credibility_threshold": 0.7,
                "bias_tolerance": 0.3
            }
            
            with open(theory_config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
                
            print(f"Created default Theory config: {theory_config_file}")
            return default_config

    async def validate_text(self, text: str, topic: str = "user_input"):
        """Validate arbitrary text content"""
        print(f"🧠 Theory validating text: {topic}")
        print("=" * 50)
        
        # Create insight-like data structure for validation
        insight_data = {
            'topic': topic,
            'summary': text,
            'sources': [],  # No sources for arbitrary text
            'retrieved_at': "manual_input"
        }
        
        async with TheoryAgent(self.config) as theory:
            validation_report = await theory.validate_insight(insight_data)
            
            # Display results
            self._display_validation_results(validation_report)
            
            return validation_report

    async def validate_beacon_insight(self, beacon_topic: str):
        """Retrieve insight from Beacon and validate with Theory"""
        print(f"🔍 Getting insight from Beacon: {beacon_topic}")
        print("🧠 Then validating with Theory...")
        print("=" * 50)
        
        # Get insight from Beacon
        beacon_config = self._load_beacon_config()
        async with BeaconAgent(beacon_config) as beacon:
            beacon_insight = await beacon.ask_beacon(beacon_topic)
        
        print(f"\n✅ Beacon retrieved knowledge for: {beacon_topic}")
        
        # Validate with Theory
        async with TheoryAgent(self.config) as theory:
            # Full multi-agent consensus
            consensus_data = await theory.validate_with_beacon(beacon_insight)
            
            # Display results
            print(f"\n🧠 THEORY VALIDATION RESULTS:")
            print("-" * 40)
            self._display_validation_results(consensus_data['theory_validation'])
            
            # Display consensus
            print(f"\n🤝 MULTI-AGENT CONSENSUS:")
            print("-" * 40)
            consensus_summary = theory.create_consensus_summary(consensus_data)
            print(consensus_summary)
            
            return consensus_data

    def _load_beacon_config(self) -> dict:
        """Load Beacon configuration"""
        beacon_config_file = Path("beacon_config.json")
        if beacon_config_file.exists():
            with open(beacon_config_file, 'r') as f:
                return json.load(f)
        return {'news_api_key': None, 'wolfram_api_key': None}

    def _display_validation_results(self, validation_report: ValidationReport):
        """Display validation results in a user-friendly format"""
        print(f"📊 Overall Reliability: {validation_report.overall_reliability_score:.2f}")
        print(f"🎯 Recommendation: {validation_report.consensus_recommendation.replace('_', ' ').title()}")
        
        # Fact checks
        if validation_report.fact_checks:
            print(f"\n🔍 FACT CHECKS ({len(validation_report.fact_checks)}):")
            print("-" * 30)
            for i, fc in enumerate(validation_report.fact_checks, 1):
                status_emoji = {
                    'verified': '✅',
                    'disputed': '⚠️', 
                    'false': '❌',
                    'unverified': '❓'
                }.get(fc.verification_status, '❓')
                
                print(f"{i}. {status_emoji} {fc.verification_status.upper()} (confidence: {fc.confidence_score:.2f})")
                print(f"   Claim: {fc.claim[:80]}...")
                print(f"   Reasoning: {fc.reasoning}")
                if fc.supporting_sources:
                    print(f"   Supporting sources: {len(fc.supporting_sources)}")
        
        # Source credibility
        if validation_report.source_credibility_scores:
            print(f"\n🔗 SOURCE CREDIBILITY:")
            print("-" * 30)
            for source, score in validation_report.source_credibility_scores.items():
                score_emoji = "🟢" if score > 0.8 else "🟡" if score > 0.6 else "🔴"
                domain = source.split('/')[2] if '/' in source else source
                print(f"{score_emoji} {domain}: {score:.2f}")
        
        # Bias analysis
        bias = validation_report.bias_analysis
        print(f"\n🎭 BIAS ANALYSIS:")
        print("-" * 30)
        print(f"Overall Bias Score: {bias['overall_bias_score']:.2f}")
        print(f"Emotional Language: {bias['emotional_language_score']:.2f}")
        print(f"Absolute Terms: {bias['absolute_terms_score']:.2f}")
        print(f"Conspiracy Indicators: {bias['conspiracy_indicators_score']:.2f}")
        
        if bias['bias_indicators_found']:
            print(f"Indicators Found: {', '.join(bias['bias_indicators_found'][:3])}")
        
        print(f"\n🔒 Theory Signature: {validation_report.theory_signature[:16]}...")

    def list_validation_logs(self):
        """List available validation logs"""
        log_dir = Path("validation_logs")
        
        if not log_dir.exists():
            print("📁 No validation logs found")
            return
            
        log_files = list(log_dir.glob("*.jsonl"))
        
        if not log_files:
            print("📁 No validation logs found")
            return
            
        print("📊 AVAILABLE VALIDATION LOGS:")
        print("-" * 30)
        
        for log_file in sorted(log_files):
            try:
                with open(log_file, 'r') as f:
                    entries = len(f.readlines())
                print(f"📄 {log_file.name}: {entries} validations")
            except Exception as e:
                print(f"📄 {log_file.name}: Error reading file - {e}")

    def show_validation_log(self, date: str = None):
        """Show validations from a specific date"""
        log_dir = Path("validation_logs")
        
        if date:
            log_file = log_dir / f"theory_validations_{date}.jsonl"
        else:
            # Get latest log file
            log_files = list(log_dir.glob("*.jsonl"))
            if not log_files:
                print("📁 No validation logs found")
                return
            log_file = max(log_files, key=lambda f: f.stat().st_mtime)
            
        if not log_file.exists():
            print(f"📁 Log file not found: {log_file.name}")
            return
            
        print(f"📖 VALIDATIONS FROM: {log_file.name}")
        print("=" * 50)
        
        try:
            with open(log_file, 'r') as f:
                for i, line in enumerate(f, 1):
                    entry = json.loads(line)
                    print(f"\n[{i}] {entry['topic']}")
                    print(f"    📅 {entry['timestamp']}")
                    print(f"    📊 Reliability: {entry['overall_reliability_score']:.2f}")
                    print(f"    🎯 Recommendation: {entry['consensus_recommendation']}")
                    print(f"    🔍 Fact Checks: {len(entry['fact_checks'])}")
                    print(f"    🔒 Signature: {entry['theory_signature'][:16]}...")
                    
        except Exception as e:
            print(f"❌ Error reading log: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="Theory - Fact-Checking & Validation Agent CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s validate-text "Vaccines cause autism" --topic "vaccine_claim"
  %(prog)s validate-beacon "climate change causes"
  %(prog)s consensus "artificial intelligence dangers"
  %(prog)s logs
  %(prog)s show-log 20250101
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Validate text command
    validate_parser = subparsers.add_parser('validate-text', help='Validate arbitrary text')
    validate_parser.add_argument('text', help='Text to validate')
    validate_parser.add_argument('--topic', default='user_input', help='Topic description for the text')
    
    # Validate Beacon insight command
    beacon_parser = subparsers.add_parser('validate-beacon', help='Get Beacon insight and validate')
    beacon_parser.add_argument('topic', help='Topic for Beacon to research')
    
    # Full consensus command
    consensus_parser = subparsers.add_parser('consensus', help='Full Beacon + Theory consensus')
    consensus_parser.add_argument('topic', help='Topic for multi-agent consensus')
    
    # Logs command
    subparsers.add_parser('logs', help='List available validation logs')
    
    # Show log command
    show_parser = subparsers.add_parser('show-log', help='Show validations from a log')
    show_parser.add_argument('date', nargs='?', help='Date in YYYYMMDD format (latest if not specified)')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
        
    cli = TheoryCLI()
    
    try:
        if args.command == 'validate-text':
            asyncio.run(cli.validate_text(args.text, args.topic))
        elif args.command == 'validate-beacon':
            asyncio.run(cli.validate_beacon_insight(args.topic))
        elif args.command == 'consensus':
            asyncio.run(cli.validate_beacon_insight(args.topic))  # Same as validate-beacon
        elif args.command == 'logs':
            cli.list_validation_logs()
        elif args.command == 'show-log':
            cli.show_validation_log(args.date)
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 