# 🛠️ C-Suite Agent Tool Calling System

## Overview

The C-Suite Agent Tool Calling System provides a comprehensive framework for AI agents to use tools for knowledge retrieval, validation, blockchain logging, and inter-agent communication. This system implements the minimum required toolkit as specified in `minimum-tools.md` and extends it with agent-specific capabilities.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 C-Suite Agent Ecosystem                     │
├─────────────────────────────────────────────────────────────┤
│  Enhanced Agents (inherit from CoreTools)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Beacon    │  │   Theory    │  │   Future    │        │
│  │ (Knowledge) │  │(Validation) │  │   Agents    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                   Core Tools Layer                         │
│  🔧 Recall & Memory  📞 Inter-Agent  🔐 Security          │
│  ⏰ Time & Signing   🎭 UI Interface  📊 Debug Tools      │
├─────────────────────────────────────────────────────────────┤
│                 Storage & Blockchain                       │
│  📋 Recall Logs  💾 Memory Store  🔑 Crypto Keys          │
│  🌐 IPFS Storage ⛓️ Blockchain     📁 File System        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Installation

1. Install dependencies:
```bash
cd tool_calling
pip install -r requirements.txt
```

2. Run the test suite:
```bash
python test_tool_calling.py
```

3. Try the interactive demo:
```bash
python agent_toolcall_demo.py
```

### Basic Usage

```python
from beacon_agent_enhanced import BeaconAgentEnhanced
from theory_agent_enhanced import TheoryAgentEnhanced

# Initialize agents
config = {'news_api_key': None, 'wolfram_api_key': None}

async with BeaconAgentEnhanced(config) as beacon:
    # Search for knowledge
    result = await beacon.execute_tool(
        'beacon_search_knowledge',
        topic='artificial intelligence',
        sources=['wikipedia', 'pubmed']
    )
    
    # Validate with Theory agent
    async with TheoryAgentEnhanced(config) as theory:
        validation = await theory.execute_tool(
            'theory_validate_insight',
            insight_data=result
        )
```

## 🔧 Core Tools (Available to All Agents)

| Tool Name | Purpose | Parameters |
|-----------|---------|------------|
| `recall_log_insight` | Logs to C-Ledger blockchain | `content`, `metadata` |
| `recall_verify_cid` | Verifies blockchain entries | `cid` |
| `memory_retrieve` | Searches memory/vector store | `query`, `limit` |
| `memory_save` | Saves to memory with metadata | `content`, `metadata` |
| `tools_call_agent` | Inter-agent communication | `agent_id`, `task` |
| `tools_ask_user` | User interaction | `question` |
| `tools_get_time` | Current timestamp | None |
| `tools_sign_output` | Cryptographic signing | `output` |
| `tools_cid_file` | IPFS upload | `file_data` |
| `tools_replay_decision` | Decision history | `task_id` |

## 🔍 Beacon Agent Tools

The **Beacon Agent** specializes in knowledge retrieval and insight generation.

### Available Tools

| Tool Name | Purpose | Parameters |
|-----------|---------|------------|
| `beacon_search_knowledge` | Multi-source knowledge search | `topic`, `sources`, `max_sources` |
| `beacon_get_source_reliability` | Analyze source credibility | `source_url` |
| `beacon_save_insight` | Blockchain-backed insight storage | `insight_data` |

### Example Usage

```python
# Search across multiple sources
result = await beacon.execute_tool(
    'beacon_search_knowledge',
    topic='machine learning in healthcare',
    sources=['wikipedia', 'pubmed', 'wolfram'],
    max_sources=3
)

# Analyze source reliability
reliability = await beacon.execute_tool(
    'beacon_get_source_reliability',
    source_url='https://www.ncbi.nlm.nih.gov/pubmed/12345'
)

# Save with blockchain logging
saved = await beacon.execute_tool(
    'beacon_save_insight',
    insight_data=result
)
```

## 🧠 Theory Agent Tools

The **Theory Agent** specializes in fact-checking, validation, and bias analysis.

### Available Tools

