# ----------------------------------------------------------------------------
#  File:        blockchain_client.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Blockchain client for submitting insights to the Recall pallet
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
from typing import Dict, Any, Optional
from dataclasses import asdict
from beacon_agent import InsightRecord, KnowledgeSource

class BlockchainClient:
    """
    Client for interacting with the C-Suite blockchain
    Currently simulates blockchain interaction - will integrate with actual node later
    """
    
    def __init__(self, node_url: str = "ws://localhost:9944", agent_key: str = None):
        self.node_url = node_url
        self.agent_key = agent_key or "beacon_default_key"
        self.simulated_records = []  # For testing without actual blockchain
        
    async def submit_insight_record(self, insight: InsightRecord) -> Dict[str, Any]:
        """
        Submit an insight record to the Recall pallet
        
        Args:
            insight: The InsightRecord to submit
            
        Returns:
            Transaction result with record ID and block hash
        """
        # Prepare transaction data for Recall.store_consensus_record
        tx_data = {
            'record_type': 'SingleAgentInsight',
            'content_hash': insight.insight_hash,
            'ipfs_cid': insight.ipfs_cid,
            'summary': insight.summary[:500],  # Truncate for on-chain storage
            'signature': insight.agent_signature,
            'metadata': self._prepare_metadata(insight)
        }
        
        # Simulate blockchain submission for now
        # In production, this would use substrate-interface or similar
        simulated_result = await self._simulate_blockchain_submission(tx_data)
        
        return simulated_result
    
    def _prepare_metadata(self, insight: InsightRecord) -> str:
        """Prepare metadata JSON for blockchain storage"""
        metadata = {
            'topic': insight.topic,
            'timestamp': insight.timestamp,
            'source_count': len(insight.sources),
            'sources_summary': [
                {
                    'type': source.source_type,
                    'title': source.title[:100],  # Truncated for space
                    'reliability': source.reliability_score
                } for source in insight.sources[:5]  # Max 5 sources in metadata
            ],
            'agent_id': 'beacon'
        }
        return json.dumps(metadata)
    
    async def _simulate_blockchain_submission(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate blockchain transaction submission
        Replace with actual substrate transaction in production
        """
        # Generate mock transaction hash
        tx_content = json.dumps(tx_data, sort_keys=True)
        tx_hash = hashlib.sha256(tx_content.encode()).hexdigest()
        
        # Generate mock block hash
        block_hash = hashlib.sha256(f"block_{len(self.simulated_records)}".encode()).hexdigest()
        
        # Simulate record ID (auto-increment)
        record_id = len(self.simulated_records) + 1
        
        # Parse metadata JSON string
        metadata_dict = {}
        if 'metadata' in tx_data:
            try:
                metadata_dict = json.loads(tx_data['metadata'])
            except (json.JSONDecodeError, TypeError):
                metadata_dict = {}
        
        # Store simulated record
        simulated_record = {
            'record_id': record_id,
            'tx_hash': tx_hash,
            'block_hash': block_hash,
            'data': tx_data,
            'timestamp': metadata_dict.get('timestamp'),
            'status': 'finalized'
        }
        
        self.simulated_records.append(simulated_record)
        
        return {
            'success': True,
            'record_id': record_id,
            'tx_hash': tx_hash,
            'block_hash': block_hash,
            'status': 'finalized'
        }
    
    async def get_record(self, record_id: int) -> Optional[Dict[str, Any]]:
        """Get a record by ID from the blockchain"""
        # Simulate reading from blockchain
        for record in self.simulated_records:
            if record['record_id'] == record_id:
                return record
        return None
    
    async def get_agent_records(self, agent_id: str) -> list:
        """Get all records by a specific agent"""
        agent_records = []
        for record in self.simulated_records:
            metadata = json.loads(record['data']['metadata'])
            if metadata.get('agent_id') == agent_id:
                agent_records.append(record)
        return agent_records
    
    async def get_latest_records(self, count: int = 10) -> list:
        """Get the latest N records"""
        return self.simulated_records[-count:] if count <= len(self.simulated_records) else self.simulated_records
    
    def get_blockchain_stats(self) -> Dict[str, Any]:
        """Get basic blockchain statistics"""
        return {
            'total_records': len(self.simulated_records),
            'node_url': self.node_url,
            'agent_key': self.agent_key[:16] + "..." if self.agent_key else None,
            'connection_status': 'simulated'  # Would be 'connected' in production
        }

class SubstrateBlockchainClient(BlockchainClient):
    """
    Production blockchain client using substrate-interface
    This will be used when connecting to actual C-Suite blockchain node
    """
    
    def __init__(self, node_url: str = "ws://localhost:9944", agent_keypair=None):
        super().__init__(node_url)
        self.agent_keypair = agent_keypair
        self.substrate = None
        
    async def connect(self):
        """Connect to the substrate node"""
        try:
            # This would use substrate-interface in production
            # from substrateinterface import SubstrateInterface, Keypair
            # self.substrate = SubstrateInterface(url=self.node_url)
            print(f"Would connect to substrate node at {self.node_url}")
            return True
        except Exception as e:
            print(f"Failed to connect to substrate node: {e}")
            return False
    
    async def submit_insight_record(self, insight: InsightRecord) -> Dict[str, Any]:
        """Submit insight to actual Recall pallet"""
        if not self.substrate:
            # Fallback to simulation if not connected
            return await super().submit_insight_record(insight)
        
        try:
            # Prepare extrinsic call to Recall.store_consensus_record
            call = self.substrate.compose_call(
                call_module='Recall',
                call_function='store_consensus_record',
                call_params={
                    'record_type': {'SingleAgentInsight': None},
                    'content_hash': bytes.fromhex(insight.insight_hash),
                    'ipfs_cid': insight.ipfs_cid.encode(),
                    'summary': insight.summary[:500].encode(),
                    'signature': bytes.fromhex(insight.agent_signature),
                    'metadata': self._prepare_metadata(insight).encode()
                }
            )
            
            # Create and submit extrinsic
            extrinsic = self.substrate.create_signed_extrinsic(
                call=call,
                keypair=self.agent_keypair
            )
            
            # Submit to blockchain
            result = self.substrate.submit_extrinsic(extrinsic, wait_for_finalization=True)
            
            return {
                'success': result.is_success,
                'tx_hash': result.extrinsic_hash,
                'block_hash': result.block_hash,
                'record_id': self._extract_record_id_from_events(result.triggered_events),
                'status': 'finalized' if result.is_success else 'failed'
            }
            
        except Exception as e:
            print(f"Blockchain submission failed: {e}")
            # Fallback to simulation
            return await super().submit_insight_record(insight)
    
    def _extract_record_id_from_events(self, events: list) -> Optional[int]:
        """Extract record ID from blockchain events"""
        for event in events:
            if event.value['module_id'] == 'Recall' and event.value['event_id'] == 'ConsensusRecordStored':
                return event.value['attributes']['record_id']
        return None

# Factory function to create appropriate client
def create_blockchain_client(use_simulation: bool = True, **kwargs) -> BlockchainClient:
    """
    Create appropriate blockchain client based on configuration
    
    Args:
        use_simulation: Whether to use simulation or real blockchain
        **kwargs: Additional arguments for client initialization
        
    Returns:
        BlockchainClient instance
    """
    if use_simulation:
        return BlockchainClient(**kwargs)
    else:
        return SubstrateBlockchainClient(**kwargs) 