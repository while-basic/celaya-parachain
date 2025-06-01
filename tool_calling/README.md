# ----------------------------------------------------------------------------
#  File:        README.md
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: C-Suite Agent Tool Calling System - Professional Structure
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

# 🏢 C-Suite Agent Tool Calling System

## Professional Architecture

Welcome to the C-Suite Agent ecosystem! This system provides a professional, modular architecture for AI agents with comprehensive tool calling capabilities, blockchain integration, and enterprise-grade security.

## 📁 Directory Structure

```
tool_calling/
├── core/                           # Core infrastructure
│   ├── core_tools.py              # Base tools for all agents
│   ├── blockchain_client.py       # Blockchain integration
│   └── requirements.txt           # Dependencies
│
├── agents/                         # Agent implementations
│   ├── beacon/                     # Knowledge & Insight Agent
│   │   ├── beacon_agent_enhanced.py
│   │   ├── beacon_cli.py
│   │   ├── test_beacon.py
│   │   ├── beacon_config.json
│   │   └── README.md
│   │
│   ├── theory/                     # Fact-Checking & Validation Agent
│   │   ├── theory_agent_enhanced.py
│   │   ├── theory_cli.py
│   │   ├── test_theory.py
│   │   └── README.md
│   │
│   └── [future_agents]/            # Additional agents
│
├── demos/                          # Demonstrations & Testing
│   ├── agent_toolcall_demo.py     # Interactive demo system
│   └── test_tool_calling.py       # Comprehensive test suite
│
├── storage/                        # Persistent data storage
│   ├── recall_logs/               # Blockchain transaction logs
│   ├── memory/                    # Agent memory & vector stores
│   └── logs/                      # System logs & private keys
│
└── docs/                          # Documentation
    ├── README_TOOLCALLING.md      # Complete system documentation
    ├── README_LEGACY.md           # Legacy documentation
    └── research_topics.txt        # Research notes
```

## 🚀 Quick Start

### 1. Installation

```bash
cd tool_calling
pip install -r core/requirements.txt
```

### 2. Run Tests

```bash
cd demos
python test_tool_calling.py
```

**Expected Output**: Tests for all three agents (Beacon, Theory, Core) with 18 total tools operational

### 3. Interactive Demo

```bash
cd demos
python agent_toolcall_demo.py
```

**Available Scenarios**:
- Knowledge Search & Validation (Beacon → Theory)
- Fact-Checking Pipeline (Theory analysis)
- **Core Orchestration** (Core → Beacon → Theory → Synthesis)
- **Three-Agent Collaboration** (All agents working together)
- Inter-Agent Communication
- Memory & Recall System

## 🤖 Available Agents

### 🔍 Beacon Agent
**Purpose**: Knowledge retrieval and insight generation
- Multi-source search (Wikipedia, PubMed, Wolfram, News)
- Source reliability analysis
- Blockchain-backed insight storage

**Location**: `agents/beacon/`
**Documentation**: [Beacon README](agents/beacon/README.md)

### 🧠 Theory Agent
**Purpose**: Fact-checking and validation
- Comprehensive insight validation
- Bias analysis and detection
- Source cross-referencing
- Risk assessment

**Location**: `agents/theory/`
**Documentation**: [Theory README](agents/theory/README.md)

### ⚙️ Core Agent
**Purpose**: Main processor and insight engine
- Multi-agent orchestration
- Consensus management
- Insight synthesis
- System coordination

**Location**: `agents/core/`
**Documentation**: [Core README](agents/core/README.md)

## 🔧 Core Tools (Available to All Agents)

Every agent inherits these essential capabilities:

- **🔗 Blockchain Integration**: `recall_log_insight`, `recall_verify_cid`
- **🧠 Memory Management**: `memory_save`, `memory_retrieve`
- **🤝 Inter-Agent Communication**: `tools_call_agent`
- **🔐 Security**: `tools_sign_output`, cryptographic verification
- **⏰ System**: `tools_get_time`, `tools_ask_user`
- **🌐 IPFS**: `tools_cid_file` for distributed storage

## 🏗️ Adding New Agents

To create a new C-Suite agent:

1. **Create agent directory**:
```bash
mkdir agents/my_new_agent
```

2. **Inherit from CoreTools**:
```python
from core.core_tools import CoreTools

class MyNewAgent(CoreTools):
    def __init__(self, config):
        super().__init__("my_new_agent", config)
```

3. **Add agent-specific tools**:
```python
async def mynew_special_function(self, param: str) -> Dict[str, Any]:
    # Tool implementation
    return {'result': 'success'}
```

4. **Register tools and create documentation**

## 🔐 Security Features

- **Cryptographic Signing**: All outputs cryptographically verified
- **Blockchain Logging**: Immutable audit trail
- **Source Validation**: Automated credibility scoring
- **Memory Encryption**: Secure storage of sensitive data
- **Risk Assessment**: Automatic threat detection

## 📊 System Status

The reorganized system provides:

- ✅ **Professional Structure**: Each agent in dedicated directory
- ✅ **Modular Design**: Core tools inherited by all agents
- ✅ **Clean Separation**: Demos, storage, and docs organized
- ✅ **Scalable Architecture**: Easy to add new agents
- ✅ **Enterprise Ready**: Production-grade organization
- ✅ **Three-Agent Coordination**: Beacon + Theory + Core working together
- ✅ **Blockchain Integration**: Full audit trail and cryptographic verification
- ✅ **Consensus Management**: Multi-agent agreement and validation

## 🎯 Next Steps

Ready to implement the next C-Suite agent! Common options include:

- **Executive Agent**: Strategic decision making and leadership
- **Finance Agent**: Economic analysis and budget optimization  
- **Operations Agent**: Process improvement and resource management
- **Security Agent**: Threat analysis and compliance monitoring
- **Communications Agent**: External relations and reporting

## 📚 Documentation

- **Complete System Guide**: [docs/README_TOOLCALLING.md](docs/README_TOOLCALLING.md)
- **Beacon Agent**: [agents/beacon/README.md](agents/beacon/README.md)
- **Theory Agent**: [agents/theory/README.md](agents/theory/README.md)

---

🏢 **Professional C-Suite Agent Architecture - Ready for Enterprise Deployment** 