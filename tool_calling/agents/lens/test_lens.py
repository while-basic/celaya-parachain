# ----------------------------------------------------------------------------
#  File:        test_lens.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test suite for the Lens Agent visual analysis functionality
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import unittest
import asyncio
import tempfile
import json
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
import time

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from lens_agent_enhanced import LensAgentEnhanced, ImageFormat, AnalysisType, ConfidenceLevel

class TestLensAgent(unittest.TestCase):
    """Test suite for Lens Agent functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {
            'max_image_size': 10485760,
            'confidence_threshold': 0.7,
            'ocr_languages': ['en', 'es', 'fr', 'de'],
            'processing_timeout': 30
        }
        self.lens_agent = LensAgentEnhanced(self.config)
        
        # Create sample image data for testing
        self.sample_image_data = b'\xff\xd8\xff\xe0' + b'\x00' * 1000  # Minimal JPEG
        self.sample_large_image = b'\xff\xd8\xff\xe0' + b'\x00' * 500000  # Larger image
        self.invalid_image_data = b'\x00\x01\x02\x03'  # Invalid image data
    
    def test_agent_initialization(self):
        """Test agent initialization and configuration"""
        self.assertEqual(self.lens_agent.agent_id, "lens_agent")
        self.assertEqual(self.lens_agent.max_image_size, 10485760)
        self.assertEqual(self.lens_agent.confidence_threshold, 0.7)
        self.assertIn('en', self.lens_agent.ocr_languages)
        self.assertIsInstance(self.lens_agent.visual_analyses, dict)
        self.assertIsInstance(self.lens_agent.ocr_results, dict)
    
    def test_image_formats_enum(self):
        """Test image format enumeration"""
        self.assertEqual(ImageFormat.JPEG.value, "jpeg")
        self.assertEqual(ImageFormat.PNG.value, "png")
        self.assertEqual(ImageFormat.GIF.value, "gif")
        self.assertIn(ImageFormat.WEBP, list(ImageFormat))
    
    def test_analysis_types_enum(self):
        """Test analysis type enumeration"""
        self.assertEqual(AnalysisType.OBJECT_DETECTION.value, "object_detection")
        self.assertEqual(AnalysisType.TEXT_RECOGNITION.value, "text_recognition")
        self.assertEqual(AnalysisType.FACE_DETECTION.value, "face_detection")
        self.assertIn(AnalysisType.BARCODE_SCANNING, list(AnalysisType))
    
    def test_confidence_levels_enum(self):
        """Test confidence level enumeration"""
        self.assertEqual(ConfidenceLevel.LOW.value, "low")
        self.assertEqual(ConfidenceLevel.MEDIUM.value, "medium")
        self.assertEqual(ConfidenceLevel.HIGH.value, "high")
        self.assertEqual(ConfidenceLevel.VERY_HIGH.value, "very_high")

class TestLensVisualAnalysis(unittest.TestCase):
    """Test visual analysis functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {
            'max_image_size': 10485760,
            'confidence_threshold': 0.7,
            'ocr_languages': ['en']
        }
        self.lens_agent = LensAgentEnhanced(self.config)
        self.sample_image = b'\xff\xd8\xff\xe0' + b'\x00' * 1000
    
    async def test_lens_analyze_image_success(self):
        """Test successful image analysis"""
        analysis_types = ['object_detection', 'text_recognition']
        
        result = await self.lens_agent.lens_analyze_image(
            self.sample_image, analysis_types
        )
        
        self.assertTrue(result['success'])
        self.assertIn('analysis_id', result)
        self.assertIn('confidence_level', result)
        self.assertIn('detected_objects', result)
        self.assertIn('processing_time_seconds', result)
        self.assertIsInstance(result['detected_objects'], list)
    
    async def test_lens_analyze_image_with_metadata(self):
        """Test image analysis with metadata"""
        analysis_types = ['object_detection']
        metadata = {
            'source': 'test_camera',
            'location': 'office',
            'timestamp': '2025-01-15T10:30:00Z'
        }
        
        result = await self.lens_agent.lens_analyze_image(
            self.sample_image, analysis_types, metadata
        )
        
        self.assertTrue(result['success'])
        self.assertIn('image_metadata', result)
    
    async def test_lens_analyze_image_invalid_data(self):
        """Test image analysis with invalid data"""
        invalid_data = b'\x00\x01\x02\x03'
        analysis_types = ['object_detection']
        
        result = await self.lens_agent.lens_analyze_image(
            invalid_data, analysis_types
        )
        
        # Should handle gracefully (implementation may vary)
        self.assertIn('success', result)
    
    async def test_lens_analyze_image_multiple_types(self):
        """Test image analysis with multiple analysis types"""
        analysis_types = [
            'object_detection', 
            'text_recognition', 
            'face_detection',
            'quality_assessment'
        ]
        
        result = await self.lens_agent.lens_analyze_image(
            self.sample_image, analysis_types
        )
        
        self.assertTrue(result['success'])
        self.assertIn('detected_objects', result)
        self.assertIn('extracted_text', result)

