// Blockchain Integration Types
export interface InsightRecord {
  id: string
  contentHash: string
  ipfsCid: string
  summary: string
  signature: string
  timestamp: string
  agentId: string
  metadata?: Record<string, any>
}

export interface BlockchainTransaction {
  hash: string
  blockHash?: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: Date
  gasUsed?: number
  error?: string
}

export interface IPFSUploadResult {
  cid: string
  size: number
  path: string
  timestamp: Date
}

// Agent Runtime Interface
export interface AgentRuntime {
  id: string
  status: 'online' | 'offline' | 'processing'
  lastHeartbeat: Date
  capabilities: string[]
  currentTask?: string
  performanceMetrics: {
    tasksCompleted: number
    averageResponseTime: number
    errorRate: number
  }
}

// Consensus and Voting
export interface Vote {
  agentId: string
  decision: 'approve' | 'reject' | 'abstain'
  confidence: number
  signature: string
  timestamp: Date
}

export interface ConsensusProposal {
  id: string
  type: 'insight' | 'decision' | 'update'
  content: string
  proposer: string
  votes: Vote[]
  status: 'pending' | 'approved' | 'rejected'
  threshold: number
  deadline: Date
} 