# ----------------------------------------------------------------------------
#  File:        test_theory.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test suite for the Theory Fact-Checking & Validation Agent
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import pytest
from pathlib import Path
from theory_agent import TheoryAgent, FactCheckResult, ValidationReport
from beacon_agent import BeaconAgent, KnowledgeSource

class TestTheoryAgent:
    """Test suite for Theory agent functionality"""
    
    @pytest.fixture
    async def theory_agent(self):
        """Create a Theory agent for testing"""
        config = {
            'factcheck_api_keys': {},
            'credibility_threshold': 0.7,
            'bias_tolerance': 0.3
        }
        
        async with TheoryAgent(config) as agent:
            yield agent
    
    @pytest.fixture
    def sample_insight_data(self):
        """Create sample insight data for testing"""
        return {
            'topic': 'test topic',
            'summary': 'This is a test summary with claims. The study shows that testing is effective. Researchers have found evidence that supports this claim.',
            'sources': [
                KnowledgeSource(
                    url='https://www.ncbi.nlm.nih.gov/pubmed/12345',
                    title='Test Research Study',
                    source_type='pubmed',
                    retrieved_at='2025-01-01T00:00:00Z'
                ),
                KnowledgeSource(
                    url='https://en.wikipedia.org/wiki/Testing',
                    title='Testing',
                    source_type='wikipedia',
                    retrieved_at='2025-01-01T00:00:00Z'
                )
            ],
            'retrieved_at': '2025-01-01T00:00:00Z'
        }
    
    async def test_extract_claims(self, theory_agent):
        """Test claim extraction from text"""
        text = "Machine learning is useful. Studies have shown effectiveness. This causes improvements."
        claims = theory_agent._extract_claims(text)
        
        assert len(claims) >= 2
        assert any('machine learning' in claim.lower() for claim in claims)
        assert any('studies have shown' in claim.lower() for claim in claims)

    async def test_extract_keywords(self, theory_agent):
        """Test keyword extraction from text"""
        text = "Machine learning algorithms are used for medical diagnosis"
        keywords = theory_agent._extract_keywords(text)
        
        assert 'machine' in keywords
        assert 'learning' in keywords
        assert 'algorithms' in keywords
        assert 'medical' in keywords
        # Stop words should be filtered out
        assert 'are' not in keywords
        assert 'for' not in keywords

    async def test_source_credibility_analysis(self, theory_agent, sample_insight_data):
        """Test source credibility scoring"""
        scores = theory_agent._analyze_source_credibility(sample_insight_data['sources'])
        
        assert len(scores) == 2
        # PubMed should have high credibility
        assert any(score > 0.9 for score in scores.values())
        # Wikipedia should have good credibility
        assert any(0.8 <= score <= 0.9 for score in scores.values())

    async def test_bias_analysis(self, theory_agent):
        """Test bias detection in content"""
        # Test high bias content
        biased_text = "This is absolutely shocking and completely unbelievable! All experts are totally wrong!"
        bias_result = theory_agent._analyze_bias(biased_text)
        
        assert bias_result['overall_bias_score'] > 0.3
        assert bias_result['emotional_language_score'] > 0.0
        assert bias_result['absolute_terms_score'] > 0.0
        assert len(bias_result['bias_indicators_found']) > 0
        
        # Test low bias content
        neutral_text = "Research suggests that some approaches may be more effective than others in certain contexts."
        neutral_bias = theory_agent._analyze_bias(neutral_text)
        
        assert neutral_bias['overall_bias_score'] < 0.2

    async def test_fact_check_simulation(self, theory_agent):
        """Test fact-checking simulation logic"""
        # Scientific claim should be verified
        scientific_claim = "The study published in the journal showed that researchers found evidence"
        status = await theory_agent._simulate_fact_check(scientific_claim)
        assert status == 'verified'
        
        # Absolute claim should be disputed
        absolute_claim = "This technology will always work perfectly and never fail"
        status = await theory_agent._simulate_fact_check(absolute_claim)
        assert status == 'disputed'
        
        # Emotional claim should be unverified
        emotional_claim = "This shocking revelation is absolutely mind-blowing"
        status = await theory_agent._simulate_fact_check(emotional_claim)
        assert status == 'unverified'

    async def test_reliability_score_calculation(self, theory_agent):
        """Test overall reliability score calculation"""
        # Create mock fact check results
        fact_checks = [
            FactCheckResult(
                claim="Test claim 1",
                verification_status="verified",
                confidence_score=0.8,
                supporting_sources=[],
                contradicting_sources=[],
                reasoning="Test reasoning",
                checked_at="2025-01-01T00:00:00Z"
            ),
            FactCheckResult(
                claim="Test claim 2",
                verification_status="disputed",
                confidence_score=0.6,
                supporting_sources=[],
                contradicting_sources=[],
                reasoning="Test reasoning",
                checked_at="2025-01-01T00:00:00Z"
            )
        ]
        
        source_scores = {'source1': 0.9, 'source2': 0.8}
        bias_analysis = {'overall_bias_score': 0.2}
        
        reliability = theory_agent._calculate_reliability_score(
            fact_checks, source_scores, bias_analysis
        )
        
        assert 0.0 <= reliability <= 1.0
        assert reliability > 0.5  # Should be decent with good sources and mixed fact checks

    async def test_recommendation_generation(self, theory_agent):
        """Test consensus recommendation generation"""
        # High reliability should lead to acceptance
        high_reliability_checks = [
            FactCheckResult("claim", "verified", 0.9, [], [], "reasoning", "timestamp")
        ]
        recommendation = theory_agent._generate_recommendation(0.9, high_reliability_checks)
        assert recommendation == 'accept'
        
        # Low reliability should lead to rejection
        low_reliability_checks = [
            FactCheckResult("claim", "false", 0.2, [], [], "reasoning", "timestamp")
        ]
        recommendation = theory_agent._generate_recommendation(0.2, low_reliability_checks)
        assert recommendation == 'reject'
        
        # Medium reliability should lead to caution
        medium_reliability_checks = [
            FactCheckResult("claim", "unverified", 0.5, [], [], "reasoning", "timestamp")
        ]
        recommendation = theory_agent._generate_recommendation(0.6, medium_reliability_checks)
        assert recommendation == 'accept_with_caution'

    async def test_validate_insight(self, theory_agent, sample_insight_data):
        """Test complete insight validation workflow"""
        validation_report = await theory_agent.validate_insight(sample_insight_data)
        
        assert isinstance(validation_report, ValidationReport)
        assert validation_report.original_content == sample_insight_data['summary']
        assert len(validation_report.fact_checks) > 0
        assert 0.0 <= validation_report.overall_reliability_score <= 1.0
        assert validation_report.consensus_recommendation in ['accept', 'accept_with_caution', 'reject']
        assert len(validation_report.theory_signature) == 64  # SHA256 hex length
        assert validation_report.validation_timestamp

    async def test_multi_agent_consensus(self, theory_agent, sample_insight_data):
        """Test multi-agent consensus functionality"""
        consensus_data = await theory_agent.validate_with_beacon(sample_insight_data)
        
        assert 'topic' in consensus_data
        assert 'beacon_insight' in consensus_data
        assert 'theory_validation' in consensus_data
        assert 'consensus_status' in consensus_data
        assert 'combined_confidence' in consensus_data
        assert 'multi_agent_signatures' in consensus_data
        
        # Check signatures
        signatures = consensus_data['multi_agent_signatures']
        assert 'beacon' in signatures
        assert 'theory' in signatures

    async def test_consensus_summary_creation(self, theory_agent, sample_insight_data):
        """Test consensus summary generation"""
        consensus_data = await theory_agent.validate_with_beacon(sample_insight_data)
        summary = theory_agent.create_consensus_summary(consensus_data)
        
        assert 'MULTI-AGENT CONSENSUS RECORD' in summary
        assert sample_insight_data['topic'] in summary
        assert 'Beacon Knowledge Summary' in summary
        assert 'Theory Validation' in summary
        assert 'Consensus Recommendation' in summary

    async def test_validation_logging(self, theory_agent, sample_insight_data):
        """Test validation log creation"""
        validation_report = await theory_agent.validate_insight(sample_insight_data)
        
        # Check if log file was created
        log_dir = Path("validation_logs")
        assert log_dir.exists()
        
        log_files = list(log_dir.glob("*.jsonl"))
        assert len(log_files) > 0
        
        # Check log content
        latest_log = max(log_files, key=lambda f: f.stat().st_mtime)
        with open(latest_log, 'r') as f:
            lines = f.readlines()
            assert len(lines) > 0
            
            # Parse last entry
            last_entry = json.loads(lines[-1])
            assert last_entry['topic'] == sample_insight_data['topic']
            assert 'overall_reliability_score' in last_entry
            assert 'consensus_recommendation' in last_entry

