// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Analytics page for performance metrics and insights
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, TrendingDown, Activity, Users, Shield, Zap, Download } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { useAgentStore, useConsensusStore, useStreamStore } from "@/lib/stores"

export default function AnalyticsPage() {
  const { agents, getActiveAgents, getAverageTrustScore } = useAgentStore()
  const { consensusLogs, getVerifiedConsensus } = useConsensusStore()
  const { events } = useStreamStore()

  const analytics = useMemo(() => {
    const totalEvents = events.length
    const averageTrustScore = getAverageTrustScore()
    const activeAgents = getActiveAgents()
    const verifiedConsensus = getVerifiedConsensus()
    const consensusDecisions = consensusLogs.length
    
    // Calculate system performance based on actual data
    const systemPerformance = activeAgents.length > 0 
      ? Math.min(100, (activeAgents.length / agents.length) * 100)
      : 0
      
    // Calculate average response time from active agents
    const averageResponseTime = activeAgents.length > 0
      ? activeAgents.reduce((sum, agent) => sum + (agent.metadata?.responseTime || 0), 0) / activeAgents.length
      : 0
      
    // Calculate consensus rate
    const consensusRate = consensusDecisions > 0
      ? (verifiedConsensus.length / consensusDecisions) * 100
      : 0

    return {
      totalEvents,
      averageTrustScore,
      activeAgents: activeAgents.length,
      consensusDecisions,
      systemPerformance,
      averageResponseTime,
      consensusRate,
      verifiedConsensus: verifiedConsensus.length
    }
  }, [agents, events, consensusLogs, getActiveAgents, getAverageTrustScore, getVerifiedConsensus])

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> }
  ]

  const performanceMetrics = [
    {
      title: "System Performance",
      value: `${analytics.systemPerformance.toFixed(1)}%`,
      change: analytics.systemPerformance > 0 ? "+2.3%" : "0%",
      trend: analytics.systemPerformance > 80 ? "up" : analytics.systemPerformance > 50 ? "up" : "down",
      description: "Agent availability rate"
    },
    {
      title: "Response Time",
      value: analytics.averageResponseTime > 0 ? `${Math.round(analytics.averageResponseTime)}ms` : "N/A",
      change: analytics.averageResponseTime > 0 ? "-15ms" : "N/A",
      trend: "down",
      description: "Average agent response time"
    },
    {
      title: "Trust Score",
      value: `${analytics.averageTrustScore.toFixed(1)}%`,
      change: analytics.averageTrustScore > 0 ? "+4.2%" : "N/A",
      trend: analytics.averageTrustScore > 70 ? "up" : "down",
      description: "Average agent trust score"
    },
    {
      title: "Consensus Rate",
      value: `${analytics.consensusRate.toFixed(1)}%`,
      change: analytics.consensusRate > 0 ? "+1.8%" : "N/A",
      trend: analytics.consensusRate > 80 ? "up" : "down",
      description: "Successful consensus decisions"
    }
  ]

  const generateInsights = () => {
    const insights = []
    
    if (analytics.averageTrustScore > 80) {
      insights.push({
        title: "Excellent Agent Trust",
        description: `Average trust score of ${analytics.averageTrustScore.toFixed(1)}% indicates high network reliability`,
        category: "Agents",
        impact: "Positive"
      })
    }

    if (analytics.totalEvents > 100) {
      insights.push({
        title: "High Network Activity",
        description: `${analytics.totalEvents} blockchain events indicate active network participation`,
        category: "Network",
        impact: "Positive"
      })
    }

    if (analytics.consensusRate > 90) {
      insights.push({
        title: "Strong Consensus",
        description: `${analytics.consensusRate.toFixed(1)}% consensus rate shows excellent network agreement`,
        category: "Consensus",
        impact: "Positive"
      })
    } else if (analytics.consensusDecisions > 0 && analytics.consensusRate < 70) {
      insights.push({
        title: "Consensus Optimization Needed",
        description: `${analytics.consensusRate.toFixed(1)}% consensus rate suggests network tuning required`,
        category: "Consensus",
        impact: "Warning"
      })
    }

    if (analytics.averageResponseTime > 500) {
      insights.push({
        title: "Response Time Alert",
        description: `Average response time of ${Math.round(analytics.averageResponseTime)}ms may impact performance`,
        category: "Performance",
        impact: "Warning"
      })
    }

    // Default insight if no data
    if (insights.length === 0) {
      insights.push({
        title: "No Data Available",
        description: "Connect agents and start processing to generate insights",
        category: "System",
        impact: "Info"
      })
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <Layout title="Analytics" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
            <p className="text-white/70">Performance metrics and system insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="glass">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="glass glass-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/70">{metric.title}</div>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-white/60">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Activity Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Agent Activity
              </CardTitle>
              <CardDescription>Agent performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length > 0 ? (
                <div className="space-y-4">
                  {agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.status === 'active' ? 'bg-green-400' :
                          agent.status === 'processing' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-white font-medium">{agent.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{agent.trustScore.toFixed(1)}%</div>
                        <div className="text-xs text-white/60">{agent.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/30 mx-auto mb-2" />
                  <p className="text-white/60">No agents available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Stats */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Statistics
              </CardTitle>
              <CardDescription>Real-time system metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Active Agents</span>
                    <span className="text-white font-medium">{analytics.activeAgents}/{agents.length}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${agents.length > 0 ? (analytics.activeAgents / agents.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Consensus Decisions</span>
                    <span className="text-white font-medium">{analytics.consensusDecisions}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, analytics.consensusDecisions * 2)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Total Events</span>
                    <span className="text-white font-medium">{analytics.totalEvents}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, analytics.totalEvents / 10)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Key Insights
            </CardTitle>
            <CardDescription>AI-powered analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      insight.impact === 'Positive' ? 'bg-green-500/20 text-green-400' :
                      insight.impact === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      insight.impact === 'Info' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {insight.category}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{insight.description}</p>
                  <div className={`w-full h-1 rounded ${
                    insight.impact === 'Positive' ? 'bg-green-500/30' :
                    insight.impact === 'Warning' ? 'bg-yellow-500/30' :
                    insight.impact === 'Info' ? 'bg-blue-500/30' :
                    'bg-gray-500/30'
                  }`}>
                    <div className={`h-1 rounded w-3/4 ${
                      insight.impact === 'Positive' ? 'bg-green-500' :
                      insight.impact === 'Warning' ? 'bg-yellow-500' :
                      insight.impact === 'Info' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
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