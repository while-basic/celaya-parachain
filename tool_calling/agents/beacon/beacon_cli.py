# ----------------------------------------------------------------------------
#  File:        beacon_cli.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: CLI interface for the Beacon Knowledge & Insight Agent
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import argparse
import json
import sys
from pathlib import Path
from beacon_agent import BeaconAgent

class BeaconCLI:
    """Command-line interface for the Beacon agent"""
    
    def __init__(self):
        self.config = self._load_config()
        
    def _load_config(self) -> dict:
        """Load configuration from file or environment"""
        config_file = Path("beacon_config.json")
        
        if config_file.exists():
            with open(config_file, 'r') as f:
                return json.load(f)
        else:
            # Create default config file
            default_config = {
                "news_api_key": None,
                "wolfram_api_key": None,
                "default_sources": ["wikipedia", "pubmed"]
            }
            
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
                
            print(f"Created default config file: {config_file}")
            print("Please edit it with your API keys if you want to use News API or Wolfram Alpha")
            
            return default_config

    async def ask(self, topic: str, sources: list = None):
        """Ask Beacon about a topic"""
        print(f"🔍 Beacon researching: {topic}")
        print("=" * 50)
        
        async with BeaconAgent(self.config) as beacon:
            # Use config default sources if none specified
            if sources is None:
                sources = self.config.get('default_sources', ['wikipedia', 'pubmed'])
                
            # Get knowledge
            result = await beacon.ask_beacon(topic, sources)
            
            # Display results
            print("\n📋 SUMMARY:")
            print("-" * 30)
            print(result['summary'])
            
            print(f"\n📚 SOURCES ({len(result['sources'])}):")
            print("-" * 30)
            for i, source in enumerate(result['sources'], 1):
                reliability = "🟢" if source.reliability_score > 0.8 else "🟡" if source.reliability_score > 0.6 else "🔴"
                print(f"{i}. {reliability} [{source.source_type.upper()}] {source.title}")
                print(f"   {source.url}")
                
            # Log the insight
            print("\n💾 LOGGING INSIGHT...")
            insight_record = await beacon.log_insight(result)
            
            print(f"✅ Insight logged!")
            print(f"   Hash: {insight_record.insight_hash[:16]}...")
            print(f"   IPFS CID: {insight_record.ipfs_cid}")
            print(f"   Signature: {insight_record.agent_signature[:16]}...")
            
            return result

    async def batch_research(self, topics_file: str):
        """Research multiple topics from a file"""
        topics_path = Path(topics_file)
        
        if not topics_path.exists():
            print(f"❌ Topics file not found: {topics_file}")
            return
            
        with open(topics_path, 'r') as f:
            topics = [line.strip() for line in f if line.strip()]
            
        print(f"🔬 Beacon batch research: {len(topics)} topics")
        print("=" * 50)
        
        results = []
        async with BeaconAgent(self.config) as beacon:
            for i, topic in enumerate(topics, 1):
                print(f"\n[{i}/{len(topics)}] Researching: {topic}")
                try:
                    result = await beacon.ask_beacon(topic)
                    insight_record = await beacon.log_insight(result)
                    results.append({
                        'topic': topic,
                        'success': True,
                        'insight_hash': insight_record.insight_hash
                    })
                    print(f"✅ Completed: {topic}")
                except Exception as e:
                    print(f"❌ Failed: {topic} - {e}")
                    results.append({
                        'topic': topic,
                        'success': False,
                        'error': str(e)
                    })
                    
        # Summary
        successful = len([r for r in results if r['success']])
        print(f"\n📊 BATCH COMPLETE: {successful}/{len(topics)} successful")
        
        return results

    def list_logs(self):
        """List available insight logs"""
        log_dir = Path("insight_logs")
        
        if not log_dir.exists():
            print("📁 No insight logs found")
            return
            
        log_files = list(log_dir.glob("*.jsonl"))
        
        if not log_files:
            print("📁 No insight logs found")
            return
            
        print("📊 AVAILABLE INSIGHT LOGS:")
        print("-" * 30)
        
        for log_file in sorted(log_files):
            # Count entries
            try:
                with open(log_file, 'r') as f:
                    entries = len(f.readlines())
                print(f"📄 {log_file.name}: {entries} insights")
            except Exception as e:
                print(f"📄 {log_file.name}: Error reading file - {e}")

    def show_log(self, date: str = None):
        """Show insights from a specific date"""
        log_dir = Path("insight_logs")
        
        if date:
            log_file = log_dir / f"beacon_insights_{date}.jsonl"
        else:
            # Get latest log file
            log_files = list(log_dir.glob("*.jsonl"))
            if not log_files:
                print("📁 No insight logs found")
                return
            log_file = max(log_files, key=lambda f: f.stat().st_mtime)
            
        if not log_file.exists():
            print(f"📁 Log file not found: {log_file.name}")
            return
            
        print(f"📖 INSIGHTS FROM: {log_file.name}")
        print("=" * 50)
        
        try:
            with open(log_file, 'r') as f:
                for i, line in enumerate(f, 1):
                    entry = json.loads(line)
                    print(f"\n[{i}] {entry['topic']}")
                    print(f"    📅 {entry['timestamp']}")
                    print(f"    🔗 {len(entry['sources'])} sources")
                    print(f"    🔒 Hash: {entry['insight_hash'][:16]}...")
                    
                    # Show brief summary
                    summary = entry['summary']
                    if len(summary) > 150:
                        summary = summary[:150] + "..."
                    print(f"    📝 {summary}")
                    
        except Exception as e:
            print(f"❌ Error reading log: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="Beacon - Knowledge & Insight Agent CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ask "lithium toxicity symptoms"
  %(prog)s ask "machine learning" --sources wikipedia wolfram
  %(prog)s batch topics.txt
  %(prog)s logs
  %(prog)s show-log 20250101
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Ask command
    ask_parser = subparsers.add_parser('ask', help='Research a topic')
    ask_parser.add_argument('topic', help='Topic to research')
    ask_parser.add_argument('--sources', nargs='+', 
                           choices=['wikipedia', 'pubmed', 'wolfram', 'news'],
                           help='Sources to use for research')
    
    # Batch command
    batch_parser = subparsers.add_parser('batch', help='Research multiple topics from file')
    batch_parser.add_argument('file', help='File containing topics (one per line)')
    
    # Logs command
    subparsers.add_parser('logs', help='List available insight logs')
    
    # Show log command
    show_parser = subparsers.add_parser('show-log', help='Show insights from a log')
    show_parser.add_argument('date', nargs='?', help='Date in YYYYMMDD format (latest if not specified)')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
        
    cli = BeaconCLI()
    
    try:
        if args.command == 'ask':
            asyncio.run(cli.ask(args.topic, args.sources))
        elif args.command == 'batch':
            asyncio.run(cli.batch_research(args.file))
        elif args.command == 'logs':
            cli.list_logs()
        elif args.command == 'show-log':
            cli.show_log(args.date)
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 