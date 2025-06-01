// ----------------------------------------------------------------------------
//  File:        network-monitor.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Network monitoring and blockchain connectivity interface
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

'use client'

import React, { useState, useEffect } from 'react'

interface NetworkNode {
  id: string
  name: string
  type: 'validator' | 'relay' | 'agent' | 'rpc' | 'peer'
  status: 'online' | 'offline' | 'syncing' | 'error'
  location: string
  latency: number
  throughput: {
    in: number
    out: number
  }
  uptime: number
  version: string
  lastSeen: Date
  connections: number
  syncHeight?: number
  errors?: number
}

interface NetworkConnection {
  id: string
  from: string
  to: string
  type: 'tcp' | 'websocket' | 'http' | 'grpc'
  status: 'active' | 'idle' | 'error'
  bandwidth: number
  packets: {
    sent: number
    received: number
    dropped: number
  }
  security: 'tls' | 'unencrypted' | 'vpn'
  establishedAt: Date
}

interface NetworkMetrics {
  totalNodes: number
  activeConnections: number
  totalThroughput: number
  averageLatency: number
  syncedNodes: number
  networkHealth: number
  blockHeight: number
  lastBlockTime: Date
}

const mockNodes: NetworkNode[] = [
  {
    id: 'node-001',
    name: 'Polkadot Relay Node #1',
    type: 'relay',
    status: 'online',
    location: 'US-East (Virginia)',
    latency: 45,
    throughput: { in: 1250, out: 980 },
    uptime: 99.8,
    version: '1.1.0',
    lastSeen: new Date(),
    connections: 23,
    syncHeight: 18945672
  },
  {
    id: 'node-002',
    name: 'Parachain Validator #1',
    type: 'validator',
    status: 'online',
    location: 'EU-West (Ireland)',
    latency: 89,
    throughput: { in: 890, out: 1120 },
    uptime: 98.5,
    version: '1.1.0',
    lastSeen: new Date(),
    connections: 18,
    syncHeight: 18945672
  },
  {
    id: 'node-003',
    name: 'Agent Network Hub',
    type: 'agent',
    status: 'syncing',
    location: 'Asia-Pacific (Tokyo)',
    latency: 156,
    throughput: { in: 450, out: 320 },
    uptime: 97.2,
    version: '2.0.1',
    lastSeen: new Date(),
    connections: 12,
    syncHeight: 18945650
  },
  {
    id: 'node-004',
    name: 'RPC Gateway',
    type: 'rpc',
    status: 'online',
    location: 'US-West (California)',
    latency: 78,
    throughput: { in: 2100, out: 1850 },
    uptime: 99.9,
    version: '3.1.2',
    lastSeen: new Date(),
    connections: 45,
    errors: 2
  },
  {
    id: 'node-005',
    name: 'Peer Discovery Node',
    type: 'peer',
    status: 'error',
    location: 'EU-Central (Frankfurt)',
    latency: 234,
    throughput: { in: 0, out: 0 },
    uptime: 85.3,
    version: '1.0.8',
    lastSeen: new Date(Date.now() - 300000),
    connections: 0,
    errors: 15
  }
]

const mockConnections: NetworkConnection[] = [
  {
    id: 'conn-001',
    from: 'node-001',
    to: 'node-002',
    type: 'tcp',
    status: 'active',
    bandwidth: 1250,
    packets: { sent: 45890, received: 48120, dropped: 23 },
    security: 'tls',
    establishedAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'conn-002',
    from: 'node-002',
    to: 'node-003',
    type: 'websocket',
    status: 'active',
    bandwidth: 890,
    packets: { sent: 32140, received: 29870, dropped: 8 },
    security: 'tls',
    establishedAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'conn-003',
    from: 'node-004',
    to: 'node-001',
    type: 'grpc',
    status: 'active',
    bandwidth: 2100,
    packets: { sent: 78920, received: 81450, dropped: 45 },
    security: 'tls',
    establishedAt: new Date(Date.now() - 1800000)
  }
]

