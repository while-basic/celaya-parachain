// ----------------------------------------------------------------------------
//  File:        cognitions.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: TypeScript definitions for cognition simulation system
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

export interface Agent {
  name: string
  role: string
  trustScore?: number
  capabilities?: string[]
}

export interface CognitionPhase {
  id: string
  name: string
  actions: string[]
  duration?: number
  dependencies?: string[]
}

export interface MemoryPolicy {
  store_insights: boolean
  inject_recap?: string
  retention_period?: number
}

export interface SecurityHooks {
  min_trust_score?: number
  authorized_initiators?: string[]
  required_memories?: string[]
  quorum_required?: boolean
  reputation_penalty_on_fail?: number
}

export interface Cognition {
  id: string
  name: string
  description: string
  category: 'cyclic' | 'debate' | 'introspection' | 'handoff' | 'memory' | 'monitoring' | 'voting' | 'gossip' | 'synthetic' | 'compliance' | 'custom'
  initiator: string
  agents: Agent[]
  phases: CognitionPhase[]
  success_criteria: string
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  memory_policy: MemoryPolicy
  security_hooks?: SecurityHooks
  parameters?: Record<string, any>
  version: string
  created_at: Date
  updated_at: Date
}

export interface CognitionTemplate {
  id: string
  name: string
  description: string
  category: Cognition['category']
  template_phases: Omit<CognitionPhase, 'id'>[]
  required_agents: number
  recommended_agents: string[]
  risk_level: Cognition['risk_level']
  example_use_cases: string[]
}

export interface Log {
  timestamp: Date
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export interface CognitionResult {
  id: string
  cognitionId: string
  cognitionName: string
  execution_id: string
  status: 'success' | 'failure' | 'partial' | 'timeout' | 'error'
  start_time: Date
  end_time: Date
  duration: number
  participating_agents: Agent[]
  phase_results: {
    phase_id: string
    status: 'completed' | 'failed' | 'skipped'
    duration: number
    output?: string
    agent_contributions?: Record<string, any>
  }[]
  insights: string[]
  consensus_score?: number
  trust_impact: Record<string, number>
  memory_artifacts: string[]
  logs: Log[]
  error_message?: string
}

export interface CognitionExecution {
  id: string
  cognition: Cognition
  status: 'pending' | 'running' | 'completed' | 'failed'
  current_phase?: string
  progress: number
  start_time: Date
  estimated_completion?: Date
  real_time_logs: string[]
}

export interface SimulationConfig {
  timeout_seconds: number
  max_retries: number
  failure_handling: 'stop' | 'continue'
  sandbox_mode: boolean
  debug_mode: boolean
} 