# Integration tests
async def test_theory_beacon_integration():
    """Test full integration between Theory and Beacon agents"""
    beacon_config = {'news_api_key': None, 'wolfram_api_key': None}
    theory_config = {'factcheck_api_keys': {}, 'credibility_threshold': 0.7}
    
    # Get insight from Beacon
    async with BeaconAgent(beacon_config) as beacon:
        beacon_insight = await beacon.ask_beacon("machine learning", sources=['wikipedia'])
    
    # Validate with Theory
    async with TheoryAgent(theory_config) as theory:
        consensus_data = await theory.validate_with_beacon(beacon_insight)
        
        # Verify integration
        assert consensus_data['topic'] == "machine learning"
        assert 'beacon_insight' in consensus_data
        assert 'theory_validation' in consensus_data
        
        # Check that both agents contributed
        signatures = consensus_data['multi_agent_signatures']
        assert len(signatures['beacon']) > 0
        assert len(signatures['theory']) > 0
        
        print(f"✅ Multi-agent consensus achieved for: {consensus_data['topic']}")
        print(f"   Recommendation: {consensus_data['consensus_status']}")
        print(f"   Combined Confidence: {consensus_data['combined_confidence']:.2f}")

async def test_bias_detection_accuracy():
    """Test Theory's bias detection on various types of content"""
    theory_config = {'factcheck_api_keys': {}}
    
    test_cases = [
        {
            'content': "Scientific studies consistently demonstrate measurable effects in controlled environments.",
            'expected_bias': 'low',
            'description': 'neutral scientific content'
        },
        {
            'content': "This is absolutely shocking! All mainstream scientists are completely wrong about everything!",
            'expected_bias': 'high',
            'description': 'highly biased conspiratorial content'
        },
        {
            'content': "Research suggests potential benefits, though more study may be needed to confirm results.",
            'expected_bias': 'low',
            'description': 'cautious scientific language'
        },
        {
            'content': "Everyone knows this is totally false and will never work under any circumstances!",
            'expected_bias': 'high',
            'description': 'absolute statements with emotional language'
        }
    ]
    
    async with TheoryAgent(theory_config) as theory:
        for case in test_cases:
            bias_analysis = theory._analyze_bias(case['content'])
            bias_score = bias_analysis['overall_bias_score']
            
            if case['expected_bias'] == 'low':
                assert bias_score < 0.3, f"Expected low bias for {case['description']}, got {bias_score}"
            else:
                assert bias_score >= 0.3, f"Expected high bias for {case['description']}, got {bias_score}"
            
            print(f"✅ Bias detection test passed: {case['description']} (score: {bias_score:.2f})")

