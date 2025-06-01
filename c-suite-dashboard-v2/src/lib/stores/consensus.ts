// ----------------------------------------------------------------------------
//  File:        consensus.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Zustand store for consensus management
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ConsensusLog } from '@/types'

interface ConsensusStore {
  consensusLogs: ConsensusLog[]
  loading: boolean
  error: string | null
  
  // Actions
  setConsensusLogs: (logs: ConsensusLog[]) => void
  addConsensusLog: (log: ConsensusLog) => void
  updateConsensusLog: (id: string, updates: Partial<ConsensusLog>) => void
  verifySignatures: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Selectors
  getConsensusById: (id: string) => ConsensusLog | undefined
  getRecentConsensus: (limit?: number) => ConsensusLog[]
  getVerifiedConsensus: () => ConsensusLog[]
}

export const useConsensusStore = create<ConsensusStore>()(
  devtools(
    (set, get) => ({
      consensusLogs: [],
      loading: false,
      error: null,

      setConsensusLogs: (consensusLogs) => set({ consensusLogs }),
      
      addConsensusLog: (log) => set((state) => ({
        consensusLogs: [log, ...state.consensusLogs].slice(0, 100) // Keep last 100
      })),
      
      updateConsensusLog: (id, updates) => set((state) => ({
        consensusLogs: state.consensusLogs.map(log =>
          log.id === id ? { ...log, ...updates } : log
        )
      })),
      
      verifySignatures: (id) => set((state) => ({
        consensusLogs: state.consensusLogs.map(log =>
          log.id === id ? { ...log, verified: true } : log
        )
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      getConsensusById: (id) => {
        const { consensusLogs } = get()
        return consensusLogs.find(log => log.id === id)
      },
      
      getRecentConsensus: (limit = 10) => {
        const { consensusLogs } = get()
        return consensusLogs
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit)
      },
      
      getVerifiedConsensus: () => {
        const { consensusLogs } = get()
        return consensusLogs.filter(log => log.verified)
      },
    }),
    { name: 'consensus-store' }
  )
) 