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

// Chat Types
export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string // user or agent ID
  senderName: string
  senderType: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  type: 'text' | 'tool_call' | 'tool_result' | 'system_message'
  toolCall?: ToolCall
  toolResult?: ToolResult
  metadata?: {
    cid?: string
    hash?: string
    signed?: boolean
    verified?: boolean
  }
}

export interface ToolCall {
  id: string
  name: string
  category: string
  parameters: Record<string, any>
  requestedBy: string
  timestamp: Date
}

export interface ToolResult {
  id: string
  toolCallId: string
  result: any
  success: boolean
  timestamp: Date
  executionTime: number
  error?: string
  cid?: string
  hash?: string
}

export interface Conversation {
  id: string
  name: string
  type: 'individual' | 'group' | 'all_agents'
  participants: string[] // agent IDs or 'all'
  messages: ChatMessage[]
  createdAt: Date
  lastActivity: Date
  metadata: {
    totalMessages: number
    savedCIDs: string[]
    totalToolCalls: number
    autoSave: boolean
    archived: boolean
  }
}

export interface ChatParticipant {
  id: string
  name: string
  type: 'agent' | 'user'
  status: 'online' | 'offline' | 'typing' | 'processing'
  avatar?: string
  capabilities?: string[]
  lastSeen?: Date
}

export interface AgentGroup {
  id: string
  name: string
  description: string
  agentIds: string[]
  createdAt: Date
  tags: string[]
  color: string
}

export interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  participants: ChatParticipant[]
  groups: AgentGroup[]
  typingIndicators: Record<string, string[]> // conversationId -> typing user IDs
  isConnected: boolean
}

// Tool Categories from all-tools.md
export interface ToolCategory {
  id: string
  name: string
  description: string
  tools: AvailableTool[]
}

export interface AvailableTool {
  id: string
  name: string
  category: string
  description: string
  parameters: ToolParameter[]
  requiredParams: string[]
  examples?: ToolExample[]
}

export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  required: boolean
  default?: any
  options?: string[]
}

export interface ToolExample {
  description: string
  parameters: Record<string, any>
  expectedResult: string
}

// IPFS and Blockchain Storage
export interface SavedInteraction {
  id: string
  conversationId: string
  cid: string
  hash: string
  timestamp: Date
  messageRange: {
    startMessageId: string
    endMessageId: string
  }
  metadata: {
    participantCount: number
    toolCallCount: number
    exportFormat: 'markdown' | 'json'
    fileSize: number
  }
} 