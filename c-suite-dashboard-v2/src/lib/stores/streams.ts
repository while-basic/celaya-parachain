// ----------------------------------------------------------------------------
//  File:        streams.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Zustand store for real-time stream management
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WebSocketMessage, BlockchainEvent, CIDLog } from '@/types'

interface StreamStore {
  isConnected: boolean
  events: BlockchainEvent[]
  cidLogs: CIDLog[]
  textStreams: Record<string, string>
  streamStatus: 'idle' | 'connecting' | 'connected' | 'error'
  error: string | null
  
  // Actions
  setConnectionStatus: (status: StreamStore['streamStatus']) => void
  addEvent: (event: BlockchainEvent) => void
  addCIDLog: (cid: CIDLog) => void
  updateTextStream: (agentId: string, text: string) => void
  clearStream: (agentId: string) => void
  processWebSocketMessage: (message: WebSocketMessage) => void
  setError: (error: string | null) => void
  
  // Selectors
  getEventsByType: (section: string) => BlockchainEvent[]
  getRecentEvents: (limit?: number) => BlockchainEvent[]
  getCIDsByAgent: (agentId: string) => CIDLog[]
  getActiveStreams: () => string[]
}

export const useStreamStore = create<StreamStore>()(
  devtools(
    (set, get) => ({
      isConnected: false,
      events: [],
      cidLogs: [],
      textStreams: {},
      streamStatus: 'idle',
      error: null,

      setConnectionStatus: (streamStatus) => set({ 
        streamStatus,
        isConnected: streamStatus === 'connected'
      }),
      
      addEvent: (event) => set((state) => ({
        events: [event, ...state.events].slice(0, 1000) // Keep last 1000 events
      })),
      
      addCIDLog: (cid) => set((state) => ({
        cidLogs: [cid, ...state.cidLogs].slice(0, 500) // Keep last 500 CIDs
      })),
      
      updateTextStream: (agentId, text) => set((state) => ({
        textStreams: {
          ...state.textStreams,
          [agentId]: text
        }
      })),
      
      clearStream: (agentId) => set((state) => {
        const newStreams = { ...state.textStreams }
        delete newStreams[agentId]
        return { textStreams: newStreams }
      }),
      
      processWebSocketMessage: (message) => {
        const { type, data } = message
        
        switch (type) {
          case 'system_event':
            get().addEvent(data)
            break
          case 'cid_log':
            get().addCIDLog(data)
            break
          case 'agent_update':
            // This would update agent store
            break
          case 'consensus_log':
            // This would update consensus store
            break
        }
      },
      
      setError: (error) => set({ error }),
      
      getEventsByType: (section) => {
        const { events } = get()
        return events.filter(event => event.section === section)
      },
      
      getRecentEvents: (limit = 50) => {
        const { events } = get()
        return events.slice(0, limit)
      },
      
      getCIDsByAgent: (agentId) => {
        const { cidLogs } = get()
        return cidLogs.filter(cid => cid.agentId === agentId)
      },
      
      getActiveStreams: () => {
        const { textStreams } = get()
        return Object.keys(textStreams)
      },
    }),
    { name: 'stream-store' }
  )
) 