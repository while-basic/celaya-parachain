// ----------------------------------------------------------------------------
//  File:        dataSimulator.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: High-frequency data simulator for real-time testing
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { useAgentStore, useConsensusStore, useStreamStore, useSystemStore } from '@/lib/stores'
import type { Agent, ConsensusLog, BlockchainEvent, CIDLog } from '@/types'
import { generateId } from '@/lib/utils'

class DataSimulator {
  private intervals: NodeJS.Timeout[] = []
  private isRunning = false
  private agentNames = ['Lyra', 'Echo', 'Verdict', 'Nexus', 'Oracle', 'Sage', 'Scout', 'Guard']

  start() {
    if (this.isRunning) return
    this.isRunning = true

    // High-frequency agent status updates (every 2 seconds)
    this.intervals.push(setInterval(() => {
      this.simulateAgentUpdates()
    }, 2000))

    // Medium-frequency consensus logs (every 8 seconds)
    this.intervals.push(setInterval(() => {
      this.simulateConsensusLog()
    }, 8000))

    // High-frequency blockchain events (every 1 second)
    this.intervals.push(setInterval(() => {
      this.simulateBlockchainEvent()
    }, 1000))

    // CID logs (every 12 seconds)
    this.intervals.push(setInterval(() => {
      this.simulateCIDLog()
    }, 12000))

    // System metrics updates (every 5 seconds)
    this.intervals.push(setInterval(() => {
      this.simulateSystemMetrics()
    }, 5000))

    // Text streams (every 3 seconds)
    this.intervals.push(setInterval(() => {
      this.simulateTextStream()
    }, 3000))

    console.log('Data simulator started')
  }

  stop() {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
    this.isRunning = false
    console.log('Data simulator stopped')
  }

  private simulateAgentUpdates() {
    const agentStore = useAgentStore.getState()
    const agents = agentStore.agents

    if (agents.length === 0) return

    // Randomly select an agent to update
    const agent = agents[Math.floor(Math.random() * agents.length)]
    
    // Simulate status changes
    const statuses: Agent['status'][] = ['active', 'processing', 'idle']
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    // Simulate trust score fluctuation (±2%)
    const trustChange = (Math.random() - 0.5) * 4
    const newTrustScore = Math.max(0, Math.min(100, agent.trustScore + trustChange))

    // Update agent
    agentStore.updateAgent(agent.id, {
      status: newStatus,
      trustScore: newTrustScore,
      lastSeen: new Date(),
      metadata: {
        ...agent.metadata,
        responseTime: Math.floor(Math.random() * 300) + 50,
        processingPower: Math.floor(Math.random() * 30) + 70,
        successRate: newTrustScore
      }
    })
  }

  private simulateConsensusLog() {
    const agentStore = useAgentStore.getState()
    const consensusStore = useConsensusStore.getState()
    const agents = agentStore.agents

    if (agents.length === 0) return

    const agent = agents[Math.floor(Math.random() * agents.length)]
    const decisions = [
      'Approve transaction batch #12847',
      'Validate agent registration request',
      'Consensus on trust score calculation',
      'Approve CID verification protocol',
      'Validate system parameter update'
    ]

    const consensusLog: ConsensusLog = {
      id: generateId(),
      agentId: agent.id,
      decision: decisions[Math.floor(Math.random() * decisions.length)],
      signatures: [
        {
          agentId: agent.id,
          signature: `0x${Math.random().toString(16).substr(2, 64)}`,
          publicKey: `0x${Math.random().toString(16).substr(2, 64)}`,
          verified: Math.random() > 0.1 // 90% verification rate
        }
      ],
      timestamp: new Date(),
      strength: Math.floor(Math.random() * 30) + 70,
      verified: Math.random() > 0.2 // 80% verification rate
    }

    consensusStore.addConsensusLog(consensusLog)
  }

