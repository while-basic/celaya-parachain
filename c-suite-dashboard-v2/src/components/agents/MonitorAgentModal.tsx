// ----------------------------------------------------------------------------
//  File:        MonitorAgentModal.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Modal for monitoring individual AI agent performance
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import { useAgentStore, useConsensusStore, useStreamStore } from "@/lib/stores"
import type { Agent } from "@/types"

interface MonitorAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
}

export function MonitorAgentModal({ open, onOpenChange, agent }: MonitorAgentModalProps) {
  const { updateAgentStatus } = useAgentStore()
  const { consensusLogs } = useConsensusStore()
  const { cidLogs } = useStreamStore()
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [currentMetrics, setCurrentMetrics] = useState({
    responseTime: 0,
    successRate: 0,
    tasksCompleted: 0,
    uptime: 0
  })

  useEffect(() => {
    if (agent && isMonitoring) {
      const interval = setInterval(() => {
        // Simulate real-time metrics updates
        setCurrentMetrics(prev => ({
          responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 20),
          successRate: Math.min(100, Math.max(0, prev.successRate + (Math.random() - 0.5) * 2)),
          tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
          uptime: prev.uptime + 1
        }))
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [agent, isMonitoring])

  useEffect(() => {
    if (agent) {
      setCurrentMetrics({
        responseTime: agent.metadata.responseTime,
        successRate: agent.metadata.successRate,
        tasksCompleted: Math.floor(Math.random() * 50) + 10,
        uptime: Math.floor(Math.random() * 1000) + 100
      })
    }
  }, [agent])

  const handleToggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  const handleRestartAgent = async () => {
    if (!agent) return
    
    try {
      updateAgentStatus(agent.id, 'processing')
      
      // Simulate restart process
      setTimeout(() => {
        updateAgentStatus(agent.id, 'active')
        setCurrentMetrics(prev => ({
          ...prev,
          responseTime: agent.metadata.responseTime,
          successRate: 95 + Math.random() * 5,
          uptime: 0
        }))
      }, 2000)
    } catch (error) {
      console.error('Failed to restart agent:', error)
    }
  }

  if (!agent) return null

  // Calculate agent-specific data
  const agentConsensusLogs = consensusLogs.filter(log => log.agentId === agent.id)
  const agentCIDLogs = cidLogs.filter(log => log.agentId === agent.id)
  const recentActivity = [
    ...agentConsensusLogs.slice(0, 3).map(log => ({
      type: 'consensus',
      message: `Participated in consensus: ${log.decision}`,
      timestamp: log.timestamp,
      status: log.verified ? 'success' : 'pending'
    })),
    ...agentCIDLogs.slice(0, 3).map(log => ({
      type: 'storage',
      message: `Stored content: ${log.contentType}`,
      timestamp: log.timestamp,
      status: log.verified ? 'success' : 'pending'
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'idle': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Monitor Agent: {agent.name}
          </DialogTitle>
          <DialogDescription>
            Real-time performance monitoring and agent activity
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Agent Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`border ${getStatusColor(agent.status)}`}>
                {agent.status}
              </Badge>
              <span className="text-white/70">Trust Score: {agent.trustScore.toFixed(1)}%</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleToggleMonitoring}
                variant={isMonitoring ? "outline" : "default"}
                size="sm"
                className={isMonitoring ? "glass" : "bg-blue-600 hover:bg-blue-700"}
              >
                {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isMonitoring ? 'Stop' : 'Start'} Monitoring
              </Button>
              
              <Button
                onClick={handleRestartAgent}
                variant="outline"
                size="sm"
                className="glass"
                disabled={agent.status === 'processing'}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-lg font-bold text-white">
                      {Math.round(currentMetrics.responseTime)}ms
                    </div>
                    <div className="text-xs text-white/60">Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-lg font-bold text-white">
                      {currentMetrics.successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/60">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="text-lg font-bold text-white">
                      {currentMetrics.tasksCompleted}
                    </div>
                    <div className="text-xs text-white/60">Tasks Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-lg font-bold text-white">
                      {formatUptime(currentMetrics.uptime)}
                    </div>
                    <div className="text-xs text-white/60">Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Capabilities */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white text-sm">Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map(capability => (
                  <Badge key={capability} variant="outline" className="border-white/20 text-white/80">
                    {capability}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white text-sm">Recent Activity</CardTitle>
              <CardDescription>Latest agent actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-400' :
                          activity.status === 'pending' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`} />
                        <span className="text-white text-sm">{activity.message}</span>
                      </div>
                      <span className="text-white/60 text-xs">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Statistics */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white text-sm">Performance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white/70 text-sm">Consensus Participation</div>
                  <div className="text-white font-medium">{agentConsensusLogs.length} decisions</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Content Storage</div>
                  <div className="text-white font-medium">{agentCIDLogs.length} items</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Processing Power</div>
                  <div className="text-white font-medium">{agent.metadata.processingPower}</div>
                </div>
                <div>
                  <div className="text-white/70 text-sm">Specialization</div>
                  <div className="text-white font-medium">{agent.metadata.specialization}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          {isMonitoring && (
            <Card className="glass border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Live monitoring active</span>
                  <span className="text-white/60 text-xs">Updates every 2 seconds</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="glass"
          >
            Close Monitor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 