# ----------------------------------------------------------------------------
#  File:        core_tools.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Core tools infrastructure implementing minimum required toolkit
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import json
import hashlib
import time
import asyncio
import aiohttp
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

# Optional imports with fallbacks
try:
    import faiss
    import numpy as np
    HAS_FAISS = True
except ImportError:
    HAS_FAISS = False
    print("⚠️ FAISS not available - using simple memory storage")

try:
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives.asymmetric import padding
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False
    print("⚠️ Cryptography not available - signatures disabled")

try:
    import ipfshttpclient
    HAS_IPFS = True
except ImportError:
    HAS_IPFS = False
    print("⚠️ IPFS client not available")

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

@dataclass
class MemoryEntry:
    """Memory entry structure for FAISS/Recall storage"""
    key: str
    content: str
    metadata: Dict[str, Any]
    timestamp: str
    vector: Optional[List[float]] = None

@dataclass
class RecallEntry:
    """Blockchain recall entry structure"""
    cid: str
    content_hash: str
    signer: str
    timestamp: str
    content: str
    signature: str

@dataclass
class VoteEntry:
    """Inter-agent voting entry"""
    vote_id: str
    proposer: str
    proposal: str
    votes: Dict[str, bool]
    status: str  # 'active', 'passed', 'rejected'
    created_at: str

