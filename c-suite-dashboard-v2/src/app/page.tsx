// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Main dashboard page with enterprise UI/UX and real-time monitoring
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Users, Zap, Shield, Database, Globe, Settings, Play, Pause, Home, FileText } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { AgentGrid } from "@/components/agents/AgentGrid"
import { RealTimeMetrics } from "@/components/metrics/RealTimeMetrics"
import { useAgentStore, useSystemStore, useStreamStore } from "@/lib/stores"
import { useWebSocket } from "@/lib/api/websocket"
import { useDataSimulator } from "@/lib/api/dataSimulator"
import type { Agent } from "@/types"

export default function DashboardPage() {
  const { agents, setAgents } = useAgentStore()
  const { addNotification } = useSystemStore()
  const { streamStatus } = useStreamStore()
  const [isSimulatorActive, setIsSimulatorActive] = useState(false)
  
  // Initialize WebSocket connection (optional - only connect when needed)
  const { isConnected, status } = useWebSocket(false)
  
  // Data simulator for demo purposes
  const { start: startSimulator, stop: stopSimulator, isActive } = useDataSimulator()

  // Initialize with mock data
  useEffect(() => {
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Lyra',
        trustScore: 94.2,
        status: 'active',
        capabilities: ['consensus', 'analysis'],
        version: '2.1.0',
        lastSeen: new Date(),
        metadata: {
          description: 'Strategic consensus coordinator',
          specialization: 'Decision Making',
          processingPower: 85,
          responseTime: 120,
          successRate: 94.2
        }
      },
      {
        id: '2',
        name: 'Echo',
        trustScore: 89.7,
        status: 'processing',
        capabilities: ['verification', 'monitoring'],
        version: '2.0.5',
        lastSeen: new Date(),
        metadata: {
          description: 'Real-time verification specialist',
          specialization: 'Verification',
          processingPower: 92,
          responseTime: 89,
          successRate: 89.7
        }
      },
      {
        id: '3',
        name: 'Verdict',
        trustScore: 96.1,
        status: 'active',
        capabilities: ['judgment', 'analysis'],
        version: '2.1.2',
        lastSeen: new Date(),
        metadata: {
          description: 'Analytical judgment engine',
          specialization: 'Analysis',
          processingPower: 88,
          responseTime: 156,
          successRate: 96.1
        }
      },
      {
        id: '4',
        name: 'Nexus',
        trustScore: 91.4,
        status: 'idle',
        capabilities: ['integration', 'coordination'],
        version: '2.0.8',
        lastSeen: new Date(),
        metadata: {
          description: 'System integration coordinator',
          specialization: 'Integration',
          processingPower: 78,
          responseTime: 203,
          successRate: 91.4
        }
      }
    ]

    setAgents(mockAgents)

    addNotification({
      type: 'info',
      title: 'Dashboard Initialized',
      message: 'C-Suite Console is now online with enterprise UI/UX'
    })
  }, [setAgents, addNotification])

  useEffect(() => {
    setIsSimulatorActive(isActive())
  }, [isActive])

  const handleAgentSelect = (agent: Agent) => {
    addNotification({
      type: 'info',
      title: 'Agent Selected',
      message: `${agent.name} - Trust Score: ${agent.trustScore}% | Status: ${agent.status}`
    })
  }

  const toggleSimulator = () => {
    if (isSimulatorActive) {
      stopSimulator()
      addNotification({
        type: 'info',
        title: 'Data Simulator Stopped',
        message: 'Real-time data simulation has been disabled'
      })
    } else {
      startSimulator()
      addNotification({
        type: 'success',
        title: 'Data Simulator Started',
        message: 'High-frequency data simulation is now active'
      })
    }
  }

  const breadcrumbs = [
    { label: "Dashboard", icon: <Home className="w-4 h-4" /> }
  ]

  return (
    <Layout title="Dashboard" breadcrumbs={breadcrumbs}>
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Hero Section with Welcome and Key Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome & Status Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Welcome back, Mr. Chris
              </h1>
              <p className="text-white/80 text-base sm:text-lg">
                Enterprise AI Agent Registry & Real-time Monitoring System
              </p>
            </div>
            
            {/* Quick Status Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass glass-hover p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">Optimal</div>
                    <div className="text-xs text-white/60">System Health</div>
                  </div>
                </div>
              </div>
              
              <div className="glass glass-hover p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    streamStatus === 'connected' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <Globe className={`w-5 h-5 ${
                      streamStatus === 'connected' ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white capitalize">{streamStatus}</div>
                    <div className="text-xs text-white/60">Network</div>
                  </div>
                </div>
              </div>
              
              <div className="glass glass-hover p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSimulatorActive ? 'bg-blue-500/20' : 'bg-gray-500/20'
                  }`}>
                    <Activity className={`w-5 h-5 ${
                      isSimulatorActive ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {isSimulatorActive ? 'Active' : 'Idle'}
                    </div>
                    <div className="text-xs text-white/60">Data Flow</div>
                  </div>
                </div>
              </div>
              
              <div className="glass glass-hover p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">Excellent</div>
                    <div className="text-xs text-white/60">Performance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass glass-hover p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={toggleSimulator}
                className={`w-full justify-start ${isSimulatorActive ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'glass'}`}
              >
                {isSimulatorActive ? <Pause className="w-4 h-4 mr-3" /> : <Play className="w-4 h-4 mr-3" />}
                {isSimulatorActive ? 'Stop Data Simulator' : 'Start Data Simulator'}
              </Button>
              
              <Button variant="outline" className="glass w-full justify-start">
                <Activity className="w-4 h-4 mr-3" />
                View Live Streams
              </Button>
              
              <Button variant="outline" className="glass w-full justify-start">
                <Database className="w-4 h-4 mr-3" />
                Browse CID Database
              </Button>
              
              <Button variant="outline" className="glass w-full justify-start">
                <Shield className="w-4 h-4 mr-3" />
                Consensus Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Metrics Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-400" />
              Live Metrics
            </h2>
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time updates</span>
            </div>
          </div>
          <RealTimeMetrics />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Agent Registry with 3D Visualization */}
          <Card className="xl:col-span-3 glass glass-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Users className="w-6 h-6 text-blue-400" />
                    <span>Agent Registry Overview</span>
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Live monitoring of AI agents with interactive 3D orb visualizations
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-400 font-medium">{agents.length} Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 sm:h-96 rounded-xl border border-white/10 overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                <AgentGrid onAgentSelect={handleAgentSelect} />
              </div>
            </CardContent>
          </Card>

          {/* Live Stream Monitor */}
          <Card className="glass glass-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-400" />
                Live Streams
              </CardTitle>
              <CardDescription>
                Real-time agent activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-white/70 font-medium mb-3">Active Streams:</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                    <div className={`w-3 h-3 rounded-full ${
                      agent.status === 'active' ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 
                      agent.status === 'processing' ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50' : 
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white/90 block">{agent.name}</span>
                      <div className="text-xs text-white/60">
                        Trust: {agent.trustScore.toFixed(1)}% • {agent.metadata?.responseTime}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Redesigned */}
        <Card className="glass glass-hover">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-purple-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="mt-1">
                  Latest events from the C-Suite blockchain and agent network
                </CardDescription>
              </div>
              <Button variant="outline" className="glass text-sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { time: "2 min ago", event: "Agent Lyra submitted consensus decision", type: "consensus", agent: "Lyra" },
                { time: "5 min ago", event: "New CID logged: QmX7Y8Z9...", type: "cid", agent: "Echo" },
                { time: "8 min ago", event: "Agent Echo trust score updated: 96.5%", type: "trust", agent: "Echo" },
                { time: "12 min ago", event: "Blockchain event: agentRegistry.register", type: "blockchain", agent: "System" },
                { time: "15 min ago", event: "Consensus verification completed", type: "consensus", agent: "Verdict" },
                { time: "18 min ago", event: "High-frequency data stream started", type: "stream", agent: "Nexus" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    activity.type === 'consensus' ? 'bg-purple-400 shadow-lg shadow-purple-400/50' :
                    activity.type === 'cid' ? 'bg-orange-400 shadow-lg shadow-orange-400/50' :
                    activity.type === 'trust' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
                    activity.type === 'blockchain' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
                    activity.type === 'stream' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
                    'bg-gray-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{activity.event}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-white/60 text-xs">{activity.time}</p>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60 text-xs">{activity.agent}</span>
                    </div>
                  </div>
                  <div className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 ${
                    activity.type === 'consensus' ? 'bg-purple-400/20 text-purple-400' :
                    activity.type === 'cid' ? 'bg-orange-400/20 text-orange-400' :
                    activity.type === 'trust' ? 'bg-green-400/20 text-green-400' :
                    activity.type === 'blockchain' ? 'bg-blue-400/20 text-blue-400' :
                    activity.type === 'stream' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-gray-400/20 text-gray-400'
                  }`}>
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
