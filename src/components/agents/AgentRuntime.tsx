// ----------------------------------------------------------------------------
//  File:        AgentRuntime.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Agent runtime interface for C-Suite agent connections
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  Brain,
  MessageSquare,
  Settings,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSystemStore, useAgentStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

interface AgentConnection {
  agentId: string
  name: string
  status: 'online' | 'offline' | 'processing' | 'error'
  lastHeartbeat: Date
  capabilities: string[]
  currentTask?: string
  performanceMetrics: {
    tasksCompleted: number
    averageResponseTime: number
    errorRate: number
  }
  runtimeInfo: {
    version: string
    uptime: number
    memoryUsage: number
    cpuUsage: number
  }
}

export function AgentRuntime() {
  const { addNotification } = useSystemStore()
  const { agents, updateAgent } = useAgentStore()
  
  const [runtimeConnections, setRuntimeConnections] = useState<AgentConnection[]>([])
  const [totalConnections, setTotalConnections] = useState(0)
  const [activeAgents, setActiveAgents] = useState(0)

  // Initialize runtime connections
  useEffect(() => {
    const initializeRuntimeConnections = () => {
      const connections: AgentConnection[] = agents.map(agent => ({
        agentId: agent.id,
        name: agent.name,
        status: agent.status === 'active' ? 'online' : 
                agent.status === 'processing' ? 'processing' : 
                agent.status === 'error' ? 'error' : 'offline',
        lastHeartbeat: new Date(),
        capabilities: agent.capabilities,
        currentTask: agent.status === 'processing' ? 'Analyzing market trends' : undefined,
        performanceMetrics: {
          tasksCompleted: Math.floor(Math.random() * 1000) + 100,
          averageResponseTime: agent.metadata?.responseTime || 120,
          errorRate: Math.random() * 5 // 0-5% error rate
        },
        runtimeInfo: {
          version: agent.version,
          uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
          memoryUsage: Math.random() * 80 + 10, // 10-90% memory usage
          cpuUsage: Math.random() * 60 + 5 // 5-65% CPU usage
        }
      }))

      setRuntimeConnections(connections)
      setTotalConnections(connections.length)
      setActiveAgents(connections.filter(c => c.status === 'online' || c.status === 'processing').length)
    }

    initializeRuntimeConnections()
  }, [agents])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRuntimeConnections(prev => prev.map(connection => {
        // Randomly update status
        let newStatus = connection.status
        if (Math.random() > 0.95) {
          const statuses: AgentConnection['status'][] = ['online', 'processing', 'offline']
          newStatus = statuses[Math.floor(Math.random() * statuses.length)]
        }

        // Update heartbeat
        const lastHeartbeat = newStatus === 'offline' ? connection.lastHeartbeat : new Date()

        // Update current task for processing agents
        let currentTask = connection.currentTask
        if (newStatus === 'processing' && Math.random() > 0.8) {
          const tasks = [
            'Analyzing blockchain consensus',
            'Processing market insights',
            'Validating agent decisions',
            'Generating strategic reports',
            'Monitoring network security',
            'Optimizing system performance'
          ]
          currentTask = tasks[Math.floor(Math.random() * tasks.length)]
        } else if (newStatus !== 'processing') {
          currentTask = undefined
        }

        // Update performance metrics
        const performanceMetrics = {
          ...connection.performanceMetrics,
          tasksCompleted: connection.performanceMetrics.tasksCompleted + (Math.random() > 0.7 ? 1 : 0),
          averageResponseTime: connection.performanceMetrics.averageResponseTime + (Math.random() - 0.5) * 10
        }

        // Update runtime info
        const runtimeInfo = {
          ...connection.runtimeInfo,
          uptime: connection.runtimeInfo.uptime + 10,
          memoryUsage: Math.max(10, Math.min(90, connection.runtimeInfo.memoryUsage + (Math.random() - 0.5) * 5)),
          cpuUsage: Math.max(5, Math.min(65, connection.runtimeInfo.cpuUsage + (Math.random() - 0.5) * 10))
        }

        // Update agent store if status changed
        if (newStatus !== connection.status) {
          const agentStatus = newStatus === 'online' ? 'active' :
                            newStatus === 'processing' ? 'processing' :
                            newStatus === 'error' ? 'error' : 'idle'
          
          updateAgent(connection.agentId, { status: agentStatus })
        }

        return {
          ...connection,
          status: newStatus,
          lastHeartbeat,
          currentTask,
          performanceMetrics,
          runtimeInfo
        }
      }))

      // Update totals
      setRuntimeConnections(prev => {
        const active = prev.filter(c => c.status === 'online' || c.status === 'processing').length
        setActiveAgents(active)
        return prev
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [updateAgent])

  const sendTestMessage = async (agentId: string) => {
    const connection = runtimeConnections.find(c => c.agentId === agentId)
    if (!connection) return

    addNotification({
      type: 'info',
      title: 'Message Sent',
      message: `Test message sent to ${connection.name}`
    })

    // Simulate response
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Agent Response',
        message: `${connection.name} acknowledged the test message`
      })
    }, 1000 + Math.random() * 2000)
  }

  const restartAgent = async (agentId: string) => {
    const connection = runtimeConnections.find(c => c.agentId === agentId)
    if (!connection) return

    addNotification({
      type: 'info',
      title: 'Restarting Agent',
      message: `Initiating restart for ${connection.name}...`
    })

    // Simulate restart process
    setRuntimeConnections(prev => prev.map(c => 
      c.agentId === agentId 
        ? { ...c, status: 'offline', currentTask: undefined }
        : c
    ))

    setTimeout(() => {
      setRuntimeConnections(prev => prev.map(c => 
        c.agentId === agentId 
          ? { 
              ...c, 
              status: 'online', 
              lastHeartbeat: new Date(),
              runtimeInfo: { ...c.runtimeInfo, uptime: 0 }
            }
          : c
      ))

      addNotification({
        type: 'success',
        title: 'Agent Restarted',
        message: `${connection.name} has been successfully restarted`
      })
    }, 3000)
  }

  const getStatusColor = (status: AgentConnection['status']) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'processing': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: AgentConnection['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Activity className="w-4 h-4 animate-pulse" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Runtime Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>Total Agents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalConnections}</div>
            <div className="text-sm text-white/60">Registered in runtime</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Active Agents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{activeAgents}</div>
            <div className="text-sm text-white/60">Online and processing</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>System Load</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((activeAgents / totalConnections) * 100)}%
            </div>
            <div className="text-sm text-white/60">Runtime utilization</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Connections */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Agent Runtime Connections</span>
          </CardTitle>
          <CardDescription>
            Real-time status and performance of connected C-Suite agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {runtimeConnections.map((connection) => (
              <motion.div
                key={connection.agentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={cn("flex items-center space-x-2", getStatusColor(connection.status))}>
                        {getStatusIcon(connection.status)}
                        <span className="font-semibold text-white">{connection.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-400/20 text-blue-400">
                        v{connection.runtimeInfo.version}
                      </span>
                    </div>

                    {connection.currentTask && (
                      <div className="mb-2 flex items-center space-x-2 text-sm text-white/80">
                        <Activity className="w-3 h-3" />
                        <span>{connection.currentTask}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-white/60">Uptime</div>
                        <div className="text-white">{formatUptime(connection.runtimeInfo.uptime)}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Tasks</div>
                        <div className="text-white">{connection.performanceMetrics.tasksCompleted}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Response</div>
                        <div className="text-white">{Math.round(connection.performanceMetrics.averageResponseTime)}ms</div>
                      </div>
                      <div>
                        <div className="text-white/60">CPU</div>
                        <div className="text-white">{Math.round(connection.runtimeInfo.cpuUsage)}%</div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-white/60">
                      Last heartbeat: {connection.lastHeartbeat.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendTestMessage(connection.agentId)}
                      disabled={connection.status === 'offline'}
                      className="glass text-xs"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restartAgent(connection.agentId)}
                      className="glass text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Restart
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 