// ----------------------------------------------------------------------------
//  File:        polkadot-client.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Polkadot blockchain client for C-Suite parachain integration
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import type { ISubmittableResult } from '@polkadot/types/types'
import type { Agent, ConsensusLog, InsightRecord } from '@/types'

interface BlockchainConfig {
  wsEndpoint: string
  agentSeed?: string
}

interface TransactionResult {
  success: boolean
  txHash: string
  blockHash?: string
  events?: any[]
  error?: string
}

export class PolkadotBlockchainClient {
  private api: ApiPromise | null = null
  private keyring: Keyring | null = null
  private agentPair: KeyringPair | null = null
  private config: BlockchainConfig
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(config: BlockchainConfig) {
    this.config = config
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔗 Initializing Polkadot blockchain client...')
      
      // Wait for crypto libraries to be ready
      await cryptoWaitReady()
      
      // Initialize keyring
      this.keyring = new Keyring({ type: 'sr25519' })
      
      // Create agent keypair
      if (this.config.agentSeed) {
        this.agentPair = this.keyring.addFromUri(this.config.agentSeed)
        console.log(`🔑 Agent account: ${this.agentPair.address}`)
      }

      // Connect to blockchain
      return await this.connect()
    } catch (error) {
      console.error('❌ Failed to initialize blockchain client:', error)
      return false
    }
  }

  async connect(): Promise<boolean> {
    try {
      const provider = new WsProvider(this.config.wsEndpoint)
      
      provider.on('connected', () => {
        console.log('🔗 Connected to C-Suite parachain')
        this.isConnected = true
        this.reconnectAttempts = 0
      })

      provider.on('disconnected', () => {
        console.log('⚠️ Disconnected from blockchain')
        this.isConnected = false
        this.scheduleReconnect()
      })

      provider.on('error', (error) => {
        console.error('🚨 Blockchain connection error:', error)
        this.isConnected = false
      })

      // Create API instance
      this.api = await ApiPromise.create({ 
        provider,
        types: {
          // Custom types for C-Suite pallets
          AgentStatus: {
            _enum: ['Online', 'Offline', 'Suspended']
          },
          AgentInfo: {
            role: 'Vec<u8>',
            status: 'AgentStatus',
            trust_score: 'u32',
            last_activity: 'u64',
            capabilities: 'Vec<Vec<u8>>',
            metadata: 'Option<Vec<u8>>'
          },
          ConsensusRecord: {
            record_type: 'ConsensusType',
            content_hash: 'H256',
            ipfs_cid: 'Vec<u8>',
            summary: 'Vec<u8>',
            signature: 'Vec<u8>',
            metadata: 'Vec<u8>'
          },
          ConsensusType: {
            _enum: ['SingleAgentInsight', 'MultiAgentConsensus', 'SystemEvent']
          }
        }
      })

      // Wait for API to be ready
      await this.api.isReady
      
      console.log('✅ Polkadot API ready')
      console.log(`📦 Runtime version: ${this.api.runtimeVersion.specName.toString()} v${this.api.runtimeVersion.specVersion.toString()}`)
      
      this.isConnected = true
      return true

    } catch (error) {
      console.error('❌ Failed to connect to blockchain:', error)
      this.isConnected = false
      return false
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000 // Exponential backoff
    this.reconnectAttempts++

    setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      this.connect()
    }, delay)
  }

  async registerAgent(agentData: Partial<Agent>): Promise<TransactionResult> {
    if (!this.api || !this.agentPair) {
      return { success: false, txHash: '', error: 'Not connected or no keypair' }
    }

    try {
      const tx = this.api.tx.agentRegistry.registerAgent(
        agentData.name || 'Unknown Agent',
        agentData.capabilities || []
      )

      return await this.submitTransaction(tx)
    } catch (error) {
      return { 
        success: false, 
        txHash: '', 
        error: `Failed to register agent: ${error}` 
      }
    }
  }

  async submitConsensusLog(logData: Partial<ConsensusLog>): Promise<TransactionResult> {
    if (!this.api || !this.agentPair) {
      return { success: false, txHash: '', error: 'Not connected or no keypair' }
    }

    try {
      const tx = this.api.tx.consensus.submitConsensusLog(
        logData.cid || '',
        logData.metadata || null
      )

      return await this.submitTransaction(tx)
    } catch (error) {
      return { 
        success: false, 
        txHash: '', 
        error: `Failed to submit consensus log: ${error}` 
      }
    }
  }

  async submitInsightRecord(insight: InsightRecord): Promise<TransactionResult> {
    if (!this.api || !this.agentPair) {
      return { success: false, txHash: '', error: 'Not connected or no keypair' }
    }

    try {
      // Create record for recall pallet
      const record = {
        record_type: { SingleAgentInsight: null },
        content_hash: insight.contentHash,
        ipfs_cid: insight.ipfsCid,
        summary: insight.summary.slice(0, 500), // Limit summary length
        signature: insight.signature,
        metadata: JSON.stringify(insight.metadata || {})
      }

      const tx = this.api.tx.recall.storeConsensusRecord(
        record.record_type,
        record.content_hash,
        record.ipfs_cid,
        record.summary,
        record.signature,
        record.metadata
      )

      return await this.submitTransaction(tx)
    } catch (error) {
      return { 
        success: false, 
        txHash: '', 
        error: `Failed to submit insight record: ${error}` 
      }
    }
  }

  private async submitTransaction(tx: any): Promise<TransactionResult> {
    return new Promise((resolve) => {
      if (!this.agentPair) {
        resolve({ success: false, txHash: '', error: 'No keypair available' })
        return
      }

      tx.signAndSend(this.agentPair, (result: ISubmittableResult) => {
        const { status, events = [], dispatchError } = result

        if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = this.api!.registry.findMetaError(dispatchError.asModule)
            resolve({
              success: false,
              txHash: result.txHash.toString(),
              error: `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`
            })
          } else {
            resolve({
              success: false,
              txHash: result.txHash.toString(),
              error: dispatchError.toString()
            })
          }
        } else if (status.isInBlock) {
          console.log(`📦 Transaction included in block: ${status.asInBlock}`)
          resolve({
            success: true,
            txHash: result.txHash.toString(),
            blockHash: status.asInBlock.toString(),
            events: events.map(record => ({
              phase: record.phase.toString(),
              event: record.event.toString()
            }))
          })
        }
      }).catch((error: any) => {
        resolve({
          success: false,
          txHash: '',
          error: `Transaction failed: ${error}`
        })
      })
    })
  }

  async getAgentInfo(agentId: string): Promise<Agent | null> {
    if (!this.api) return null

    try {
      const agentInfo = await this.api.query.agentRegistry.agents(agentId)
      
      if (agentInfo.isNone) return null

      const agent = agentInfo.unwrap()
      return {
        id: agentId,
        name: agent.role.toString(),
        status: agent.status.toString().toLowerCase() as 'active' | 'idle' | 'processing' | 'error',
        trustScore: agent.trust_score.toNumber() / 100, // Convert from basis points
        capabilities: agent.capabilities.map((cap: any) => cap.toString()),
        version: '1.0.0',
        lastSeen: new Date(agent.last_activity.toNumber()),
        metadata: {
          description: agent.metadata.isSome ? agent.metadata.unwrap().toString() : '',
          specialization: agent.role.toString(),
          processingPower: 85,
          responseTime: 120,
          successRate: agent.trust_score.toNumber() / 100
        }
      }
    } catch (error) {
      console.error('Failed to get agent info:', error)
      return null
    }
  }

  async getConsensusLogs(limit = 10): Promise<ConsensusLog[]> {
    if (!this.api) return []

    try {
      // Query recent consensus logs
      const logs = await this.api.query.consensus.logs.entries()
      
      return logs
        .slice(-limit)
        .map(([key, value]) => {
          const log = value.unwrap()
          return {
            id: key.toString(),
            timestamp: new Date(),
            cid: log.cid.toString(),
            agentsInvolved: log.agents_involved.map((agent: any) => agent.toString()),
            signatures: log.signatures.map((sig: any) => ({
              agent: sig.agent.toString(),
              signature: sig.signature.toString()
            })),
            metadata: log.metadata.isSome ? JSON.parse(log.metadata.unwrap().toString()) : {}
          }
        })
    } catch (error) {
      console.error('Failed to get consensus logs:', error)
      return []
    }
  }

  isReady(): boolean {
    return this.isConnected && this.api !== null
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect()
      this.api = null
      this.isConnected = false
      console.log('🔌 Disconnected from blockchain')
    }
  }
}

// Singleton instance
let blockchainClient: PolkadotBlockchainClient | null = null

export const getBlockchainClient = (config?: BlockchainConfig): PolkadotBlockchainClient => {
  if (!blockchainClient && config) {
    blockchainClient = new PolkadotBlockchainClient(config)
  }
  
  if (!blockchainClient) {
    throw new Error('Blockchain client not initialized')
  }
  
  return blockchainClient
}

export const initializeBlockchain = async (config: BlockchainConfig): Promise<boolean> => {
  blockchainClient = new PolkadotBlockchainClient(config)
  return await blockchainClient.initialize()
} 