| Tool Name | Purpose | Parameters |
|-----------|---------|------------|
| `theory_validate_insight` | Comprehensive insight validation | `insight_data` |
| `theory_check_single_claim` | Individual claim fact-checking | `claim`, `context` |
| `theory_analyze_bias` | Content bias analysis | `content` |
| `theory_cross_reference_sources` | Source consistency analysis | `sources` |

### Example Usage

```python
# Validate a complete insight
validation = await theory.execute_tool(
    'theory_validate_insight',
    insight_data={
        'topic': 'AI in medicine',
        'summary': 'AI systems show promise...',
        'sources': [...]
    }
)

# Check a single claim
fact_check = await theory.execute_tool(
    'theory_check_single_claim',
    claim='AI can diagnose with 100% accuracy',
    context='Medical AI systems'
)

# Analyze bias
bias_analysis = await theory.execute_tool(
    'theory_analyze_bias',
    content='This revolutionary technology will solve everything!'
)
```

## 📊 Tool Call Results

### Standard Response Format

All tools return structured data with consistent formatting:

```python
{
    'success_field': 'value',
    'metadata': {...},
    'timestamp': '2025-01-01T00:00:00Z',
    'agent_id': 'beacon_agent',
    'tool_name': 'beacon_search_knowledge'
}

# Or error format:
{
    'error': 'Error description',
    'tool_name': 'failed_tool'
}
```

### Beacon Search Results

```python
{
    'topic': 'artificial intelligence',
    'summary': 'Comprehensive knowledge summary...',
    'sources': [
        {
            'url': 'https://en.wikipedia.org/wiki/AI',
            'title': 'Artificial Intelligence',
            'source_type': 'wikipedia',
            'reliability_score': 0.85,
            'retrieved_at': '2025-01-01T00:00:00Z'
        }
    ],
    'search_id': 'abc123...',
    'memory_key': 'def456...',
    'retrieved_at': '2025-01-01T00:00:00Z'
}
```

### Theory Validation Results

```python
{
    'overall_reliability_score': 0.82,
    'consensus_recommendation': 'accept_with_caution',
    'fact_checks': [
        {
            'claim': 'AI systems show promise...',
            'verification_status': 'verified',
            'confidence_score': 0.85,
            'reasoning': 'Multiple reliable sources confirm...'
        }
    ],
    'bias_analysis': {
        'overall_bias_score': 0.15,
        'bias_level': 'low',
        'category_scores': {...}
    },
    'validation_id': 'xyz789...'
}
```

## 🔐 Security & Blockchain Integration

### Cryptographic Signing

All outputs can be cryptographically signed for integrity:

```python
signed = await agent.execute_tool(
    'tools_sign_output',
    output='Important content to verify'
)
# Returns: signature, content_hash, signer, timestamp, cid
```

### Blockchain Logging

Every insight and decision is logged to the C-Ledger:

```python
cid = await agent.execute_tool(
    'recall_log_insight',
    content='Agent performed knowledge search',
    metadata={'type': 'search', 'topic': 'AI'}
)
# Returns: blockchain CID for verification
```

### Memory Management

Agents maintain persistent memory across sessions:

```python
# Save to memory
key = await agent.execute_tool(
    'memory_save',
    content='Important information to remember',
    metadata={'category': 'research', 'priority': 'high'}
)

# Retrieve from memory
memories = await agent.execute_tool(
    'memory_retrieve',
    query='research about AI',
    limit=5
)
```

## 🤝 Inter-Agent Communication

Agents can communicate and collaborate:

```python
# Beacon calls Theory for validation
response = await beacon.execute_tool(
    'tools_call_agent',
    agent_id='theory_agent',
    task='Please validate this medical claim'
)

# Theory can access the request and respond
# (Integration with actual agent communication system)
```

## 📁 Storage Structure

The system creates organized storage for each agent:

```
tool_calling/
├── recall_logs/           # Blockchain entries
│   ├── beacon_agent/
│   └── theory_agent/
├── memory/               # Vector store & memories
│   ├── beacon_agent/
│   └── theory_agent/
└── logs/                # Private keys & system logs
    ├── beacon_agent/
    └── theory_agent/
```

## 🎯 Demo Scenarios

Run the interactive demo to see the system in action:

```bash
python agent_toolcall_demo.py
```

