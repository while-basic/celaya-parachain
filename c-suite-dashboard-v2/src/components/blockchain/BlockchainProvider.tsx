// ----------------------------------------------------------------------------
//  File:        BlockchainProvider.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Provider component for blockchain connectivity and live data
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useEffect, useState } from 'react'
import { blockchainService } from '@/lib/services/blockchain'
import { useStreamStore } from '@/lib/stores/streams'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

interface BlockchainProviderProps {
  children: React.ReactNode
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  const { streamStatus, error, setError } = useStreamStore()
  const [blockNumber, setBlockNumber] = useState<number>(0)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  
  useEffect(() => {
    // Initialize blockchain connection
    const initializeBlockchain = async () => {
      try {
        // Start the polling service
        await blockchainService.startPolling()
        
        // Get initial system info
        const info = await blockchainService.getSystemInfo()
        setSystemInfo(info)
        
        // Start block number tracking
        const updateBlockNumber = async () => {
          try {
            const header = await blockchainService.getLatestBlock()
            if (header) {
              setBlockNumber(parseInt(header.number, 16))
            }
          } catch (error) {
            console.error('Failed to get block number:', error)
          }
        }
        
        updateBlockNumber()
        const interval = setInterval(updateBlockNumber, 5000)
        
        return () => clearInterval(interval)
      } catch (error) {
        console.error('Failed to initialize blockchain:', error)
        setError(`Initialization failed: ${error}`)
      }
    }

    initializeBlockchain()
    
    // Cleanup on unmount
    return () => {
      blockchainService.stopPolling()
    }
  }, [setError])

  const handleReconnect = async () => {
    setError(null)
    await blockchainService.startPolling()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'connecting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'connecting': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Blockchain Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`border ${getStatusColor(streamStatus)}`}>
                {getStatusIcon(streamStatus)}
                <span className="ml-2 capitalize">{streamStatus}</span>
              </Badge>
              
              {streamStatus === 'connected' && (
                <>
                  <div className="text-sm text-white/70">
                    Block: <span className="text-white font-mono">{blockNumber.toLocaleString()}</span>
                  </div>
                  
                  {systemInfo && (
                    <div className="text-sm text-white/70">
                      Network: <span className="text-white">{systemInfo.chain}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {error && (
                <div className="text-sm text-red-400 max-w-md truncate">
                  {error}
                </div>
              )}
              
              {streamStatus === 'error' && (
                <Button
                  onClick={handleReconnect}
                  size="sm"
                  variant="outline"
                  className="glass text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reconnect
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content with top padding to account for status bar */}
      <div className="pt-12">
        {children}
      </div>
      
      {/* Connection Error Modal */}
      {streamStatus === 'error' && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="glass max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Blockchain Connection Lost
              </h3>
              <p className="text-white/70 mb-4">
                Unable to connect to the live blockchain. Make sure your zombienet is running.
              </p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setError(null)}
                  variant="outline"
                  className="glass"
                >
                  Dismiss
                </Button>
                <Button
                  onClick={handleReconnect}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
} 