export function NetworkMonitor() {
  const [nodes, setNodes] = useState<NetworkNode[]>(mockNodes)
  const [connections, setConnections] = useState<NetworkConnection[]>(mockConnections)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    totalNodes: mockNodes.length,
    activeConnections: mockConnections.filter(c => c.status === 'active').length,
    totalThroughput: mockNodes.reduce((sum, node) => sum + node.throughput.in + node.throughput.out, 0),
    averageLatency: mockNodes.reduce((sum, node) => sum + node.latency, 0) / mockNodes.length,
    syncedNodes: mockNodes.filter(node => node.syncHeight === 18945672).length,
    networkHealth: 94.2,
    blockHeight: 18945672,
    lastBlockTime: new Date()
  })
  const [activeView, setActiveView] = useState<'topology' | 'nodes' | 'connections' | 'metrics'>('nodes')

  useEffect(() => {
    // Simulate real-time network updates
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => {
        const latencyChange = (Math.random() - 0.5) * 20
        const throughputChange = (Math.random() - 0.5) * 100
        
        return {
          ...node,
          latency: Math.max(10, Math.min(500, node.latency + latencyChange)),
          throughput: {
            in: Math.max(0, node.throughput.in + throughputChange),
            out: Math.max(0, node.throughput.out + throughputChange)
          },
          lastSeen: node.status === 'online' ? new Date() : node.lastSeen,
          connections: node.status === 'online' ? 
            Math.max(0, node.connections + Math.floor((Math.random() - 0.5) * 3)) : 
            node.connections
        }
      }))

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        networkHealth: Math.max(80, Math.min(100, prev.networkHealth + (Math.random() - 0.5) * 2)),
        blockHeight: prev.blockHeight + (Math.random() > 0.8 ? 1 : 0),
        lastBlockTime: Math.random() > 0.8 ? new Date() : prev.lastBlockTime
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    const colors = {
      'online': 'text-green-600 bg-green-100',
      'offline': 'text-gray-600 bg-gray-100',
      'syncing': 'text-blue-600 bg-blue-100',
      'error': 'text-red-600 bg-red-100',
      'active': 'text-green-600 bg-green-100',
      'idle': 'text-yellow-600 bg-yellow-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      'validator': '🛡️',
      'relay': '🔗',
      'agent': '🤖',
      'rpc': '🌐',
      'peer': '👥'
    }
    return icons[type as keyof typeof icons] || '📡'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDuration = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ago`
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`
    return `${minutes}m ago`
  }

  const connectToNode = (nodeId: string) => {
    // Simulate connecting to a node
    setNodes(prev => prev.map(node => 
      node.id === nodeId && node.status === 'offline'
        ? { ...node, status: 'syncing' as const }
        : node
    ))
  }

  const disconnectNode = (nodeId: string) => {
    // Simulate disconnecting a node
    setNodes(prev => prev.map(node => 
      node.id === nodeId
        ? { ...node, status: 'offline' as const, connections: 0 }
        : node
    ))
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Network Monitor</h1>
            <p className="text-gray-600">Monitor blockchain network and agent connectivity</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Network Health: {metrics.networkHealth.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalNodes}</div>
            <div className="text-xs text-gray-600">Total Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.activeConnections}</div>
            <div className="text-xs text-gray-600">Active Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatBytes(metrics.totalThroughput)}</div>
            <div className="text-xs text-gray-600">Total Throughput</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.averageLatency.toFixed(0)}ms</div>
            <div className="text-xs text-gray-600">Avg Latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{metrics.syncedNodes}</div>
            <div className="text-xs text-gray-600">Synced Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{metrics.blockHeight.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Block Height</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{formatDuration(metrics.lastBlockTime)}</div>
            <div className="text-xs text-gray-600">Last Block</div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-8">
          {[
            { id: 'nodes', label: 'Network Nodes', count: nodes.filter(n => n.status === 'online').length },
            { id: 'connections', label: 'Connections', count: connections.filter(c => c.status === 'active').length },
            { id: 'topology', label: 'Network Topology', count: 0 },
            { id: 'metrics', label: 'Real-time Metrics', count: 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'nodes' && (
            <div className="space-y-4">
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedNode?.id === node.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTypeIcon(node.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(node.status)}`}>
                            {node.status}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full capitalize">
                            {node.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Location:</span> {node.location}
                          </div>
                          <div>
                            <span className="font-medium">Latency:</span> {node.latency}ms
                          </div>
                          <div>
                            <span className="font-medium">Connections:</span> {node.connections}
                          </div>
                          <div>
                            <span className="font-medium">Uptime:</span> {node.uptime.toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">Throughput:</span> ↓{formatBytes(node.throughput.in)} ↑{formatBytes(node.throughput.out)}
                          </div>
                          <div>
                            <span className="font-medium">Version:</span> {node.version}
                          </div>
                          {node.syncHeight && (
                            <div>
                              <span className="font-medium">Sync Height:</span> {node.syncHeight.toLocaleString()}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Last Seen:</span> {formatDuration(node.lastSeen)}
                          </div>
                        </div>
                        {node.errors && node.errors > 0 && (
                          <div className="mt-2 text-sm text-red-600">
                            ⚠️ {node.errors} recent errors detected
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {node.status === 'offline' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            connectToNode(node.id)
                          }}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Connect
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            disconnectNode(node.id)
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Disconnect
                        </button>
                      )}
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'connections' && (
            <div className="space-y-4">
              {connections.map(connection => {
                const fromNode = nodes.find(n => n.id === connection.from)
                const toNode = nodes.find(n => n.id === connection.to)
                
                return (
                  <div key={connection.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🔗</span>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {fromNode?.name} → {toNode?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {connection.type.toUpperCase()} • {connection.security.toUpperCase()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(connection.status)}`}>
                          {connection.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatBytes(connection.bandwidth)}/s</div>
                        <div className="text-sm text-gray-600">Bandwidth</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Packets Sent:</span> {connection.packets.sent.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Packets Received:</span> {connection.packets.received.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Packets Dropped:</span> {connection.packets.dropped}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Established:</span> {formatDuration(connection.establishedAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeView === 'topology' && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Network Topology Visualization</h3>
                <p className="text-gray-600">Interactive network diagram coming soon...</p>
                <div className="mt-4 text-sm text-gray-500">
                  This will show a visual representation of all network nodes and their connections
                </div>
              </div>
            </div>
          )}

          {activeView === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Network Health Over Time</h3>
                  <div className="h-40 flex items-end justify-center">
                    <div className="text-gray-500">📈 Chart placeholder</div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Throughput Distribution</h3>
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-gray-500">📊 Chart placeholder</div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Latency by Region</h3>
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-gray-500">🗺️ Map placeholder</div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-gray-500">🥧 Pie chart placeholder</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="w-96 border-l border-gray-200 bg-gray-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Node Details</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(selectedNode.type)}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedNode.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{selectedNode.type} Node</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedNode.status)}`}>
                    {selectedNode.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Performance</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Latency:</span>
                      <span>{selectedNode.latency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Uptime:</span>
                      <span>{selectedNode.uptime.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Connections:</span>
                      <span>{selectedNode.connections}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Throughput</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Incoming:</span>
                      <span>{formatBytes(selectedNode.throughput.in)}/s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Outgoing:</span>
                      <span>{formatBytes(selectedNode.throughput.out)}/s</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Information</label>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Location:</span> {selectedNode.location}
                    </div>
                    <div>
                      <span className="text-gray-600">Version:</span> {selectedNode.version}
                    </div>
                    <div>
                      <span className="text-gray-600">Last Seen:</span> {formatDuration(selectedNode.lastSeen)}
                    </div>
                    {selectedNode.syncHeight && (
                      <div>
                        <span className="text-gray-600">Sync Height:</span> {selectedNode.syncHeight.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {selectedNode.errors && selectedNode.errors > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">Issues</label>
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {selectedNode.errors} recent errors detected
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 