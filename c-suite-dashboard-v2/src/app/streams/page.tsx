// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard v2)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Live streams page for real-time data monitoring
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Play, Pause, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { useStreamStore } from "@/lib/stores"

export default function StreamsPage() {
  const { events, streamStatus, isConnected, setConnectionStatus } = useStreamStore()
  const [isStreaming, setIsStreaming] = useState(isConnected)

  const streamMetrics = useMemo(() => {
    const recentEvents = events.slice(0, 10)
    const eventsPerSecond = isConnected && events.length > 0 ? 
      Math.round(events.length / Math.max(1, (Date.now() - events[0]?.timestamp.getTime()) / 1000)) : 0
    const uptime = isConnected ? 99.9 : 0

    return {
      recentEvents,
      eventsPerSecond,
      uptime
    }
  }, [events, isConnected])

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Live Streams", icon: <Activity className="w-4 h-4" /> }
  ]

  const handleToggleStream = () => {
    const newStreamingState = !isStreaming
    setIsStreaming(newStreamingState)
    
    if (newStreamingState) {
      setConnectionStatus('connecting')
      // In a real implementation, this would establish WebSocket connection
      setTimeout(() => {
        setConnectionStatus('connected')
      }, 1000)
    } else {
      setConnectionStatus('idle')
    }
  }

  const getConnectionStatus = () => {
    if (streamStatus === 'connected' && isStreaming) return 'Connected'
    if (streamStatus === 'connecting') return 'Connecting'
    if (streamStatus === 'error') return 'Error'
    return 'Disconnected'
  }

  const isConnectedStatus = streamStatus === 'connected' && isStreaming

  return (
    <Layout title="Live Streams" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Data Streams</h1>
            <p className="text-white/70">Real-time monitoring and data feeds</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className={`border ${isConnectedStatus ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
              {isConnectedStatus ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
              {getConnectionStatus()}
            </Badge>
            <Button 
              onClick={handleToggleStream}
              variant={isStreaming ? "outline" : "default"}
              className={isStreaming ? "glass" : "bg-blue-600 hover:bg-blue-700"}
              disabled={streamStatus === 'connecting'}
            >
              {streamStatus === 'connecting' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : isStreaming ? (
                <Pause className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {streamStatus === 'connecting' ? 'Connecting' : isStreaming ? 'Pause' : 'Start'} Stream
            </Button>
          </div>
        </div>

        {/* Stream Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{events.length}</div>
                  <div className="text-sm text-white/60">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {streamMetrics.eventsPerSecond}/s
                  </div>
                  <div className="text-sm text-white/60">Events per Second</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {streamMetrics.uptime.toFixed(1)}%
                  </div>
                  <div className="text-sm text-white/60">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Events */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Event Stream
            </CardTitle>
            <CardDescription>Live blockchain and agent events</CardDescription>
          </CardHeader>
          <CardContent>
            {streamMetrics.recentEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {streamMetrics.recentEvents.map((event, index) => (
                  <div key={event.id || index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        event.section === 'blocks' ? 'bg-blue-400' :
                        event.section === 'transactions' ? 'bg-green-400' :
                        event.section === 'consensus' ? 'bg-purple-400' :
                        'bg-yellow-400'
                      }`} />
                      <div>
                        <div className="text-white font-medium">{event.method}</div>
                        <div className="text-white/60 text-sm">
                          Block #{event.blockNumber} - {event.data ? Object.keys(event.data).length : 0} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/80 text-sm">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-white/50 text-xs">
                        {event.section}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isConnectedStatus ? 'No events streaming' : 'Stream not active'}
                </h3>
                <p className="text-white/60">
                  {isConnectedStatus 
                    ? 'Waiting for blockchain events and agent activities...'
                    : 'Start the stream to see real-time events from the network'
                  }
                </p>
                {!isConnectedStatus && (
                  <Button 
                    onClick={handleToggleStream}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Streaming
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stream Details */}
        {events.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Stream Statistics
              </CardTitle>
              <CardDescription>Detailed streaming metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-white/70 text-sm">Event Types</div>
                  <div className="space-y-2 mt-2">
                    {['blocks', 'transactions', 'consensus', 'system'].map(type => {
                      const count = events.filter(e => e.section === type).length
                      return (
                        <div key={type} className="flex justify-between">
                          <span className="text-white capitalize">{type}</span>
                          <span className="text-white/70">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-white/70 text-sm">Latest Block</div>
                  <div className="text-white font-medium text-lg mt-2">
                    {events.length > 0 ? Math.max(...events.map(e => e.blockNumber)) : 0}
                  </div>
                </div>
                
                <div>
                  <div className="text-white/70 text-sm">Stream Duration</div>
                  <div className="text-white font-medium text-lg mt-2">
                    {events.length > 0 && isConnectedStatus
                      ? Math.round((Date.now() - events[events.length - 1].timestamp.getTime()) / 60000)
                      : 0
                    } min
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