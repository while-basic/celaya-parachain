# ----------------------------------------------------------------------------
#  File:        theory_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Theory Agent with LLM tool calling capabilities
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
import requests
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import re
from urllib.parse import urlparse
import sys

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from core.core_tools import CoreTools, KnowledgeSource

@dataclass
class FactCheckResult:
    """Result of a fact-checking operation"""
    claim: str
    verification_status: str  # 'verified', 'disputed', 'false', 'unverified'
    confidence_score: float  # 0.0 to 1.0
    supporting_sources: List[str]
    contradicting_sources: List[str]
    reasoning: str
    checked_at: str

@dataclass
class ValidationReport:
    """Complete validation report for an insight or claim"""
    original_content: str
    fact_checks: List[FactCheckResult]
    overall_reliability_score: float
    source_credibility_scores: Dict[str, float]
    bias_analysis: Dict[str, Any]
    consensus_recommendation: str  # 'accept', 'accept_with_caution', 'reject'
    theory_signature: str
    validation_timestamp: str

class TheoryAgentEnhanced(CoreTools):
    """
    Enhanced Theory - Fact-Checking & Validation Agent with Full Tool Calling
    
    Inherits all minimum required tools from CoreTools and adds specialized
    fact-checking and validation capabilities with full LLM tool calling support.
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize core tools first
        super().__init__("theory_agent", config)
        
        # Theory-specific configuration
        self.session = None
        
        # Fact-checking and validation endpoints
        self.factcheck_apis = {
            'snopes': 'https://www.snopes.com/api/v1/',
            'politifact': 'https://www.politifact.com/api/v/2/',
            'factcheck_org': 'https://www.factcheck.org/api/',
        }
        
        # Source credibility database (simplified version)
        self.source_credibility = {
            'wikipedia.org': 0.85,
            'ncbi.nlm.nih.gov': 0.95,
            'nature.com': 0.95,
            'science.org': 0.95,
            'nejm.org': 0.95,
            'who.int': 0.90,
            'cdc.gov': 0.90,
            'nih.gov': 0.90,
            'edu': 0.80,  # General .edu domains
            'gov': 0.85,  # General .gov domains
            'reuters.com': 0.80,
            'bbc.com': 0.80,
            'apnews.com': 0.85,
        }
        
        # Bias indicators (simplified)
        self.bias_indicators = {
            'emotional_language': [
                'shocking', 'devastating', 'incredible', 'unbelievable',
                'outrageous', 'stunning', 'mind-blowing', 'epic'
            ],
            'absolute_terms': [
                'always', 'never', 'all', 'none', 'every', 'completely',
                'totally', 'absolutely', 'definitely', 'certainly'
            ],
            'conspiracy_terms': [
                'cover-up', 'conspiracy', 'hidden truth', 'they dont want you to know',
                'secret agenda', 'mainstream media lies'
            ]
        }
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    # =============================================================================
    # THEORY-SPECIFIC TOOLS (In addition to minimum required tools)
    # =============================================================================

    async def theory_validate_insight(self, insight_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main validation tool - validates an insight from Beacon or other sources
        
        This is the primary tool that LLMs will call to fact-check content.
        """
        try:
            # Log validation start
            validation_id = await self.recall_log_insight(
                f"Starting validation for: {insight_data.get('topic', 'Unknown')}",
                {'type': 'validation_start', 'insight_data': insight_data}
            )
            
            # Save validation request to memory
            memory_key = await self.memory_save(
                f"Validation request: {insight_data.get('topic', 'Unknown')}",
                {'type': 'validation_request', 'validation_id': validation_id}
            )
            
            print(f"🧠 Theory validating: {insight_data.get('topic', 'Unknown')}")
            
            # Extract claims from the insight
            claims = self._extract_claims(insight_data.get('summary', ''))
            
            # Fact-check each claim
            fact_checks = []
            for claim in claims:
                result = await self._fact_check_claim(claim, insight_data.get('sources', []))
                fact_checks.append(result)
            
            # Analyze source credibility
            source_scores = self._analyze_source_credibility(insight_data.get('sources', []))
            
            # Perform bias analysis
            bias_analysis = self._analyze_bias(insight_data.get('summary', ''))
            
            # Calculate overall reliability score
            reliability_score = self._calculate_reliability_score(
                fact_checks, source_scores, bias_analysis
            )
            
            # Generate consensus recommendation
            recommendation = self._generate_recommendation(reliability_score, fact_checks)
            
            # Create validation signature
            validation_content = f"{insight_data.get('topic', '')}{reliability_score}{datetime.utcnow().isoformat()}"
            theory_signature = hashlib.sha256(validation_content.encode()).hexdigest()
            
            # Create validation report
            report = ValidationReport(
                original_content=insight_data.get('summary', ''),
                fact_checks=fact_checks,
                overall_reliability_score=reliability_score,
                source_credibility_scores=source_scores,
                bias_analysis=bias_analysis,
                consensus_recommendation=recommendation,
                theory_signature=theory_signature,
                validation_timestamp=datetime.utcnow().isoformat()
            )
            
            # Convert to dict for return
            report_dict = asdict(report)
            report_dict['validation_id'] = validation_id
            report_dict['memory_key'] = memory_key
            
            # Log validation completion
            await self.recall_log_insight(
                f"Validation completed for: {insight_data.get('topic', 'Unknown')}. Score: {reliability_score}, Recommendation: {recommendation}",
                {'type': 'validation_complete', 'reliability_score': reliability_score, 'recommendation': recommendation}
            )
            
            # Save validation report
            await self._save_validation_log(insight_data.get('topic', 'Unknown'), report)
            
            return report_dict
            
        except Exception as e:
            await self.security_log_risk(f"Validation failed: {e}", "high")
            return {'error': str(e), 'topic': insight_data.get('topic', 'Unknown')}

    async def theory_check_single_claim(self, claim: str, context: str = "") -> Dict[str, Any]:
        """
        Fact-check a single claim with optional context
        """
        try:
            # Log claim check
            check_id = await self.recall_log_insight(
                f"Checking claim: {claim[:100]}...",
                {'type': 'claim_check', 'claim': claim, 'context': context}
            )
            
            # Perform fact-check
            result = await self._fact_check_claim(claim, [])
            
            # Save to memory
            memory_key = await self.memory_save(
                f"Claim check: {claim}",
                {'type': 'fact_check_result', 'check_id': check_id, 'result': asdict(result)}
            )
            
            # Convert to dict and add metadata
            result_dict = asdict(result)
            result_dict['check_id'] = check_id
            result_dict['memory_key'] = memory_key
            
            # Log completion
            await self.recall_log_insight(
                f"Claim check completed: {result.verification_status} (confidence: {result.confidence_score})",
                {'type': 'claim_check_complete', 'status': result.verification_status, 'confidence': result.confidence_score}
            )
            
            return result_dict
            
        except Exception as e:
            await self.security_log_risk(f"Claim check failed: {e}")
            return {'error': str(e), 'claim': claim}

    async def theory_analyze_bias(self, content: str) -> Dict[str, Any]:
        """
        Analyze bias indicators in content
        """
        try:
            # Log bias analysis
            analysis_id = await self.recall_log_insight(
                f"Analyzing bias in content ({len(content)} chars)",
                {'type': 'bias_analysis', 'content_length': len(content)}
            )
            
            # Perform bias analysis
            bias_analysis = self._analyze_bias(content)
            
            # Add metadata
            bias_analysis['analysis_id'] = analysis_id
            bias_analysis['analyzed_at'] = datetime.utcnow().isoformat()
            
            # Save to memory
            memory_key = await self.memory_save(
                f"Bias analysis: {bias_analysis['overall_bias_score']}",
                {'type': 'bias_analysis_result', 'analysis_id': analysis_id, 'result': bias_analysis}
            )
            
            bias_analysis['memory_key'] = memory_key
            
            # Log completion
            await self.recall_log_insight(
                f"Bias analysis completed: score {bias_analysis['overall_bias_score']}",
                {'type': 'bias_analysis_complete', 'score': bias_analysis['overall_bias_score']}
            )
            
            return bias_analysis
            
        except Exception as e:
            await self.security_log_risk(f"Bias analysis failed: {e}")
            return {'error': str(e)}

    async def theory_cross_reference_sources(self, sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Cross-reference multiple sources for consistency and reliability
        """
        try:
            # Log cross-reference start
            ref_id = await self.recall_log_insight(
                f"Cross-referencing {len(sources)} sources",
                {'type': 'cross_reference', 'source_count': len(sources)}
            )
            
            # Analyze each source
            source_analyses = []
            for source in sources:
                url = source.get('url', '')
                reliability = await self._analyze_single_source_reliability(url)
                source_analyses.append({
                    'source': source,
                    'reliability': reliability
                })
            
            # Calculate consensus
            reliability_scores = [s['reliability']['score'] for s in source_analyses if 'score' in s['reliability']]
            avg_reliability = sum(reliability_scores) / len(reliability_scores) if reliability_scores else 0.0
            
            # Identify conflicts
            conflicts = self._identify_source_conflicts(source_analyses)
            
            cross_ref_result = {
                'ref_id': ref_id,
                'source_analyses': source_analyses,
                'average_reliability': avg_reliability,
                'conflicts': conflicts,
                'consensus_strength': self._calculate_consensus_strength(source_analyses),
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
            # Save to memory
            memory_key = await self.memory_save(
                f"Cross-reference: {len(sources)} sources, avg reliability {avg_reliability:.2f}",
                {'type': 'cross_reference_result', 'ref_id': ref_id, 'result': cross_ref_result}
            )
            
            cross_ref_result['memory_key'] = memory_key
            
            # Log completion
            await self.recall_log_insight(
                f"Cross-reference completed: {len(sources)} sources, avg reliability {avg_reliability:.2f}",
                {'type': 'cross_reference_complete', 'avg_reliability': avg_reliability, 'conflicts': len(conflicts)}
            )
            
            return cross_ref_result
            
        except Exception as e:
            await self.security_log_risk(f"Cross-reference failed: {e}")
            return {'error': str(e)}

    # =============================================================================
    # ENHANCED TOOL REGISTRATION
    # =============================================================================
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get all available tools including core tools and Theory-specific tools"""
        # Get core tools from parent class
        tools = super().get_available_tools()
        
        # Add Theory-specific tools
        theory_tools = [
            {
                "name": "theory_validate_insight",
                "description": "Validate an insight through comprehensive fact-checking and bias analysis",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "insight_data": {
                            "type": "object",
                            "description": "The insight data to validate including topic, summary, and sources"
                        }
                    },
                    "required": ["insight_data"]
                }
            },
            {
                "name": "theory_check_single_claim",
                "description": "Fact-check a single claim with optional context",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "claim": {
                            "type": "string",
                            "description": "The claim to fact-check"
                        },
                        "context": {
                            "type": "string",
                            "description": "Optional context for the claim",
                            "default": ""
                        }
                    },
                    "required": ["claim"]
                }
            },
            {
                "name": "theory_analyze_bias",
                "description": "Analyze bias indicators in content",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "string",
                            "description": "The content to analyze for bias"
                        }
                    },
                    "required": ["content"]
                }
            },
            {
                "name": "theory_cross_reference_sources",
                "description": "Cross-reference multiple sources for consistency and reliability",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sources": {
                            "type": "array",
                            "items": {"type": "object"},
                            "description": "List of sources to cross-reference"
                        }
                    },
                    "required": ["sources"]
                }
            }
        ]
        
        # Combine all tools
        tools.extend(theory_tools)
        return tools

    # =============================================================================
    # PRIVATE METHODS (Enhanced from original implementation)
    # =============================================================================

    def _extract_claims(self, summary: str) -> List[str]:
        """Extract verifiable claims from summary text"""
        claims = []
        
        # Split by sentences
        sentences = re.split(r'[.!?]+', summary)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 20:  # Skip very short sentences
                continue
                
            # Look for factual statements (simple heuristics)
            if any(indicator in sentence.lower() for indicator in [
                'is', 'are', 'was', 'were', 'has', 'have', 'causes', 'results in',
                'leads to', 'associated with', 'linked to', 'found that', 'shows that'
            ]):
                claims.append(sentence)
        
        return claims[:5]  # Limit to 5 claims for efficiency

    async def _fact_check_claim(self, claim: str, sources: List[Any]) -> FactCheckResult:
        """Fact-check a specific claim against multiple sources"""
        # Cross-reference with original sources
        supporting_sources = []
        contradicting_sources = []
        
        # Extract keywords from claim
        keywords = self._extract_keywords(claim)
        
        # Check relevance to original sources
        for source in sources:
            if hasattr(source, 'title') or isinstance(source, dict):
                title = source.title if hasattr(source, 'title') else source.get('title', '')
                relevance = self._calculate_source_relevance(keywords, title)
                
                if relevance > 0.3:  # Threshold for relevance
                    supporting_sources.append(title)
        
        # Simulate fact-checking (in production, use real APIs)
        verification_status = await self._simulate_fact_check(claim)
        
        # Calculate confidence based on sources
        confidence = self._calculate_fact_check_confidence(
            claim, supporting_sources, contradicting_sources
        )
        
        # Generate reasoning
        reasoning = self._generate_fact_check_reasoning(
            claim, verification_status, supporting_sources, contradicting_sources
        )
        
        return FactCheckResult(
            claim=claim,
            verification_status=verification_status,
            confidence_score=confidence,
            supporting_sources=supporting_sources,
            contradicting_sources=contradicting_sources,
            reasoning=reasoning,
            checked_at=datetime.utcnow().isoformat()
        )

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract key terms from text for relevance matching"""
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Filter common words
        stop_words = {
            'the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with',
            'for', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'throughout', 'during'
        }
        
        keywords = [word for word in words if word not in stop_words]
        return list(set(keywords))[:10]  # Unique keywords, max 10

    def _calculate_source_relevance(self, keywords: List[str], source_title: str) -> float:
        """Calculate how relevant a source is to the keywords"""
        if not source_title:
            return 0.0
            
        source_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', source_title.lower()))
        keyword_set = set(keywords)
        
        if not keyword_set:
            return 0.0
            
        intersection = len(source_words.intersection(keyword_set))
        return intersection / len(keyword_set)

    async def _simulate_fact_check(self, claim: str) -> str:
        """Simulate fact-checking result (replace with real API calls)"""
        # Simple heuristics for simulation
        claim_lower = claim.lower()
        
        # Check for uncertainty indicators
        uncertainty_indicators = ['might', 'could', 'possibly', 'perhaps', 'may']
        if any(indicator in claim_lower for indicator in uncertainty_indicators):
            return 'unverified'
        
        # Check for absolute statements (often disputed)
        absolute_indicators = ['always', 'never', 'all', 'none', 'completely']
        if any(indicator in claim_lower for indicator in absolute_indicators):
            return 'disputed'
        
        # Check for scientific/medical terms (often verified if from good sources)
        scientific_indicators = ['study', 'research', 'published', 'peer-reviewed']
        if any(indicator in claim_lower for indicator in scientific_indicators):
            return 'verified'
        
        # Default based on length and complexity
        if len(claim) > 100:
            return 'verified'  # Longer, more detailed claims
        else:
            return 'unverified'  # Shorter claims need more verification

    def _calculate_fact_check_confidence(self, claim: str, supporting: List[str], 
                                       contradicting: List[str]) -> float:
        """Calculate confidence score for fact-check result"""
        base_confidence = 0.5
        
        # Adjust based on supporting sources
        if supporting:
            base_confidence += min(0.3, len(supporting) * 0.1)
        
        # Adjust based on contradicting sources
        if contradicting:
            base_confidence -= min(0.3, len(contradicting) * 0.1)
        
        # Adjust based on claim specificity
        if len(claim.split()) > 10:  # More specific claims
            base_confidence += 0.1
        
        return max(0.0, min(1.0, base_confidence))

    def _generate_fact_check_reasoning(self, claim: str, status: str, 
                                     supporting: List[str], contradicting: List[str]) -> str:
        """Generate human-readable reasoning for fact-check result"""
        reasoning_parts = [f"Claim: '{claim[:100]}...' if len(claim) > 100 else claim"]
        
        reasoning_parts.append(f"Status: {status.upper()}")
        
        if supporting:
            reasoning_parts.append(f"Supporting evidence from {len(supporting)} sources")
        
        if contradicting:
            reasoning_parts.append(f"Contradicting evidence from {len(contradicting)} sources")
        
        if status == 'verified':
            reasoning_parts.append("Multiple reliable sources confirm this claim")
        elif status == 'disputed':
            reasoning_parts.append("Conflicting information found across sources")
        elif status == 'false':
            reasoning_parts.append("Evidence contradicts this claim")
        else:
            reasoning_parts.append("Insufficient evidence for verification")
        
        return ". ".join(reasoning_parts)

    def _analyze_source_credibility(self, sources: List[Any]) -> Dict[str, float]:
        """Analyze credibility of sources"""
        scores = {}
        
        for source in sources:
            if hasattr(source, 'url') or isinstance(source, dict):
                url = source.url if hasattr(source, 'url') else source.get('url', '')
                if url:
                    domain = self._extract_domain(url)
                    score = self._get_domain_credibility(domain)
                    scores[url] = score
        
        return scores

    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        try:
            parsed = urlparse(url)
            return parsed.netloc.lower()
        except:
            return ""

    def _get_domain_credibility(self, domain: str) -> float:
        """Get credibility score for a domain"""
        # Check exact matches first
        for known_domain, score in self.source_credibility.items():
            if known_domain in domain:
                return score
        
        # Check for general patterns
        if '.edu' in domain:
            return 0.80
        elif '.gov' in domain:
            return 0.85
        elif '.org' in domain:
            return 0.75
        else:
            return 0.65  # Default for unknown domains

    def _analyze_bias(self, content: str) -> Dict[str, Any]:
        """Analyze bias indicators in content"""
        content_lower = content.lower()
        
        bias_scores = {}
        total_indicators = 0
        
        # Check each bias category
        for category, indicators in self.bias_indicators.items():
            found_indicators = [indicator for indicator in indicators if indicator in content_lower]
            bias_scores[category] = {
                'found': found_indicators,
                'count': len(found_indicators),
                'score': len(found_indicators) / len(indicators)
            }
            total_indicators += len(found_indicators)
        
        # Calculate overall bias score
        total_possible = sum(len(indicators) for indicators in self.bias_indicators.values())
        overall_bias_score = total_indicators / total_possible if total_possible > 0 else 0.0
        
        # Classify bias level
        if overall_bias_score < 0.1:
            bias_level = "low"
        elif overall_bias_score < 0.3:
            bias_level = "moderate"
        else:
            bias_level = "high"
        
        return {
            'overall_bias_score': overall_bias_score,
            'bias_level': bias_level,
            'category_scores': bias_scores,
            'total_indicators_found': total_indicators,
            'analysis_timestamp': datetime.utcnow().isoformat()
        }

    def _calculate_reliability_score(self, fact_checks: List[FactCheckResult], 
                                    source_scores: Dict[str, float], 
                                    bias_analysis: Dict[str, Any]) -> float:
        """Calculate overall reliability score"""
        # Base score from fact-checks
        if fact_checks:
            fact_check_scores = []
            for fact_check in fact_checks:
                if fact_check.verification_status == 'verified':
                    fact_check_scores.append(fact_check.confidence_score)
                elif fact_check.verification_status == 'disputed':
                    fact_check_scores.append(fact_check.confidence_score * 0.5)
                elif fact_check.verification_status == 'false':
                    fact_check_scores.append(0.0)
                else:  # unverified
                    fact_check_scores.append(fact_check.confidence_score * 0.7)
            
            avg_fact_check_score = sum(fact_check_scores) / len(fact_check_scores)
        else:
            avg_fact_check_score = 0.5  # Neutral if no fact-checks
        
        # Source credibility score
        if source_scores:
            avg_source_score = sum(source_scores.values()) / len(source_scores)
        else:
            avg_source_score = 0.5  # Neutral if no sources
        
        # Bias penalty
        bias_penalty = bias_analysis.get('overall_bias_score', 0) * 0.3
        
        # Combined score
        reliability_score = (
            avg_fact_check_score * 0.5 +  # 50% weight on fact-checks
            avg_source_score * 0.4 +      # 40% weight on source credibility
            (1.0 - bias_penalty) * 0.1    # 10% weight on bias (inverted)
        )
        
        return max(0.0, min(1.0, reliability_score))

    def _generate_recommendation(self, reliability_score: float, fact_checks: List[FactCheckResult]) -> str:
        """Generate consensus recommendation"""
        # Check for any false claims
        false_claims = [fc for fc in fact_checks if fc.verification_status == 'false']
        if false_claims:
            return 'reject'
        
        # Check reliability score
        if reliability_score >= 0.8:
            return 'accept'
        elif reliability_score >= 0.6:
            return 'accept_with_caution'
        else:
            return 'reject'

    async def _save_validation_log(self, topic: str, report: ValidationReport):
        """Save validation report to logs"""
        try:
            timestamp = datetime.utcnow().isoformat().replace(':', '-')
            log_file = self.logs_path / f"validation_{timestamp}.json"
            
            with open(log_file, 'w') as f:
                json.dump({
                    'topic': topic,
                    'report': asdict(report),
                    'saved_at': datetime.utcnow().isoformat()
                }, f, indent=2)
                
        except Exception as e:
            await self.security_log_risk(f"Failed to save validation log: {e}")

    async def _analyze_single_source_reliability(self, url: str) -> Dict[str, Any]:
        """Analyze reliability of a single source"""
        domain = self._extract_domain(url)
        score = self._get_domain_credibility(domain)
        
        return {
            'url': url,
            'domain': domain,
            'score': score,
            'classification': self._classify_reliability(score)
        }

    def _classify_reliability(self, score: float) -> str:
        """Classify reliability score"""
        if score >= 0.90:
            return "highly_reliable"
        elif score >= 0.80:
            return "reliable"
        elif score >= 0.70:
            return "moderately_reliable"
        else:
            return "low_reliability"

    def _identify_source_conflicts(self, source_analyses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify conflicts between sources"""
        conflicts = []
        
        # Simple conflict detection based on reliability score variance
        scores = [s['reliability']['score'] for s in source_analyses if 'score' in s['reliability']]
        
        if len(scores) > 1:
            score_variance = max(scores) - min(scores)
            if score_variance > 0.3:  # Significant variance
                conflicts.append({
                    'type': 'reliability_variance',
                    'description': f"Significant variance in source reliability scores: {score_variance:.2f}",
                    'severity': 'high' if score_variance > 0.5 else 'medium'
                })
        
        return conflicts

    def _calculate_consensus_strength(self, source_analyses: List[Dict[str, Any]]) -> float:
        """Calculate how strong the consensus is across sources"""
        if not source_analyses:
            return 0.0
        
        scores = [s['reliability']['score'] for s in source_analyses if 'score' in s['reliability']]
        
        if len(scores) <= 1:
            return 0.5  # No consensus possible with one or no sources
        
        # Calculate standard deviation
        mean_score = sum(scores) / len(scores)
        variance = sum((score - mean_score) ** 2 for score in scores) / len(scores)
        std_dev = variance ** 0.5
        
        # Convert to consensus strength (lower std_dev = higher consensus)
        consensus_strength = max(0.0, 1.0 - (std_dev * 2))  # Scale factor
        
        return consensus_strength


