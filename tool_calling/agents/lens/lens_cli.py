# ----------------------------------------------------------------------------
#  File:        lens_cli.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Command-line interface for the Lens Agent
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, List, Any
import time

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from lens_agent_enhanced import LensAgentEnhanced

class LensCLI:
    """Command-line interface for the Lens Agent"""
    
    def __init__(self):
        self.agent = None
        self.config_file = Path(__file__).parent / "lens_config.json"
        
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            else:
                # Default configuration
                return {
                    'max_image_size': 10485760,
                    'confidence_threshold': 0.7,
                    'ocr_languages': ['en', 'es', 'fr', 'de']
                }
        except Exception as e:
            print(f"⚠️ Error loading config: {e}")
            return {}
    
    async def initialize_agent(self):
        """Initialize the Lens Agent"""
        config = self.load_config()
        self.agent = LensAgentEnhanced(config)
        print("👁️ Lens Agent initialized successfully")
    
    async def analyze_image(self, image_path: str, analysis_types: List[str], 
                          output_file: str = None):
        """Analyze an image file"""
        try:
            image_path = Path(image_path)
            if not image_path.exists():
                print(f"❌ Image file not found: {image_path}")
                return
            
            print(f"🔍 Analyzing image: {image_path.name}")
            print(f"📋 Analysis types: {', '.join(analysis_types)}")
            
            # Read image data
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Perform analysis
            start_time = time.time()
            result = await self.agent.lens_analyze_image(
                image_data, analysis_types
            )
            processing_time = time.time() - start_time
            
            if result['success']:
                print(f"✅ Analysis completed in {processing_time:.2f}s")
                print(f"🎯 Confidence Level: {result['confidence_level']}")
                print(f"📊 Objects Detected: {len(result.get('detected_objects', []))}")
                
                if result.get('extracted_text'):
                    print(f"📝 Text Extracted: {result['extracted_text'][:100]}...")
                
                # Save results if output file specified
                if output_file:
                    with open(output_file, 'w') as f:
                        json.dump(result, f, indent=2, default=str)
                    print(f"💾 Results saved to: {output_file}")
                
            else:
                print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Error analyzing image: {e}")
    
    async def extract_text(self, image_path: str, language: str = 'en',
                         preprocessing: List[str] = None, output_file: str = None):
        """Extract text from image using OCR"""
        try:
            image_path = Path(image_path)
            if not image_path.exists():
                print(f"❌ Image file not found: {image_path}")
                return
            
            print(f"📝 Extracting text from: {image_path.name}")
            print(f"🌐 Language: {language}")
            
            # Read image data
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Extract text
            start_time = time.time()
            result = await self.agent.lens_extract_text(
                image_data, language, preprocessing or []
            )
            processing_time = time.time() - start_time
            
            if result['success']:
                print(f"✅ OCR completed in {processing_time:.2f}s")
                print(f"🎯 Confidence: {result.get('average_confidence', 0):.2f}")
                print(f"🌐 Language Detected: {result.get('language_detected', 'unknown')}")
                print(f"📝 Extracted Text:\n{result['extracted_text']}")
                
                # Save results if output file specified
                if output_file:
                    with open(output_file, 'w') as f:
                        f.write(result['extracted_text'])
                    print(f"💾 Text saved to: {output_file}")
                
            else:
                print(f"❌ OCR failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Error extracting text: {e}")
    
    async def scan_document(self, image_path: str, document_type: str = 'auto',
                          output_file: str = None):
        """Scan and analyze a document"""
        try:
            image_path = Path(image_path)
            if not image_path.exists():
                print(f"❌ Document file not found: {image_path}")
                return
            
            print(f"📄 Scanning document: {image_path.name}")
            print(f"📋 Document Type: {document_type}")
            
            # Read image data
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Scan document
            start_time = time.time()
            result = await self.agent.lens_scan_documents(image_data, document_type)
            processing_time = time.time() - start_time
            
            if result['success']:
                print(f"✅ Document scan completed in {processing_time:.2f}s")
                print(f"📋 Document Type: {result.get('document_type', 'unknown')}")
                print(f"⭐ Quality Score: {result.get('quality_score', 0):.2f}")
                
                if result.get('extracted_data'):
                    print("📊 Extracted Data:")
                    for key, value in result['extracted_data'].items():
                        print(f"  {key}: {value}")
                
                # Save results if output file specified
                if output_file:
                    with open(output_file, 'w') as f:
                        json.dump(result, f, indent=2, default=str)
                    print(f"💾 Results saved to: {output_file}")
                
            else:
                print(f"❌ Document scan failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Error scanning document: {e}")
    
    async def compare_images(self, image1_path: str, image2_path: str,
                           comparison_type: str = 'similarity', output_file: str = None):
        """Compare two images"""
        try:
            image1_path = Path(image1_path)
            image2_path = Path(image2_path)
            
            if not image1_path.exists():
                print(f"❌ First image not found: {image1_path}")
                return
            if not image2_path.exists():
                print(f"❌ Second image not found: {image2_path}")
                return
            
            print(f"⚖️ Comparing images:")
            print(f"  📷 Image 1: {image1_path.name}")
            print(f"  📷 Image 2: {image2_path.name}")
            print(f"  📋 Comparison Type: {comparison_type}")
            
            # Read image data
            with open(image1_path, 'rb') as f:
                image1_data = f.read()
            with open(image2_path, 'rb') as f:
                image2_data = f.read()
            
            # Compare images
            start_time = time.time()
            result = await self.agent.lens_compare_images(
                image1_data, image2_data, comparison_type
            )
            processing_time = time.time() - start_time
            
            if result['success']:
                print(f"✅ Comparison completed in {processing_time:.2f}s")
                print(f"📊 Similarity Score: {result.get('similarity_score', 0):.2f}")
                print(f"📋 Comparison Type: {result.get('comparison_type', 'unknown')}")
                
                if result.get('differences'):
                    print(f"🔍 Differences Found: {len(result['differences'])}")
                
                # Save results if output file specified
                if output_file:
                    with open(output_file, 'w') as f:
                        json.dump(result, f, indent=2, default=str)
                    print(f"💾 Results saved to: {output_file}")
                
            else:
                print(f"❌ Comparison failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Error comparing images: {e}")
    
    async def detect_patterns(self, image_path: str, pattern_types: List[str] = None,
                            output_file: str = None):
        """Detect patterns in an image"""
        try:
            image_path = Path(image_path)
            if not image_path.exists():
                print(f"❌ Image file not found: {image_path}")
                return
            
            print(f"🔍 Detecting patterns in: {image_path.name}")
            if pattern_types:
                print(f"📋 Pattern Types: {', '.join(pattern_types)}")
            
            # Read image data
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Detect patterns
            start_time = time.time()
            result = await self.agent.lens_detect_patterns(image_data, pattern_types)
            processing_time = time.time() - start_time
            
            if result['success']:
                print(f"✅ Pattern detection completed in {processing_time:.2f}s")
                print(f"🎯 Total Matches: {result.get('total_matches', 0)}")
                print(f"📊 Detection Confidence: {result.get('detection_confidence', 0):.2f}")
                
                if result.get('detected_patterns'):
                    print("🔍 Detected Patterns:")
                    for pattern in result['detected_patterns'][:5]:  # Show first 5
                        print(f"  • {pattern.get('pattern_type', 'unknown')}: "
                              f"{pattern.get('confidence_score', 0):.2f}")
                
                # Save results if output file specified
                if output_file:
                    with open(output_file, 'w') as f:
                        json.dump(result, f, indent=2, default=str)
                    print(f"💾 Results saved to: {output_file}")
                
            else:
                print(f"❌ Pattern detection failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Error detecting patterns: {e}")
    
    async def generate_report(self, hours: int = 24, output_file: str = None):
        """Generate visual analysis report"""
        try:
            print(f"📊 Generating visual analysis report for last {hours} hours...")
            
            start_time = time.time()
            result = await self.agent.lens_generate_visual_report(hours)
            processing_time = time.time() - start_time
            
            if result['success']:
                print(f"✅ Report generated in {processing_time:.2f}s")
                
                report = result['report']
                summary = report.get('analysis_summary', {})
                
                print(f"\n📈 Analysis Summary:")
                print(f"  🔍 Total Analyses: {summary.get('total_analyses', 0)}")
                print(f"  📝 OCR Operations: {summary.get('total_ocr_operations', 0)}")
                print(f"  🎯 Objects Detected: {summary.get('total_objects_detected', 0)}")
                print(f"  📊 Average Processing Time: {summary.get('average_processing_time', 0):.2f}s")
                print(f"  ⭐ Success Rate: {summary.get('success_rate', 0):.1%}")
                
                # Save report if output file specified
                if output_file:
                    with open(output_file, 'w') as f:
                        json.dump(result, f, indent=2, default=str)
                    print(f"💾 Report saved to: {output_file}")
                
            else:
                print(f"❌ Report generation failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Error generating report: {e}")
    
    async def interactive_mode(self):
        """Interactive CLI mode"""
        print("👁️ Lens Agent - Interactive Mode")
        print("=" * 50)
        print("Available commands:")
        print("  1. analyze - Analyze an image")
        print("  2. ocr - Extract text from image")
        print("  3. scan - Scan a document")
        print("  4. compare - Compare two images")
        print("  5. patterns - Detect patterns")
        print("  6. report - Generate analysis report")
        print("  7. tools - List available tools")
        print("  8. help - Show this help")
        print("  9. exit - Exit interactive mode")
        print("-" * 50)
        
        while True:
            try:
                command = input("\n👁️ lens> ").strip().lower()
                
                if command in ['exit', 'quit', 'q']:
                    print("👋 Goodbye!")
                    break
                elif command == 'help':
                    print("📋 Available commands: analyze, ocr, scan, compare, patterns, report, tools, exit")
                elif command == 'tools':
                    tools = self.agent.get_available_tools()
                    print(f"🛠️ Available tools: {len(tools)}")
                    for tool in tools[:10]:  # Show first 10
                        print(f"  • {tool['name']}: {tool['description']}")
                elif command == 'analyze':
                    image_path = input("📷 Image path: ").strip()
                    types_input = input("📋 Analysis types (comma-separated): ").strip()
                    analysis_types = [t.strip() for t in types_input.split(',') if t.strip()]
                    if not analysis_types:
                        analysis_types = ['object_detection', 'text_recognition']
                    await self.analyze_image(image_path, analysis_types)
                elif command == 'ocr':
                    image_path = input("📷 Image path: ").strip()
                    language = input("🌐 Language (default: en): ").strip() or 'en'
                    await self.extract_text(image_path, language)
                elif command == 'scan':
                    image_path = input("📄 Document path: ").strip()
                    doc_type = input("📋 Document type (default: auto): ").strip() or 'auto'
                    await self.scan_document(image_path, doc_type)
                elif command == 'compare':
                    image1 = input("📷 First image path: ").strip()
                    image2 = input("📷 Second image path: ").strip()
                    comp_type = input("⚖️ Comparison type (default: similarity): ").strip() or 'similarity'
                    await self.compare_images(image1, image2, comp_type)
                elif command == 'patterns':
                    image_path = input("📷 Image path: ").strip()
                    patterns_input = input("🔍 Pattern types (comma-separated, optional): ").strip()
                    pattern_types = [p.strip() for p in patterns_input.split(',') if p.strip()] if patterns_input else None
                    await self.detect_patterns(image_path, pattern_types)
                elif command == 'report':
                    hours_input = input("⏰ Time period in hours (default: 24): ").strip()
                    hours = int(hours_input) if hours_input.isdigit() else 24
                    await self.generate_report(hours)
                else:
                    print(f"❓ Unknown command: {command}. Type 'help' for available commands.")
                    
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Lens Agent - Visual Analysis & Scanner CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --interactive                    # Interactive mode
  %(prog)s --analyze image.jpg              # Analyze image
  %(prog)s --ocr document.pdf --language en # Extract text
  %(prog)s --scan invoice.jpg               # Scan document
  %(prog)s --compare img1.jpg img2.jpg      # Compare images
  %(prog)s --patterns logo.png              # Detect patterns
  %(prog)s --report --hours 48              # Generate report
        """
    )
    
    # Main operation modes
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Run in interactive mode')
    
    # Analysis operations
    parser.add_argument('--analyze', metavar='IMAGE_PATH',
                       help='Analyze an image file')
    parser.add_argument('--types', metavar='TYPES',
                       help='Analysis types (comma-separated)')
    
    # OCR operations
    parser.add_argument('--ocr', metavar='IMAGE_PATH',
                       help='Extract text from image using OCR')
    parser.add_argument('--language', default='en',
                       help='OCR language (default: en)')
    
    # Document scanning
    parser.add_argument('--scan', metavar='DOC_PATH',
                       help='Scan and analyze a document')
    parser.add_argument('--doc-type', default='auto',
                       help='Document type (default: auto)')
    
    # Image comparison
    parser.add_argument('--compare', nargs=2, metavar=('IMAGE1', 'IMAGE2'),
                       help='Compare two images')
    parser.add_argument('--comparison-type', default='similarity',
                       help='Comparison type (default: similarity)')
    
    # Pattern detection
    parser.add_argument('--patterns', metavar='IMAGE_PATH',
                       help='Detect patterns in image')
    parser.add_argument('--pattern-types', metavar='TYPES',
                       help='Pattern types (comma-separated)')
    
    # Reporting
    parser.add_argument('--report', action='store_true',
                       help='Generate visual analysis report')
    parser.add_argument('--hours', type=int, default=24,
                       help='Report time period in hours (default: 24)')
    
    # Output options
    parser.add_argument('--output', '-o', metavar='FILE',
                       help='Output file for results')
    
    args = parser.parse_args()
    
    async def run_cli():
        cli = LensCLI()
        await cli.initialize_agent()
        
        if args.interactive:
            await cli.interactive_mode()
        elif args.analyze:
            types = args.types.split(',') if args.types else ['object_detection', 'text_recognition']
            await cli.analyze_image(args.analyze, types, args.output)
        elif args.ocr:
            await cli.extract_text(args.ocr, args.language, None, args.output)
        elif args.scan:
            await cli.scan_document(args.scan, args.doc_type, args.output)
        elif args.compare:
            await cli.compare_images(args.compare[0], args.compare[1], 
                                   args.comparison_type, args.output)
        elif args.patterns:
            pattern_types = args.pattern_types.split(',') if args.pattern_types else None
            await cli.detect_patterns(args.patterns, pattern_types, args.output)
        elif args.report:
            await cli.generate_report(args.hours, args.output)
        else:
            print("👁️ Lens Agent CLI")
            print("Use --help for usage information or --interactive for interactive mode")
    
    try:
        asyncio.run(run_cli())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 