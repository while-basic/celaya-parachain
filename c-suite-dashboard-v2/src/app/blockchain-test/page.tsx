// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Blockchain connection test page for debugging live data
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { blockchainService } from "@/lib/services/blockchain"
import { useStreamStore, useAgentStore, useConsensusStore } from "@/lib/stores"
import { RefreshCw, Play, Pause } from "lucide-react"

export default function BlockchainTestPage() {
  const { streamStatus, events, cidLogs } = useStreamStore()
  const { agents } = useAgentStore()
  const { consensusLogs } = useConsensusStore()
  
  const [isPolling, setIsPolling] = useState(false)
  const [blockNumber, setBlockNumber] = useState(0)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [connectionLog, setConnectionLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setConnectionLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 10)])
  }

  useEffect(() => {
    addLog('Page loaded, checking blockchain connection...')
    
    const checkConnection = async () => {
      try {
        const connected = await blockchainService.checkConnection()
        addLog(`Connection check: ${connected ? 'SUCCESS' : 'FAILED'}`)
        
        if (connected) {
          const info = await blockchainService.getSystemInfo()
          setSystemInfo(info)
          addLog(`System info retrieved: ${info?.chain}`)
          
          const header = await blockchainService.getLatestBlock()
          if (header) {
            const blockNum = parseInt(header.number, 16)
            setBlockNumber(blockNum)
            addLog(`Latest block: ${blockNum}`)
          }
        }
      } catch (error) {
        addLog(`Connection error: ${error}`)
      }
    }
    
    checkConnection()
  }, [])

  const handleStartPolling = async () => {
    addLog('Starting blockchain polling...')
    setIsPolling(true)
    try {
      await blockchainService.startPolling()
      addLog('Polling started successfully')
    } catch (error) {
      addLog(`Polling start error: ${error}`)
      setIsPolling(false)
    }
  }

  const handleStopPolling = () => {
    addLog('Stopping blockchain polling...')
    blockchainService.stopPolling()
    setIsPolling(false)
    addLog('Polling stopped')
  }

  const handleTestRPC = async () => {
    addLog('Testing direct RPC call...')
    try {
      const health = await blockchainService.rpcCall('system_health')
      addLog(`RPC test successful: ${JSON.stringify(health)}`)
    } catch (error) {
      addLog(`RPC test failed: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Blockchain Connection Test</h1>
          <p className="text-white/70">Live blockchain data debugging and monitoring</p>
        </div>

        {/* Connection Status */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Connection Status
              <Badge className={`${
                streamStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                streamStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                streamStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {streamStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-white/70 text-sm">Block Number</div>
                <div className="text-white font-mono text-lg">{blockNumber.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Network</div>
                <div className="text-white">{systemInfo?.chain || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Node</div>
                <div className="text-white">{systemInfo?.name || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Health</div>
                <div className="text-white">{systemInfo?.health?.peers || 0} peers</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={isPolling ? handleStopPolling : handleStartPolling}
                className={isPolling ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isPolling ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPolling ? 'Stop' : 'Start'} Polling
              </Button>
              
              <Button onClick={handleTestRPC} variant="outline" className="glass">
                <RefreshCw className="w-4 h-4 mr-2" />
                Test RPC
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agents.length}</div>
              <div className="text-xs text-white/60">
                {agents.filter(a => a.status === 'active').length} active
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-xs text-white/60">blockchain events</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Consensus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{consensusLogs.length}</div>
              <div className="text-xs text-white/60">consensus logs</div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">CIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{cidLogs.length}</div>
              <div className="text-xs text-white/60">content identifiers</div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Log */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white">Connection Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 rounded p-4 font-mono text-sm max-h-64 overflow-y-auto">
              {connectionLog.length > 0 ? (
                connectionLog.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-white/50">No logs yet...</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">Recent Events</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              {events.length > 0 ? (
                events.slice(0, 10).map((event, index) => (
                  <div key={index} className="mb-2 p-2 bg-white/5 rounded">
                    <div className="text-white text-sm font-medium">
                      {event.section}.{event.method}
                    </div>
                    <div className="text-white/60 text-xs">
                      Block {event.blockNumber} • {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-white/50 text-center py-4">No events yet</div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">Agent List</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              {agents.length > 0 ? (
                agents.map((agent) => (
                  <div key={agent.id} className="mb-2 p-2 bg-white/5 rounded">
                    <div className="text-white text-sm font-medium">{agent.name}</div>
                    <div className="text-white/60 text-xs">
                      {agent.status} • Trust: {agent.trustScore.toFixed(1)}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-white/50 text-center py-4">No agents yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 