# ----------------------------------------------------------------------------
#  File:        beacon_agent_enhanced.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Enhanced Beacon Agent with LLM tool calling capabilities
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
from dataclasses import dataclass, asdict
import asyncio
import aiohttp
from pathlib import Path
import sys

# Add the parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from core.core_tools import CoreTools, KnowledgeSource, InsightRecord

class BeaconAgentEnhanced(CoreTools):
    """
    Enhanced Beacon - Knowledge & Insight Agent with Full Tool Calling
    
    Inherits all minimum required tools from CoreTools and adds specialized
    knowledge retrieval capabilities with full LLM tool calling support.
    """
    
    def __init__(self, config: Dict[str, Any]):
        # Initialize core tools first
        super().__init__("beacon_agent", config)
        
        # Beacon-specific configuration
        self.session = None
        
        # API endpoints
        self.wikipedia_base = "https://en.wikipedia.org/api/rest_v1"
        self.pubmed_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
        self.news_api_key = config.get('news_api_key')
        self.wolfram_api_key = config.get('wolfram_api_key')
        
        # Knowledge sources tracking
        self.active_sources = ['wikipedia', 'pubmed']
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    # =============================================================================
    # BEACON-SPECIFIC TOOLS (In addition to minimum required tools)
    # =============================================================================

    async def beacon_search_knowledge(self, topic: str, sources: List[str] = None, 
                                    max_sources: int = 3) -> Dict[str, Any]:
        """
        Search for knowledge on a topic across multiple sources
        
        This is the main tool that LLMs will call to retrieve knowledge.
        """
        try:
            # Log the search request
            search_id = await self.recall_log_insight(
                f"Starting knowledge search for: {topic}",
                {'type': 'knowledge_search', 'topic': topic, 'sources': sources}
            )
            
            if sources is None:
                sources = self.active_sources
                
            # Save search to memory
            memory_key = await self.memory_save(
                f"Knowledge search: {topic}",
                {'type': 'search_query', 'sources': sources, 'search_id': search_id}
            )
            
            knowledge_sources = []
            raw_data = {}
            
            # Query each requested source
            for source in sources[:max_sources]:
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
                    await self.security_log_risk(f"Source query failed: {source} - {e}")
                    continue
                    
            # Generate comprehensive summary
            summary = await self._generate_summary(topic, raw_data)
            
            # Create result
            result = {
                'topic': topic,
                'summary': summary,
                'sources': [asdict(source) for source in knowledge_sources],
                'raw_data': raw_data,
                'retrieved_at': datetime.utcnow().isoformat(),
                'search_id': search_id,
                'memory_key': memory_key
            }
            
            # Log successful search
            await self.recall_log_insight(
                f"Knowledge search completed for: {topic}. Found {len(knowledge_sources)} sources.",
                {'type': 'search_complete', 'result_summary': summary[:200], 'source_count': len(knowledge_sources)}
            )
            
            return result
            
        except Exception as e:
            await self.security_log_risk(f"Knowledge search failed: {e}", "high")
            return {'error': str(e), 'topic': topic}

    async def beacon_get_source_reliability(self, source_url: str) -> Dict[str, Any]:
        """
        Analyze the reliability of a specific knowledge source
        """
        try:
            # Extract domain and check reliability
            from urllib.parse import urlparse
            domain = urlparse(source_url).netloc.lower()
            
            # Basic reliability scoring
            reliability_scores = {
                'ncbi.nlm.nih.gov': 0.95,
                'pubmed.ncbi.nlm.nih.gov': 0.95,
                'en.wikipedia.org': 0.85,
                'nature.com': 0.95,
                'science.org': 0.95,
                'who.int': 0.90,
                'cdc.gov': 0.90,
                'nih.gov': 0.90
            }
            
            # Check for domain patterns
            score = 0.70  # Default score
            for reliable_domain, domain_score in reliability_scores.items():
                if reliable_domain in domain:
                    score = domain_score
                    break
            
            # Additional checks for .edu, .gov domains
            if '.edu' in domain:
                score = max(score, 0.80)
            elif '.gov' in domain:
                score = max(score, 0.85)
            
            reliability_info = {
                'url': source_url,
                'domain': domain,
                'reliability_score': score,
                'classification': self._classify_reliability(score),
                'analysis_timestamp': datetime.utcnow().isoformat()
            }
            
            # Log reliability check
            await self.recall_log_insight(
                f"Reliability check for {domain}: {score}",
                {'type': 'reliability_check', 'domain': domain, 'score': score}
            )
            
            return reliability_info
            
        except Exception as e:
            return {'error': str(e), 'url': source_url}

    async def beacon_save_insight(self, insight_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Save a knowledge insight with full blockchain logging and signing
        """
        try:
            # Create insight summary
            insight_text = f"Topic: {insight_data['topic']}\nSummary: {insight_data['summary']}"
            
            # Sign the insight
            signed_insight = await self.tools_sign_output(insight_text)
            
            # Save to memory
            memory_key = await self.memory_save(
                insight_text,
                {
                    'type': 'knowledge_insight',
                    'topic': insight_data['topic'],
                    'source_count': len(insight_data.get('sources', [])),
                    'signature': signed_insight.get('signature')
                }
            )
            
            # Upload to IPFS if available
            ipfs_cid = None
            if self.ipfs:
                try:
                    ipfs_cid = await self.tools_cid_file(insight_data)
                except:
                    pass
            
            # Create insight record
            insight_record = {
                'insight_hash': signed_insight.get('content_hash'),
                'memory_key': memory_key,
                'ipfs_cid': ipfs_cid,
                'blockchain_cid': signed_insight.get('cid'),
                'timestamp': signed_insight.get('timestamp'),
                'topic': insight_data['topic']
            }
            
            # Log to dashboard
            await self.ui_stream_to_dashboard({
                'type': 'insight_saved',
                'topic': insight_data['topic'],
                'insight_hash': insight_record['insight_hash'],
                'sources': len(insight_data.get('sources', []))
            })
            
            return insight_record
            
        except Exception as e:
            await self.security_log_risk(f"Insight save failed: {e}", "medium")
            return {'error': str(e)}

    def _classify_reliability(self, score: float) -> str:
        """Classify reliability score into categories"""
        if score >= 0.90:
            return "highly_reliable"
        elif score >= 0.80:
            return "reliable"
        elif score >= 0.70:
            return "moderately_reliable"
        else:
            return "low_reliability"

    # =============================================================================
    # ENHANCED TOOL REGISTRATION
    # =============================================================================
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get all available tools including core tools and Beacon-specific tools"""
        # Get core tools from parent class
        tools = super().get_available_tools()
        
        # Add Beacon-specific tools
        beacon_tools = [
            {
                "name": "beacon_search_knowledge",
                "description": "Search for knowledge on a topic across multiple sources (Wikipedia, PubMed, etc.)",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string", 
                            "description": "The topic to search for knowledge about"
                        },
                        "sources": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of sources to search (wikipedia, pubmed, wolfram, news)",
                            "default": ["wikipedia", "pubmed"]
                        },
                        "max_sources": {
                            "type": "integer",
                            "description": "Maximum number of sources to query",
                            "default": 3
                        }
                    },
                    "required": ["topic"]
                }
            },
            {
                "name": "beacon_get_source_reliability",
                "description": "Analyze the reliability and credibility of a knowledge source",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "source_url": {
                            "type": "string",
                            "description": "URL of the source to analyze"
                        }
                    },
                    "required": ["source_url"]
                }
            },
            {
                "name": "beacon_save_insight",
                "description": "Save a knowledge insight with blockchain logging and cryptographic signing",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "insight_data": {
                            "type": "object",
                            "description": "The insight data to save including topic, summary, and sources"
                        }
                    },
                    "required": ["insight_data"]
                }
            }
        ]
        
        # Combine all tools
        tools.extend(beacon_tools)
        return tools

    # =============================================================================
    # PRIVATE METHODS (Existing implementation)
    # =============================================================================

    async def _query_wikipedia(self, topic: str) -> Optional[Dict[str, Any]]:
        """Query Wikipedia REST API for topic information"""
        try:
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
                            reliability_score=0.85
                        )
                    }
        except Exception as e:
            await self.security_log_risk(f"Wikipedia query error: {e}")
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
                            for pmid in pmids:
                                if pmid in articles:
                                    article = articles[pmid]
                                    title = article.get('title', '')
                                    
                                    sources.append(KnowledgeSource(
                                        url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                                        title=title,
                                        source_type='pubmed',
                                        retrieved_at=datetime.utcnow().isoformat(),
                                        reliability_score=0.95
                                    ))
                            
                            return {
                                'sources': sources,
                                'article_count': len(sources)
                            }
        except Exception as e:
            await self.security_log_risk(f"PubMed query error: {e}")
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
            await self.security_log_risk(f"Wolfram Alpha query error: {e}")
        return None

    async def _query_news(self, topic: str, max_results: int = 5) -> Optional[Dict[str, Any]]:
        """Query news sources for recent articles on the topic"""
        if not self.news_api_key:
            return None
            
        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                'q': topic,
                'apiKey': self.news_api_key,
                'pageSize': max_results,
                'sortBy': 'relevancy'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    articles = data.get('articles', [])
                    
                    sources = []
                    headlines = []
                    
                    for article in articles:
                        title = article.get('title', '')
                        url = article.get('url', '')
                        
                        sources.append(KnowledgeSource(
                            url=url,
                            title=title,
                            source_type='news',
                            retrieved_at=datetime.utcnow().isoformat(),
                            reliability_score=0.70
                        ))
                        headlines.append(title)
                    
                    return {
                        'sources': sources,
                        'headlines': headlines
                    }
        except Exception as e:
            await self.security_log_risk(f"News API query error: {e}")
        return None

    async def _generate_summary(self, topic: str, data: Dict[str, Any]) -> str:
        """Generate a comprehensive summary from retrieved data"""
        summary_parts = [f"## Knowledge Summary: {topic}\n"]
        
        if 'wikipedia' in data:
            wiki_summary = data['wikipedia'].get('summary', '')
            if wiki_summary:
                summary_parts.append(f"**Wikipedia Overview:** {wiki_summary[:500]}...")
        
        if 'pubmed' in data:
            article_count = data['pubmed'].get('article_count', 0)
            if article_count > 0:
                summary_parts.append(f"**Scientific Literature:** Found {article_count} peer-reviewed articles.")
        
        if 'wolfram' in data:
            wolfram_result = data['wolfram'].get('result', '')
            if wolfram_result:
                summary_parts.append(f"**Computational Analysis:** {wolfram_result}")
        
        if 'news' in data:
            headlines = data['news'].get('headlines', [])
            if headlines:
                summary_parts.append(f"**Recent News:** {len(headlines)} recent articles found.")
        
        return "\n\n".join(summary_parts)


# =============================================================================
# USAGE EXAMPLE
# =============================================================================

async def main():
    """Example usage of the enhanced Beacon agent with tool calling"""
    config = {
        'news_api_key': None,
        'wolfram_api_key': None,
    }
    
    async with BeaconAgentEnhanced(config) as beacon:
        # Test the tool calling system
        print("🔧 Available tools:")
        tools = beacon.get_available_tools()
        for tool in tools:
            print(f"  - {tool['name']}: {tool['description']}")
        
        print("\n🔍 Testing knowledge search...")
        result = await beacon.execute_tool(
            'beacon_search_knowledge',
            topic="machine learning in healthcare",
            sources=["wikipedia", "pubmed"]
        )
        
        if 'error' not in result:
            print(f"✅ Found knowledge on: {result['topic']}")
            print(f"   Sources: {len(result['sources'])}")
            print(f"   Search ID: {result['search_id']}")
            
            # Test saving the insight
            save_result = await beacon.execute_tool(
                'beacon_save_insight',
                insight_data=result
            )
            print(f"💾 Insight saved: {save_result}")
        else:
            print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    asyncio.run(main()) 