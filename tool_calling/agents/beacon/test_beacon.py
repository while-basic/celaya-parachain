# ----------------------------------------------------------------------------
#  File:        test_beacon.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Test suite for the Beacon Knowledge & Insight Agent
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import pytest
from pathlib import Path
from beacon_agent import BeaconAgent, KnowledgeSource, InsightRecord
from blockchain_client import BlockchainClient, create_blockchain_client

class TestBeaconAgent:
    """Test suite for Beacon agent functionality"""
    
    @pytest.fixture
    async def beacon_agent(self):
        """Create a Beacon agent for testing"""
        config = {
            'news_api_key': None,  # Tests work without API keys
            'wolfram_api_key': None,
        }
        
        async with BeaconAgent(config) as agent:
            yield agent
    
    @pytest.fixture
    def blockchain_client(self):
        """Create a blockchain client for testing"""
        return create_blockchain_client(use_simulation=True)
    
    async def test_wikipedia_query(self, beacon_agent):
        """Test Wikipedia API integration"""
        result = await beacon_agent._query_wikipedia("python programming")
        
        assert result is not None
        assert 'summary' in result
        assert 'source' in result
        assert isinstance(result['source'], KnowledgeSource)
        assert result['source'].source_type == 'wikipedia'
        assert len(result['summary']) > 0
    
    async def test_pubmed_query(self, beacon_agent):
        """Test PubMed API integration"""
        result = await beacon_agent._query_pubmed("diabetes treatment")
        
        assert result is not None
        assert 'sources' in result
        assert 'article_titles' in result
        assert len(result['sources']) > 0
        assert all(isinstance(source, KnowledgeSource) for source in result['sources'])
        assert all(source.source_type == 'pubmed' for source in result['sources'])
    
    async def test_ask_beacon_single_source(self, beacon_agent):
        """Test asking Beacon about a topic with single source"""
        result = await beacon_agent.ask_beacon("machine learning", sources=['wikipedia'])
        
        assert result['topic'] == "machine learning"
        assert 'summary' in result
        assert 'sources' in result
        assert 'retrieved_at' in result
        assert len(result['sources']) > 0
        
        # Check summary content
        assert len(result['summary']) > 100
        assert "machine learning" in result['summary'].lower()
    
    async def test_ask_beacon_multiple_sources(self, beacon_agent):
        """Test asking Beacon with multiple sources"""
        result = await beacon_agent.ask_beacon("artificial intelligence", sources=['wikipedia', 'pubmed'])
        
        assert result['topic'] == "artificial intelligence"
        assert len(result['sources']) >= 1  # Should have at least Wikipedia
        
        # Check if we got sources from multiple types
        source_types = set(source.source_type for source in result['sources'])
        assert 'wikipedia' in source_types
    
    async def test_generate_summary(self, beacon_agent):
        """Test summary generation functionality"""
        mock_data = {
            'wikipedia': {
                'summary': 'Python is a high-level programming language.',
                'source': KnowledgeSource(
                    url='https://en.wikipedia.org/wiki/Python',
                    title='Python (programming language)',
                    source_type='wikipedia',
                    retrieved_at='2025-01-01T00:00:00Z'
                )
            },
            'pubmed': {
                'sources': [
                    KnowledgeSource(
                        url='https://pubmed.ncbi.nlm.nih.gov/12345/',
                        title='Python in Scientific Computing',
                        source_type='pubmed',
                        retrieved_at='2025-01-01T00:00:00Z'
                    )
                ],
                'article_titles': ['Python in Scientific Computing - Author et al']
            }
        }
        
        summary = await beacon_agent._generate_summary("Python programming", mock_data)
        
        assert "Knowledge Summary: Python programming" in summary
        assert "Wikipedia Overview:" in summary
        assert "Scientific Literature" in summary
        assert "Python" in summary
    
    async def test_insight_hash_creation(self, beacon_agent):
        """Test insight hash creation for integrity"""
        summary = "Test summary content"
        sources = [
            KnowledgeSource(
                url='http://test.com',
                title='Test Source',
                source_type='test',
                retrieved_at='2025-01-01T00:00:00Z'
            )
        ]
        
        hash1 = beacon_agent.create_insight_hash(summary, sources)
        hash2 = beacon_agent.create_insight_hash(summary, sources)
        
        # Same content should produce same hash
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA256 hex length
        
        # Different content should produce different hash
        different_summary = "Different summary content"
        hash3 = beacon_agent.create_insight_hash(different_summary, sources)
        assert hash1 != hash3
    
    async def test_log_insight(self, beacon_agent):
        """Test insight logging functionality"""
        # Create test insight data
        insight_data = {
            'topic': 'test topic',
            'summary': 'Test summary for logging',
            'sources': [
                KnowledgeSource(
                    url='http://test.com',
                    title='Test Source',
                    source_type='test',
                    retrieved_at='2025-01-01T00:00:00Z'
                )
            ],
            'retrieved_at': '2025-01-01T00:00:00Z'
        }
        
        insight_record = await beacon_agent.log_insight(insight_data)
        
        assert isinstance(insight_record, InsightRecord)
        assert insight_record.topic == 'test topic'
        assert insight_record.summary == 'Test summary for logging'
        assert len(insight_record.insight_hash) == 64
        assert insight_record.ipfs_cid.startswith('Qm')
        assert len(insight_record.agent_signature) == 64
    
    async def test_full_workflow(self, beacon_agent):
        """Test complete Beacon workflow from query to logging"""
        # Query knowledge
        result = await beacon_agent.ask_beacon("blockchain technology", sources=['wikipedia'])
        
        # Verify result structure
        assert 'topic' in result
        assert 'summary' in result
        assert 'sources' in result
        assert 'retrieved_at' in result
        
        # Log the insight
        insight_record = await beacon_agent.log_insight(result)
        
        # Verify insight record
        assert insight_record.topic == "blockchain technology"
        assert len(insight_record.sources) > 0
        assert insight_record.insight_hash
        assert insight_record.agent_signature
        assert insight_record.ipfs_cid
        
        # Check if log file was created
        log_dir = Path("insight_logs")
        assert log_dir.exists()
        
        log_files = list(log_dir.glob("*.jsonl"))
        assert len(log_files) > 0

