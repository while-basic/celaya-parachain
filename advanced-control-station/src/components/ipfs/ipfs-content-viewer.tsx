// ----------------------------------------------------------------------------
//  File:        ipfs-content-viewer.tsx
//  Project:     Celaya Solutions (Parachain Template)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Comprehensive IPFS content viewer with CID input and multiple display modes
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: January 2025
// ----------------------------------------------------------------------------

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Copy, Download, ExternalLink, FileText, Image, Video, Code, Eye } from 'lucide-react'

interface IPFSContent {
  cid: string
  content: string
  contentType: string
  size: number
  timestamp: string
}

interface IPFSViewerProps {
  initialCid?: string
  onContentLoad?: (content: IPFSContent) => void
}

export function IPFSContentViewer({ initialCid, onContentLoad }: IPFSViewerProps) {
  const [cid, setCid] = useState(initialCid || '')
  const [content, setContent] = useState<IPFSContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'raw' | 'formatted' | 'preview'>('formatted')
  const [recentCids, setRecentCids] = useState<string[]>([])

  const mockIPFSGateway = 'https://ipfs.io/ipfs'
  
  useEffect(() => {
    // Check for pre-selected CID from localStorage
    const selectedCid = localStorage.getItem('selectedCid')
    if (selectedCid) {
      setCid(selectedCid)
      fetchContent(selectedCid)
      localStorage.removeItem('selectedCid')
    }

    // Load recent CIDs
    const recent = localStorage.getItem('recentCids')
    if (recent) {
      setRecentCids(JSON.parse(recent))
    }
  }, [])

  const validateCid = (cidInput: string): boolean => {
    // Basic CID validation patterns
    const cidPatterns = [
      /^Qm[a-zA-Z0-9]{44}$/,           // IPFS CIDv0
      /^[a-f0-9]{16,}$/,               // Hex CIDs
      /^[a-zA-Z0-9]{10,}$/             // General alphanumeric
    ]
    
    return cidPatterns.some(pattern => pattern.test(cidInput.trim()))
  }

  const detectContentType = (contentStr: string): string => {
    try {
      JSON.parse(contentStr)
      return 'application/json'
    } catch {
      if (contentStr.includes('<html') || contentStr.includes('<!DOCTYPE')) {
        return 'text/html'
      }
      if (contentStr.startsWith('data:image/')) {
        return 'image'
      }
      if (contentStr.startsWith('data:video/')) {
        return 'video'
      }
      return 'text/plain'
    }
  }

  const fetchContent = async (cidToFetch: string) => {
    if (!cidToFetch.trim()) {
      setError('Please enter a valid CID')
      return
    }

    if (!validateCid(cidToFetch)) {
      setError('Invalid CID format')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try local API first
      let response = await fetch(`/api/recall-logs?cid=${cidToFetch}`)
      let contentText = ''
      
      if (response.ok) {
        const data = await response.json()
        contentText = data.content || JSON.stringify(data, null, 2)
      } else {
        // Fallback: simulate IPFS content for demo
        contentText = JSON.stringify({
          cid: cidToFetch,
          type: "IPFS Content",
          message: "This is simulated IPFS content for testing",
          metadata: {
            retrieved: new Date().toISOString(),
            source: "Local simulation",
            contentHash: cidToFetch
          },
          data: {
            insights: ["Smart contract execution data", "Transaction metadata", "Block validation info"],
            metrics: {
              performance: "High",
              reliability: "99.9%",
              latency: "12ms"
            }
          }
        }, null, 2)
      }

      const contentType = detectContentType(contentText)
      const ipfsContent: IPFSContent = {
        cid: cidToFetch,
        content: contentText,
        contentType,
        size: new Blob([contentText]).size,
        timestamp: new Date().toISOString()
      }

      setContent(ipfsContent)
      onContentLoad?.(ipfsContent)

      // Update recent CIDs
      const updatedRecent = [cidToFetch, ...recentCids.filter(c => c !== cidToFetch)].slice(0, 5)
      setRecentCids(updatedRecent)
      localStorage.setItem('recentCids', JSON.stringify(updatedRecent))

    } catch (err) {
      setError(`Failed to fetch content: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadContent = () => {
    if (!content) return
    
    const blob = new Blob([content.content], { type: content.contentType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ipfs-${content.cid}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const openInGateway = () => {
    if (!content) return
    window.open(`${mockIPFSGateway}/${content.cid}`, '_blank')
  }

  const formatContent = (contentStr: string, type: string) => {
    if (viewMode === 'raw') {
      return (
        <pre className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96 border border-green-500">
          {contentStr}
        </pre>
      )
    }

    if (viewMode === 'preview') {
      try {
        const parsed = JSON.parse(contentStr)
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>CID:</strong> {content?.cid}</div>
              <div><strong>Size:</strong> {content?.size} bytes</div>
              <div><strong>Type:</strong> {content?.contentType}</div>
              <div><strong>Retrieved:</strong> {new Date(content?.timestamp || '').toLocaleString()}</div>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <strong>Content Preview:</strong>
              <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(parsed, null, 2).slice(0, 500)}
                {JSON.stringify(parsed, null, 2).length > 500 ? '...' : ''}
              </pre>
            </div>
          </div>
        )
      } catch {
        return (
          <div className="border rounded-lg p-3 bg-gray-50">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {contentStr.slice(0, 500)}
              {contentStr.length > 500 ? '...' : ''}
            </pre>
          </div>
        )
      }
    }

    // Formatted view
    if (type === 'application/json') {
      try {
        const parsed = JSON.parse(contentStr)
        return (
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 border">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        )
      } catch {
        return <div className="text-red-500">Invalid JSON content</div>
      }
    }

    return (
      <div className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 border whitespace-pre-wrap">
        {contentStr}
      </div>
    )
  }

  const getContentIcon = (type: string) => {
    if (type === 'application/json') return <Code className="w-4 h-4" />
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Eye className="w-5 h-5" />
            📄 IPFS Content Viewer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CID Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter CID (e.g., Qm..., hex hash, or identifier)"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => fetchContent(cid)}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Loading...' : 'Fetch'}
            </Button>
          </div>

          {/* Recent CIDs */}
          {recentCids.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Recent CIDs:</span>
              <div className="flex flex-wrap gap-2">
                {recentCids.map((recentCid) => (
                  <Badge
                    key={recentCid}
                    variant="outline"
                    className="cursor-pointer hover:bg-yellow-100"
                    onClick={() => {
                      setCid(recentCid)
                      fetchContent(recentCid)
                    }}
                  >
                    {recentCid.slice(0, 8)}...
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
              {error}
            </div>
          )}

          {/* Content Display */}
          {content && (
            <div className="space-y-4">
              {/* Content Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getContentIcon(content.contentType)}
                  <Badge variant="outline" className="bg-yellow-100">
                    {content.contentType}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {content.size} bytes
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formatted">Formatted</SelectItem>
                      <SelectItem value="raw">Raw</SelectItem>
                      <SelectItem value="preview">Preview</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(content.content)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadContent}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openInGateway}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Content Body */}
              {formatContent(content.content, content.contentType)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 