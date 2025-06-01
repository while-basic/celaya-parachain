// ----------------------------------------------------------------------------
//  File:        index.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Core TypeScript types and interfaces for the dashboard
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

export interface Agent {
  id: string
  name: string
  trustScore: number
  status: 'active' | 'idle' | 'processing' | 'error'
  capabilities: string[]
  version: string
  lastSeen: Date
  metadata: AgentMetadata
}

export interface AgentMetadata {
  description: string
  specialization: string
  processingPower: number
  responseTime: number
  successRate: number
}

export interface ConsensusLog {
  id: string
  agentId: string
  decision: string
  signatures: Signature[]
  timestamp: Date
  strength: number
  verified: boolean
}

export interface Signature {
  agentId: string
  signature: string
  publicKey: string
  verified: boolean
}

export interface CIDLog {
  cid: string
  contentType: string
  agentId: string
  metadata: Record<string, any>
  timestamp: Date
  size: number
  verified: boolean
}

export interface BlockchainEvent {
  id: string
  blockNumber: number
  extrinsicIndex?: number
  method: string
  section: string
  data: any
  timestamp: Date
}

export interface SystemMetrics {
  totalAgents: number
  activeAgents: number
  averageTrustScore: number
  totalEvents: number
  lastBlockNumber: number
  consensusCount: number
}

export interface WebSocketMessage {
  type: 'agent_update' | 'consensus_log' | 'cid_log' | 'system_event'
  data: any
  timestamp: Date
}

export interface AgentOrbState {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: string
  intensity: number
  pulsing: boolean
} 