  private simulateBlockchainEvent() {
    const streamStore = useStreamStore.getState()
    const systemStore = useSystemStore.getState()
    const currentBlock = systemStore.metrics.lastBlockNumber || 156789

    const sections = ['agentRegistry', 'consensus', 'system', 'balances', 'utility'] as const
    const methods: Record<typeof sections[number], string[]> = {
      agentRegistry: ['register', 'updateTrust', 'deregister'],
      consensus: ['submitDecision', 'verifySignature', 'finalizeConsensus'],
      system: ['setStorage', 'killStorage', 'remark'],
      balances: ['transfer', 'forceTransfer', 'setBalance'],
      utility: ['batch', 'batchAll', 'forceBatch']
    }

    const section = sections[Math.floor(Math.random() * sections.length)]
    const method = methods[section][Math.floor(Math.random() * methods[section].length)]

    const event: BlockchainEvent = {
      id: generateId(),
      blockNumber: currentBlock + Math.floor(Math.random() * 3),
      extrinsicIndex: Math.floor(Math.random() * 10),
      method,
      section,
      data: {
        weight: Math.floor(Math.random() * 1000000),
        fee: Math.floor(Math.random() * 1000),
        success: Math.random() > 0.05 // 95% success rate
      },
      timestamp: new Date()
    }

    streamStore.addEvent(event)
  }

  private simulateCIDLog() {
    const streamStore = useStreamStore.getState()
    const agentStore = useAgentStore.getState()
    const agents = agentStore.agents

    if (agents.length === 0) return

    const agent = agents[Math.floor(Math.random() * agents.length)]
    const contentTypes = ['insight', 'analysis', 'decision', 'verification', 'report']

    const cidLog: CIDLog = {
      cid: `Qm${Math.random().toString(36).substr(2, 44)}`,
      contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      agentId: agent.id,
      metadata: {
        fileSize: Math.floor(Math.random() * 100000) + 1000,
        mimeType: 'application/json',
        created: new Date().toISOString()
      },
      timestamp: new Date(),
      size: Math.floor(Math.random() * 100000) + 1000,
      verified: Math.random() > 0.15 // 85% verification rate
    }

    streamStore.addCIDLog(cidLog)
  }

  private simulateSystemMetrics() {
    const systemStore = useSystemStore.getState()
    const streamStore = useStreamStore.getState()
    const agentStore = useAgentStore.getState()
    const consensusStore = useConsensusStore.getState()

    const agents = agentStore.agents
    const events = streamStore.events
    const consensus = consensusStore.consensusLogs

    systemStore.updateMetrics({
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      averageTrustScore: agents.length > 0 
        ? agents.reduce((sum, a) => sum + a.trustScore, 0) / agents.length 
        : 0,
      totalEvents: events.length,
      lastBlockNumber: Math.max(...events.map(e => e.blockNumber), 156789),
      consensusCount: consensus.length
    })
  }

  private simulateTextStream() {
    const streamStore = useStreamStore.getState()
    const agentStore = useAgentStore.getState()
    const agents = agentStore.agents

    if (agents.length === 0) return

    const agent = agents[Math.floor(Math.random() * agents.length)]
    const messages = [
      'Processing transaction validation...',
      'Analyzing consensus parameters...',
      'Verifying agent signatures...',
      'Computing trust score updates...',
      'Monitoring blockchain events...',
      'Optimizing decision algorithms...',
      'Scanning for anomalies...',
      'Updating verification protocols...'
    ]

    const message = messages[Math.floor(Math.random() * messages.length)]
    streamStore.updateTextStream(agent.id, message)

    // Clear stream after 10 seconds
    setTimeout(() => {
      streamStore.clearStream(agent.id)
    }, 10000)
  }

  isActive(): boolean {
    return this.isRunning
  }
}

// Singleton instance
export const dataSimulator = new DataSimulator()

// React hook for data simulation
export function useDataSimulator() {
  return {
    start: () => dataSimulator.start(),
    stop: () => dataSimulator.stop(),
    isActive: () => dataSimulator.isActive()
  }
} 