# ----------------------------------------------------------------------------
#  File:        lens_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Lens Agent - Visual Analysis & Scanner with AI-powered Recognition
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
import time
import base64
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import sys
from enum import Enum
import asyncio
import re
import math

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from core.core_tools import CoreTools

class ImageFormat(Enum):
    JPEG = "jpeg"
    PNG = "png"
    GIF = "gif"
    BMP = "bmp"
    WEBP = "webp"
    TIFF = "tiff"

class AnalysisType(Enum):
    OBJECT_DETECTION = "object_detection"
    TEXT_RECOGNITION = "text_recognition"
    FACE_DETECTION = "face_detection"
    BARCODE_SCANNING = "barcode_scanning"
    DOCUMENT_ANALYSIS = "document_analysis"
    QUALITY_ASSESSMENT = "quality_assessment"
    SIMILARITY_COMPARISON = "similarity_comparison"

class ConfidenceLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class ScanPriority(Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

@dataclass
class ImageMetadata:
    """Image metadata and properties"""
    image_id: str
    format: ImageFormat
    dimensions: Tuple[int, int]
    file_size: int
    color_mode: str
    compression: Optional[str]
    timestamp: str
    source: str

@dataclass
class VisualAnalysis:
    """Visual analysis result record"""
    analysis_id: str
    image_hash: str
    analysis_type: AnalysisType
    confidence_level: ConfidenceLevel
    detected_objects: List[Dict[str, Any]]
    extracted_text: str
    analysis_metadata: Dict[str, Any]
    processing_time: float
    analysis_timestamp: str
    scanner_agent: str = "lens_agent"

@dataclass
class OCRResult:
    """OCR text extraction result"""
    ocr_id: str
    image_hash: str
    extracted_text: str
    confidence_scores: List[float]
    text_regions: List[Dict[str, Any]]
    language_detected: str
    preprocessing_applied: List[str]
    ocr_timestamp: str

@dataclass
class PatternMatch:
    """Pattern recognition match result"""
    match_id: str
    pattern_type: str
    confidence_score: float
    match_location: Dict[str, Any]
    match_metadata: Dict[str, Any]
    similarity_score: float

class LensAgentEnhanced(CoreTools):
    """
    Enhanced Lens - Visual Analysis & Scanner Agent
    
    Responsible for:
    - Advanced image and visual content analysis
    - OCR and text extraction from images/documents
    - Object detection and pattern recognition
    - Barcode/QR code scanning and interpretation
    - Visual quality assessment and validation
    - Image similarity and comparison analysis
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize core tools
        super().__init__("lens_agent", config)
        
        # Lens-specific configuration
        self.max_image_size = config.get('max_image_size', 10485760)  # 10MB
        self.supported_formats = config.get('supported_formats', list(ImageFormat))
        self.ocr_languages = config.get('ocr_languages', ['en', 'es', 'fr', 'de'])
        self.confidence_threshold = config.get('confidence_threshold', 0.7)
        
        # Visual analysis tracking
        self.visual_analyses: Dict[str, VisualAnalysis] = {}
        self.ocr_results: Dict[str, OCRResult] = {}
        self.image_cache: Dict[str, Dict[str, Any]] = {}
        
        # Performance metrics
        self.visual_metrics = {
            'total_analyses': 0,
            'successful_ocr': 0,
            'objects_detected': 0,
            'patterns_matched': 0,
            'average_processing_time': 0.0,
            'accuracy_rate': 0.95
        }
        
        # Pattern recognition templates
        self.detection_patterns = {
            'document_types': {
                'invoice': ['invoice', 'bill', 'amount due', 'total', 'payment'],
                'receipt': ['receipt', 'purchase', 'subtotal', 'tax', 'change'],
                'contract': ['agreement', 'party', 'terms', 'signature', 'date'],
                'license': ['license', 'permit', 'valid', 'expires', 'authority'],
                'certificate': ['certificate', 'certification', 'issued', 'valid until']
            },
            'data_patterns': {
                'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                'phone': r'(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
                'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
                'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
                'date': r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
            }
        }
        
        # Object detection categories
        self.object_categories = {
            'people': ['person', 'face', 'body', 'crowd'],
            'vehicles': ['car', 'truck', 'motorcycle', 'bicycle', 'bus'],
            'documents': ['paper', 'document', 'form', 'certificate', 'card'],
            'technology': ['computer', 'phone', 'screen', 'device', 'equipment'],
            'buildings': ['building', 'house', 'structure', 'facility'],
            'security': ['camera', 'sensor', 'badge', 'sign', 'barrier']
        }

    # =============================================================================
    # LENS-SPECIFIC VISUAL ANALYSIS TOOLS
    # =============================================================================

    async def lens_analyze_image(self, image_data: bytes, analysis_types: List[str],
                               metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Perform comprehensive visual analysis of an image
        """
        try:
            analysis_start = time.time()
            
            # Generate analysis ID and image hash
            image_hash = hashlib.sha256(image_data).hexdigest()
            analysis_id = f"visual_{int(time.time())}_{image_hash[:8]}"
            
            # Validate image
            validation_result = await self._validate_image(image_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': validation_result['error'],
                    'analysis_id': analysis_id
                }
            
            # Extract image metadata
            image_metadata = await self._extract_image_metadata(image_data, metadata or {})
            
            # Perform requested analysis types
            analysis_results = {}
            detected_objects = []
            extracted_text = ""
            
            for analysis_type in analysis_types:
                if analysis_type == 'object_detection':
                    objects = await self._detect_objects(image_data)
                    analysis_results['objects'] = objects
                    detected_objects.extend(objects)
                
                elif analysis_type == 'text_recognition':
                    ocr_result = await self._extract_text_ocr(image_data, image_hash)
                    analysis_results['text'] = ocr_result
                    extracted_text = ocr_result.get('text', '')
                
                elif analysis_type == 'face_detection':
                    faces = await self._detect_faces(image_data)
                    analysis_results['faces'] = faces
                    detected_objects.extend(faces)
                
                elif analysis_type == 'barcode_scanning':
                    barcodes = await self._scan_barcodes(image_data)
                    analysis_results['barcodes'] = barcodes
                
                elif analysis_type == 'document_analysis':
                    document_info = await self._analyze_document_structure(image_data, extracted_text)
                    analysis_results['document'] = document_info
                
                elif analysis_type == 'quality_assessment':
                    quality_metrics = await self._assess_image_quality(image_data)
                    analysis_results['quality'] = quality_metrics
            
            # Determine overall confidence level
            confidence_level = self._calculate_overall_confidence(analysis_results)
            
            # Create visual analysis record
            analysis = VisualAnalysis(
                analysis_id=analysis_id,
                image_hash=image_hash,
                analysis_type=AnalysisType.OBJECT_DETECTION,  # Primary type
                confidence_level=confidence_level,
                detected_objects=detected_objects,
                extracted_text=extracted_text,
                analysis_metadata={
                    'image_metadata': asdict(image_metadata),
                    'analysis_types': analysis_types,
                    'analysis_results': analysis_results
                },
                processing_time=time.time() - analysis_start,
                analysis_timestamp=datetime.now(timezone.utc).isoformat()
            )
            
            self.visual_analyses[analysis_id] = analysis
            
            # Update metrics
            self.visual_metrics['total_analyses'] += 1
            self.visual_metrics['objects_detected'] += len(detected_objects)
            if extracted_text:
                self.visual_metrics['successful_ocr'] += 1
            
            processing_time = analysis.processing_time
            self.visual_metrics['average_processing_time'] = (
                self.visual_metrics['average_processing_time'] * 0.9 + processing_time * 0.1
            )
            
            # Log analysis to blockchain
            await self.recall_log_insight(
                f'Visual analysis completed: {len(analysis_types)} types processed',
                {
                    'type': 'visual_analysis',
                    'analysis_id': analysis_id,
                    'image_hash': image_hash,
                    'analysis_types': analysis_types,
                    'confidence_level': confidence_level.value,
                    'objects_detected': len(detected_objects),
                    'text_extracted': bool(extracted_text)
                }
            )
            
            return {
                'success': True,
                'analysis_id': analysis_id,
                'image_hash': image_hash,
                'confidence_level': confidence_level.value,
                'analysis_results': analysis_results,
                'image_metadata': asdict(image_metadata),
                'processing_time_seconds': processing_time,
                'analysis_timestamp': analysis.analysis_timestamp
            }
            
        except Exception as e:
            await self.security_log_risk(f"Visual analysis failed: {e}", "high")
            return {
                'success': False,
                'error': str(e),
                'analysis_id': analysis_id if 'analysis_id' in locals() else None
            }

    async def lens_extract_text(self, image_data: bytes, 
                              language: str = 'en',
                              preprocessing: List[str] = None) -> Dict[str, Any]:
        """
        Extract text from image using OCR with advanced preprocessing
        """
        try:
            # Generate OCR ID and image hash
            image_hash = hashlib.sha256(image_data).hexdigest()
            ocr_id = f"ocr_{int(time.time())}_{image_hash[:8]}"
            
            # Validate language support
            if language not in self.ocr_languages:
                return {
                    'success': False,
                    'error': f'Language {language} not supported',
                    'supported_languages': self.ocr_languages
                }
            
            # Apply preprocessing if specified
            processed_image = await self._preprocess_image_for_ocr(
                image_data, preprocessing or []
            )
            
            # Perform OCR
            ocr_result = await self._perform_ocr_extraction(
                processed_image, language
            )
            
            # Post-process and validate text
            validated_text = await self._validate_extracted_text(
                ocr_result['text'], language
            )
            
            # Detect data patterns in extracted text
            pattern_matches = await self._detect_data_patterns(validated_text)
            
            # Create OCR result record
            ocr_record = OCRResult(
                ocr_id=ocr_id,
                image_hash=image_hash,
                extracted_text=validated_text,
                confidence_scores=ocr_result['confidence_scores'],
                text_regions=ocr_result['regions'],
                language_detected=language,
                preprocessing_applied=preprocessing or [],
                ocr_timestamp=datetime.now(timezone.utc).isoformat()
            )
            
            self.ocr_results[ocr_id] = ocr_record
            
            # Log OCR to blockchain
            await self.recall_log_insight(
                f'OCR extraction completed: {len(validated_text)} characters',
                {
                    'type': 'ocr_extraction',
                    'ocr_id': ocr_id,
                    'image_hash': image_hash,
                    'language': language,
                    'text_length': len(validated_text),
                    'pattern_matches': len(pattern_matches),
                    'preprocessing': preprocessing or []
                }
            )
            
            return {
                'success': True,
                'ocr_id': ocr_id,
                'image_hash': image_hash,
                'extracted_text': validated_text,
                'language_detected': language,
                'confidence_scores': ocr_result['confidence_scores'],
                'text_regions': ocr_result['regions'],
                'pattern_matches': pattern_matches,
                'preprocessing_applied': preprocessing or [],
                'ocr_timestamp': ocr_record.ocr_timestamp
            }
            
        except Exception as e:
            await self.security_log_risk(f"OCR extraction failed: {e}", "medium")
            return {
                'success': False,
                'error': str(e),
                'ocr_id': ocr_id if 'ocr_id' in locals() else None
            }

    async def lens_scan_documents(self, image_data: bytes,
                                document_type: str = 'auto') -> Dict[str, Any]:
        """
        Specialized document scanning and analysis
        """
        try:
            # Generate scan ID and image hash
            image_hash = hashlib.sha256(image_data).hexdigest()
            scan_id = f"doc_scan_{int(time.time())}_{image_hash[:8]}"
            
            # First extract text via OCR
            ocr_result = await self.lens_extract_text(image_data, 'en', ['deskew', 'denoise'])
            
            if not ocr_result['success']:
                return {
                    'success': False,
                    'error': 'OCR extraction failed',
                    'scan_id': scan_id
                }
            
            extracted_text = ocr_result['extracted_text']
            
            # Detect document type if auto
            if document_type == 'auto':
                document_type = await self._detect_document_type(extracted_text)
            
            # Analyze document structure
            structure_analysis = await self._analyze_document_structure(image_data, extracted_text)
            
            # Extract structured data based on document type
            structured_data = await self._extract_structured_data(extracted_text, document_type)
            
            # Validate document completeness
            completeness_check = await self._validate_document_completeness(
                structured_data, document_type
            )
            
            # Calculate document quality score
            quality_score = await self._calculate_document_quality_score(
                structure_analysis, ocr_result['confidence_scores'], completeness_check
            )
            
            # Log document scan
            await self.recall_log_insight(
                f'Document scan completed: {document_type} with quality {quality_score:.2f}',
                {
                    'type': 'document_scan',
                    'scan_id': scan_id,
                    'image_hash': image_hash,
                    'document_type': document_type,
                    'quality_score': quality_score,
                    'structured_fields': len(structured_data),
                    'completeness': completeness_check['completeness_percentage']
                }
            )
            
            return {
                'success': True,
                'scan_id': scan_id,
                'image_hash': image_hash,
                'document_type': document_type,
                'extracted_text': extracted_text,
                'structured_data': structured_data,
                'structure_analysis': structure_analysis,
                'quality_score': quality_score,
                'completeness_check': completeness_check,
                'ocr_details': {
                    'ocr_id': ocr_result['ocr_id'],
                    'confidence_scores': ocr_result['confidence_scores'],
                    'text_regions': ocr_result['text_regions']
                },
                'scan_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            await self.security_log_risk(f"Document scanning failed: {e}", "medium")
            return {
                'success': False,
                'error': str(e),
                'scan_id': scan_id if 'scan_id' in locals() else None
            }

    async def lens_compare_images(self, image1_data: bytes, image2_data: bytes,
                                comparison_type: str = 'similarity') -> Dict[str, Any]:
        """
        Compare two images for similarity, differences, or specific features
        """
        try:
            # Generate comparison ID
            combined_hash = hashlib.sha256(image1_data + image2_data).hexdigest()
            comparison_id = f"compare_{int(time.time())}_{combined_hash[:8]}"
            
            # Generate individual image hashes
            image1_hash = hashlib.sha256(image1_data).hexdigest()
            image2_hash = hashlib.sha256(image2_data).hexdigest()
            
            # Extract features from both images
            features1 = await self._extract_image_features(image1_data)
            features2 = await self._extract_image_features(image2_data)
            
            # Perform comparison based on type
            comparison_results = {}
            
            if comparison_type == 'similarity':
                similarity_score = await self._calculate_image_similarity(features1, features2)
                comparison_results['similarity_score'] = similarity_score
                comparison_results['similarity_level'] = self._categorize_similarity(similarity_score)
            
            elif comparison_type == 'difference':
                differences = await self._detect_image_differences(features1, features2)
                comparison_results['differences'] = differences
                comparison_results['difference_count'] = len(differences)
            
            elif comparison_type == 'object_matching':
                object_matches = await self._match_objects_between_images(features1, features2)
                comparison_results['object_matches'] = object_matches
                comparison_results['match_count'] = len(object_matches)
            
            # Generate overall comparison summary
            comparison_summary = await self._generate_comparison_summary(
                comparison_results, comparison_type
            )
            
            # Log comparison to blockchain
            await self.recall_log_insight(
                f'Image comparison completed: {comparison_type}',
                {
                    'type': 'image_comparison',
                    'comparison_id': comparison_id,
                    'image1_hash': image1_hash,
                    'image2_hash': image2_hash,
                    'comparison_type': comparison_type,
                    'results_summary': comparison_summary
                }
            )
            
            return {
                'success': True,
                'comparison_id': comparison_id,
                'image1_hash': image1_hash,
                'image2_hash': image2_hash,
                'comparison_type': comparison_type,
                'comparison_results': comparison_results,
                'comparison_summary': comparison_summary,
                'comparison_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            await self.security_log_risk(f"Image comparison failed: {e}", "medium")
            return {
                'success': False,
                'error': str(e),
                'comparison_id': comparison_id if 'comparison_id' in locals() else None
            }

    async def lens_detect_patterns(self, image_data: bytes,
                                 pattern_types: List[str] = None) -> Dict[str, Any]:
        """
        Detect specific patterns, shapes, or objects in images
        """
        try:
            # Generate detection ID
            image_hash = hashlib.sha256(image_data).hexdigest()
            detection_id = f"pattern_{int(time.time())}_{image_hash[:8]}"
            
            # Default to all pattern types if none specified
            if pattern_types is None:
                pattern_types = ['shapes', 'text_patterns', 'objects', 'faces', 'barcodes']
            
            # Perform pattern detection for each type
            detection_results = {}
            total_matches = 0
            
            for pattern_type in pattern_types:
                if pattern_type == 'shapes':
                    shapes = await self._detect_geometric_shapes(image_data)
                    detection_results['shapes'] = shapes
                    total_matches += len(shapes)
                
                elif pattern_type == 'text_patterns':
                    text_patterns = await self._detect_text_patterns(image_data)
                    detection_results['text_patterns'] = text_patterns
                    total_matches += len(text_patterns)
                
                elif pattern_type == 'objects':
                    objects = await self._detect_objects(image_data)
                    detection_results['objects'] = objects
                    total_matches += len(objects)
                
                elif pattern_type == 'faces':
                    faces = await self._detect_faces(image_data)
                    detection_results['faces'] = faces
                    total_matches += len(faces)
                
                elif pattern_type == 'barcodes':
                    barcodes = await self._scan_barcodes(image_data)
                    detection_results['barcodes'] = barcodes
                    total_matches += len(barcodes)
            
            # Calculate detection confidence
            detection_confidence = await self._calculate_detection_confidence(detection_results)
            
            # Update metrics
            self.visual_metrics['patterns_matched'] += total_matches
            
            # Log pattern detection
            await self.recall_log_insight(
                f'Pattern detection completed: {total_matches} patterns found',
                {
                    'type': 'pattern_detection',
                    'detection_id': detection_id,
                    'image_hash': image_hash,
                    'pattern_types': pattern_types,
                    'total_matches': total_matches,
                    'detection_confidence': detection_confidence
                }
            )
            
            return {
                'success': True,
                'detection_id': detection_id,
                'image_hash': image_hash,
                'pattern_types': pattern_types,
                'detection_results': detection_results,
                'total_matches': total_matches,
                'detection_confidence': detection_confidence,
                'detection_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            await self.security_log_risk(f"Pattern detection failed: {e}", "medium")
            return {
                'success': False,
                'error': str(e),
                'detection_id': detection_id if 'detection_id' in locals() else None
            }

    async def lens_generate_visual_report(self, time_period_hours: int = 24) -> Dict[str, Any]:
        """
        Generate comprehensive visual analysis report
        """
        try:
            # Define time window
            end_time = datetime.now(timezone.utc)
            start_time = end_time - timedelta(hours=time_period_hours)
            
            # Filter records by time period
            recent_analyses = [
                analysis for analysis in self.visual_analyses.values()
                if datetime.fromisoformat(analysis.analysis_timestamp) >= start_time
            ]
            
            recent_ocr = [
                ocr for ocr in self.ocr_results.values()
                if datetime.fromisoformat(ocr.ocr_timestamp) >= start_time
            ]
            
            # Calculate statistics
            total_analyses = len(recent_analyses)
            total_ocr = len(recent_ocr)
            
            # Analysis type distribution
            analysis_types = {}
            for analysis in recent_analyses:
                analysis_type = analysis.analysis_type.value
                analysis_types[analysis_type] = analysis_types.get(analysis_type, 0) + 1
            
            # Confidence level distribution
            confidence_distribution = {}
            for analysis in recent_analyses:
                confidence = analysis.confidence_level.value
                confidence_distribution[confidence] = confidence_distribution.get(confidence, 0) + 1
            
            # Average processing time
            avg_processing_time = sum(a.processing_time for a in recent_analyses) / len(recent_analyses) if recent_analyses else 0
            
            # OCR language distribution
            language_distribution = {}
            for ocr in recent_ocr:
                lang = ocr.language_detected
                language_distribution[lang] = language_distribution.get(lang, 0) + 1
            
            # Generate insights and recommendations
            insights = self._generate_visual_insights(recent_analyses, recent_ocr)
            recommendations = self._generate_visual_recommendations(recent_analyses, recent_ocr)
            
            # Create comprehensive report
            report = {
                'report_id': f"visual_report_{int(time.time())}",
                'time_period': {
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'hours': time_period_hours
                },
                'analysis_summary': {
                    'total_analyses': total_analyses,
                    'total_ocr_operations': total_ocr,
                    'analysis_type_distribution': analysis_types,
                    'confidence_distribution': confidence_distribution,
                    'average_processing_time': avg_processing_time
                },
                'ocr_summary': {
                    'total_extractions': total_ocr,
                    'language_distribution': language_distribution,
                    'average_text_length': sum(len(ocr.extracted_text) for ocr in recent_ocr) / len(recent_ocr) if recent_ocr else 0
                },
                'performance_metrics': self.visual_metrics.copy(),
                'insights': insights,
                'recommendations': recommendations,
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Log report generation
            await self.recall_log_insight(
                f'Visual analysis report generated for {time_period_hours}h period',
                {
                    'type': 'visual_report',
                    'report_id': report['report_id'],
                    'time_period_hours': time_period_hours,
                    'total_analyses': total_analyses,
                    'total_ocr': total_ocr
                }
            )
            
            return {
                'success': True,
                'report': report
            }
            
        except Exception as e:
            await self.security_log_risk(f"Visual report generation failed: {e}", "medium")
            return {
                'success': False,
                'error': str(e)
            }

    # =============================================================================
    # HELPER METHODS
    # =============================================================================

    async def _validate_image(self, image_data: bytes) -> Dict[str, Any]:
        """Validate image data and format"""
        if len(image_data) > self.max_image_size:
            return {
                'valid': False,
                'error': f'Image size {len(image_data)} exceeds maximum {self.max_image_size}'
            }
        
        # Basic format detection
        if image_data.startswith(b'\xff\xd8\xff'):
            format_detected = ImageFormat.JPEG
        elif image_data.startswith(b'\x89PNG'):
            format_detected = ImageFormat.PNG
        elif image_data.startswith(b'GIF8'):
            format_detected = ImageFormat.GIF
        elif image_data.startswith(b'BM'):
            format_detected = ImageFormat.BMP
        else:
            return {
                'valid': False,
                'error': 'Unsupported image format'
            }
        
        return {
            'valid': True,
            'format': format_detected,
            'size': len(image_data)
        }

    async def _extract_image_metadata(self, image_data: bytes, 
                                    provided_metadata: Dict[str, Any]) -> ImageMetadata:
        """Extract image metadata and properties"""
        # Simulate image metadata extraction
        return ImageMetadata(
            image_id=f"img_{int(time.time())}",
            format=ImageFormat.JPEG,
            dimensions=(1920, 1080),
            file_size=len(image_data),
            color_mode="RGB",
            compression="JPEG",
            timestamp=datetime.now(timezone.utc).isoformat(),
            source=provided_metadata.get('source', 'unknown')
        )

    async def _detect_objects(self, image_data: bytes) -> List[Dict[str, Any]]:
        """Detect objects in image"""
        # Simulate object detection
        objects = [
            {
                'object_id': 'obj_001',
                'category': 'person',
                'confidence': 0.92,
                'bounding_box': {'x': 100, 'y': 50, 'width': 200, 'height': 300},
                'attributes': ['standing', 'adult']
            },
            {
                'object_id': 'obj_002',
                'category': 'document',
                'confidence': 0.87,
                'bounding_box': {'x': 400, 'y': 200, 'width': 300, 'height': 400},
                'attributes': ['paper', 'text']
            }
        ]
        
        return objects

    async def _extract_text_ocr(self, image_data: bytes, image_hash: str) -> Dict[str, Any]:
        """Extract text using OCR"""
        # Simulate OCR extraction
        extracted_text = "Sample extracted text from document. Invoice #12345 dated 2025-01-15."
        
        return {
            'text': extracted_text,
            'confidence_scores': [0.95, 0.89, 0.92, 0.87],
            'regions': [
                {'text': 'Sample extracted text', 'confidence': 0.95, 'bbox': [10, 10, 200, 30]},
                {'text': 'Invoice #12345', 'confidence': 0.89, 'bbox': [10, 50, 150, 70]},
                {'text': 'dated 2025-01-15', 'confidence': 0.92, 'bbox': [10, 90, 180, 110]}
            ]
        }

    async def _detect_faces(self, image_data: bytes) -> List[Dict[str, Any]]:
        """Detect faces in image"""
        # Simulate face detection
        faces = [
            {
                'face_id': 'face_001',
                'confidence': 0.94,
                'bounding_box': {'x': 120, 'y': 80, 'width': 150, 'height': 180},
                'attributes': {
                    'age_estimate': 35,
                    'gender_estimate': 'male',
                    'emotion': 'neutral',
                    'glasses': False,
                    'facial_hair': True
                }
            }
        ]
        
        return faces

    async def _scan_barcodes(self, image_data: bytes) -> List[Dict[str, Any]]:
        """Scan for barcodes and QR codes"""
        # Simulate barcode scanning
        barcodes = [
            {
                'barcode_id': 'bc_001',
                'type': 'QR_CODE',
                'data': 'https://example.com/product/12345',
                'confidence': 0.98,
                'bounding_box': {'x': 50, 'y': 400, 'width': 100, 'height': 100}
            }
        ]
        
        return barcodes

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get all available tools including inherited core tools"""
        lens_tools = [
            {
                'name': 'lens_analyze_image',
                'description': 'Perform comprehensive visual analysis of an image',
                'parameters': {
                    'image_data': 'bytes - The image data to analyze',
                    'analysis_types': 'list - Types of analysis to perform',
                    'metadata': 'dict - Optional image metadata'
                }
            },
            {
                'name': 'lens_extract_text',
                'description': 'Extract text from image using OCR',
                'parameters': {
                    'image_data': 'bytes - The image data containing text',
                    'language': 'string - Language for OCR (default: en)',
                    'preprocessing': 'list - Optional preprocessing steps'
                }
            },
            {
                'name': 'lens_scan_documents',
                'description': 'Specialized document scanning and analysis',
                'parameters': {
                    'image_data': 'bytes - The document image data',
                    'document_type': 'string - Type of document or auto-detect'
                }
            },
            {
                'name': 'lens_compare_images',
                'description': 'Compare two images for similarity or differences',
                'parameters': {
                    'image1_data': 'bytes - First image data',
                    'image2_data': 'bytes - Second image data',
                    'comparison_type': 'string - Type of comparison (similarity/difference/object_matching)'
                }
            },
            {
                'name': 'lens_detect_patterns',
                'description': 'Detect specific patterns, shapes, or objects in images',
                'parameters': {
                    'image_data': 'bytes - The image data to analyze',
                    'pattern_types': 'list - Types of patterns to detect'
                }
            },
            {
                'name': 'lens_generate_visual_report',
                'description': 'Generate comprehensive visual analysis report',
                'parameters': {
                    'time_period_hours': 'int - Time period in hours for the report (default 24)'
                }
            }
        ]
        
        # Combine with inherited core tools
        core_tools = super().get_available_tools()
        return core_tools + lens_tools

    async def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """Execute a tool by name with given parameters"""
        # First try Lens-specific tools
        if hasattr(self, tool_name):
            method = getattr(self, tool_name)
            if callable(method):
                return await method(**kwargs)
        
        # Fall back to core tools
        return await super().execute_tool(tool_name, **kwargs)

    async def _preprocess_image_for_ocr(self, image_data: bytes, preprocessing: List[str]) -> bytes:
        """Apply preprocessing steps for OCR"""
        # Simulate preprocessing - return original data
        return image_data

    async def _perform_ocr_extraction(self, image_data: bytes, language: str) -> Dict[str, Any]:
        """Perform OCR text extraction"""
        return {
            'text': "Sample extracted text from document. Invoice #12345 dated 2025-01-15.",
            'confidence_scores': [0.95, 0.89, 0.92, 0.87],
            'regions': [
                {'text': 'Sample extracted text', 'confidence': 0.95, 'bbox': [10, 10, 200, 30]},
                {'text': 'Invoice #12345', 'confidence': 0.89, 'bbox': [10, 50, 150, 70]},
                {'text': 'dated 2025-01-15', 'confidence': 0.92, 'bbox': [10, 90, 180, 110]}
            ]
        }

    async def _validate_extracted_text(self, text: str, language: str) -> str:
        """Validate and clean extracted text"""
        # Simple validation - return cleaned text
        return text.strip()

    async def _detect_data_patterns(self, text: str) -> List[Dict[str, Any]]:
        """Detect data patterns in text"""
        patterns = []
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        for email in emails:
            patterns.append({
                'type': 'email',
                'value': email,
                'confidence': 0.9
            })
        
        # Phone pattern
        phone_pattern = r'(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        for phone in phones:
            patterns.append({
                'type': 'phone',
                'value': phone,
                'confidence': 0.85
            })
        
        return patterns

    async def _classify_document_type(self, extracted_text: str, specified_type: str) -> str:
        """Classify document type based on content"""
        if specified_type != 'auto':
            return specified_type
        
        text_lower = extracted_text.lower()
        
        if any(word in text_lower for word in ['invoice', 'bill', 'amount due']):
            return 'invoice'
        elif any(word in text_lower for word in ['receipt', 'purchase', 'subtotal']):
            return 'receipt'
        elif any(word in text_lower for word in ['contract', 'agreement', 'terms']):
            return 'contract'
        elif any(word in text_lower for word in ['license', 'permit', 'certification']):
            return 'license'
        else:
            return 'unknown'

    async def _extract_structured_data(self, text: str, document_type: str) -> Dict[str, Any]:
        """Extract structured data based on document type"""
        structured_data = {}
        
        if document_type == 'invoice':
            # Extract invoice-specific data
            structured_data.update({
                'invoice_number': self._extract_pattern(text, r'invoice[#\s]*(\w+)', 1),
                'date': self._extract_pattern(text, r'date[:\s]*([0-9\-/]+)', 1),
                'amount': self._extract_pattern(text, r'total[:\s]*\$?([0-9.,]+)', 1)
            })
        elif document_type == 'receipt':
            # Extract receipt-specific data
            structured_data.update({
                'store_name': self._extract_pattern(text, r'^([A-Z\s]+)', 1),
                'date': self._extract_pattern(text, r'([0-9\-/]+)', 1),
                'total': self._extract_pattern(text, r'total[:\s]*\$?([0-9.,]+)', 1)
            })
        
        return structured_data

    def _extract_pattern(self, text: str, pattern: str, group: int = 0) -> Optional[str]:
        """Extract pattern from text"""
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(group) if match else None

    async def _assess_image_quality(self, image_data: bytes) -> Dict[str, Any]:
        """Assess image quality metrics"""
        return {
            'resolution_score': 0.8,
            'brightness_score': 0.75,
            'contrast_score': 0.9,
            'blur_score': 0.85,
            'overall_score': 0.82
        }

    def _calculate_overall_confidence(self, analysis_results: Dict[str, Any]) -> ConfidenceLevel:
        """Calculate overall confidence level"""
        # Simple confidence calculation
        if len(analysis_results) >= 3:
            return ConfidenceLevel.HIGH
        elif len(analysis_results) >= 2:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW

    async def _detect_specific_patterns(self, image_data: bytes, pattern_types: List[str]) -> List[Dict[str, Any]]:
        """Detect specific pattern types"""
        patterns = []
        
        for pattern_type in pattern_types:
            if pattern_type == 'shapes':
                patterns.append({
                    'pattern_type': 'rectangle',
                    'confidence_score': 0.9,
                    'location': {'x': 100, 'y': 150, 'width': 200, 'height': 100}
                })
            elif pattern_type == 'text_patterns':
                patterns.append({
                    'pattern_type': 'heading',
                    'confidence_score': 0.85,
                    'location': {'x': 50, 'y': 50, 'width': 300, 'height': 30}
                })
            elif pattern_type == 'barcodes':
                patterns.append({
                    'pattern_type': 'qr_code',
                    'confidence_score': 0.95,
                    'location': {'x': 400, 'y': 300, 'width': 100, 'height': 100}
                })
        
        return patterns

    async def _detect_document_type(self, text: str) -> str:
        """Detect document type from text content"""
        return await self._classify_document_type(text, 'auto')

    async def _validate_document_completeness(self, structured_data: Dict[str, Any], document_type: str) -> Dict[str, Any]:
        """Validate document completeness"""
        required_fields = {
            'invoice': ['invoice_number', 'date', 'amount'],
            'receipt': ['store_name', 'date', 'total'],
            'contract': ['parties', 'terms', 'signature'],
            'license': ['license_number', 'expiry_date', 'authority']
        }
        
        required = required_fields.get(document_type, [])
        present_fields = [field for field in required if structured_data.get(field)]
        
        completeness_percentage = len(present_fields) / len(required) if required else 1.0
        
        return {
            'completeness_percentage': completeness_percentage,
            'missing_fields': [field for field in required if not structured_data.get(field)],
            'present_fields': present_fields,
            'is_complete': completeness_percentage >= 0.8
        }

    async def _calculate_document_quality_score(self, structure_analysis: Dict[str, Any], 
                                              confidence_scores: List[float], 
                                              completeness_check: Dict[str, Any]) -> float:
        """Calculate overall document quality score"""
        structure_score = structure_analysis.get('text_density', 0.5)
        ocr_score = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.5
        completeness_score = completeness_check['completeness_percentage']
        
        # Weighted average
        quality_score = (structure_score * 0.3 + ocr_score * 0.4 + completeness_score * 0.3)
        return min(1.0, max(0.0, quality_score))

    async def _extract_image_features(self, image_data: bytes) -> Dict[str, Any]:
        """Extract features from image for comparison"""
        # Simulate feature extraction
        return {
            'color_histogram': [0.2, 0.3, 0.1, 0.4],
            'edge_density': 0.7,
            'texture_features': [0.5, 0.3, 0.8],
            'dominant_colors': ['#FF0000', '#00FF00', '#0000FF'],
            'brightness': 0.6,
            'contrast': 0.8
        }

    async def _calculate_image_similarity(self, features1: Dict[str, Any], features2: Dict[str, Any]) -> float:
        """Calculate similarity between image features"""
        # Simple similarity calculation based on features
        histogram_diff = sum(abs(a - b) for a, b in zip(features1['color_histogram'], features2['color_histogram']))
        histogram_similarity = 1.0 - (histogram_diff / 4.0)
        
        edge_similarity = 1.0 - abs(features1['edge_density'] - features2['edge_density'])
        brightness_similarity = 1.0 - abs(features1['brightness'] - features2['brightness'])
        
        # Weighted average
        overall_similarity = (histogram_similarity * 0.5 + edge_similarity * 0.3 + brightness_similarity * 0.2)
        return max(0.0, min(1.0, overall_similarity))

    def _categorize_similarity(self, similarity_score: float) -> str:
        """Categorize similarity score"""
        if similarity_score >= 0.9:
            return 'very_high'
        elif similarity_score >= 0.7:
            return 'high'
        elif similarity_score >= 0.5:
            return 'medium'
        elif similarity_score >= 0.3:
            return 'low'
        else:
            return 'very_low'

    async def _detect_image_differences(self, features1: Dict[str, Any], features2: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect differences between image features"""
        differences = []
        
        # Check brightness difference
        brightness_diff = abs(features1['brightness'] - features2['brightness'])
        if brightness_diff > 0.2:
            differences.append({
                'type': 'brightness',
                'description': f'Brightness difference: {brightness_diff:.2f}',
                'severity': 'medium' if brightness_diff > 0.4 else 'low'
            })
        
        # Check contrast difference
        contrast_diff = abs(features1['contrast'] - features2['contrast'])
        if contrast_diff > 0.2:
            differences.append({
                'type': 'contrast',
                'description': f'Contrast difference: {contrast_diff:.2f}',
                'severity': 'medium' if contrast_diff > 0.4 else 'low'
            })
        
        return differences

    async def _match_objects_between_images(self, features1: Dict[str, Any], features2: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Match objects between two images"""
        # Simulate object matching
        return [
            {
                'match_id': 'match_001',
                'object_type': 'rectangle',
                'similarity_score': 0.85,
                'location1': {'x': 100, 'y': 100, 'width': 50, 'height': 30},
                'location2': {'x': 105, 'y': 98, 'width': 52, 'height': 31}
            }
        ]

    async def _generate_comparison_summary(self, comparison_results: Dict[str, Any], comparison_type: str) -> Dict[str, Any]:
        """Generate summary of comparison results"""
        summary = {'comparison_type': comparison_type}
        
        if comparison_type == 'similarity':
            similarity_score = comparison_results.get('similarity_score', 0)
            summary['overall_similarity'] = similarity_score
            summary['recommendation'] = 'Images are very similar' if similarity_score > 0.8 else 'Images have notable differences'
        
        elif comparison_type == 'difference':
            differences = comparison_results.get('differences', [])
            summary['total_differences'] = len(differences)
            summary['significant_differences'] = len([d for d in differences if d.get('severity') in ['medium', 'high']])
        
        elif comparison_type == 'object_matching':
            matches = comparison_results.get('object_matches', [])
            summary['total_matches'] = len(matches)
            summary['high_confidence_matches'] = len([m for m in matches if m.get('similarity_score', 0) > 0.8])
        
        return summary

    async def _detect_geometric_shapes(self, image_data: bytes) -> List[Dict[str, Any]]:
        """Detect geometric shapes in image"""
        return [
            {
                'shape_type': 'rectangle',
                'confidence': 0.9,
                'location': {'x': 100, 'y': 150, 'width': 200, 'height': 100},
                'properties': {'area': 20000, 'perimeter': 600}
            },
            {
                'shape_type': 'circle',
                'confidence': 0.85,
                'location': {'x': 300, 'y': 300, 'radius': 50},
                'properties': {'area': 7854, 'circumference': 314}
            }
        ]

    async def _detect_text_patterns(self, image_data: bytes) -> List[Dict[str, Any]]:
        """Detect text patterns in image"""
        return [
            {
                'pattern_type': 'heading',
                'confidence': 0.88,
                'location': {'x': 50, 'y': 50, 'width': 300, 'height': 30},
                'properties': {'font_size': 'large', 'style': 'bold'}
            },
            {
                'pattern_type': 'paragraph',
                'confidence': 0.75,
                'location': {'x': 50, 'y': 100, 'width': 400, 'height': 200},
                'properties': {'line_count': 8, 'alignment': 'left'}
            }
        ]

    async def _calculate_detection_confidence(self, detection_results: Dict[str, Any]) -> float:
        """Calculate overall detection confidence"""
        total_confidence = 0
        total_items = 0
        
        for category, items in detection_results.items():
            if isinstance(items, list):
                for item in items:
                    confidence = item.get('confidence', item.get('confidence_score', 0))
                    total_confidence += confidence
                    total_items += 1
        
        return total_confidence / total_items if total_items > 0 else 0.0

    async def _analyze_document_structure(self, image_data: bytes, text: str) -> Dict[str, Any]:
        """Analyze document structure"""
        return {
            'layout_type': 'standard',
            'sections_detected': 3,
            'has_header': True,
            'has_footer': False,
            'text_density': 0.7,
            'column_count': 1,
            'page_orientation': 'portrait'
        }

    def _generate_visual_insights(self, analyses: List, ocr_results: List) -> List[Dict[str, Any]]:
        """Generate insights from visual analysis data"""
        insights = []
        
        if analyses:
            # Most common confidence level
            confidence_levels = [a.confidence_level.value for a in analyses]
            most_common_confidence = max(set(confidence_levels), key=confidence_levels.count)
            insights.append({
                'type': 'performance',
                'insight': f'Most analyses achieved {most_common_confidence} confidence level',
                'importance': 'medium'
            })
        
        if ocr_results:
            # Average text length
            avg_text_length = sum(len(ocr.extracted_text) for ocr in ocr_results) / len(ocr_results)
            insights.append({
                'type': 'content',
                'insight': f'Average text extraction length: {avg_text_length:.0f} characters',
                'importance': 'low'
            })
        
        return insights

    def _generate_visual_recommendations(self, analyses: List, ocr_results: List) -> List[Dict[str, Any]]:
        """Generate recommendations based on analysis patterns"""
        recommendations = []
        
        if len(analyses) > 10:
            recommendations.append({
                'type': 'optimization',
                'recommendation': 'Consider implementing batch processing for high-volume analysis',
                'priority': 'medium'
            })
        
        if ocr_results:
            # Check if any OCR results have low confidence
            low_confidence_count = sum(1 for ocr in ocr_results 
                                     if any(score < 0.7 for score in ocr.confidence_scores))
            if low_confidence_count > len(ocr_results) * 0.3:
                recommendations.append({
                    'type': 'quality',
                    'recommendation': 'Image preprocessing may improve OCR accuracy',
                    'priority': 'high'
                })
        
        return recommendations

# =============================================================================
# STANDALONE EXECUTION
# =============================================================================

async def main():
    """Demo Lens Agent functionality"""
    
    config = {
        'max_image_size': 10485760,
        'confidence_threshold': 0.7,
        'ocr_languages': ['en', 'es', 'fr']
    }
    
    lens = LensAgentEnhanced(config)
    print("👁️ Lens Agent - Visual Analysis & Scanner")
    print("=" * 50)
    
    # Create sample image data (would be actual image bytes in real use)
    sample_image = b'\xff\xd8\xff\xe0' + b'\x00' * 1000  # Minimal JPEG header + data
    
    # Demo 1: Image Analysis
    print("\n1. 🖼️ Image Analysis")
    analysis_result = await lens.lens_analyze_image(
        sample_image, 
        ['object_detection', 'text_recognition', 'quality_assessment']
    )
    print(f"Analysis Success: {analysis_result['success']}")
    if analysis_result['success']:
        print(f"Confidence Level: {analysis_result['confidence_level']}")
        print(f"Processing Time: {analysis_result['processing_time_seconds']:.2f}s")
    
    # Demo 2: OCR Text Extraction
    print("\n2. 📝 OCR Text Extraction")
    ocr_result = await lens.lens_extract_text(sample_image, 'en', ['deskew', 'denoise'])
    print(f"OCR Success: {ocr_result['success']}")
    if ocr_result['success']:
        print(f"Extracted Text: {ocr_result['extracted_text'][:50]}...")
        print(f"Language: {ocr_result['language_detected']}")
    
    # Demo 3: Document Scanning
    print("\n3. 📄 Document Scanning")
    scan_result = await lens.lens_scan_documents(sample_image, 'auto')
    print(f"Scan Success: {scan_result['success']}")
    if scan_result['success']:
        print(f"Document Type: {scan_result['document_type']}")
        print(f"Quality Score: {scan_result.get('quality_score', 0):.2f}")
    
    # Demo 4: Pattern Detection
    print("\n4. 🔍 Pattern Detection")
    pattern_result = await lens.lens_detect_patterns(sample_image, ['shapes', 'text_patterns'])
    print(f"Detection Success: {pattern_result['success']}")
    if pattern_result['success']:
        print(f"Total Patterns: {pattern_result['total_matches']}")
        print(f"Detection Confidence: {pattern_result['detection_confidence']:.2f}")
    
    # Demo 5: Image Comparison
    print("\n5. ⚖️ Image Comparison")
    sample_image2 = b'\xff\xd8\xff\xe0' + b'\x11' * 1000  # Different sample
    comparison_result = await lens.lens_compare_images(sample_image, sample_image2, 'similarity')
    print(f"Comparison Success: {comparison_result['success']}")
    if comparison_result['success']:
        print(f"Comparison Type: {comparison_result['comparison_type']}")
    
    # Demo 6: Visual Report
    print("\n6. 📊 Visual Analysis Report")
    report_result = await lens.lens_generate_visual_report(1)  # 1 hour
    if report_result['success']:
        report = report_result['report']
        print(f"Total Analyses: {report['analysis_summary']['total_analyses']}")
        print(f"Total OCR Operations: {report['analysis_summary']['total_ocr_operations']}")
    
    print(f"\n🎯 Lens Agent Tools: {len(lens.get_available_tools())}")

if __name__ == "__main__":
    asyncio.run(main()) 