class TestLensOCR(unittest.TestCase):
    """Test OCR functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {
            'max_image_size': 10485760,
            'ocr_languages': ['en', 'es', 'fr']
        }
        self.lens_agent = LensAgentEnhanced(self.config)
        self.sample_image = b'\xff\xd8\xff\xe0' + b'\x00' * 1000
    
    async def test_lens_extract_text_basic(self):
        """Test basic text extraction"""
        result = await self.lens_agent.lens_extract_text(
            self.sample_image, 'en'
        )
        
        self.assertTrue(result['success'])
        self.assertIn('extracted_text', result)
        self.assertIn('language_detected', result)
        self.assertIn('confidence_scores', result)
        self.assertIn('processing_time_seconds', result)
    
    async def test_lens_extract_text_with_preprocessing(self):
        """Test text extraction with preprocessing"""
        preprocessing = ['deskew', 'denoise', 'enhance_contrast']
        
        result = await self.lens_agent.lens_extract_text(
            self.sample_image, 'en', preprocessing
        )
        
        self.assertTrue(result['success'])
        self.assertIn('preprocessing_applied', result)
        self.assertEqual(result['preprocessing_applied'], preprocessing)
    
    async def test_lens_extract_text_different_languages(self):
        """Test text extraction with different languages"""
        languages = ['en', 'es', 'fr']
        
        for language in languages:
            result = await self.lens_agent.lens_extract_text(
                self.sample_image, language
            )
            
            self.assertTrue(result['success'])
            self.assertIn('language_detected', result)
    
    async def test_lens_extract_text_confidence_scores(self):
        """Test OCR confidence scoring"""
        result = await self.lens_agent.lens_extract_text(
            self.sample_image, 'en'
        )
        
        self.assertTrue(result['success'])
        self.assertIn('confidence_scores', result)
        self.assertIsInstance(result['confidence_scores'], list)
        if result['confidence_scores']:
            for score in result['confidence_scores']:
                self.assertGreaterEqual(score, 0.0)
                self.assertLessEqual(score, 1.0)

class TestLensDocumentScanning(unittest.TestCase):
    """Test document scanning functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {'max_image_size': 10485760}
        self.lens_agent = LensAgentEnhanced(self.config)
        self.sample_document = b'\xff\xd8\xff\xe0' + b'\x00' * 1000
    
    async def test_lens_scan_documents_auto_detect(self):
        """Test document scanning with auto-detection"""
        result = await self.lens_agent.lens_scan_documents(
            self.sample_document, 'auto'
        )
        
        self.assertTrue(result['success'])
        self.assertIn('document_type', result)
        self.assertIn('quality_score', result)
        self.assertIn('extracted_data', result)
        self.assertIn('processing_time_seconds', result)
    
    async def test_lens_scan_documents_specific_types(self):
        """Test document scanning with specific document types"""
        document_types = ['invoice', 'receipt', 'contract', 'license']
        
        for doc_type in document_types:
            result = await self.lens_agent.lens_scan_documents(
                self.sample_document, doc_type
            )
            
            self.assertTrue(result['success'])
            self.assertIn('document_type', result)
    
    async def test_lens_scan_documents_quality_assessment(self):
        """Test document quality assessment"""
        result = await self.lens_agent.lens_scan_documents(
            self.sample_document, 'auto'
        )
        
        self.assertTrue(result['success'])
        self.assertIn('quality_score', result)
        quality_score = result['quality_score']
        self.assertGreaterEqual(quality_score, 0.0)
        self.assertLessEqual(quality_score, 1.0)
    
    async def test_lens_scan_documents_data_extraction(self):
        """Test structured data extraction from documents"""
        result = await self.lens_agent.lens_scan_documents(
            self.sample_document, 'invoice'
        )
        
        self.assertTrue(result['success'])
        self.assertIn('extracted_data', result)
        self.assertIsInstance(result['extracted_data'], dict)

