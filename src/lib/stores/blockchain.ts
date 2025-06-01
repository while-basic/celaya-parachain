// ----------------------------------------------------------------------------
//  File:        blockchain.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Blockchain integration store for C-Suite parachain connectivity
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { InsightRecord, BlockchainTransaction, IPFSUploadResult } from '@/types'

interface BlockchainConfig {
  wsEndpoint: string
  agentAccount?: string
  enableIPFS: boolean
  ipfsGateway: string
}

interface BlockchainState {
  // Connection State
  isConnected: boolean
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  lastBlockNumber: number
  networkInfo: {
    chainName: string
    version: string
    peerId?: string
  }

  // Configuration
  config: BlockchainConfig

  // Transaction Management
  pendingTransactions: BlockchainTransaction[]
  confirmedTransactions: BlockchainTransaction[]
  
  // IPFS Integration
  ipfsConnected: boolean
  cidRegistry: Map<string, IPFSUploadResult>
  
  // Insight Records
  insightRecords: InsightRecord[]
  
  // Agent Runtime Connectivity
  runtimeConnections: Map<string, {
    agentId: string
    status: 'online' | 'offline' | 'processing'
    lastHeartbeat: Date
    capabilities: string[]
  }>

  // Actions
  setConnectionStatus: (status: BlockchainState['connectionStatus']) => void
  setNetworkInfo: (info: Partial<BlockchainState['networkInfo']>) => void
  addTransaction: (transaction: BlockchainTransaction) => void
  updateTransaction: (hash: string, updates: Partial<BlockchainTransaction>) => void
  
  // IPFS Actions
  setIPFSStatus: (connected: boolean) => void
  addCIDRecord: (cid: string, result: IPFSUploadResult) => void
  getCIDRecord: (cid: string) => IPFSUploadResult | undefined
  
  // Insight Management
  addInsightRecord: (insight: InsightRecord) => void
  updateInsightRecord: (id: string, updates: Partial<InsightRecord>) => void
  
  // Agent Runtime
  updateRuntimeConnection: (agentId: string, connection: BlockchainState['runtimeConnections']['get']) => void
  
  // Blockchain Operations
  submitInsightToBlockchain: (insight: InsightRecord) => Promise<string>
  uploadToIPFS: (content: any, type: 'insight' | 'file' | 'json') => Promise<string>
  
  // Initialization
  initialize: (config: BlockchainConfig) => Promise<boolean>
  disconnect: () => Promise<void>
}

