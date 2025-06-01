//  File:        extensive-simulation.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Extensive simulation component with comprehensive LLM token tracking and blockchain/IPFS logging
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

import React, { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

interface LLMTokenEvent {
  id: string
  timestamp: Date
  agentId: string
  agentName: string
  tokenType: 'input' | 'output' | 'system' | 'function'
  content: string
  tokenCount: number
  modelUsed: string
  cost: number
  processingTime: number
  contextLength: number
}

interface BlockchainLogEntry {
  id: string
  timestamp: Date
  blockNumber: number
  transactionHash: string
  eventType: 'simulation_start' | 'agent_interaction' | 'tool_execution' | 'simulation_complete'
  data: any
  gasUsed: number
  status: 'pending' | 'confirmed' | 'failed'
}

interface IPFSLogEntry {
  id: string
  timestamp: Date
  hash: string
  contentType: 'simulation_data' | 'agent_logs' | 'tool_outputs' | 'results'
  size: number
  pinned: boolean
  replicationCount: number
}

interface ExtensiveSimulationConfig {
  name: string
  description: string
  duration: number // in minutes
  participants: string[]
  trackTokens: boolean
  logToBlockchain: boolean
  storeOnIPFS: boolean
  realTimeVisualization: boolean
  detailedMetrics: boolean
}

interface ExtensiveSimulationRun {
  id: string
  config: ExtensiveSimulationConfig
  status: 'configuring' | 'initializing' | 'running' | 'paused' | 'completed' | 'error'
  startTime: Date
  endTime?: Date
  progress: number
  tokenEvents: LLMTokenEvent[]
  blockchainLogs: BlockchainLogEntry[]
  ipfsLogs: IPFSLogEntry[]
  totalTokensUsed: number
  totalCost: number
  averageResponseTime: number
  currentPhase: string
  // Enhanced cost tracking based on real-world analysis
  infrastructureCosts: {
    computeHours: number
    storageGB: number
    networkBandwidth: number
    developmentAmortization: number // Based on $5.6M DeepSeek-style development
  }
  efficiencyMetrics: {
    costPerDecision: number
    automationPercentage: number // Lenovo achieved 80% automation
    costSavingsVsProprietaryAI: number
  }
}

export function ExtensiveSimulation() {
  const [activeRun, setActiveRun] = useState<ExtensiveSimulationRun | null>(null)
  const [config, setConfig] = useState<ExtensiveSimulationConfig>({
    name: '',
    description: '',
    duration: 30,
    participants: [],
    trackTokens: true,
    logToBlockchain: true,
    storeOnIPFS: true,
    realTimeVisualization: true,
    detailedMetrics: true
  })
  const [tokenStream, setTokenStream] = useState<LLMTokenEvent[]>([])
  const [showTokenDetails, setShowTokenDetails] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [isConfiguring, setIsConfiguring] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'tokens' | 'blockchain' | 'ipfs' | 'metrics'>('tokens')
  const [chartDataHistory, setChartDataHistory] = useState<Array<{
    time: string,
    tokens: number,
    cost: number,
    cumulativeTokens: number,
    cumulativeCost: number
  }>>([])
  const availableAgents = [
    'Lyra Agent - OS/Meta-Orchestrator & System Coordinator',
    'Echo Agent - Insight Relay & Compliance Auditing',
    'Verdict Agent - Legal/Compliance Decision Output',
    'Volt Agent - Hardware/Electrical Diagnostics & Smart-Panel Ops',
    'Core Agent - Main Processor & Insight Engine',
    'Vitals Agent - Medical/Health Diagnostics',
    'Sentinel Agent - Security/Surveillance & Anomaly Detection',
    'Theory Agent - Research & Hypothesis Generation',
    'Beacon Agent - Knowledge Base & Fact Retrieval',
    'Lens Agent - Visual Analysis & Scanner Operations',
    'Arc Agent - ECU Vehicle Controller & Otto\'s Assistant',
    'Otto Agent - Autonomous Vehicle/Robotics Control',
    'Luma Agent - Smart Home & Environmental Control'
  ]

  useEffect(() => {
    if (activeRun && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [tokenStream])

  const startExtensiveSimulation = async () => {
    if (!config.name || config.participants.length === 0) {
      alert('Please configure simulation name and select participants')
      return
    }

    const newRun: ExtensiveSimulationRun = {
      id: `ext-sim-${Date.now()}`,
      config: { ...config },
      status: 'initializing',
      startTime: new Date(),
      progress: 0,
      tokenEvents: [],
      blockchainLogs: [],
      ipfsLogs: [],
      totalTokensUsed: 0,
      totalCost: 0,
      averageResponseTime: 0,
      currentPhase: 'Initialization',
      infrastructureCosts: {
        computeHours: 0,
        storageGB: 0,
        networkBandwidth: 0,
        developmentAmortization: 0
      },
      efficiencyMetrics: {
        costPerDecision: 0,
        automationPercentage: 0,
        costSavingsVsProprietaryAI: 0
      }
    }

    setActiveRun(newRun)
    setIsConfiguring(false)

    // Simulate initialization phase
    await simulatePhase(newRun, 'Initialization', 5)
    
    // Start main simulation
    newRun.status = 'running'
    newRun.currentPhase = 'Agent Interaction Phase'
    setActiveRun({ ...newRun })

    // Run simulation with detailed tracking
    await runDetailedSimulation(newRun)
  }

  const simulatePhase = async (run: ExtensiveSimulationRun, phaseName: string, durationSeconds: number) => {
    for (let i = 0; i <= durationSeconds; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      run.progress = (i / (run.config.duration * 60)) * 100
      run.currentPhase = `${phaseName} (${i}/${durationSeconds}s)`
      setActiveRun({ ...run })
    }
  }

  const runDetailedSimulation = async (run: ExtensiveSimulationRun) => {
    const totalDuration = run.config.duration * 60 * 1000 // Convert to milliseconds
    const updateInterval = 2000 // Update every 2 seconds
    const totalUpdates = totalDuration / updateInterval

    for (let i = 0; i <= totalUpdates; i++) {
      await new Promise(resolve => setTimeout(resolve, updateInterval))
      
      // Generate LLM token events
      if (run.config.trackTokens) {
        const newTokenEvents = generateTokenEvents(run.config.participants)
        run.tokenEvents.push(...newTokenEvents)
        setTokenStream(prev => [...prev, ...newTokenEvents])
        
        // Update totals
        const newTokenCount = newTokenEvents.reduce((sum, event) => sum + event.tokenCount, 0)
        const newCost = newTokenEvents.reduce((sum, event) => sum + event.cost, 0)
        run.totalTokensUsed += newTokenCount
        run.totalCost += newCost
        
        // Update chart data with real accumulated values
        const currentTime = new Date().toLocaleTimeString()
        setChartDataHistory(prev => {
          const newEntry = {
            time: currentTime,
            tokens: newTokenCount,
            cost: newCost,
            cumulativeTokens: run.totalTokensUsed,
            cumulativeCost: run.totalCost
          }
          const updated = [...prev, newEntry]
          // Keep only last 20 data points for chart performance
          return updated.length > 20 ? updated.slice(-20) : updated
        })
      }

      // Generate blockchain logs
      if (run.config.logToBlockchain) {
        const blockchainEntry = generateBlockchainLog()
        run.blockchainLogs.push(blockchainEntry)
      }

      // Generate IPFS logs
      if (run.config.storeOnIPFS) {
        const ipfsEntry = generateIPFSLog()
        run.ipfsLogs.push(ipfsEntry)
      }

      // Update progress and metrics
      run.progress = (i / totalUpdates) * 100
      run.averageResponseTime = 150 + Math.random() * 100 // Simulate varying response times
      
      // Update infrastructure costs based on real-world data
      const computeHoursUsed = (updateInterval / 1000 / 3600) * run.config.participants.length
      const storageUsed = Math.random() * 0.1 + 0.05 // GB per update
      const bandwidthUsed = Math.random() * 50 + 25 // MB per update
      
      run.infrastructureCosts.computeHours += computeHoursUsed
      run.infrastructureCosts.storageGB += storageUsed
      run.infrastructureCosts.networkBandwidth += bandwidthUsed
      
      // Development amortization: $5.6M spread over expected usage
      const developmentCostPerHour = 5600000 / (365 * 24 * 100) // Assuming 100 agent-hours daily usage
      run.infrastructureCosts.developmentAmortization += developmentCostPerHour * computeHoursUsed
      
      // Calculate efficiency metrics based on Lenovo case study (80% automation)
      const decisionsPerformed = Math.floor(Math.random() * 5) + 3
      run.efficiencyMetrics.costPerDecision = run.totalCost / Math.max(decisionsPerformed, 1)
      run.efficiencyMetrics.automationPercentage = Math.min(75 + run.progress * 0.05, 82) // Progress toward 80%+ automation
      
      // Cost savings vs proprietary AI (GPT-4 at $0.03/1K tokens vs our $0.0001-0.0005/1K)
      const proprietaryEquivalentCost = run.totalTokensUsed * 0.03 / 1000
      run.efficiencyMetrics.costSavingsVsProprietaryAI = proprietaryEquivalentCost - run.totalCost

      // Update current phase based on progress
      if (run.progress < 25) {
        run.currentPhase = 'Agent Registration & Identity Verification'
      } else if (run.progress < 50) {
        run.currentPhase = 'Multi-Agent Consensus & Coordination'
      } else if (run.progress < 75) {
        run.currentPhase = 'Blockchain Logging & IPFS Storage'
      } else if (run.progress < 95) {
        run.currentPhase = 'Signature Verification & Audit Trail'
      } else {
        run.currentPhase = 'Results Compilation & On-Chain Finalization'
      }

      setActiveRun({ ...run })
    }

    // Complete simulation
    run.status = 'completed'
    run.endTime = new Date()
    run.currentPhase = 'Completed'
    setActiveRun({ ...run })
  }

  const generateTokenEvents = (participants: string[]): LLMTokenEvent[] => {
    const events: LLMTokenEvent[] = []
    const eventCount = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < eventCount; i++) {
      const participant = participants[Math.floor(Math.random() * participants.length)]
      const tokenTypes: LLMTokenEvent['tokenType'][] = ['input', 'output', 'system', 'function']
      // Based on real-world cost analysis: open-source models with self-hosted infrastructure
      const models = [
        'llama3.2', 
        'deepseek-r1', 
        'gemma3', 
        'qwen3'
      ]
      
      const tokenType = tokenTypes[Math.floor(Math.random() * tokenTypes.length)]
      const tokenCount = Math.floor(Math.random() * 500) + 50
      const model = models[Math.floor(Math.random() * models.length)]
      
      // Realistic pricing based on Blockchain App Factory's cost analysis:
      // - Self-hosted infrastructure: $0.0001-0.0005 per 1K tokens
      // - Distributed compute: Even lower costs
      // - DeepSeek-style optimization: ~$5.6M total development vs billions
      const getCostPerToken = (modelName: string, tokenCount: number): number => {
        const baseInfrastructureCost = 0.0001 // Base compute cost per 1K tokens
        const modelMultipliers = {
          'deepseek-r1': 0.8, // DeepSeek's cost-optimized model
          'llama3.2': 1.0, // Efficient base model
          'gemma3': 0.6, // Google's efficient model
          'qwen3': 1.2 // Alibaba's balanced performance model
        }
        
        const multiplier = Object.entries(modelMultipliers).find(([key]) => 
          modelName.includes(key)
        )?.[1] || 1.0
        
        return (tokenCount / 1000) * baseInfrastructureCost * multiplier
      }
      
      // Infrastructure and development costs simulation
      const processingTime = Math.random() * 150 + 25 // Optimized local processing
      const contextLength = Math.floor(Math.random() * 8000) + 2000 // Extended context for agents
      
      events.push({
        id: `token-${Date.now()}-${i}`,
        timestamp: new Date(),
        agentId: participant.split(' ')[0].toLowerCase(),
        agentName: participant,
        tokenType,
        content: generateSimulatedContent(tokenType, participant),
        tokenCount,
        modelUsed: model,
        cost: getCostPerToken(model, tokenCount),
        processingTime,
        contextLength
      })
    }

    return events
  }

  const generateSimulatedContent = (tokenType: string, agent: string): string => {
    const agentName = agent.split(' ')[0]
    const timestamp = new Date().toISOString()
    
    const verboseContentTemplates = {
      input: [
        `[SYSTEM] ${agentName} Agent Input Processing
Query: "Analyze current blockchain consensus state and validate multi-agent coordination protocols"
Context: Examining block height 7,234,891 with pending transactions in mempool
Parameters: {
  "consensus_threshold": 0.67,
  "agent_participation": ${Math.floor(Math.random() * 13) + 1}/13,
  "validation_window": "300_seconds",
  "cryptographic_proof": "sr25519_signature"
}
Processing multi-sig requirements for cross-agent decision validation...`,

        `[INPUT] ${agentName} Multi-Agent Coordination Request
Initiating consensus protocol for critical system decision
Agent Network Status:
├── Lyra (Orchestrator): ACTIVE, reputation: 0.98
├── Echo (Compliance): ACTIVE, reputation: 0.95
├── Verdict (Legal): ACTIVE, reputation: 0.97
├── ${agentName}: ACTIVE, reputation: ${(0.9 + Math.random() * 0.1).toFixed(2)}
└── Network Latency: ${Math.floor(Math.random() * 50) + 10}ms

Analyzing blockchain state for decision validation:
- Current epoch: ${Math.floor(Math.random() * 1000) + 5000}
- Validator set: 127 active validators
- Finality lag: ${Math.floor(Math.random() * 5) + 1} blocks`
      ],
      
      output: [
        `[RESPONSE] ${agentName} Agent Analysis Complete
===============================================
CONSENSUS DECISION: APPROVED
Confidence Score: ${(0.85 + Math.random() * 0.15).toFixed(3)}

Detailed Analysis:
1. Blockchain Validation Results:
   ✓ Transaction integrity verified (SHA-256: ${Math.random().toString(16).substr(2, 8)})
   ✓ Multi-signature threshold met (9/13 agents confirmed)
   ✓ Gas estimation: ${Math.floor(Math.random() * 100000) + 21000} units
   ✓ IPFS content hash validated: Qm${Math.random().toString(36).substr(2, 44)}

2. Agent Coordination Metrics:
   - Response time: ${Math.floor(Math.random() * 200) + 50}ms
   - Consensus round: ${Math.floor(Math.random() * 3) + 1}/3
   - Network synchronization: 99.${Math.floor(Math.random() * 10)}%

3. Compliance & Security Assessment:
   ✓ Audit trail generated and stored on-chain
   ✓ Privacy-preserving computation verified
   ✓ Regulatory compliance checked (${Math.floor(Math.random() * 15) + 85}% confidence)

RECOMMENDATION: Proceed with coordinated action execution.
Next Phase: Broadcasting decision to agent network for implementation.`,

        `[OUTPUT] ${agentName} Strategic Decision Framework
================================================
ANALYSIS COMPLETE - BLOCKCHAIN COORDINATION APPROVED

Executive Summary:
The ${agentName} agent has completed comprehensive analysis of the requested coordination protocol. After processing ${Math.floor(Math.random() * 5000) + 10000} data points and consulting with ${Math.floor(Math.random() * 8) + 5} peer agents, the following decision matrix has been generated:

┌─────────────────────┬──────────┬──────────┬──────────┐
│ Evaluation Criteria │ Score    │ Weight   │ Impact   │
├─────────────────────┼──────────┼──────────┼──────────┤
│ Technical Viability │ ${(Math.random() * 0.3 + 0.7).toFixed(2)}     │ 0.25     │ HIGH     │
│ Cost Efficiency     │ ${(Math.random() * 0.3 + 0.7).toFixed(2)}     │ 0.20     │ MEDIUM   │
│ Security Compliance │ ${(Math.random() * 0.2 + 0.8).toFixed(2)}     │ 0.30     │ CRITICAL │
│ Network Consensus   │ ${(Math.random() * 0.3 + 0.7).toFixed(2)}     │ 0.25     │ HIGH     │
└─────────────────────┴──────────┴──────────┴──────────┘

Blockchain Integration Status:
- Transaction Pool: ${Math.floor(Math.random() * 500) + 100} pending
- Network Hashrate: ${Math.floor(Math.random() * 100) + 200} TH/s
- Finalization Time: ${Math.floor(Math.random() * 10) + 5} seconds
- Cross-chain bridges: ${Math.floor(Math.random() * 5) + 3} active connections

IPFS Storage Metrics:
- Content addressing: CIDv1 with SHA-256
- Replication factor: ${Math.floor(Math.random() * 5) + 3} nodes
- Retrieval latency: ${Math.floor(Math.random() * 100) + 50}ms
- Data integrity: 100% verified

[CONCLUSION] All systems green. Coordinated blockchain action authorized.`
      ],
      
      system: [
        `[SYS] Agent Registry Blockchain Synchronization
======================================================
Timestamp: ${timestamp}
Block Height: ${Math.floor(Math.random() * 1000000) + 7000000}
Gas Price: ${Math.floor(Math.random() * 50) + 10} gwei

Loading agent credentials from distributed registry...
├── Verifying SR25519 signatures for all active agents
├── Cross-referencing reputation scores with on-chain history
├── Validating multi-party computation proofs
└── Synchronizing with parachain consensus mechanisms

Agent Network Topology:
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Agent ID    │ Node Status  │ Stake Amount │ Last Active  │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ lyra_001    │ VALIDATOR    │ 1,000 DOT    │ ${Math.floor(Math.random() * 10)}s ago    │
│ echo_002    │ FULL_NODE    │ 500 DOT     │ ${Math.floor(Math.random() * 10)}s ago    │
│ verdict_003 │ VALIDATOR    │ 750 DOT     │ ${Math.floor(Math.random() * 10)}s ago    │
└─────────────┴──────────────┴──────────────┴──────────────┘

Consensus Protocol: GRANDPA + BABE hybrid
Current Validator Set: 127 active, 23 waiting
Network Finality: ${Math.floor(Math.random() * 10) + 1} block lag`,

        `[SYSTEM] Multi-Agent Consensus Protocol Initialization
=====================================================
Session ID: ${Math.random().toString(16).substr(2, 16)}
Consensus Algorithm: Modified PBFT with agent reputation weighting

Phase 1: Pre-prepare
- Broadcasting proposal hash: 0x${Math.random().toString(16).substr(2, 64)}
- Required signatures: 9/13 (Byzantine fault tolerance)
- Timeout threshold: 30 seconds

Phase 2: Prepare Messages
- Collecting agent confirmations...
- Cryptographic proof verification in progress
- Network partition tolerance: ACTIVE

Phase 3: Commit Phase
- Finalizing decision state on blockchain
- Generating audit trail for compliance
- IPFS content addressing for immutable storage

Agent Participation Matrix:
[${Array.from({length: 13}, () => Math.random() > 0.2 ? '●' : '○').join(' ')}]
Legend: ● Active participant, ○ Offline/Abstaining

Estimated consensus completion: ${Math.floor(Math.random() * 30) + 10} seconds`
      ],
      
      function: [
        `[FUNCTION] register_agent_action() - Blockchain Transaction
============================================================
Transaction Hash: 0x${Math.random().toString(16).substr(2, 64)}
Block Number: ${Math.floor(Math.random() * 1000000) + 7000000}
Gas Used: ${Math.floor(Math.random() * 100000) + 21000} / ${Math.floor(Math.random() * 200000) + 150000}
Transaction Fee: ${(Math.random() * 0.01).toFixed(6)} DOT

Function Parameters:
├── agent_id: "${agentName.toLowerCase()}_${Math.floor(Math.random() * 1000)}"
├── action_type: "COORDINATION_DECISION"
├── timestamp: ${Math.floor(Date.now() / 1000)}
├── signature_proof: "0x${Math.random().toString(16).substr(2, 128)}"
└── metadata_hash: "Qm${Math.random().toString(36).substr(2, 44)}"

Event Logs Generated:
- AgentActionRegistered(agent_id, action_hash, block_timestamp)
- ConsensusParticipationRecorded(session_id, vote_weight, reputation_delta)
- AuditTrailUpdated(transaction_ref, compliance_status, storage_cid)

Storage Updates:
├── On-chain state: Agent reputation +${(Math.random() * 0.05).toFixed(3)}
├── IPFS pinning: Content replicated to ${Math.floor(Math.random() * 5) + 3} nodes
└── Cross-chain relay: Bridge transaction queued for finalization

Status: CONFIRMED - Action successfully recorded in blockchain state`,

        `[EXEC] multi_sig_consensus() - Cryptographic Validation
=======================================================
Multi-Signature Ceremony Initiated
Threshold: 9 of 13 signatures required (Byzantine fault tolerance)
Curve: SR25519 (Schnorrkel/Ristretto)

Signature Collection Progress:
[████████████████████████████████████████] 100% (12/13)

Participating Agents:
✓ Lyra: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Echo: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)  
✓ Verdict: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Volt: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Core: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Vitals: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Sentinel: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Theory: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Beacon: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Lens: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Arc: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
✓ Otto: 0x${Math.random().toString(16).substr(2, 16)}... (VALID)
○ Luma: OFFLINE (signature threshold still met)

Aggregated Signature: 0x${Array.from({length: 8}, () => Math.random().toString(16).substr(2, 8)).join('')}

Verification Status: CONSENSUS ACHIEVED
Result: Decision approved with 12/13 agent consensus (92.3% participation)
Blockchain Commitment: Signature submitted to validator set for finalization`
      ]
    }

    const templates = verboseContentTemplates[tokenType as keyof typeof verboseContentTemplates] || verboseContentTemplates.output
    return templates[Math.floor(Math.random() * templates.length)]
  }

  const generateBlockchainLog = (): BlockchainLogEntry => {
    const eventTypes: BlockchainLogEntry['eventType'][] = ['agent_interaction', 'tool_execution', 'simulation_start']
    
    return {
      id: `block-${Date.now()}`,
      timestamp: new Date(),
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      data: { phase: 'interaction', metrics: { tokens: Math.floor(Math.random() * 1000) } },
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      status: Math.random() > 0.1 ? 'confirmed' : 'pending'
    }
  }

  const generateIPFSLog = (): IPFSLogEntry => {
    const contentTypes: IPFSLogEntry['contentType'][] = ['simulation_data', 'agent_logs', 'tool_outputs']
    
    return {
      id: `ipfs-${Date.now()}`,
      timestamp: new Date(),
      hash: `Qm${Math.random().toString(36).substr(2, 44)}`,
      contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      size: Math.floor(Math.random() * 10000) + 1000,
      pinned: Math.random() > 0.2,
      replicationCount: Math.floor(Math.random() * 5) + 1
    }
  }

  const filteredTokenEvents = selectedAgent === 'all' 
    ? tokenStream 
    : tokenStream.filter(event => event.agentId === selectedAgent)

  if (isConfiguring) {
    return (
      <div className="space-y-6 p-6">
        <div className="control-panel p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🔬 Extensive Simulation Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Simulation Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Q4 Strategic Planning Simulation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({...config, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Comprehensive simulation of C-Suite decision making process..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="180"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Participating Agents</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {availableAgents.map(agent => (
                    <label key={agent} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.participants.includes(agent)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({...config, participants: [...config.participants, agent]})
                          } else {
                            setConfig({...config, participants: config.participants.filter(p => p !== agent)})
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{agent}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Simulation Features</label>
                {[
                  { key: 'trackTokens', label: 'Track LLM Token Usage' },
                  { key: 'logToBlockchain', label: 'Log to Blockchain' },
                  { key: 'storeOnIPFS', label: 'Store Data on IPFS' },
                  { key: 'realTimeVisualization', label: 'Real-time Visualization' },
                  { key: 'detailedMetrics', label: 'Detailed Metrics Collection' }
                ].map(feature => (
                  <label key={feature.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config[feature.key as keyof ExtensiveSimulationConfig] as boolean}
                      onChange={(e) => setConfig({...config, [feature.key]: e.target.checked})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={startExtensiveSimulation}
              disabled={!config.name || config.participants.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Start Extensive Simulation
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Simulation Status Header */}
      <div className="control-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {activeRun?.config.name}
            </h2>
            <p className="text-gray-600">{activeRun?.config.description}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              activeRun?.status === 'running' ? 'bg-green-100 text-green-800' :
              activeRun?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {activeRun?.status.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{Math.round(activeRun?.progress || 0)}%</div>
            <div className="text-sm text-blue-800">Progress</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeRun?.totalTokensUsed.toLocaleString()}</div>
            <div className="text-sm text-green-800">Tokens Used</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">${activeRun?.totalCost.toFixed(6)}</div>
            <div className="text-sm text-purple-800">Inference Cost</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{Math.round(activeRun?.averageResponseTime || 0)}ms</div>
            <div className="text-sm text-orange-800">Avg Response</div>
          </div>
        </div>
        
        {/* Enhanced Cost Metrics - Based on Real-World Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
            <div className="text-xl font-bold text-emerald-600">
              ${(activeRun?.efficiencyMetrics.costSavingsVsProprietaryAI || 0).toFixed(4)}
            </div>
            <div className="text-sm text-emerald-800">Savings vs GPT-4</div>
            <div className="text-xs text-emerald-600 mt-1">
              ({((activeRun?.efficiencyMetrics.costSavingsVsProprietaryAI || 0) / Math.max(activeRun?.totalCost || 0.001, 0.001) * 100).toFixed(0)}% reduction)
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg">
            <div className="text-xl font-bold text-cyan-600">
              {(activeRun?.efficiencyMetrics.automationPercentage || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-cyan-800">Automation Rate</div>
            <div className="text-xs text-cyan-600 mt-1">Target: 80% (Lenovo benchmark)</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
            <div className="text-xl font-bold text-indigo-600">
              {(activeRun?.infrastructureCosts.computeHours || 0).toFixed(3)}h
            </div>
            <div className="text-sm text-indigo-800">Compute Hours</div>
            <div className="text-xs text-indigo-600 mt-1">
              ${(activeRun?.infrastructureCosts.developmentAmortization || 0).toFixed(4)} dev cost
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Current Phase: {activeRun?.currentPhase}</span>
            <span>{activeRun?.startTime.toLocaleTimeString()} - {activeRun?.endTime?.toLocaleTimeString() || 'Running'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${activeRun?.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Data Tabs */}
      <div className="control-panel">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'tokens', label: '🔤 Token Stream', count: tokenStream.length },
              { id: 'blockchain', label: '⛓️ Blockchain Logs', count: activeRun?.blockchainLogs.length || 0 },
              { id: 'ipfs', label: '📦 IPFS Storage', count: activeRun?.ipfsLogs.length || 0 },
              { id: 'metrics', label: '📊 Real-time Metrics', count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'tokens' | 'blockchain' | 'ipfs' | 'metrics')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id ?
                  'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Live Token Stream</h3>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Agents</option>
                  {activeRun?.config.participants.map(agent => (
                    <option key={agent} value={agent.split(' ')[0].toLowerCase()}>
                      {agent.split(' ')[0]} Agent
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div 
                  ref={scrollRef}
                  className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto"
                >
                  {filteredTokenEvents.map(event => (
                    <div key={event.id} className="mb-2 border-l-2 border-green-500 pl-2">
                      <div className="text-green-300">
                        [{event.timestamp.toLocaleTimeString()}] {event.agentName}
                      </div>
                      <div className="text-yellow-400">
                        {event.tokenType.toUpperCase()} | {event.modelUsed} | {event.tokenCount} tokens | ${event.cost.toFixed(4)}
                      </div>
                      <div className="text-white">
                        {event.content}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Processing: {Math.round(event.processingTime)}ms | Context: {event.contextLength} tokens
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="h-48">
                    <h4 className="text-sm font-medium mb-2">Token Usage Over Time</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDataHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="tokens" stroke="#8884d8" strokeWidth={2} name="Tokens This Period" />
                        <Line type="monotone" dataKey="cumulativeTokens" stroke="#ff7300" strokeWidth={2} name="Total Tokens" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-48">
                    <h4 className="text-sm font-medium mb-2">Cost Tracking ($)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDataHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(6)}`} />
                        <Line type="monotone" dataKey="cost" stroke="#82ca9d" strokeWidth={2} name="Cost This Period" />
                        <Line type="monotone" dataKey="cumulativeCost" stroke="#8dd1e1" strokeWidth={2} name="Total Cost" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'blockchain' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Blockchain Transaction Log</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeRun?.blockchainLogs.map(log => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-sm text-blue-600">
                        Block #{log.blockNumber.toLocaleString()}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        log.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {log.timestamp.toLocaleTimeString()} | {log.eventType.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="font-mono text-xs text-gray-500 truncate">
                      {log.transactionHash}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Gas Used: {log.gasUsed.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'ipfs' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">IPFS Storage Entries</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeRun?.ipfsLogs.map(log => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-sm text-purple-600">
                        {log.contentType.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        {log.pinned && (
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            PINNED
                          </div>
                        )}
                        <div className="text-xs text-gray-600">
                          {(log.size / 1024).toFixed(1)}KB
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="font-mono text-xs text-gray-500 truncate">
                      {log.hash}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Replications: {log.replicationCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Real-time Performance Metrics</h3>
              
              {/* Real-time charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <h4 className="text-sm font-medium mb-2">Cumulative Token Usage</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartDataHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="cumulativeTokens" stroke="#8884d8" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-64">
                  <h4 className="text-sm font-medium mb-2">Cost vs Savings Analysis</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartDataHistory.map(item => ({
                      ...item,
                      proprietaryCost: item.cumulativeTokens * 0.03 / 1000,
                      savings: (item.cumulativeTokens * 0.03 / 1000) - item.cumulativeCost
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(6)}`} />
                      <Line type="monotone" dataKey="cumulativeCost" stroke="#82ca9d" strokeWidth={2} name="Our Cost" />
                      <Line type="monotone" dataKey="proprietaryCost" stroke="#ff7300" strokeWidth={2} name="GPT-4 Cost" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Performance metrics grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {((activeRun?.efficiencyMetrics.costSavingsVsProprietaryAI || 0) / Math.max(activeRun?.totalCost || 0.001, 0.001) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-800">Cost Reduction vs GPT-4</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {(activeRun?.totalTokensUsed || 0).toLocaleString()}/min
                  </div>
                  <div className="text-sm text-green-800">Token Processing Rate</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round(activeRun?.averageResponseTime || 0)}ms
                  </div>
                  <div className="text-sm text-purple-800">Average Response Time</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="control-panel p-6">
        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <button
              onClick={() => setIsConfiguring(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ⚙️ New Simulation
            </button>
            {activeRun?.status === 'running' && (
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                ⏸️ Pause
              </button>
            )}
          </div>
          
          {activeRun?.status === 'completed' && (
            <div className="space-x-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                📊 Export Results
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                💾 Save Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const LLMModelOptions = [
  { value: 'deepseek-r1', label: 'DeepSeek-R1' },
  { value: 'gemma3', label: 'Gemma 3' },
  { value: 'wen3', label: 'Wen 3' },
  { value: 'llama3.2', label: 'Llama 3.2' }
];

export default ExtensiveSimulation; 