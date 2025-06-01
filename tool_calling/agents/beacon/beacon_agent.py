# ----------------------------------------------------------------------------
#  File:        beacon_agent.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Beacon Knowledge & Insight Agent - retrieves and logs external knowledge
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
import requests
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import asyncio
import aiohttp
from pathlib import Path

@dataclass
class KnowledgeSource:
    """Represents a knowledge source with metadata"""
    url: str
    title: str
    source_type: str  # 'wikipedia', 'pubmed', 'wolfram', 'news'
    retrieved_at: str
    reliability_score: float = 0.8

@dataclass
class InsightRecord:
    """Complete insight record for blockchain logging"""
    topic: str
    summary: str
    sources: List[KnowledgeSource]
    agent_signature: str
    ipfs_cid: str
    timestamp: str
    insight_hash: str

class BeaconAgent:
    """
    Beacon - Knowledge & Insight Agent
    
    Retrieves, summarizes, and publishes external knowledge with full 
    transparency and on-chain audit logs.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.agent_id = "beacon_agent"
        self.session = None
        
        # API endpoints
        self.wikipedia_base = "https://en.wikipedia.org/api/rest_v1"
        self.pubmed_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
        self.news_api_key = config.get('news_api_key')
        self.wolfram_api_key = config.get('wolfram_api_key')
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    async def ask_beacon(self, topic: str, sources: List[str] = None) -> Dict[str, Any]:
        """
        Main function to retrieve knowledge about a topic
        
        Args:
            topic: The topic to research
            sources: Optional list of specific sources to use
            
        Returns:
            Dictionary with summary, sources, and metadata
        """
        if sources is None:
            sources = ['wikipedia', 'pubmed']  # Default sources
            
        knowledge_sources = []
        raw_data = {}
        
        # Query each requested source
        for source in sources:
            try:
                if source == 'wikipedia':
                    data = await self._query_wikipedia(topic)
                    if data:
                        raw_data['wikipedia'] = data
                        knowledge_sources.append(data['source'])
                        
                elif source == 'pubmed':
                    data = await self._query_pubmed(topic)
                    if data:
                        raw_data['pubmed'] = data
                        knowledge_sources.extend(data['sources'])
                        
                elif source == 'wolfram' and self.wolfram_api_key:
                    data = await self._query_wolfram(topic)
                    if data:
                        raw_data['wolfram'] = data
                        knowledge_sources.append(data['source'])
                        
                elif source == 'news' and self.news_api_key:
                    data = await self._query_news(topic)
                    if data:
                        raw_data['news'] = data
                        knowledge_sources.extend(data['sources'])
                        
            except Exception as e:
                print(f"Error querying {source}: {e}")
                continue
                
        # Generate comprehensive summary
        summary = await self._generate_summary(topic, raw_data)
        
        return {
            'topic': topic,
            'summary': summary,
            'sources': knowledge_sources,
            'raw_data': raw_data,
            'retrieved_at': datetime.utcnow().isoformat()
        }

    async def _query_wikipedia(self, topic: str) -> Optional[Dict[str, Any]]:
        """Query Wikipedia REST API for topic information"""
        try:
            # First, search for the topic
            search_url = f"{self.wikipedia_base}/page/summary/{topic.replace(' ', '_')}"
            
            async with self.session.get(search_url) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'summary': data.get('extract', ''),
                        'source': KnowledgeSource(
                            url=data.get('content_urls', {}).get('desktop', {}).get('page', ''),
                            title=data.get('title', topic),
                            source_type='wikipedia',
                            retrieved_at=datetime.utcnow().isoformat(),
                            reliability_score=0.9
                        )
                    }
        except Exception as e:
            print(f"Wikipedia query error: {e}")
        return None

    async def _query_pubmed(self, topic: str, max_results: int = 5) -> Optional[Dict[str, Any]]:
        """Query PubMed for scientific articles on the topic"""
        try:
            # Search for articles
            search_url = f"{self.pubmed_base}/esearch.fcgi"
            search_params = {
                'db': 'pubmed',
                'term': topic,
                'retmax': max_results,
                'retmode': 'json'
            }
            
            async with self.session.get(search_url, params=search_params) as response:
                if response.status == 200:
                    search_data = await response.json()
                    pmids = search_data.get('esearchresult', {}).get('idlist', [])
                    
                    if not pmids:
                        return None
                    
                    # Get article summaries
                    summary_url = f"{self.pubmed_base}/esummary.fcgi"
                    summary_params = {
                        'db': 'pubmed',
                        'id': ','.join(pmids),
                        'retmode': 'json'
                    }
                    
                    async with self.session.get(summary_url, params=summary_params) as sum_response:
                        if sum_response.status == 200:
                            summary_data = await sum_response.json()
                            articles = summary_data.get('result', {})
                            
                            sources = []
                            summaries = []
                            
                            for pmid in pmids:
                                if pmid in articles:
                                    article = articles[pmid]
                                    title = article.get('title', '')
                                    authors = article.get('authors', [])
                                    author_names = [author.get('name', '') for author in authors[:3]]
                                    
                                    sources.append(KnowledgeSource(
                                        url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                                        title=title,
                                        source_type='pubmed',
                                        retrieved_at=datetime.utcnow().isoformat(),
                                        reliability_score=0.95
                                    ))
                                    
                                    summaries.append(f"{title} - {', '.join(author_names)}")
                            
                            return {
                                'sources': sources,
                                'article_titles': summaries,
                                'total_found': len(pmids)
                            }
        except Exception as e:
            print(f"PubMed query error: {e}")
        return None

    async def _query_wolfram(self, topic: str) -> Optional[Dict[str, Any]]:
        """Query Wolfram Alpha for computational answers"""
        if not self.wolfram_api_key:
            return None
            
        try:
            url = "http://api.wolframalpha.com/v2/query"
            params = {
                'input': topic,
                'appid': self.wolfram_api_key,
                'output': 'json',
                'format': 'plaintext'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Extract useful information from Wolfram response
                    pods = data.get('queryresult', {}).get('pods', [])
                    result_text = ""
                    
                    for pod in pods:
                        if pod.get('title') in ['Result', 'Definition', 'Basic Information']:
                            subpods = pod.get('subpods', [])
                            for subpod in subpods:
                                if subpod.get('plaintext'):
                                    result_text += subpod['plaintext'] + "\n"
                    
                    if result_text:
                        return {
                            'result': result_text.strip(),
                            'source': KnowledgeSource(
                                url=f"https://www.wolframalpha.com/input/?i={topic.replace(' ', '+')}",
                                title=f"Wolfram Alpha: {topic}",
                                source_type='wolfram',
                                retrieved_at=datetime.utcnow().isoformat(),
                                reliability_score=0.85
                            )
                        }
        except Exception as e:
            print(f"Wolfram Alpha query error: {e}")
        return None

    async def _query_news(self, topic: str, max_results: int = 5) -> Optional[Dict[str, Any]]:
        """Query News API for recent news on the topic"""
        if not self.news_api_key:
            return None
            
        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                'q': topic,
                'apiKey': self.news_api_key,
                'pageSize': max_results,
                'sortBy': 'relevancy',
                'language': 'en'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    articles = data.get('articles', [])
                    
                    sources = []
                    summaries = []
                    
                    for article in articles:
                        sources.append(KnowledgeSource(
                            url=article.get('url', ''),
                            title=article.get('title', ''),
                            source_type='news',
                            retrieved_at=datetime.utcnow().isoformat(),
                            reliability_score=0.7  # News is less reliable than scientific sources
                        ))
                        
                        summaries.append(article.get('description', ''))
                    
                    return {
                        'sources': sources,
                        'headlines': summaries,
                        'total_found': len(articles)
                    }
        except Exception as e:
            print(f"News API query error: {e}")
        return None

    async def generate_summary(self, topic: str, data: Dict[str, Any]) -> str:
        """
        Generate a comprehensive summary from retrieved data
        
        This is a simplified version - in production you might use
        an LLM for better summarization
        """
        return await self._generate_summary(topic, data)

    async def _generate_summary(self, topic: str, data: Dict[str, Any]) -> str:
        """Internal summary generation logic"""
        summary_parts = [f"## Knowledge Summary: {topic}\n"]
        
        # Wikipedia summary
        if 'wikipedia' in data:
            wiki_summary = data['wikipedia'].get('summary', '')
            if wiki_summary:
                summary_parts.append(f"**Wikipedia Overview:** {wiki_summary[:500]}...")
        
        # PubMed articles
        if 'pubmed' in data:
            articles = data['pubmed'].get('article_titles', [])
            if articles:
                summary_parts.append(f"**Scientific Literature ({len(articles)} articles found):**")
                for i, article in enumerate(articles[:3], 1):
                    summary_parts.append(f"{i}. {article}")
        
        # Wolfram results
        if 'wolfram' in data:
            wolfram_result = data['wolfram'].get('result', '')
            if wolfram_result:
                summary_parts.append(f"**Computational Analysis:** {wolfram_result}")
        
        # News articles
        if 'news' in data:
            headlines = data['news'].get('headlines', [])
            if headlines:
                summary_parts.append(f"**Recent News ({len(headlines)} articles):**")
                for i, headline in enumerate(headlines[:3], 1):
                    summary_parts.append(f"{i}. {headline}")
        
        return "\n\n".join(summary_parts)

    def create_insight_hash(self, summary: str, sources: List[KnowledgeSource]) -> str:
        """Create a deterministic hash of the insight content"""
        content = summary + "".join([source.url + source.title for source in sources])
        return hashlib.sha256(content.encode()).hexdigest()

    async def log_insight(self, insight_data: Dict[str, Any]) -> InsightRecord:
        """
        Create an insight record ready for blockchain logging
        
        Args:
            insight_data: Data from ask_beacon() call
            
        Returns:
            Complete InsightRecord for blockchain submission
        """
        # Create insight hash
        insight_hash = self.create_insight_hash(
            insight_data['summary'], 
            insight_data['sources']
        )
        
        # Generate agent signature (simplified - in production use proper cryptographic signing)
        signature_content = f"{insight_hash}{insight_data['retrieved_at']}{self.agent_id}"
        agent_signature = hashlib.sha256(signature_content.encode()).hexdigest()
        
        # Create IPFS CID placeholder (in production, actually push to IPFS)
        # Convert sources to JSON-serializable format
        serializable_data = {
            'topic': insight_data['topic'],
            'summary': insight_data['summary'],
            'sources': [
                {
                    'url': source.url,
                    'title': source.title,
                    'source_type': source.source_type,
                    'retrieved_at': source.retrieved_at,
                    'reliability_score': source.reliability_score
                } for source in insight_data['sources']
            ],
            'retrieved_at': insight_data['retrieved_at']
        }
        ipfs_content = json.dumps(serializable_data, indent=2)
        ipfs_cid = f"Qm{hashlib.sha256(ipfs_content.encode()).hexdigest()[:44]}"
        
        # Create complete insight record
        insight_record = InsightRecord(
            topic=insight_data['topic'],
            summary=insight_data['summary'],
            sources=insight_data['sources'],
            agent_signature=agent_signature,
            ipfs_cid=ipfs_cid,
            timestamp=insight_data['retrieved_at'],
            insight_hash=insight_hash
        )
        
        # Save to local log (in production, submit to blockchain)
        await self._save_insight_log(insight_record)
        
        return insight_record

    async def _save_insight_log(self, insight: InsightRecord):
        """Save insight to local log file (placeholder for blockchain submission)"""
        log_dir = Path("insight_logs")
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"beacon_insights_{datetime.now().strftime('%Y%m%d')}.jsonl"
        
        log_entry = {
            'timestamp': insight.timestamp,
            'topic': insight.topic,
            'summary': insight.summary,
            'sources': [
                {
                    'url': source.url,
                    'title': source.title,
                    'source_type': source.source_type,
                    'reliability_score': source.reliability_score
                } for source in insight.sources
            ],
            'agent_signature': insight.agent_signature,
            'ipfs_cid': insight.ipfs_cid,
            'insight_hash': insight.insight_hash
        }
        
        with open(log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')

# Example usage and testing
async def main():
    """Example usage of the Beacon agent"""
    config = {
        'news_api_key': None,  # Add your API key here
        'wolfram_api_key': None,  # Add your API key here
    }
    
    async with BeaconAgent(config) as beacon:
        # Test query
        result = await beacon.ask_beacon("lithium toxicity symptoms")
        print("Knowledge Retrieved:")
        print(result['summary'])
        print(f"\nSources: {len(result['sources'])}")
        
        # Log the insight
        insight_record = await beacon.log_insight(result)
        print(f"\nInsight logged with hash: {insight_record.insight_hash}")

if __name__ == "__main__":
    asyncio.run(main()) 