export const useBlockchainStore = create<BlockchainState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    isConnected: false,
    connectionStatus: 'disconnected',
    lastBlockNumber: 0,
    networkInfo: {
      chainName: 'C-Suite Parachain',
      version: '1.0.0'
    },
    
    config: {
      wsEndpoint: 'ws://localhost:9944',
      enableIPFS: true,
      ipfsGateway: 'https://ipfs.io/ipfs/'
    },
    
    pendingTransactions: [],
    confirmedTransactions: [],
    
    ipfsConnected: false,
    cidRegistry: new Map(),
    
    insightRecords: [],
    runtimeConnections: new Map(),

    // Connection Management
    setConnectionStatus: (status) => set({ connectionStatus: status, isConnected: status === 'connected' }),
    
    setNetworkInfo: (info) => set((state) => ({
      networkInfo: { ...state.networkInfo, ...info }
    })),

    // Transaction Management
    addTransaction: (transaction) => set((state) => ({
      pendingTransactions: [...state.pendingTransactions, transaction]
    })),

    updateTransaction: (hash, updates) => set((state) => {
      const pendingIndex = state.pendingTransactions.findIndex(tx => tx.hash === hash)
      const confirmedIndex = state.confirmedTransactions.findIndex(tx => tx.hash === hash)
      
      if (pendingIndex !== -1) {
        const updatedTx = { ...state.pendingTransactions[pendingIndex], ...updates }
        const newPending = [...state.pendingTransactions]
        newPending[pendingIndex] = updatedTx
        
        // Move to confirmed if status changed
        if (updates.status === 'confirmed') {
          newPending.splice(pendingIndex, 1)
          return {
            pendingTransactions: newPending,
            confirmedTransactions: [...state.confirmedTransactions, updatedTx]
          }
        }
        
        return { pendingTransactions: newPending }
      }
      
      if (confirmedIndex !== -1) {
        const newConfirmed = [...state.confirmedTransactions]
        newConfirmed[confirmedIndex] = { ...newConfirmed[confirmedIndex], ...updates }
        return { confirmedTransactions: newConfirmed }
      }
      
      return state
    }),

    // IPFS Management
    setIPFSStatus: (connected) => set({ ipfsConnected: connected }),
    
    addCIDRecord: (cid, result) => set((state) => {
      const newRegistry = new Map(state.cidRegistry)
      newRegistry.set(cid, result)
      return { cidRegistry: newRegistry }
    }),
    
    getCIDRecord: (cid) => get().cidRegistry.get(cid),

    // Insight Management
    addInsightRecord: (insight) => set((state) => ({
      insightRecords: [...state.insightRecords, insight]
    })),

    updateInsightRecord: (id, updates) => set((state) => ({
      insightRecords: state.insightRecords.map(insight =>
        insight.id === id ? { ...insight, ...updates } : insight
      )
    })),

    // Runtime Connections
    updateRuntimeConnection: (agentId, connection) => set((state) => {
      const newConnections = new Map(state.runtimeConnections)
      if (connection) {
        newConnections.set(agentId, connection as any)
      } else {
        newConnections.delete(agentId)
      }
      return { runtimeConnections: newConnections }
    }),

    // Blockchain Operations (Simulated for now)
    submitInsightToBlockchain: async (insight) => {
      const state = get()
      
      // Generate transaction hash
      const txHash = `0x${Math.random().toString(16).slice(2, 18)}`
      
      // Create transaction record
      const transaction: BlockchainTransaction = {
        hash: txHash,
        status: 'pending',
        timestamp: new Date(),
        gasUsed: Math.floor(Math.random() * 1000000) + 100000
      }
      
      // Add to pending transactions
      state.addTransaction(transaction)
      
      // Simulate blockchain submission delay
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          state.updateTransaction(txHash, {
            status: 'confirmed',
            blockHash: `0x${Math.random().toString(16).slice(2, 18)}`
          })
          console.log(`✅ Insight ${insight.id} confirmed on blockchain: ${txHash}`)
        } else {
          state.updateTransaction(txHash, {
            status: 'failed',
            error: 'Transaction failed due to insufficient gas'
          })
          console.log(`❌ Insight ${insight.id} failed on blockchain: ${txHash}`)
        }
      }, 2000 + Math.random() * 3000) // 2-5 second delay
      
      return txHash
    },

    uploadToIPFS: async (content, type) => {
      const state = get()
      
      // Generate mock CID
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content)
      const hash = contentStr.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      
      const cid = `Qm${Math.abs(hash).toString(16).padStart(44, '0').slice(0, 44)}`
      
      // Create IPFS result
      const result: IPFSUploadResult = {
        cid,
        size: contentStr.length,
        path: `/ipfs/${cid}`,
        timestamp: new Date()
      }
      
      // Store in registry
      state.addCIDRecord(cid, result)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500))
      
      console.log(`📤 Content uploaded to IPFS: ${cid} (${type})`)
      return cid
    },

    // Initialization
    initialize: async (config) => {
      set({ config, connectionStatus: 'connecting' })
      
      try {
        console.log('🔗 Initializing blockchain connection...')
        console.log(`📍 Endpoint: ${config.wsEndpoint}`)
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock successful connection
        const success = Math.random() > 0.2 // 80% success rate
        
        if (success) {
          set({
            connectionStatus: 'connected',
            isConnected: true,
            lastBlockNumber: Math.floor(Math.random() * 1000000) + 500000,
            networkInfo: {
              chainName: 'C-Suite Parachain',
              version: '2.1.0',
              peerId: `12D3KooW${Math.random().toString(36).substr(2, 40)}`
            }
          })
          
          // Initialize IPFS if enabled
          if (config.enableIPFS) {
            setTimeout(() => {
              set({ ipfsConnected: true })
              console.log('🌐 IPFS client connected')
            }, 500)
          }
          
          console.log('✅ Blockchain connection established')
          return true
        } else {
          set({ connectionStatus: 'error' })
          console.error('❌ Failed to connect to blockchain')
          return false
        }
      } catch (error) {
        set({ connectionStatus: 'error' })
        console.error('❌ Blockchain initialization error:', error)
        return false
      }
    },

    disconnect: async () => {
      set({
        isConnected: false,
        connectionStatus: 'disconnected',
        ipfsConnected: false,
        lastBlockNumber: 0
      })
      
      console.log('🔌 Blockchain disconnected')
    }
  }))
)

// Subscribe to connection changes for logging
useBlockchainStore.subscribe(
  (state) => state.connectionStatus,
  (status) => {
    console.log(`🔗 Blockchain connection status: ${status}`)
  }
)

// Subscribe to new transactions
useBlockchainStore.subscribe(
  (state) => state.confirmedTransactions.length,
  (count) => {
    if (count > 0) {
      const latest = useBlockchainStore.getState().confirmedTransactions[count - 1]
      console.log(`📦 Transaction confirmed: ${latest.hash}`)
    }
  }
) 