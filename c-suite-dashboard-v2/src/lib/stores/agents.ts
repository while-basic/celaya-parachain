// ----------------------------------------------------------------------------
//  File:        agents.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Zustand store for agent state management
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Agent } from '@/types'

interface AgentStore {
  agents: Agent[]
  loading: boolean
  error: string | null
  
  // Actions
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  updateAgentStatus: (id: string, status: Agent['status']) => void
  updateTrustScore: (id: string, trustScore: number) => void
  removeAgent: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Selectors
  getAgentById: (id: string) => Agent | undefined
  getActiveAgents: () => Agent[]
  getAverageTrustScore: () => number
}

export const useAgentStore = create<AgentStore>()(
  devtools(
    (set, get) => ({
      agents: [],
      loading: false,
      error: null,

      setAgents: (agents) => set({ agents }),
      
      addAgent: (agent) => set((state) => ({
        agents: [...state.agents, agent]
      })),
      
      updateAgent: (id, updates) => set((state) => ({
        agents: state.agents.map(agent =>
          agent.id === id ? { ...agent, ...updates } : agent
        )
      })),
      
      updateAgentStatus: (id, status) => set((state) => ({
        agents: state.agents.map(agent =>
          agent.id === id ? { ...agent, status, lastSeen: new Date() } : agent
        )
      })),
      
      updateTrustScore: (id, trustScore) => set((state) => ({
        agents: state.agents.map(agent =>
          agent.id === id ? { ...agent, trustScore } : agent
        )
      })),
      
      removeAgent: (id) => set((state) => ({
        agents: state.agents.filter(agent => agent.id !== id)
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      getAgentById: (id) => {
        const { agents } = get()
        return agents.find(agent => agent.id === id)
      },
      
      getActiveAgents: () => {
        const { agents } = get()
        return agents.filter(agent => agent.status === 'active')
      },
      
      getAverageTrustScore: () => {
        const { agents } = get()
        if (agents.length === 0) return 0
        const sum = agents.reduce((acc, agent) => acc + agent.trustScore, 0)
        return sum / agents.length
      },
    }),
    { name: 'agent-store' }
  )
) 