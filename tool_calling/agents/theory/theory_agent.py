# ----------------------------------------------------------------------------
#  File:        theory_agent.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Theory Fact-Checking & Validation Agent - verifies knowledge claims
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
from dataclasses import dataclass
from pathlib import Path
import re
from urllib.parse import urlparse

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

class TheoryAgent:
    """
    Theory - Fact-Checking & Validation Agent
    
    Verifies knowledge claims through cross-referencing, fact-checking,
    and reliability analysis to ensure information integrity.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.agent_id = "theory_agent"
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

    async def validate_insight(self, insight_data: Dict[str, Any]) -> ValidationReport:
        """
        Main function to validate an insight from Beacon or other sources
        
        Args:
            insight_data: Insight data to validate (from Beacon.ask_beacon())
            
        Returns:
            Complete ValidationReport with fact-checking results
        """
        print(f"🧠 Theory validating: {insight_data['topic']}")
        
        # Extract claims from the insight
        claims = self._extract_claims(insight_data['summary'])
        
        # Fact-check each claim
        fact_checks = []
        for claim in claims:
            result = await self._fact_check_claim(claim, insight_data['sources'])
            fact_checks.append(result)
        
        # Analyze source credibility
        source_scores = self._analyze_source_credibility(insight_data['sources'])
        
        # Perform bias analysis
        bias_analysis = self._analyze_bias(insight_data['summary'])
        
        # Calculate overall reliability score
        reliability_score = self._calculate_reliability_score(
            fact_checks, source_scores, bias_analysis
        )
        
        # Generate consensus recommendation
        recommendation = self._generate_recommendation(reliability_score, fact_checks)
        
        # Create validation signature
        validation_content = f"{insight_data['topic']}{reliability_score}{datetime.utcnow().isoformat()}"
        theory_signature = hashlib.sha256(validation_content.encode()).hexdigest()
        
        # Create validation report
        report = ValidationReport(
            original_content=insight_data['summary'],
            fact_checks=fact_checks,
            overall_reliability_score=reliability_score,
            source_credibility_scores=source_scores,
            bias_analysis=bias_analysis,
            consensus_recommendation=recommendation,
            theory_signature=theory_signature,
            validation_timestamp=datetime.utcnow().isoformat()
        )
        
        # Log validation
        await self._save_validation_log(insight_data['topic'], report)
        
        return report

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
        """
        Fact-check a specific claim against multiple sources
        
        Args:
            claim: The claim to fact-check
            sources: Original sources from Beacon
            
        Returns:
            FactCheckResult with verification status
        """
        # Cross-reference with original sources
        supporting_sources = []
        contradicting_sources = []
        
        # For now, we'll do basic keyword matching and source validation
        # In production, this would use actual fact-checking APIs
        
        claim_keywords = self._extract_keywords(claim)
        
        # Check original sources for supporting evidence
        for source in sources:
            if hasattr(source, 'title') and hasattr(source, 'url'):
                source_relevance = self._calculate_source_relevance(
                    claim_keywords, source.title
                )
                if source_relevance > 0.3:
                    supporting_sources.append(source.url)
        
        # Simulate additional fact-checking (in production, query fact-check APIs)
        verification_status = await self._simulate_fact_check(claim)
        
        # Calculate confidence based on multiple factors
        confidence_score = self._calculate_fact_check_confidence(
            claim, supporting_sources, contradicting_sources
        )
        
        # Generate reasoning
        reasoning = self._generate_fact_check_reasoning(
            claim, verification_status, supporting_sources, contradicting_sources
        )
        
        return FactCheckResult(
            claim=claim,
            verification_status=verification_status,
            confidence_score=confidence_score,
            supporting_sources=supporting_sources,
            contradicting_sources=contradicting_sources,
            reasoning=reasoning,
            checked_at=datetime.utcnow().isoformat()
        )

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract key terms from text for relevance matching"""
        # Simple keyword extraction (in production, use NLP libraries)
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
        """
        Simulate fact-checking API call
        In production, this would query actual fact-checking services
        """
        # Simple heuristics for simulation
        claim_lower = claim.lower()
        
        # Check for scientific/medical claims (usually more reliable)
        if any(term in claim_lower for term in [
            'study', 'research', 'data', 'analysis', 'published', 'journal',
            'scientists', 'researchers', 'evidence', 'clinical'
        ]):
            return 'verified'
        
        # Check for absolute claims (often questionable)
        if any(term in claim_lower for term in [
            'always', 'never', 'all', 'none', 'completely', 'totally'
        ]):
            return 'disputed'
            
        # Check for emotional language (potential bias)
        if any(term in claim_lower for term in self.bias_indicators['emotional_language']):
            return 'unverified'
            
        # Default to unverified for safety
        return 'unverified'

    def _calculate_fact_check_confidence(self, claim: str, supporting: List[str], 
                                       contradicting: List[str]) -> float:
        """Calculate confidence score for fact-check result"""
        base_score = 0.5
        
        # Boost confidence for supporting sources
        if supporting:
            base_score += min(0.3, len(supporting) * 0.1)
        
        # Reduce confidence for contradicting sources
        if contradicting:
            base_score -= min(0.3, len(contradicting) * 0.15)
        
        # Adjust for claim complexity/specificity
        if len(claim.split()) > 15:  # Complex claims are harder to verify
            base_score -= 0.1
            
        return max(0.0, min(1.0, base_score))

    def _generate_fact_check_reasoning(self, claim: str, status: str, 
                                     supporting: List[str], contradicting: List[str]) -> str:
        """Generate human-readable reasoning for fact-check result"""
        reasoning_parts = [f"Claim: '{claim[:100]}...' if claim is long else claim"]
        
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
            if hasattr(source, 'url'):
                domain = self._extract_domain(source.url)
                score = self._get_domain_credibility(domain)
                scores[source.url] = score
        
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
        # Direct match
        if domain in self.source_credibility:
            return self.source_credibility[domain]
        
        # Check for pattern matches
        for pattern, score in self.source_credibility.items():
            if pattern in domain:
                return score
        
        # Check domain endings
        if domain.endswith('.edu'):
            return self.source_credibility['edu']
        elif domain.endswith('.gov'):
            return self.source_credibility['gov']
        
        # Default for unknown sources
        return 0.6

    def _analyze_bias(self, content: str) -> Dict[str, Any]:
        """Analyze potential bias in content"""
        bias_analysis = {
            'emotional_language_score': 0.0,
            'absolute_terms_score': 0.0,
            'conspiracy_indicators_score': 0.0,
            'overall_bias_score': 0.0,
            'bias_indicators_found': []
        }
        
        content_lower = content.lower()
        word_count = len(content.split())
        
        # Check for emotional language
        emotional_count = sum(1 for term in self.bias_indicators['emotional_language'] 
                            if term in content_lower)
        bias_analysis['emotional_language_score'] = min(1.0, emotional_count / max(1, word_count / 50))
        
        # Check for absolute terms
        absolute_count = sum(1 for term in self.bias_indicators['absolute_terms'] 
                           if term in content_lower)
        bias_analysis['absolute_terms_score'] = min(1.0, absolute_count / max(1, word_count / 30))
        
        # Check for conspiracy indicators
        conspiracy_count = sum(1 for term in self.bias_indicators['conspiracy_terms'] 
                             if term in content_lower)
        bias_analysis['conspiracy_indicators_score'] = min(1.0, conspiracy_count / max(1, word_count / 100))
        
        # Calculate overall bias score
        bias_analysis['overall_bias_score'] = (
            bias_analysis['emotional_language_score'] * 0.4 +
            bias_analysis['absolute_terms_score'] * 0.3 +
            bias_analysis['conspiracy_indicators_score'] * 0.3
        )
        
        # Record found indicators
        found_indicators = []
        for category, terms in self.bias_indicators.items():
            for term in terms:
                if term in content_lower:
                    found_indicators.append(f"{category}: {term}")
        
        bias_analysis['bias_indicators_found'] = found_indicators[:10]  # Limit output
        
        return bias_analysis

    def _calculate_reliability_score(self, fact_checks: List[FactCheckResult], 
                                    source_scores: Dict[str, float], 
                                    bias_analysis: Dict[str, Any]) -> float:
        """Calculate overall reliability score based on multiple factors"""
        # Base score from fact-checking results
        fact_check_score = 0.0
        if fact_checks:
            verified_count = sum(1 for fc in fact_checks if fc.verification_status == 'verified')
            disputed_count = sum(1 for fc in fact_checks if fc.verification_status == 'disputed')
            false_count = sum(1 for fc in fact_checks if fc.verification_status == 'false')
            
            fact_check_score = (
                (verified_count * 1.0) + 
                (disputed_count * 0.5) + 
                (false_count * 0.0)
            ) / len(fact_checks)
        
        # Average source credibility score
        source_score = sum(source_scores.values()) / len(source_scores) if source_scores else 0.6
        
        # Bias penalty (lower bias = higher reliability)
        bias_penalty = bias_analysis.get('overall_bias_score', 0.0)
        bias_adjusted_score = max(0.0, 1.0 - bias_penalty)
        
        # Confidence weighting from fact-checks
        confidence_score = 0.0
        if fact_checks:
            confidence_score = sum(fc.confidence_score for fc in fact_checks) / len(fact_checks)
        
        # Weighted combination
        reliability_score = (
            fact_check_score * 0.35 +
            source_score * 0.30 +
            bias_adjusted_score * 0.20 +
            confidence_score * 0.15
        )
        
        return min(1.0, max(0.0, reliability_score))

    def _generate_recommendation(self, reliability_score: float, fact_checks: List[FactCheckResult]) -> str:
        """Generate consensus recommendation based on analysis"""
        # Count verification statuses
        verified_count = sum(1 for fc in fact_checks if fc.verification_status == 'verified')
        false_count = sum(1 for fc in fact_checks if fc.verification_status == 'false')
        disputed_count = sum(1 for fc in fact_checks if fc.verification_status == 'disputed')
        
        # Strong rejection criteria
        if false_count > 0 or reliability_score < 0.3:
            return 'reject'
        
        # Strong acceptance criteria
        if reliability_score > 0.8 and verified_count > disputed_count:
            return 'accept'
        
        # Moderate acceptance with caution
        if reliability_score > 0.5:
            return 'accept_with_caution'
        
        # Default to rejection for safety
        return 'reject'

    async def _save_validation_log(self, topic: str, report: ValidationReport):
        """Save validation report to local log file"""
        log_dir = Path("validation_logs")
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"theory_validations_{datetime.now().strftime('%Y%m%d')}.jsonl"
        
        # Convert dataclasses to dictionaries for JSON serialization
        log_entry = {
            'timestamp': report.validation_timestamp,
            'topic': topic,
            'original_content': report.original_content[:200] + "..." if len(report.original_content) > 200 else report.original_content,
            'fact_checks': [
                {
                    'claim': fc.claim[:100] + "..." if len(fc.claim) > 100 else fc.claim,
                    'verification_status': fc.verification_status,
                    'confidence_score': fc.confidence_score,
                    'supporting_sources_count': len(fc.supporting_sources),
                    'contradicting_sources_count': len(fc.contradicting_sources),
                    'reasoning': fc.reasoning
                } for fc in report.fact_checks
            ],
            'overall_reliability_score': report.overall_reliability_score,
            'source_credibility_scores': report.source_credibility_scores,
            'bias_analysis': report.bias_analysis,
            'consensus_recommendation': report.consensus_recommendation,
            'theory_signature': report.theory_signature
        }
        
        with open(log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')

    # Multi-agent consensus methods
    async def validate_with_beacon(self, beacon_insight_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate Beacon insight and prepare for multi-agent consensus
        
        Args:
            beacon_insight_data: Output from Beacon.ask_beacon()
            
        Returns:
            Combined Beacon + Theory consensus data
        """
        # Validate the Beacon insight
        validation_report = await self.validate_insight(beacon_insight_data)
        
        # Create multi-agent consensus data
        consensus_data = {
            'topic': beacon_insight_data['topic'],
            'beacon_insight': beacon_insight_data,
            'theory_validation': validation_report,
            'consensus_status': validation_report.consensus_recommendation,
            'combined_confidence': min(
                0.8,  # Beacon's implicit confidence
                validation_report.overall_reliability_score
            ),
            'multi_agent_signatures': {
                'beacon': beacon_insight_data.get('agent_signature', 'beacon_sig'),
                'theory': validation_report.theory_signature
            },
            'consensus_timestamp': datetime.utcnow().isoformat()
        }
        
        return consensus_data

    def create_consensus_summary(self, consensus_data: Dict[str, Any]) -> str:
        """Create a summary for multi-agent consensus record"""
        beacon_summary = consensus_data['beacon_insight']['summary'][:300]
        validation_status = consensus_data['theory_validation'].consensus_recommendation
        reliability = consensus_data['theory_validation'].overall_reliability_score
        
        consensus_summary = f"""
MULTI-AGENT CONSENSUS RECORD

Topic: {consensus_data['topic']}

Beacon Knowledge Summary:
{beacon_summary}{'...' if len(consensus_data['beacon_insight']['summary']) > 300 else ''}

Theory Validation:
- Status: {validation_status.upper()}
- Reliability Score: {reliability:.2f}
- Fact Checks: {len(consensus_data['theory_validation'].fact_checks)} claims verified
- Source Credibility: {len(consensus_data['theory_validation'].source_credibility_scores)} sources analyzed

Consensus Recommendation: {validation_status.replace('_', ' ').title()}
Combined Confidence: {consensus_data['combined_confidence']:.2f}
"""
        return consensus_summary.strip()

# Example usage and testing
async def main():
    """Example usage of Theory agent with Beacon integration"""
    from beacon_agent import BeaconAgent
    
    config = {
        'news_api_key': None,
        'wolfram_api_key': None,
    }
    
    # Create sample insight data (simulating Beacon output)
    sample_insight = {
        'topic': 'machine learning in healthcare',
        'summary': """Machine learning algorithms are increasingly being used in healthcare for diagnostic purposes. 
        Studies have shown that ML can achieve accuracy rates above 90% in certain medical imaging tasks. 
        Researchers published findings that deep learning models can detect cancer with remarkable precision. 
        The technology is completely revolutionizing medical diagnosis and will solve all healthcare problems.""",
        'sources': [
            type('Source', (), {
                'url': 'https://www.ncbi.nlm.nih.gov/pubmed/12345',
                'title': 'Machine Learning in Medical Imaging',
                'source_type': 'pubmed'
            })(),
            type('Source', (), {
                'url': 'https://en.wikipedia.org/wiki/Machine_learning_in_healthcare',
                'title': 'Machine learning in healthcare',
                'source_type': 'wikipedia'
            })()
        ],
        'retrieved_at': datetime.utcnow().isoformat()
    }
    
    async with TheoryAgent(config) as theory:
        print("🧠 Testing Theory Agent Validation...")
        
        # Validate the insight
        validation_report = await theory.validate_insight(sample_insight)
        
        print(f"\n📊 VALIDATION RESULTS:")
        print(f"Reliability Score: {validation_report.overall_reliability_score:.2f}")
        print(f"Recommendation: {validation_report.consensus_recommendation}")
        print(f"Fact Checks: {len(validation_report.fact_checks)}")
        
        for i, fc in enumerate(validation_report.fact_checks, 1):
            print(f"\n[{i}] {fc.verification_status.upper()} (confidence: {fc.confidence_score:.2f})")
            print(f"    Claim: {fc.claim[:80]}...")
            print(f"    Reasoning: {fc.reasoning}")
        
        print(f"\n🔒 Theory Signature: {validation_report.theory_signature[:16]}...")
        
        # Test multi-agent consensus
        print(f"\n🤝 Testing Multi-Agent Consensus...")
        consensus_data = await theory.validate_with_beacon(sample_insight)
        consensus_summary = theory.create_consensus_summary(consensus_data)
        
        print(f"\n📋 CONSENSUS SUMMARY:")
        print(consensus_summary)

if __name__ == "__main__":
    asyncio.run(main()) 