# Performance test
async def test_theory_performance():
    """Test Theory performance with multiple validations"""
    import time
    
    theory_config = {'factcheck_api_keys': {}}
    
    test_insights = [
        {
            'topic': f'test_topic_{i}',
            'summary': f'This is test summary {i} with claims that need validation. Studies show various results.',
            'sources': [
                KnowledgeSource(
                    url=f'https://example.com/source_{i}',
                    title=f'Test Source {i}',
                    source_type='test',
                    retrieved_at='2025-01-01T00:00:00Z'
                )
            ],
            'retrieved_at': '2025-01-01T00:00:00Z'
        } for i in range(5)
    ]
    
    async with TheoryAgent(theory_config) as theory:
        start_time = time.time()
        
        results = []
        for insight in test_insights:
            validation = await theory.validate_insight(insight)
            results.append(validation)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Performance assertions
        assert len(results) == len(test_insights)
        assert total_time < 30  # Should complete within 30 seconds
        assert all(isinstance(r, ValidationReport) for r in results)
        
        print(f"Validated {len(test_insights)} insights in {total_time:.2f} seconds")
        print(f"Average time per validation: {total_time/len(test_insights):.2f} seconds")

if __name__ == "__main__":
    # Run integration tests
    print("Running Theory Agent Integration Tests...")
    asyncio.run(test_theory_beacon_integration())
    
    print("\nRunning Bias Detection Tests...")
    asyncio.run(test_bias_detection_accuracy())
    
    print("\nRunning Performance Tests...")
    asyncio.run(test_theory_performance())
    
    print("\nAll tests completed! ✅")
    print("\nTo run full test suite with pytest:")
    print("pip install pytest pytest-asyncio")
    print("pytest test_theory.py -v") 