class TestLensImageComparison(unittest.TestCase):
    """Test image comparison functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {'max_image_size': 10485760}
        self.lens_agent = LensAgentEnhanced(self.config)
        self.sample_image1 = b'\xff\xd8\xff\xe0' + b'\x00' * 1000
        self.sample_image2 = b'\xff\xd8\xff\xe0' + b'\x11' * 1000  # Different
    
    async def test_lens_compare_images_similarity(self):
        """Test image similarity comparison"""
        result = await self.lens_agent.lens_compare_images(
            self.sample_image1, self.sample_image2, 'similarity'
        )
        
        self.assertTrue(result['success'])
        self.assertIn('similarity_score', result)
        self.assertIn('comparison_type', result)
        self.assertEqual(result['comparison_type'], 'similarity')
        
        similarity_score = result['similarity_score']
        self.assertGreaterEqual(similarity_score, 0.0)
        self.assertLessEqual(similarity_score, 1.0)
    
    async def test_lens_compare_images_difference(self):
        """Test image difference detection"""
        result = await self.lens_agent.lens_compare_images(
            self.sample_image1, self.sample_image2, 'difference'
        )
        
        self.assertTrue(result['success'])
        self.assertIn('comparison_type', result)
        self.assertEqual(result['comparison_type'], 'difference')
    
    async def test_lens_compare_images_identical(self):
        """Test comparison of identical images"""
        result = await self.lens_agent.lens_compare_images(
            self.sample_image1, self.sample_image1, 'similarity'
        )
        
        self.assertTrue(result['success'])
        # Identical images should have high similarity
        self.assertGreater(result['similarity_score'], 0.9)

class TestLensPatternDetection(unittest.TestCase):
    """Test pattern detection functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {'max_image_size': 10485760}
        self.lens_agent = LensAgentEnhanced(self.config)
        self.sample_image = b'\xff\xd8\xff\xe0' + b'\x00' * 1000
    
    async def test_lens_detect_patterns_basic(self):
        """Test basic pattern detection"""
        result = await self.lens_agent.lens_detect_patterns(
            self.sample_image
        )
        
        self.assertTrue(result['success'])
        self.assertIn('total_matches', result)
        self.assertIn('detected_patterns', result)
        self.assertIn('detection_confidence', result)
        self.assertIsInstance(result['detected_patterns'], list)
    
    async def test_lens_detect_patterns_specific_types(self):
        """Test pattern detection with specific types"""
        pattern_types = ['shapes', 'text_patterns', 'barcodes']
        
        result = await self.lens_agent.lens_detect_patterns(
            self.sample_image, pattern_types
        )
        
        self.assertTrue(result['success'])
        self.assertIn('pattern_types_searched', result)
        self.assertEqual(result['pattern_types_searched'], pattern_types)
    
    async def test_lens_detect_patterns_confidence(self):
        """Test pattern detection confidence scoring"""
        result = await self.lens_agent.lens_detect_patterns(
            self.sample_image
        )
        
        self.assertTrue(result['success'])
        confidence = result['detection_confidence']
        self.assertGreaterEqual(confidence, 0.0)
        self.assertLessEqual(confidence, 1.0)