# =============================================================================
# USAGE EXAMPLE
# =============================================================================

async def main():
    """Example usage of the enhanced Theory agent with tool calling"""
    config = {}
    
    async with TheoryAgentEnhanced(config) as theory:
        # Test the tool calling system
        print("🔧 Available tools:")
        tools = theory.get_available_tools()
        for tool in tools:
            print(f"  - {tool['name']}: {tool['description']}")
        
        # Sample insight data for testing
        sample_insight = {
            'topic': 'machine learning in healthcare',
            'summary': """Machine learning algorithms are increasingly being used in healthcare for diagnostic purposes. 
            Studies have shown that ML can achieve accuracy rates above 90% in certain medical imaging tasks. 
            Researchers published findings that deep learning models can detect cancer with remarkable precision. 
            The technology is completely revolutionizing medical diagnosis and will solve all healthcare problems.""",
            'sources': [
                {'url': 'https://www.ncbi.nlm.nih.gov/pubmed/12345', 'title': 'Machine Learning in Medical Imaging'},
                {'url': 'https://en.wikipedia.org/wiki/Machine_learning_in_healthcare', 'title': 'Machine learning in healthcare'}
            ]
        }
        
        print("\n🔍 Testing insight validation...")
        result = await theory.execute_tool(
            'theory_validate_insight',
            insight_data=sample_insight
        )
        
        if 'error' not in result:
            print(f"✅ Validation completed")
            print(f"   Reliability Score: {result['overall_reliability_score']:.2f}")
            print(f"   Recommendation: {result['consensus_recommendation']}")
            print(f"   Fact Checks: {len(result['fact_checks'])}")
        else:
            print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    asyncio.run(main()) 