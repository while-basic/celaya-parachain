// ----------------------------------------------------------------------------
//  File:        BlockchainMonitor.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Real-time blockchain monitoring with IPFS integration
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Link, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Hash,
  FileText,
  Globe,
  Zap,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSystemStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

interface BlockchainTransaction {
  hash: string
  blockHash?: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: Date
  gasUsed?: number
  error?: string
  type: 'insight' | 'consensus' | 'agent_registration'
}

interface CIDRecord {
  cid: string
  size: number
  path: string
  timestamp: Date
  type: 'insight' | 'file' | 'json'
}

export function BlockchainMonitor() {
  const { addNotification } = useSystemStore()
  
  const [blockchainStatus, setBlockchainStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [ipfsStatus, setIPFSStatus] = useState<boolean>(false)
  const [lastBlockNumber, setLastBlockNumber] = useState<number>(0)
  const [networkInfo, setNetworkInfo] = useState({
    chainName: 'C-Suite Parachain',
    version: '2.1.0',
    peerId: '12D3KooWXYZ...'
  })
  
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [cidRecords, setCidRecords] = useState<CIDRecord[]>([])

  // Initialize blockchain connection
  useEffect(() => {
    const initializeBlockchain = async () => {
      setBlockchainStatus('connecting')
      
      try {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Mock successful connection (80% success rate)
        if (Math.random() > 0.2) {
          setBlockchainStatus('connected')
          setLastBlockNumber(Math.floor(Math.random() * 1000000) + 500000)
          setNetworkInfo({
            chainName: 'C-Suite Parachain',
            version: '2.1.0',
            peerId: `12D3KooW${Math.random().toString(36).substr(2, 20)}...`
          })
          
          // Initialize IPFS
          setTimeout(() => {
            setIPFSStatus(true)
            addNotification({
              type: 'success',
              title: 'Blockchain Connected',
              message: 'Successfully connected to C-Suite parachain and IPFS network'
            })
          }, 500)
          
        } else {
          setBlockchainStatus('error')
          addNotification({
            type: 'error',
            title: 'Connection Failed',
            message: 'Failed to connect to blockchain network'
          })
        }
      } catch (error) {
        setBlockchainStatus('error')
        addNotification({
          type: 'error',
          title: 'Blockchain Error',
          message: 'An error occurred during blockchain initialization'
        })
      }
    }

    initializeBlockchain()
  }, [addNotification])

  // Simulate blockchain activity
  useEffect(() => {
    if (blockchainStatus !== 'connected') return

    const interval = setInterval(() => {
      // Update block number
      setLastBlockNumber(prev => prev + 1)

      // Occasionally add new transactions
      if (Math.random() > 0.7) {
        const newTx: BlockchainTransaction = {
          hash: `0x${Math.random().toString(16).slice(2, 18)}`,
          status: 'pending',
          timestamp: new Date(),
          type: ['insight', 'consensus', 'agent_registration'][Math.floor(Math.random() * 3)] as any,
          gasUsed: Math.floor(Math.random() * 500000) + 100000
        }
        
        setTransactions(prev => [newTx, ...prev.slice(0, 9)])
        
        // Simulate confirmation
        setTimeout(() => {
          setTransactions(prev => prev.map(tx => 
            tx.hash === newTx.hash 
              ? { 
                  ...tx, 
                  status: Math.random() > 0.1 ? 'confirmed' : 'failed',
                  blockHash: `0x${Math.random().toString(16).slice(2, 18)}`
                }
              : tx
          ))
        }, 2000 + Math.random() * 3000)
      }

      // Occasionally add CID records
      if (Math.random() > 0.8) {
        const newCid: CIDRecord = {
          cid: `Qm${Math.random().toString(16).slice(2, 46)}`,
          size: Math.floor(Math.random() * 100000) + 1000,
          path: `/ipfs/Qm${Math.random().toString(16).slice(2, 46)}`,
          timestamp: new Date(),
          type: ['insight', 'file', 'json'][Math.floor(Math.random() * 3)] as any
        }
        
        setCidRecords(prev => [newCid, ...prev.slice(0, 9)])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [blockchainStatus])

  const submitTestInsight = async () => {
    if (blockchainStatus !== 'connected') {
      addNotification({
        type: 'error',
        title: 'Not Connected',
        message: 'Blockchain connection required to submit insights'
      })
      return
    }

    // Create test insight
    const insight = {
      id: `insight_${Date.now()}`,
      summary: 'Test insight for blockchain integration validation',
      agentId: 'test_agent',
      timestamp: new Date().toISOString()
    }

    try {
      // Upload to IPFS first
      addNotification({
        type: 'info',
        title: 'Uploading to IPFS',
        message: 'Uploading insight content to IPFS network...'
      })

      const cid = `Qm${Math.random().toString(16).slice(2, 46)}`
      const cidRecord: CIDRecord = {
        cid,
        size: JSON.stringify(insight).length,
        path: `/ipfs/${cid}`,
        timestamp: new Date(),
        type: 'insight'
      }

      setCidRecords(prev => [cidRecord, ...prev.slice(0, 9)])

      // Submit to blockchain
      const txHash = `0x${Math.random().toString(16).slice(2, 18)}`
      const transaction: BlockchainTransaction = {
        hash: txHash,
        status: 'pending',
        timestamp: new Date(),
        type: 'insight',
        gasUsed: Math.floor(Math.random() * 300000) + 150000
      }

      setTransactions(prev => [transaction, ...prev.slice(0, 9)])

      addNotification({
        type: 'info',
        title: 'Transaction Submitted',
        message: `Insight submitted to blockchain: ${txHash.slice(0, 10)}...`
      })

      // Simulate confirmation
      setTimeout(() => {
        setTransactions(prev => prev.map(tx => 
          tx.hash === txHash 
            ? { 
                ...tx, 
                status: 'confirmed',
                blockHash: `0x${Math.random().toString(16).slice(2, 18)}`
              }
            : tx
        ))

        addNotification({
          type: 'success',
          title: 'Transaction Confirmed',
          message: `Insight successfully recorded on blockchain`
        })
      }, 3000)

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit insight to blockchain'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400'
      case 'connecting': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'connecting': return <Clock className="w-4 h-4 animate-spin" />
      case 'error': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>Blockchain</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={cn("flex items-center space-x-2", getStatusColor(blockchainStatus))}>
                {getStatusIcon(blockchainStatus)}
                <span className="font-medium capitalize">{blockchainStatus}</span>
              </div>
            </div>
            {blockchainStatus === 'connected' && (
              <div className="mt-2 text-sm text-white/60">
                Block #{lastBlockNumber.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>IPFS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={cn("flex items-center space-x-2", ipfsStatus ? 'text-green-400' : 'text-gray-400')}>
                {ipfsStatus ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span className="font-medium">{ipfsStatus ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            {ipfsStatus && (
              <div className="mt-2 text-sm text-white/60">
                {networkInfo.peerId}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Network</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white font-medium">{networkInfo.chainName}</div>
            <div className="text-sm text-white/60">v{networkInfo.version}</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Blockchain Testing</CardTitle>
          <CardDescription>
            Test blockchain and IPFS integration with sample transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              onClick={submitTestInsight}
              disabled={blockchainStatus !== 'connected'}
              className="glass"
            >
              <Zap className="w-4 h-4 mr-2" />
              Submit Test Insight
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>
              Latest blockchain transactions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  No transactions yet
                </div>
              ) : (
                transactions.map((tx) => (
                  <motion.div
                    key={tx.hash}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      tx.status === 'confirmed' ? 'bg-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400'
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-3 h-3 text-white/60" />
                        <span className="text-sm font-mono text-white/90">
                          {tx.hash.slice(0, 10)}...
                        </span>
                        <span className="text-xs text-white/60 capitalize">
                          {tx.type}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        {tx.timestamp.toLocaleTimeString()}
                        {tx.gasUsed && ` • ${tx.gasUsed.toLocaleString()} gas`}
                      </div>
                    </div>
                    
                    <div className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      tx.status === 'confirmed' ? 'bg-green-400/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    )}>
                      {tx.status}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* IPFS CID Records */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>IPFS Records</span>
            </CardTitle>
            <CardDescription>
              Recent content uploaded to IPFS network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cidRecords.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  No IPFS records yet
                </div>
              ) : (
                cidRecords.map((cid) => (
                  <motion.div
                    key={cid.cid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-white/90">
                          {cid.cid.slice(0, 12)}...
                        </span>
                        <span className="text-xs text-white/60 capitalize">
                          {cid.type}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        {cid.timestamp.toLocaleTimeString()}
                        • {(cid.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    
                    <div className="text-xs px-2 py-1 rounded-full bg-blue-400/20 text-blue-400">
                      stored
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 