class TestLensReporting(unittest.TestCase):
    """Test reporting functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {'max_image_size': 10485760}
        self.lens_agent = LensAgentEnhanced(self.config)
    
    async def test_lens_generate_visual_report(self):
        """Test visual analysis report generation"""
        result = await self.lens_agent.lens_generate_visual_report(24)
        
        self.assertTrue(result['success'])
        self.assertIn('report', result)
        self.assertIn('report_timestamp', result)
        
        report = result['report']
        self.assertIn('analysis_summary', report)
        self.assertIn('performance_metrics', report)
    
    async def test_lens_generate_visual_report_different_periods(self):
        """Test report generation for different time periods"""
        time_periods = [1, 6, 12, 24, 48]
        
        for hours in time_periods:
            result = await self.lens_agent.lens_generate_visual_report(hours)
            
            self.assertTrue(result['success'])
            self.assertIn('time_period_hours', result)
            self.assertEqual(result['time_period_hours'], hours)

class TestLensTools(unittest.TestCase):
    """Test tool management functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {'max_image_size': 10485760}
        self.lens_agent = LensAgentEnhanced(self.config)
    
    def test_get_available_tools(self):
        """Test getting available tools"""
        tools = self.lens_agent.get_available_tools()
        
        self.assertIsInstance(tools, list)
        self.assertGreater(len(tools), 0)
        
        # Check for Lens-specific tools
        tool_names = [tool['name'] for tool in tools]
        self.assertIn('lens_analyze_image', tool_names)
        self.assertIn('lens_extract_text', tool_names)
        self.assertIn('lens_scan_documents', tool_names)
        self.assertIn('lens_compare_images', tool_names)
        self.assertIn('lens_detect_patterns', tool_names)
        self.assertIn('lens_generate_visual_report', tool_names)
    
    def test_tool_descriptions(self):
        """Test tool descriptions are properly formatted"""
        tools = self.lens_agent.get_available_tools()
        
        for tool in tools:
            self.assertIn('name', tool)
            self.assertIn('description', tool)
            self.assertIn('parameters', tool)
            self.assertIsInstance(tool['name'], str)
            self.assertIsInstance(tool['description'], str)
            self.assertIsInstance(tool['parameters'], dict)
    
    async def test_execute_tool_dynamic(self):
        """Test dynamic tool execution"""
        # Test executing a Lens tool dynamically
        sample_image = b'\xff\xd8\xff\xe0' + b'\x00' * 1000
        
        result = await self.lens_agent.execute_tool(
            'lens_extract_text',
            image_data=sample_image,
            language='en'
        )
        
        self.assertIsInstance(result, dict)
        self.assertIn('success', result)

class TestLensValidation(unittest.TestCase):
    """Test validation and error handling"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {'max_image_size': 1000}  # Small size for testing
        self.lens_agent = LensAgentEnhanced(self.config)
    
    async def test_image_size_validation(self):
        """Test image size validation"""
        large_image = b'\xff\xd8\xff\xe0' + b'\x00' * 10000  # Exceeds limit
        
        result = await self.lens_agent.lens_analyze_image(
            large_image, ['object_detection']
        )
        
        # Should handle size limit gracefully
        self.assertIn('success', result)
    
    async def test_invalid_analysis_types(self):
        """Test handling of invalid analysis types"""
        sample_image = b'\xff\xd8\xff\xe0' + b'\x00' * 100
        invalid_types = ['invalid_type', 'nonexistent_analysis']
        
        result = await self.lens_agent.lens_analyze_image(
            sample_image, invalid_types
        )
        
        # Should handle gracefully
        self.assertIn('success', result)
    
    async def test_empty_image_data(self):
        """Test handling of empty image data"""
        empty_data = b''
        
        result = await self.lens_agent.lens_analyze_image(
            empty_data, ['object_detection']
        )
        
        # Should handle empty data gracefully
        self.assertIn('success', result)

class TestLensIntegration(unittest.TestCase):
    """Integration tests for Lens Agent"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {
            'max_image_size': 10485760,
            'confidence_threshold': 0.7,
            'ocr_languages': ['en']
        }
        self.lens_agent = LensAgentEnhanced(self.config)
        self.sample_image = b'\xff\xd8\xff\xe0' + b'\x00' * 1000
    
    async def test_full_workflow_analysis(self):
        """Test complete analysis workflow"""
        # Step 1: Analyze image
        analysis_result = await self.lens_agent.lens_analyze_image(
            self.sample_image, ['object_detection', 'text_recognition']
        )
        self.assertTrue(analysis_result['success'])
        
        # Step 2: Extract text
        ocr_result = await self.lens_agent.lens_extract_text(
            self.sample_image, 'en'
        )
        self.assertTrue(ocr_result['success'])
        
        # Step 3: Detect patterns
        pattern_result = await self.lens_agent.lens_detect_patterns(
            self.sample_image
        )
        self.assertTrue(pattern_result['success'])
        
        # Step 4: Generate report
        report_result = await self.lens_agent.lens_generate_visual_report(1)
        self.assertTrue(report_result['success'])
    
    async def test_batch_processing_simulation(self):
        """Test batch processing capabilities"""
        images = [
            b'\xff\xd8\xff\xe0' + b'\x00' * 1000,
            b'\xff\xd8\xff\xe0' + b'\x11' * 1000,
            b'\xff\xd8\xff\xe0' + b'\x22' * 1000
        ]
        
        results = []
        for image in images:
            result = await self.lens_agent.lens_analyze_image(
                image, ['object_detection']
            )
            results.append(result)
        
        # All should succeed
        for result in results:
            self.assertTrue(result['success'])