Available scenarios:
1. **Knowledge Search & Validation** - Full pipeline from search to validation
2. **Fact-Checking Pipeline** - Claims analysis and bias detection  
3. **Inter-Agent Collaboration** - Agent communication examples
4. **Memory & Recall System** - Persistent memory demonstrations

## 🔧 Configuration

### Basic Configuration

```python
config = {
    'news_api_key': 'your_news_api_key',      # Optional
    'wolfram_api_key': 'your_wolfram_key',    # Optional
}
```

### Advanced Configuration

```python
config = {
    # API Keys
    'news_api_key': None,
    'wolfram_api_key': None,
    
    # Storage Settings  
    'memory_dimension': 384,
    'max_memory_entries': 10000,
    
    # Security Settings
    'require_signatures': True,
    'blockchain_logging': True,
    
    # Agent Behavior
    'max_search_sources': 5,
    'fact_check_threshold': 0.7,
    'bias_analysis_enabled': True
}
```

## 🚀 Adding New Agents

To create a new agent with tool calling capabilities:

1. **Inherit from CoreTools**:
```python
from core_tools import CoreTools

class MyNewAgent(CoreTools):
    def __init__(self, config):
        super().__init__("my_new_agent", config)
```

2. **Add agent-specific tools**:
```python
async def mynew_special_function(self, param: str) -> Dict[str, Any]:
    """Agent-specific tool implementation"""
    # Tool logic here
    return {'result': 'success'}
```

3. **Register tools**:
```python
def get_available_tools(self) -> List[Dict[str, Any]]:
    tools = super().get_available_tools()  # Get core tools
    
    # Add your specific tools
    tools.extend([
        {
            "name": "mynew_special_function",
            "description": "Does something special",
            "parameters": {
                "type": "object",
                "properties": {
                    "param": {"type": "string", "description": "Input parameter"}
                },
                "required": ["param"]
            }
        }
    ])
    
    return tools
```

## 🐛 Troubleshooting

### Common Issues

1. **IPFS Connection Failed**
   - This is expected if IPFS isn't running locally
   - System falls back to local storage
   - To fix: Install and start IPFS daemon

2. **Cryptography Module Missing**
   - Install: `pip install cryptography`
   - Signatures will be disabled if not available

3. **Memory/Vector Store Issues**
   - Install: `pip install faiss-cpu numpy`
   - System falls back to simple keyword search

### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Tools will log detailed execution information
```

## 📊 Monitoring & Analytics

### Tool Usage Analytics

```python
# Get agent statistics
async with BeaconAgentEnhanced(config) as beacon:
    stats = beacon.system_status
    print(f"Uptime: {stats['uptime_start']}")
    print(f"Last task: {stats['last_task']}")
    print(f"Last CID: {stats['last_cid']}")
```

### Memory Usage

```python
# Check memory statistics
memories = await beacon.execute_tool('memory_retrieve', query='*', limit=1000)
print(f"Total memories: {len(memories)}")

# Memory categories
categories = {}
for memory in memories:
    cat = memory.get('metadata', {}).get('category', 'uncategorized')
    categories[cat] = categories.get(cat, 0) + 1
```

## 🔮 Future Enhancements

Planned improvements to the tool calling system:

1. **Real-time Agent Communication** - WebSocket-based inter-agent messaging
2. **Advanced Vector Search** - Semantic similarity with embeddings
3. **Tool Chaining** - Automatic multi-tool workflows
4. **Performance Monitoring** - Tool execution metrics and optimization
5. **Dynamic Tool Loading** - Runtime tool discovery and registration
6. **Distributed Memory** - Shared memory across agent instances

## 📝 API Reference

For complete API documentation, see the docstrings in:
- `core_tools.py` - Core tool implementations
- `beacon_agent_enhanced.py` - Beacon-specific tools
- `theory_agent_enhanced.py` - Theory-specific tools

## 🤝 Contributing

When adding new tools or agents:

1. Follow the established patterns in `core_tools.py`
2. Include comprehensive error handling
3. Add appropriate logging and blockchain integration
4. Update the tool registry with proper schemas
5. Add tests in `test_tool_calling.py`
6. Update this documentation

---

🎉 **The C-Suite Agent Tool Calling System is now ready for production use!**

For questions or support, refer to the test suite and demo applications for working examples. 