class TestBlockchainClient:
    """Test suite for blockchain client functionality"""
    
    @pytest.fixture
    def blockchain_client(self):
        """Create blockchain client for testing"""
        return create_blockchain_client(use_simulation=True)
    
    @pytest.fixture
    def sample_insight_record(self):
        """Create sample insight record for testing"""
        return InsightRecord(
            topic="test topic",
            summary="Test insight summary",
            sources=[
                KnowledgeSource(
                    url="http://test.com",
                    title="Test Source",
                    source_type="test",
                    retrieved_at="2025-01-01T00:00:00Z"
                )
            ],
            agent_signature="test_signature_hash",
            ipfs_cid="QmTestCID123",
            timestamp="2025-01-01T00:00:00Z",
            insight_hash="test_insight_hash"
        )
    
    async def test_submit_insight_record(self, blockchain_client, sample_insight_record):
        """Test submitting insight record to blockchain"""
        result = await blockchain_client.submit_insight_record(sample_insight_record)
        
        assert result['success'] is True
        assert 'record_id' in result
        assert 'tx_hash' in result
        assert 'block_hash' in result
        assert result['status'] == 'finalized'
    
    async def test_get_record(self, blockchain_client, sample_insight_record):
        """Test retrieving record from blockchain"""
        # Submit record first
        submit_result = await blockchain_client.submit_insight_record(sample_insight_record)
        record_id = submit_result['record_id']
        
        # Retrieve the record
        retrieved_record = await blockchain_client.get_record(record_id)
        
        assert retrieved_record is not None
        assert retrieved_record['record_id'] == record_id
        assert retrieved_record['data']['summary'] == sample_insight_record.summary
    
    async def test_get_agent_records(self, blockchain_client, sample_insight_record):
        """Test getting all records by agent"""
        # Submit multiple records
        await blockchain_client.submit_insight_record(sample_insight_record)
        await blockchain_client.submit_insight_record(sample_insight_record)
        
        # Get agent records
        agent_records = await blockchain_client.get_agent_records('beacon')
        
        assert len(agent_records) >= 2
        for record in agent_records:
            metadata = json.loads(record['data']['metadata'])
            assert metadata['agent_id'] == 'beacon'
    
    async def test_blockchain_stats(self, blockchain_client, sample_insight_record):
        """Test blockchain statistics"""
        # Submit a record to have some data
        await blockchain_client.submit_insight_record(sample_insight_record)
        
        stats = blockchain_client.get_blockchain_stats()
        
        assert 'total_records' in stats
        assert stats['total_records'] >= 1
        assert 'node_url' in stats
        assert 'connection_status' in stats
        assert stats['connection_status'] == 'simulated'

# Integration test
async def test_beacon_blockchain_integration():
    """Test full integration between Beacon agent and blockchain"""
    config = {
        'news_api_key': None,
        'wolfram_api_key': None,
    }
    
    # Create clients
    blockchain_client = create_blockchain_client(use_simulation=True)
    
    async with BeaconAgent(config) as beacon:
        # Query knowledge
        result = await beacon.ask_beacon("quantum computing", sources=['wikipedia'])
        
        # Create insight record
        insight_record = await beacon.log_insight(result)
        
        # Submit to blockchain
        blockchain_result = await blockchain_client.submit_insight_record(insight_record)
        
        # Verify blockchain submission
        assert blockchain_result['success'] is True
        
        # Retrieve from blockchain
        retrieved = await blockchain_client.get_record(blockchain_result['record_id'])
        assert retrieved is not None
        
        # Verify content integrity
        metadata = json.loads(retrieved['data']['metadata'])
        assert metadata['topic'] == "quantum computing"
        assert metadata['agent_id'] == 'beacon'

# Performance test
async def test_beacon_performance():
    """Test Beacon performance with multiple queries"""
    import time
    
    config = {
        'news_api_key': None,
        'wolfram_api_key': None,
    }
    
    topics = [
        "artificial intelligence",
        "machine learning",
        "blockchain technology",
        "quantum computing",
        "data science"
    ]
    
    async with BeaconAgent(config) as beacon:
        start_time = time.time()
        
        # Process multiple topics
        results = []
        for topic in topics:
            result = await beacon.ask_beacon(topic, sources=['wikipedia'])
            insight = await beacon.log_insight(result)
            results.append(insight)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Performance assertions
        assert len(results) == len(topics)
        assert total_time < 60  # Should complete within 60 seconds
        print(f"Processed {len(topics)} topics in {total_time:.2f} seconds")
        print(f"Average time per topic: {total_time/len(topics):.2f} seconds")

if __name__ == "__main__":
    # Run integration test
    print("Running Beacon Agent Integration Test...")
    asyncio.run(test_beacon_blockchain_integration())
    
    print("\nRunning Performance Test...")
    asyncio.run(test_beacon_performance())
    
    print("\nAll tests completed! ✅")
    print("\nTo run full test suite with pytest:")
    print("pip install pytest pytest-asyncio")
    print("pytest test_beacon.py -v") 