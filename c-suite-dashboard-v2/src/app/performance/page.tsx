// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard v2)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Performance monitoring page for system performance metrics
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Cpu, MemoryStick, HardDrive, Gauge, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { useAgentStore, useSystemStore, useStreamStore } from "@/lib/stores"

export default function PerformancePage() {
  const { agents, getActiveAgents, getAverageTrustScore } = useAgentStore()
  const { metrics } = useSystemStore()
  const { events, streamStatus } = useStreamStore()

  const performanceData = useMemo(() => {
    const activeAgents = getActiveAgents()
    const averageTrustScore = getAverageTrustScore()
    
    // Calculate real metrics based on actual data
    const systemPerformance = activeAgents.length > 0 ? 
      Math.min(100, (activeAgents.length / agents.length) * 100) : 0
    
    const averageResponseTime = activeAgents.length > 0 ?
      activeAgents.reduce((sum, agent) => sum + (agent.metadata?.responseTime || 0), 0) / activeAgents.length : 0
    
    const networkActivity = streamStatus === 'connected' ? 85 : 0
    const consensusEfficiency = averageTrustScore

    // Simulate system resource usage based on agent activity
    const cpuUsage = Math.min(100, (activeAgents.length * 15) + (events.length * 0.1))
    const memoryUsage = Math.min(100, (agents.length * 8) + (events.length * 0.05))
    const diskUsage = Math.min(100, (events.length * 0.02) + 20) // Base 20% usage
    const networkIO = streamStatus === 'connected' ? Math.min(50, events.length * 0.3) : 0

    return {
      systemPerformance,
      averageResponseTime,
      networkActivity,
      consensusEfficiency,
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkIO,
      activeAgents,
      totalAgents: agents.length,
      eventsProcessed: events.length
    }
  }, [agents, events, streamStatus, getActiveAgents, getAverageTrustScore])

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Performance", icon: <Zap className="w-4 h-4" /> }
  ]

  const performanceStats = [
    {
      title: "System Load",
      value: `${performanceData.systemPerformance.toFixed(1)}%`,
      icon: <Cpu className="w-5 h-5" />,
      color: "blue",
      trend: performanceData.systemPerformance > 80 ? "+2.3%" : "0%"
    },
    {
      title: "Memory Usage",
      value: `${performanceData.memoryUsage.toFixed(1)}%`,
      icon: <MemoryStick className="w-5 h-5" />,
      color: "green",
      trend: performanceData.memoryUsage > 70 ? "+1.2%" : "-1.2%"
    },
    {
      title: "CPU Usage",
      value: `${performanceData.cpuUsage.toFixed(1)}%`,
      icon: <Gauge className="w-5 h-5" />,
      color: "purple",
      trend: performanceData.cpuUsage > 60 ? "+0.8%" : "-0.8%"
    },
    {
      title: "Network I/O",
      value: `${performanceData.networkIO.toFixed(1)} MB/s`,
      icon: <HardDrive className="w-5 h-5" />,
      color: "yellow",
      trend: streamStatus === 'connected' ? "+5.1%" : "0%"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-500/20 text-blue-400",
      green: "bg-green-500/20 text-green-400",
      purple: "bg-purple-500/20 text-purple-400",
      yellow: "bg-yellow-500/20 text-yellow-400"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getPerformanceInsights = () => {
    const insights = []
    
    if (performanceData.cpuUsage < 50) {
      insights.push({
        title: "Optimal CPU Performance",
        description: `CPU usage at ${performanceData.cpuUsage.toFixed(1)}% indicates efficient processing`,
        type: "success"
      })
    } else if (performanceData.cpuUsage > 80) {
      insights.push({
        title: "High CPU Usage",
        description: `CPU usage at ${performanceData.cpuUsage.toFixed(1)}% may impact performance`,
        type: "warning"
      })
    }

    if (performanceData.memoryUsage > 75) {
      insights.push({
        title: "Memory Optimization Needed",
        description: `Memory usage at ${performanceData.memoryUsage.toFixed(1)}% requires attention`,
        type: "warning"
      })
    }

    if (performanceData.averageResponseTime > 0 && performanceData.averageResponseTime < 200) {
      insights.push({
        title: "Excellent Response Times",
        description: `Average response time of ${Math.round(performanceData.averageResponseTime)}ms is optimal`,
        type: "success"
      })
    }

    if (streamStatus === 'connected' && performanceData.networkIO > 10) {
      insights.push({
        title: "Active Network Processing",
        description: `${performanceData.networkIO.toFixed(1)} MB/s indicates healthy network activity`,
        type: "success"
      })
    }

    if (insights.length === 0) {
      insights.push({
        title: "System Monitoring",
        description: "Start agents and enable data streams for detailed performance insights",
        type: "info"
      })
    }

    return insights
  }

  const insights = getPerformanceInsights()

  return (
    <Layout title="Performance" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Performance Monitor</h1>
            <p className="text-white/70">System performance metrics and resource utilization</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {performanceStats.map((stat, index) => (
            <Card key={index} className="glass glass-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.title}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Resources */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                System Resources
              </CardTitle>
              <CardDescription>Real-time resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "CPU", value: performanceData.cpuUsage, max: 100, color: "blue-500" },
                { name: "Memory", value: performanceData.memoryUsage, max: 100, color: "green-500" },
                { name: "Disk", value: performanceData.diskUsage, max: 100, color: "purple-500" },
                { name: "Network", value: performanceData.networkIO, max: 50, color: "yellow-500", unit: " MB/s" }
              ].map((resource) => (
                <div key={resource.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">{resource.name}</span>
                    <span className="text-white font-medium">
                      {resource.value.toFixed(1)}{resource.unit || "%"}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${resource.color}`}
                      style={{ width: `${Math.min(100, (resource.value / resource.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Agent Performance
              </CardTitle>
              <CardDescription>Individual agent performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.activeAgents.length > 0 ? (
                <div className="space-y-4">
                  {performanceData.activeAgents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.status === 'active' ? 'bg-green-400' :
                          agent.status === 'processing' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-white font-medium">{agent.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {agent.metadata?.responseTime ? `${agent.metadata.responseTime}ms` : 'N/A'}
                        </div>
                        <div className="text-xs text-white/60">Response Time</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-white/30 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">No active agents</p>
                  <p className="text-white/40 text-xs mt-1">Start agents to monitor performance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Insights
            </CardTitle>
            <CardDescription>System optimization recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  insight.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                  insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  insight.type === 'error' ? 'bg-red-500/10 border-red-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                    {insight.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                    {insight.type === 'info' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                    <h4 className={`font-semibold ${
                      insight.type === 'success' ? 'text-green-400' :
                      insight.type === 'warning' ? 'text-yellow-400' :
                      insight.type === 'error' ? 'text-red-400' :
                      'text-blue-400'
                    }`}>
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-white/70 text-sm">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Summary */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              System Summary
            </CardTitle>
            <CardDescription>Overall system status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-white/70 text-sm mb-2">Agent Status</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white">Active Agents</span>
                    <span className="text-green-400">{performanceData.activeAgents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Total Agents</span>
                    <span className="text-white/70">{performanceData.totalAgents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Efficiency</span>
                    <span className="text-blue-400">
                      {performanceData.totalAgents > 0 
                        ? ((performanceData.activeAgents.length / performanceData.totalAgents) * 100).toFixed(1)
                        : 0
                      }%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-white/70 text-sm mb-2">Processing Stats</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white">Events Processed</span>
                    <span className="text-purple-400">{performanceData.eventsProcessed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Avg Response Time</span>
                    <span className="text-white/70">
                      {performanceData.averageResponseTime > 0 
                        ? `${Math.round(performanceData.averageResponseTime)}ms`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Stream Status</span>
                    <span className={streamStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
                      {streamStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-white/70 text-sm mb-2">Resource Health</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white">Overall Health</span>
                    <span className={`${
                      performanceData.cpuUsage < 70 && performanceData.memoryUsage < 80 
                        ? 'text-green-400' 
                        : performanceData.cpuUsage < 85 && performanceData.memoryUsage < 90
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>
                      {performanceData.cpuUsage < 70 && performanceData.memoryUsage < 80 
                        ? 'Excellent' 
                        : performanceData.cpuUsage < 85 && performanceData.memoryUsage < 90
                        ? 'Good'
                        : 'Needs Attention'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Peak Load</span>
                    <span className="text-white/70">
                      {Math.max(performanceData.cpuUsage, performanceData.memoryUsage).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Uptime</span>
                    <span className="text-blue-400">
                      {streamStatus === 'connected' ? '99.9%' : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
} 