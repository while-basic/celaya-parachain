// ----------------------------------------------------------------------------
//  File:        websocket.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: WebSocket client manager for real-time communication
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

// Temporarily disable Socket.IO to prevent connection errors in demo mode
// import { io, Socket } from 'socket.io-client'
import { useStreamStore, useAgentStore, useConsensusStore, useSystemStore } from '@/lib/stores'
import type { WebSocketMessage, Agent, ConsensusLog, BlockchainEvent, CIDLog } from '@/types'

// Mock Socket interface for demo mode
interface MockSocket {
  connected: boolean
  on: (event: string, handler: Function) => void
  emit: (event: string, data?: any) => void
  disconnect: () => void
}

class WebSocketManager {
  private socket: MockSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 2000
  private isConnecting = false
  private connectionEnabled = false

  connect(url: string = 'ws://localhost:8080') {
    // Demo mode - no actual connections
    console.log('WebSocket connect called but running in demo mode')
    
    // Set status to idle instead of attempting connection
    useStreamStore.getState().setConnectionStatus('idle')
    useStreamStore.getState().setError(null)
    
    // Add demo mode notification once
    const systemStore = useSystemStore.getState()
    systemStore.addNotification({
      type: 'info',
      title: 'Demo Mode',
      message: 'Dashboard running in demo mode - real-time server not required'
    })
  }

  private handleConnectionFailure() {
    this.isConnecting = false
    this.connectionEnabled = false
    useStreamStore.getState().setConnectionStatus('idle')
    useStreamStore.getState().setError(null)
  }

  enableConnection() {
    this.connectionEnabled = true
    console.log('WebSocket connection enabled (demo mode)')
  }

  disableConnection() {
    this.connectionEnabled = false
    this.disconnect()
  }

  private setupEventHandlers() {
    // No-op in demo mode
  }

  private handleAgentUpdate(data: Agent) {
    const agentStore = useAgentStore.getState()
    agentStore.updateAgent(data.id, data)
    
    // Update system metrics
    const systemStore = useSystemStore.getState()
    const agents = agentStore.agents
    systemStore.updateMetrics({
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      averageTrustScore: agents.reduce((sum, a) => sum + a.trustScore, 0) / agents.length
    })
    
    // Add notification for significant changes
    if (data.trustScore < 70) {
      systemStore.addNotification({
        type: 'warning',
        title: 'Low Trust Score',
        message: `Agent ${data.name} trust score dropped to ${data.trustScore}%`
      })
    }
  }

  private handleConsensusLog(data: ConsensusLog) {
    const consensusStore = useConsensusStore.getState()
    consensusStore.addConsensusLog(data)
    
    // Update system metrics
    const systemStore = useSystemStore.getState()
    systemStore.updateMetrics({
      consensusCount: consensusStore.consensusLogs.length
    })
    
    // Add notification
    systemStore.addNotification({
      type: 'info',
      title: 'New Consensus',
      message: `Consensus decision recorded with strength ${data.strength}`
    })
  }

  private handleBlockchainEvent(data: BlockchainEvent) {
    const streamStore = useStreamStore.getState()
    streamStore.addEvent(data)
    
    // Update system metrics
    const systemStore = useSystemStore.getState()
    systemStore.updateMetrics({
      totalEvents: streamStore.events.length,
      lastBlockNumber: data.blockNumber
    })
  }

  private handleCIDLog(data: CIDLog) {
    const streamStore = useStreamStore.getState()
    streamStore.addCIDLog(data)
    
    // Add notification for verified CIDs
    if (data.verified) {
      const systemStore = useSystemStore.getState()
      systemStore.addNotification({
        type: 'success',
        title: 'CID Verified',
        message: `Content ${data.cid.substring(0, 8)}... verified by ${data.agentId}`
      })
    }
  }

  private handleSystemMetrics(data: any) {
    const systemStore = useSystemStore.getState()
    systemStore.updateMetrics(data)
  }

  private handleTextStream(data: { agentId: string; text: string }) {
    const streamStore = useStreamStore.getState()
    streamStore.updateTextStream(data.agentId, data.text)
  }

  subscribe(channel: string) {
    console.log(`Subscribe to ${channel} (demo mode)`)
  }

  unsubscribe(channel: string) {
    console.log(`Unsubscribe from ${channel} (demo mode)`)
  }

  send(message: WebSocketMessage) {
    console.log('WebSocket message not sent (demo mode):', message)
    return false
  }

  disconnect() {
    console.log('WebSocket disconnect (demo mode)')
    this.isConnecting = false
    useStreamStore.getState().setConnectionStatus('idle')
  }

  isConnected(): boolean {
    return false // Always false in demo mode
  }
}

const wsManager = new WebSocketManager()

export function useWebSocket(autoConnect = false) {
  // Demo mode - no auto-connect
  return {
    connect: () => {
      wsManager.enableConnection()
      wsManager.connect()
    },
    disconnect: () => wsManager.disconnect(),
    send: (message: WebSocketMessage) => wsManager.send(message),
    subscribe: (channel: string) => wsManager.subscribe(channel),
    unsubscribe: (channel: string) => wsManager.unsubscribe(channel),
    isConnected: wsManager.isConnected(),
    status: useStreamStore(state => state.streamStatus)
  }
} 