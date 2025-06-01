# ----------------------------------------------------------------------------
#  File:        README.md
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Lens Agent documentation - Visual Analysis & Scanner
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

# 👁️ Lens Agent - Visual Analysis & Scanner

## Overview

The Lens Agent is a sophisticated visual analysis and scanning system designed for the C-Suite Blockchain ecosystem. It provides advanced image processing, OCR capabilities, object detection, and pattern recognition to support visual intelligence operations.

## 🎯 Primary Responsibilities

- **Advanced Visual Analysis**: Comprehensive image content analysis and object detection
- **OCR & Text Extraction**: Multi-language text recognition from images and documents
- **Document Scanning**: Specialized analysis for various document types (invoices, contracts, receipts)
- **Pattern Recognition**: Detection of shapes, objects, barcodes, and QR codes
- **Quality Assessment**: Visual quality validation and enhancement recommendations
- **Similarity Analysis**: Image comparison and matching capabilities

## 🔧 Core Capabilities

### Visual Analysis Tools
- **Image Processing**: Support for JPEG, PNG, GIF, BMP, WEBP, TIFF formats
- **Object Detection**: Real-time identification of people, vehicles, documents, technology
- **Face Detection**: Facial recognition with attribute analysis (age, gender, emotion)
- **Quality Assessment**: Image quality scoring and enhancement suggestions

### Text Recognition
- **Multi-language OCR**: Support for English, Spanish, French, German
- **Document Types**: Invoice, receipt, contract, license, certificate recognition
- **Pattern Extraction**: Email addresses, phone numbers, SSN, credit cards, dates
- **Confidence Scoring**: Accuracy assessment for extracted text

### Scanning Operations
- **Barcode/QR Scanning**: Multi-format barcode and QR code detection
- **Document Classification**: Automatic document type identification
- **Data Extraction**: Structured data extraction from scanned documents
- **Batch Processing**: Multiple image analysis with parallel processing

## 🚀 Quick Start

### Installation

```bash
cd tool_calling/agents/lens
pip install -r requirements.txt  # If requirements exist
```

### Basic Usage

```python
from lens_agent_enhanced import LensAgentEnhanced

# Initialize with configuration
config = {
    'max_image_size': 10485760,  # 10MB
    'confidence_threshold': 0.7,
    'ocr_languages': ['en', 'es']
}

lens = LensAgentEnhanced(config)

# Analyze an image
with open('document.jpg', 'rb') as f:
    image_data = f.read()

result = await lens.lens_analyze_image(
    image_data, 
    ['object_detection', 'text_recognition']
)
```

### Command Line Usage

```bash
# Run interactive CLI
python lens_cli.py

# Analyze specific image
python lens_cli.py --analyze image.jpg --types object_detection,text_recognition

# Extract text from document
python lens_cli.py --ocr document.pdf --language en

# Generate analysis report
python lens_cli.py --report --hours 24
```

## 🛠️ Available Tools

### Primary Analysis Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `lens_analyze_image` | Comprehensive visual analysis | image_data, analysis_types, metadata |
| `lens_extract_text` | OCR text extraction | image_data, language, preprocessing |
| `lens_scan_documents` | Document scanning and classification | image_data, document_type |
| `lens_compare_images` | Image similarity comparison | image1_data, image2_data, comparison_type |
| `lens_detect_patterns` | Pattern and object detection | image_data, pattern_types |
| `lens_generate_visual_report` | Comprehensive analysis report | time_period_hours |

### Analysis Types

- `object_detection` - Identify objects, people, vehicles
- `text_recognition` - Extract text using OCR
- `face_detection` - Detect and analyze faces
- `barcode_scanning` - Scan barcodes and QR codes
- `document_analysis` - Classify and analyze documents
- `quality_assessment` - Assess image quality
- `similarity_comparison` - Compare image similarity

### Document Types

- `invoice` - Invoice and billing documents
- `receipt` - Purchase receipts
- `contract` - Legal contracts and agreements
- `license` - Licenses and permits
- `certificate` - Certificates and credentials
- `auto` - Automatic document type detection

## 📊 Configuration Options

```json
{
  "max_image_size": 10485760,
  "supported_formats": ["jpeg", "png", "gif", "bmp", "webp", "tiff"],
  "ocr_languages": ["en", "es", "fr", "de"],
  "confidence_threshold": 0.7,
  "processing_timeout": 30,
  "cache_results": true,
  "parallel_processing": true
}
```

## 🔍 Advanced Features

### Pattern Recognition
- Email address detection
- Phone number extraction
- Social Security Number identification
- Credit card number detection
- Date pattern recognition

### Quality Assessment
- Image resolution analysis
- Brightness and contrast evaluation
- Blur detection
- Noise assessment
- Enhancement recommendations

### Batch Processing
- Multiple image analysis
- Parallel processing support
- Progress tracking
- Result aggregation

## 📈 Performance Metrics

The Lens Agent tracks various performance metrics:

- **Total Analyses**: Number of images processed
- **OCR Success Rate**: Text extraction accuracy
- **Object Detection Rate**: Object identification success
- **Average Processing Time**: Performance optimization
- **Accuracy Rate**: Overall analysis accuracy

## 🧪 Testing

Run the test suite:

```bash
python test_lens.py
```

Test specific functionality:

```bash
# Test OCR
python test_lens.py --test ocr

# Test object detection
python test_lens.py --test object_detection

# Test document scanning
python test_lens.py --test document_scanning
```

## 🔄 Integration

### With Other Agents

The Lens Agent integrates seamlessly with other C-Suite agents:

- **Beacon Agent**: Visual monitoring and alerting
- **Core Agent**: Foundational tools and utilities
- **Theory Agent**: Research document analysis
- **Echo Agent**: Visual audit trails

### API Integration

```python
# Get available tools
tools = lens.get_available_tools()

# Execute tool dynamically
result = await lens.execute_tool('lens_analyze_image', 
                               image_data=data, 
                               analysis_types=['object_detection'])
```

## 📋 Supported Formats

### Image Formats
- JPEG/JPG (recommended)
- PNG (lossless)
- GIF (animated support)
- BMP (uncompressed)
- WEBP (modern format)
- TIFF (high quality)

### Document Formats
- PDF pages (as images)
- Scanned documents
- Screenshots
- Camera captures
- Digital documents

## 🚨 Error Handling

The Lens Agent provides comprehensive error handling:

- Image validation errors
- Format compatibility issues
- Processing timeouts
- Memory limitations
- OCR language support

## 📝 Logging

Detailed logging for:
- Analysis operations
- Performance metrics
- Error conditions
- Security events
- Processing statistics

## 🛡️ Security Considerations

- Image data encryption in transit
- Secure temporary file handling
- Access control for sensitive documents
- Audit trail for all operations
- Data retention policies

## 📞 Support

For technical support or questions:
- Email: chris@celayasolutions.com
- Documentation: [Internal Wiki]
- Issue Tracking: [Internal System]

---

**Version**: 1.0.0  
**License**: BSL (SPDX id BUSL)  
**Last Updated**: May 2025 