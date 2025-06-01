// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard v2)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: CID browser page for IPFS content identifier management
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Database, Search, Download, CheckCircle, AlertCircle, FileText, Copy } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { useStreamStore, useAgentStore } from "@/lib/stores"

export default function CIDsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { cidLogs } = useStreamStore()
  const { getAgentById } = useAgentStore()

  const cidMetrics = useMemo(() => {
    const filteredCIDs = cidLogs.filter(cid =>
      cid.cid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cid.contentType.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const verifiedCIDs = cidLogs.filter(c => c.verified)
    const totalSize = cidLogs.reduce((sum, c) => sum + c.size, 0)
    const verificationRate = cidLogs.length > 0
      ? (verifiedCIDs.length / cidLogs.length) * 100
      : 0

    return {
      filteredCIDs,
      totalCIDs: cidLogs.length,
      verifiedCIDs: verifiedCIDs.length,
      totalSize,
      verificationRate
    }
  }, [cidLogs, searchQuery])

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "CID Browser", icon: <Database className="w-4 h-4" /> }
  ]

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Layout title="CID Browser" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">CID Browser</h1>
            <p className="text-white/70">IPFS content identifier management</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search CIDs..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/40"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Add CID
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{cidMetrics.totalCIDs}</div>
                  <div className="text-sm text-white/60">Total CIDs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{cidMetrics.verifiedCIDs}</div>
                  <div className="text-sm text-white/60">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatSize(cidMetrics.totalSize)}
                  </div>
                  <div className="text-sm text-white/60">Total Size</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {cidMetrics.verificationRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-white/60">Verification Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CID List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Content Identifiers
            </CardTitle>
            <CardDescription>IPFS content stored and managed by agents</CardDescription>
          </CardHeader>
          <CardContent>
            {cidMetrics.filteredCIDs.length > 0 ? (
              <div className="space-y-4">
                {cidMetrics.filteredCIDs.map((cid, index) => {
                  const agent = getAgentById(cid.agentId)
                  
                  return (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cid.verified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-white font-mono text-sm truncate">{cid.cid}</div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(cid.cid)}
                                className="text-white/60 hover:text-white p-1 h-auto"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-white/60 text-sm">{cid.contentType}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`border ${cid.verified ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                            {cid.verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <Button variant="outline" size="sm" className="glass">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-white/70">Agent</div>
                          <div className="text-white font-medium">
                            {agent?.name || `Agent ${cid.agentId.slice(0, 8)}...`}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70">Size</div>
                          <div className="text-white font-medium">{formatSize(cid.size)}</div>
                        </div>
                        <div>
                          <div className="text-white/70">Timestamp</div>
                          <div className="text-white font-medium">
                            {new Date(cid.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70">Metadata</div>
                          <div className="text-white font-medium">
                            {Object.keys(cid.metadata || {}).length} fields
                          </div>
                        </div>
                      </div>

                      {/* Metadata Details */}
                      {cid.metadata && Object.keys(cid.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-white/70 text-sm mb-2">Metadata:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {Object.entries(cid.metadata).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-white/60">{key}:</span>
                                <span className="text-white truncate ml-2">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'No CIDs found' : 'No CIDs available'}
                </h3>
                <p className="text-white/60">
                  {searchQuery 
                    ? `No CIDs match "${searchQuery}". Try a different search term.`
                    : "Content identifiers will appear here as agents store data on IPFS."
                  }
                </p>
                {!searchQuery && (
                  <div className="mt-4 text-sm text-white/50">
                    Connect agents and enable IPFS storage to start seeing CIDs
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CID Analytics */}
        {cidMetrics.totalCIDs > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Storage Analytics
              </CardTitle>
              <CardDescription>Content storage patterns and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-white/70 text-sm mb-2">Content Types</div>
                  <div className="space-y-2">
                    {Array.from(new Set(cidLogs.map(c => c.contentType))).map(type => {
                      const count = cidLogs.filter(c => c.contentType === type).length
                      const percentage = (count / cidLogs.length) * 100
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{type}</span>
                            <span className="text-white/70">{count}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-white/70 text-sm mb-2">Storage by Agent</div>
                  <div className="space-y-2">
                    {Array.from(new Set(cidLogs.map(c => c.agentId))).slice(0, 3).map(agentId => {
                      const agent = getAgentById(agentId)
                      const count = cidLogs.filter(c => c.agentId === agentId).length
                      const percentage = (count / cidLogs.length) * 100
                      return (
                        <div key={agentId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white truncate">
                              {agent?.name || `Agent ${agentId.slice(0, 8)}...`}
                            </span>
                            <span className="text-white/70">{count}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-white/70 text-sm mb-2">Recent Activity</div>
                  <div className="space-y-2">
                    <div className="text-white font-medium">
                      {cidLogs.length > 0 ? new Date(Math.max(...cidLogs.map(c => c.timestamp.getTime()))).toLocaleDateString() : 'No activity'}
                    </div>
                    <div className="text-white/60 text-sm">Last upload</div>
                    <div className="text-white font-medium">
                      {formatSize(cidMetrics.totalSize / Math.max(1, cidLogs.length))}
                    </div>
                    <div className="text-white/60 text-sm">Average size</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
} 