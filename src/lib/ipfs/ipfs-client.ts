// ----------------------------------------------------------------------------
//  File:        ipfs-client.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: IPFS client using Helia for distributed content storage
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { json } from '@helia/json'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import type { Helia } from 'helia'
import type { UnixFS } from '@helia/unixfs'
import type { JSON as HeliaJSON } from '@helia/json'
import type { IPFSUploadResult, InsightRecord } from '@/types'

interface IPFSClientConfig {
  useLocalNode?: boolean
  gatewayUrl?: string
}

export class IPFSClient {
  private helia: Helia | null = null
  private fs: UnixFS | null = null
  private j: HeliaJSON | null = null
  private config: IPFSClientConfig
  private isInitialized = false

  constructor(config: IPFSClientConfig = {}) {
    this.config = {
      useLocalNode: true,
      gatewayUrl: 'https://ipfs.io/ipfs/',
      ...config
    }
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🌐 Initializing IPFS client with Helia...')

      // Create Helia node with in-memory stores (for browser compatibility)
      this.helia = await createHelia({
        blockstore: new MemoryBlockstore(),
        datastore: new MemoryDatastore(),
      })

      // Initialize UnixFS for file operations
      this.fs = unixfs(this.helia)
      
      // Initialize JSON for structured data
      this.j = json(this.helia)

      this.isInitialized = true
      console.log('✅ IPFS client initialized successfully')
      console.log(`📍 Peer ID: ${this.helia.libp2p.peerId.toString()}`)
      
      return true
    } catch (error) {
      console.error('❌ Failed to initialize IPFS client:', error)
      return false
    }
  }

  async uploadInsight(insight: InsightRecord): Promise<IPFSUploadResult | null> {
    if (!this.isInitialized || !this.j) {
      console.error('IPFS client not initialized')
      return null
    }

    try {
      console.log(`📤 Uploading insight to IPFS: ${insight.id}`)
      
      // Prepare insight data for IPFS
      const ipfsData = {
        id: insight.id,
        summary: insight.summary,
        agentId: insight.agentId,
        timestamp: insight.timestamp,
        metadata: insight.metadata || {},
        // Don't include contentHash and signature in IPFS data to avoid circular references
      }

      // Upload as JSON
      const cid = await this.j.add(ipfsData)
      
      const result: IPFSUploadResult = {
        cid: cid.toString(),
        size: JSON.stringify(ipfsData).length,
        path: `/ipfs/${cid.toString()}`,
        timestamp: new Date()
      }

      console.log(`✅ Insight uploaded to IPFS: ${result.cid}`)
      return result
    } catch (error) {
      console.error('❌ Failed to upload insight to IPFS:', error)
      return null
    }
  }

  async uploadFile(content: string | Uint8Array, filename?: string): Promise<IPFSUploadResult | null> {
    if (!this.isInitialized || !this.fs) {
      console.error('IPFS client not initialized')
      return null
    }

    try {
      console.log(`📤 Uploading file to IPFS: ${filename || 'unnamed'}`)
      
      // Convert string to Uint8Array if needed
      const data = typeof content === 'string' ? new TextEncoder().encode(content) : content
      
      // Upload file
      const cid = await this.fs.addFile({ content: data })
      
      const result: IPFSUploadResult = {
        cid: cid.toString(),
        size: data.length,
        path: `/ipfs/${cid.toString()}${filename ? `/${filename}` : ''}`,
        timestamp: new Date()
      }

      console.log(`✅ File uploaded to IPFS: ${result.cid}`)
      return result
    } catch (error) {
      console.error('❌ Failed to upload file to IPFS:', error)
      return null
    }
  }

  async uploadJSON(data: any): Promise<IPFSUploadResult | null> {
    if (!this.isInitialized || !this.j) {
      console.error('IPFS client not initialized')
      return null
    }

    try {
      console.log('📤 Uploading JSON to IPFS')
      
      const cid = await this.j.add(data)
      
      const result: IPFSUploadResult = {
        cid: cid.toString(),
        size: JSON.stringify(data).length,
        path: `/ipfs/${cid.toString()}`,
        timestamp: new Date()
      }

      console.log(`✅ JSON uploaded to IPFS: ${result.cid}`)
      return result
    } catch (error) {
      console.error('❌ Failed to upload JSON to IPFS:', error)
      return null
    }
  }

  async retrieveInsight(cid: string): Promise<InsightRecord | null> {
    if (!this.isInitialized || !this.j) {
      console.error('IPFS client not initialized')
      return null
    }

    try {
      console.log(`📥 Retrieving insight from IPFS: ${cid}`)
      
      const data = await this.j.get(cid)
      
      // Reconstruct insight record
      const insight: InsightRecord = {
        id: data.id,
        contentHash: '', // Will be computed separately
        ipfsCid: cid,
        summary: data.summary,
        signature: '', // Will be retrieved from blockchain
        timestamp: data.timestamp,
        agentId: data.agentId,
        metadata: data.metadata
      }

      console.log(`✅ Insight retrieved from IPFS: ${insight.id}`)
      return insight
    } catch (error) {
      console.error('❌ Failed to retrieve insight from IPFS:', error)
      return null
    }
  }

  async retrieveFile(cid: string): Promise<Uint8Array | null> {
    if (!this.isInitialized || !this.fs) {
      console.error('IPFS client not initialized')
      return null
    }

    try {
      console.log(`📥 Retrieving file from IPFS: ${cid}`)
      
      const chunks: Uint8Array[] = []
      for await (const chunk of this.fs.cat(cid)) {
        chunks.push(chunk)
      }
      
      // Concatenate chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0
      
      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }

      console.log(`✅ File retrieved from IPFS: ${cid}`)
      return result
    } catch (error) {
      console.error('❌ Failed to retrieve file from IPFS:', error)
      return null
    }
  }

  async retrieveJSON(cid: string): Promise<any | null> {
    if (!this.isInitialized || !this.j) {
      console.error('IPFS client not initialized')
      return null
    }

    try {
      console.log(`📥 Retrieving JSON from IPFS: ${cid}`)
      
      const data = await this.j.get(cid)
      
      console.log(`✅ JSON retrieved from IPFS: ${cid}`)
      return data
    } catch (error) {
      console.error('❌ Failed to retrieve JSON from IPFS:', error)
      return null
    }
  }

  getGatewayUrl(cid: string): string {
    return `${this.config.gatewayUrl}${cid}`
  }

  isReady(): boolean {
    return this.isInitialized
  }

  async disconnect(): Promise<void> {
    if (this.helia) {
      await this.helia.stop()
      this.helia = null
      this.fs = null
      this.j = null
      this.isInitialized = false
      console.log('🔌 IPFS client disconnected')
    }
  }

  // Generate a mock CID for testing purposes
  static generateMockCID(content: string): string {
    // This is a simplified mock CID generator for testing
    const hash = content.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return `Qm${Math.abs(hash).toString(16).padStart(44, '0').slice(0, 44)}`
  }
}

// Singleton instance
let ipfsClient: IPFSClient | null = null

export const getIPFSClient = (config?: IPFSClientConfig): IPFSClient => {
  if (!ipfsClient) {
    ipfsClient = new IPFSClient(config)
  }
  return ipfsClient
}

export const initializeIPFS = async (config?: IPFSClientConfig): Promise<boolean> => {
  ipfsClient = new IPFSClient(config)
  return await ipfsClient.initialize()
} 