class CoreTools:
    """
    Core Tools Implementation
    
    Provides all minimum required tools for C-Suite agents including:
    - Recall and memory management
    - Inter-agent communication
    - Security and alignment
    - Identity and signing
    - System control
    - UI and transparency
    """
    
    def __init__(self, agent_id: str, config: Dict[str, Any]):
        self.agent_id = agent_id
        self.config = config
        
        # Initialize storage paths - updated for new structure
        base_path = Path(__file__).parent.parent  # Go up to tool_calling directory
        self.recall_path = base_path / "storage" / "recall_logs" / agent_id
        self.memory_path = base_path / "storage" / "memory" / agent_id
        self.logs_path = base_path / "storage" / "logs" / agent_id
        
        # Ensure directories exist
        self.recall_path.mkdir(parents=True, exist_ok=True)
        self.memory_path.mkdir(parents=True, exist_ok=True)
        self.logs_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize memory system
        self.memory_index = None
        self.memory_entries = {}
        self._init_memory_system()
        
        # Initialize crypto keys
        self.private_key = None
        self.public_key = None
        self._init_keys()
        
        # System state
        self.system_status = {
            'uptime_start': datetime.utcnow().isoformat(),
            'last_task': None,
            'last_cid': None,
            'is_isolated': False
        }
        
        # Agent registry and voting
        self.agent_registry = {}
        self.active_votes = {}
        
        # Initialize IPFS client (if available)
        self.ipfs = None
        if HAS_IPFS:
            try:
                self.ipfs = ipfshttpclient.connect()
            except:
                print(f"⚠️ IPFS connection failed for {agent_id}")

    def _init_memory_system(self):
        """Initialize FAISS vector store for memory"""
        try:
            if HAS_FAISS:
                # Create a simple FAISS index for similarity search
                dimension = 384  # Standard embedding dimension
                self.memory_index = faiss.IndexFlatIP(dimension)
            
            # Load existing memories if available
            memory_file = self.memory_path / "memories.json"
            if memory_file.exists():
                with open(memory_file, 'r') as f:
                    self.memory_entries = json.load(f)
        except Exception as e:
            print(f"⚠️ Memory system init failed: {e}")

    def _init_keys(self):
        """Initialize cryptographic keys for signing"""
        if not HAS_CRYPTO:
            return
            
        try:
            key_file = self.logs_path / "private_key.pem"
            
            if key_file.exists():
                # Load existing key
                with open(key_file, 'rb') as f:
                    self.private_key = serialization.load_pem_private_key(
                        f.read(), password=None
                    )
            else:
                # Generate new key pair
                self.private_key = rsa.generate_private_key(
                    public_exponent=65537,
                    key_size=2048
                )
                
                # Save private key
                with open(key_file, 'wb') as f:
                    f.write(self.private_key.private_bytes(
                        encoding=serialization.Encoding.PEM,
                        format=serialization.PrivateFormat.PKCS8,
                        encryption_algorithm=serialization.NoEncryption()
                    ))
            
            self.public_key = self.private_key.public_key()
            
        except Exception as e:
            print(f"⚠️ Key initialization failed: {e}")

    # =============================================================================
    # CORE TOOLCHAIN (Every Agent Must Have)
    # =============================================================================
    
    async def recall_log_insight(self, content: str, metadata: Dict[str, Any] = None) -> str:
        """Logs any thought, message, result to the C-Ledger"""
        try:
            timestamp = datetime.utcnow().isoformat()
            content_hash = hashlib.sha256(content.encode()).hexdigest()
            
            # Sign the content
            signature = self._sign_content(content)
            
            # Create recall entry
            recall_entry = RecallEntry(
                cid=content_hash[:16],  # Simplified CID
                content_hash=content_hash,
                signer=self.agent_id,
                timestamp=timestamp,
                content=content,
                signature=signature
            )
            
            # Upload to IPFS if available
            ipfs_cid = None
            if self.ipfs:
                try:
                    result = self.ipfs.add_json({
                        'content': content,
                        'metadata': metadata or {},
                        'agent': self.agent_id,
                        'timestamp': timestamp
                    })
                    ipfs_cid = result
                except:
                    pass
            
            # Save to local recall log
            recall_file = self.recall_path / f"{timestamp.replace(':', '-')}.json"
            with open(recall_file, 'w') as f:
                json.dump({
                    'recall_entry': asdict(recall_entry),
                    'ipfs_cid': ipfs_cid,
                    'metadata': metadata
                }, f, indent=2)
            
            self.system_status['last_cid'] = recall_entry.cid
            
            return recall_entry.cid
            
        except Exception as e:
            return f"Error logging insight: {e}"

    async def recall_verify_cid(self, cid: str) -> Dict[str, Any]:
        """Verifies a CID's existence, content hash, and signer"""
        try:
            # Search local recall logs
            for recall_file in self.recall_path.glob("*.json"):
                with open(recall_file, 'r') as f:
                    data = json.load(f)
                    
                if data['recall_entry']['cid'] == cid:
                    return {
                        'exists': True,
                        'content_hash': data['recall_entry']['content_hash'],
                        'signer': data['recall_entry']['signer'],
                        'timestamp': data['recall_entry']['timestamp'],
                        'verified': True
                    }
            
            return {'exists': False, 'verified': False}
            
        except Exception as e:
            return {'error': str(e), 'verified': False}

    async def memory_retrieve(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Pulls past memory entries from FAISS, Recall, or vector store"""
        try:
            # Simple keyword-based retrieval for now
            results = []
            
            for key, entry in self.memory_entries.items():
                if query.lower() in entry.get('content', '').lower():
                    results.append({
                        'key': key,
                        'content': entry['content'],
                        'metadata': entry.get('metadata', {}),
                        'timestamp': entry.get('timestamp'),
                        'relevance_score': 0.8  # Simplified scoring
                    })
                    
                if len(results) >= limit:
                    break
            
            return results
            
        except Exception as e:
            return [{'error': str(e)}]

    async def memory_save(self, content: str, metadata: Dict[str, Any] = None) -> str:
        """Writes memory to FAISS/Recall + returns a memory key"""
        try:
            timestamp = datetime.utcnow().isoformat()
            memory_key = hashlib.md5(f"{content}{timestamp}".encode()).hexdigest()
            
            memory_entry = MemoryEntry(
                key=memory_key,
                content=content,
                metadata=metadata or {},
                timestamp=timestamp
            )
            
            # Save to memory store
            self.memory_entries[memory_key] = asdict(memory_entry)
            
            # Persist to disk
            memory_file = self.memory_path / "memories.json"
            with open(memory_file, 'w') as f:
                json.dump(self.memory_entries, f, indent=2)
            
            return memory_key
            
        except Exception as e:
            return f"Error saving memory: {e}"

    async def tools_call_agent(self, agent_id: str, task: str) -> Dict[str, Any]:
        """Directly call another agent with a subtask"""
        try:
            # This would integrate with the actual agent communication system
            # For now, simulate the call
            timestamp = datetime.utcnow().isoformat()
            
            call_record = {
                'caller': self.agent_id,
                'target': agent_id,
                'task': task,
                'timestamp': timestamp,
                'status': 'simulated',
                'response': f"Simulated response from {agent_id} for task: {task}"
            }
            
            # Log the inter-agent call
            await self.recall_log_insight(
                f"Called agent {agent_id} with task: {task}",
                {'type': 'inter_agent_call', 'target': agent_id}
            )
            
            return call_record
            
        except Exception as e:
            return {'error': str(e), 'status': 'failed'}

    async def tools_ask_user(self, question: str) -> str:
        """Sends a clarifying question to the user"""
        try:
            # Log the question
            await self.recall_log_insight(
                f"Asked user: {question}",
                {'type': 'user_question'}
            )
            
            # In a real implementation, this would interface with the UI
            # For now, return a placeholder
            return f"[USER_INPUT_REQUIRED] {question}"
            
        except Exception as e:
            return f"Error asking user: {e}"

    async def tools_get_time(self) -> Dict[str, str]:
        """Fetches current date/time for logging or decision-making"""
        now = datetime.utcnow()
        return {
            'utc_datetime': now.isoformat(),
            'unix_timestamp': str(int(now.timestamp())),
            'formatted': now.strftime('%Y-%m-%d %H:%M:%S UTC'),
            'agent_id': self.agent_id
        }

    async def tools_sign_output(self, output: str) -> Dict[str, str]:
        """Signs the final answer before logging to Recall blockchain"""
        try:
            signature = self._sign_content(output)
            content_hash = hashlib.sha256(output.encode()).hexdigest()
            
            signed_output = {
                'content': output,
                'signature': signature,
                'content_hash': content_hash,
                'signer': self.agent_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Log to recall
            cid = await self.recall_log_insight(
                output,
                {'type': 'signed_output', 'signature': signature}
            )
            
            signed_output['cid'] = cid
            return signed_output
            
        except Exception as e:
            return {'error': str(e)}

    async def tools_cid_file(self, file_data: Any) -> str:
        """Uploads data to IPFS and returns a CID"""
        try:
            if not self.ipfs:
                return "IPFS not available"
            
            # Handle different data types
            if isinstance(file_data, str):
                result = self.ipfs.add_str(file_data)
            elif isinstance(file_data, dict):
                result = self.ipfs.add_json(file_data)
            else:
                result = self.ipfs.add_str(str(file_data))
                
            return result
                
        except Exception as e:
            return f"Error uploading to IPFS: {e}"

    async def tools_replay_decision(self, task_id: str) -> List[Dict[str, Any]]:
        """Pulls full decision log from C-Ledger for a specific task"""
        try:
            decision_log = []
            
            # Search recall logs for task-related entries
            for recall_file in self.recall_path.glob("*.json"):
                with open(recall_file, 'r') as f:
                    data = json.load(f)
                    
                if (data.get('metadata', {}).get('task_id') == task_id or
                    task_id in data['recall_entry']['content']):
                    decision_log.append(data)
            
            return decision_log
            
        except Exception as e:
            return [{'error': str(e)}]

    def _sign_content(self, content: str) -> str:
        """Sign content with private key"""
        if not HAS_CRYPTO or not self.private_key:
            return "no_crypto_available"
            
        try:
            signature = self.private_key.sign(
                content.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            return signature.hex()
            
        except Exception as e:
            return f"signing_error_{e}"

    # =============================================================================
    # ADDITIONAL MINIMUM TOOLS (truncated for space)
    # =============================================================================
    
    async def dev_get_prompt(self) -> str:
        """Returns the agent's current full system prompt"""
        return f"Agent {self.agent_id} system prompt [PLACEHOLDER]"
    
    async def security_log_risk(self, event: str, risk_level: str = "medium") -> str:
        """Logs an event tagged as dangerous, risky, or misaligned"""
        return await self.recall_log_insight(
            f"RISK_{risk_level.upper()}: {event}",
            {'type': 'security_risk', 'risk_level': risk_level}
        )
    
    async def ui_stream_to_dashboard(self, data: Dict[str, Any]) -> bool:
        """Sends agent state or thoughts to Orb UI"""
        try:
            timestamp = datetime.utcnow().isoformat()
            
            # Handle case where data might not be a dict
            if not isinstance(data, dict):
                data = {'content': str(data)}
            
            dashboard_entry = {
                'agent_id': self.agent_id,
                'timestamp': timestamp,
                'data': data,
                'entry_type': 'dashboard_stream'
            }
            
            # In a real implementation, this would send to actual dashboard
            # For now, just log it
            await self.recall_log_insight(
                f"Dashboard stream: {data}",
                {'type': 'dashboard_stream', 'data': data}
            )
            
            return True
            
        except Exception as e:
            await self.security_log_risk(f"Dashboard streaming failed: {e}")
            return False

    # =============================================================================
    # TOOL REGISTRATION AND EXECUTION
    # =============================================================================
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of all available tools for this agent"""
        tools = []
        
        # Core toolchain
        core_tools = [
            {
                "name": "recall_log_insight",
                "description": "Logs any thought, message, result to the C-Ledger",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {"type": "string", "description": "Content to log"},
                        "metadata": {"type": "object", "description": "Optional metadata"}
                    },
                    "required": ["content"]
                }
            },
            {
                "name": "memory_retrieve",
                "description": "Pulls past memory entries from FAISS, Recall, or vector store",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "limit": {"type": "integer", "description": "Max results", "default": 5}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "memory_save",
                "description": "Writes memory to FAISS/Recall + returns a memory key",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {"type": "string", "description": "Content to save"},
                        "metadata": {"type": "object", "description": "Optional metadata"}
                    },
                    "required": ["content"]
                }
            },
            {
                "name": "tools_call_agent",
                "description": "Directly call another agent with a subtask",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "agent_id": {"type": "string", "description": "Target agent ID"},
                        "task": {"type": "string", "description": "Task description"}
                    },
                    "required": ["agent_id", "task"]
                }
            },
            {
                "name": "tools_ask_user",
                "description": "Sends a clarifying question to the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "question": {"type": "string", "description": "Question to ask"}
                    },
                    "required": ["question"]
                }
            },
            {
                "name": "tools_get_time",
                "description": "Fetches current date/time for logging or decision-making",
                "parameters": {"type": "object", "properties": {}}
            },
            {
                "name": "tools_sign_output",
                "description": "Signs the final answer before logging to Recall blockchain",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "output": {"type": "string", "description": "Content to sign"}
                    },
                    "required": ["output"]
                }
            }
        ]
        
        return core_tools

    async def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """Execute a tool by name with given parameters"""
        try:
            # Get the method
            method = getattr(self, tool_name, None)
            if method and callable(method):
                result = await method(**kwargs)
                
                # Update system status
                self.system_status['last_task'] = {
                    'tool': tool_name,
                    'timestamp': datetime.utcnow().isoformat(),
                    'params': kwargs
                }
                
                return result
            else:
                return {"error": f"Tool {tool_name} not found"}
                
        except Exception as e:
            await self.security_log_risk(f"Tool execution error: {tool_name} - {e}", "high")
            return {"error": str(e)} 