# =============================================================================
# TEST UTILITIES AND RUNNERS
# =============================================================================

def run_async_test(test_func):
    """Helper to run async test functions"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(test_func())
    finally:
        loop.close()

class AsyncTestRunner:
    """Custom test runner for async tests"""
    
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.errors = []
    
    async def run_test_suite(self):
        """Run the complete test suite"""
        test_classes = [
            TestLensAgent,
            TestLensVisualAnalysis,
            TestLensOCR,
            TestLensDocumentScanning,
            TestLensImageComparison,
            TestLensPatternDetection,
            TestLensReporting,
            TestLensTools,
            TestLensValidation,
            TestLensIntegration
        ]
        
        print("🧪 Running Lens Agent Test Suite")
        print("=" * 50)
        
        for test_class in test_classes:
            print(f"\n📋 Running {test_class.__name__}")
            suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
            
            for test in suite:
                self.total_tests += 1
                try:
                    if asyncio.iscoroutinefunction(test._testMethodName):
                        # Handle async tests
                        method = getattr(test, test._testMethodName)
                        test.setUp()
                        await method()
                    else:
                        # Handle sync tests
                        test.debug()
                    
                    self.passed_tests += 1
                    print(f"  ✅ {test._testMethodName}")
                except Exception as e:
                    self.failed_tests += 1
                    self.errors.append(f"{test_class.__name__}.{test._testMethodName}: {e}")
                    print(f"  ❌ {test._testMethodName}: {e}")
        
        # Print summary
        print(f"\n📊 Test Results:")
        print(f"  Total Tests: {self.total_tests}")
        print(f"  Passed: {self.passed_tests}")
        print(f"  Failed: {self.failed_tests}")
        print(f"  Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        
        if self.errors:
            print(f"\n❌ Errors:")
            for error in self.errors[:5]:  # Show first 5 errors
                print(f"  • {error}")

async def main():
    """Main test runner"""
    runner = AsyncTestRunner()
    await runner.run_test_suite()

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Lens Agent Test Suite')
    parser.add_argument('--test', choices=[
        'basic', 'visual', 'ocr', 'document', 'comparison', 
        'patterns', 'reporting', 'tools', 'validation', 'integration', 'all'
    ], default='all', help='Test category to run')
    
    args = parser.parse_args()
    
    if args.test == 'all':
        asyncio.run(main())
    else:
        # Run specific test category
        test_map = {
            'basic': TestLensAgent,
            'visual': TestLensVisualAnalysis,
            'ocr': TestLensOCR,
            'document': TestLensDocumentScanning,
            'comparison': TestLensImageComparison,
            'patterns': TestLensPatternDetection,
            'reporting': TestLensReporting,
            'tools': TestLensTools,
            'validation': TestLensValidation,
            'integration': TestLensIntegration
        }
        
        if args.test in test_map:
            unittest.main(argv=[''], testLoader=unittest.TestLoader().loadTestsFromTestCase(test_map[args.test])) 