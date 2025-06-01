// ----------------------------------------------------------------------------
//  File:        dashboard-overview.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Real-time dashboard overview with interactive monitoring
//  Version:     2.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AgentStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'error'
  version: string
  lastSeen: Date
  tasksCompleted: number
  responseTime: number
  cpuUsage: number
  memoryUsage: number
}

interface SystemMetrics {
  timestamp: Date
  cpuUsage: number
  memoryUsage: number
  networkLatency: number
  activeConnections: number
  taskQueue: number
}

interface RecentActivity {
  id: string
  type: 'tool_call' | 'simulation' | 'chat' | 'error' | 'system'
  message: string
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'success'
  agent?: string
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280']

export function DashboardOverview() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Initialize mock data
    initializeAgents()
    initializeMetrics()
    initializeActivities()

    // Set up real-time updates
    const metricsInterval = setInterval(updateMetrics, 2000)
    const activityInterval = setInterval(addRandomActivity, 5000)
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => {
      clearInterval(metricsInterval)
      clearInterval(activityInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const initializeAgents = () => {
    const agentData: AgentStatus[] = [
      {
        id: 'lens-01',
        name: 'Lens Agent',
        status: 'online',
        version: '2.1.0',
        lastSeen: new Date(),
        tasksCompleted: 247,
        responseTime: 120,
        cpuUsage: 15.2,
        memoryUsage: 238.5
      },
      {
        id: 'core-01',
        name: 'Core Agent',
        status: 'online',
        version: '3.0.1',
        lastSeen: new Date(),
        tasksCompleted: 892,
        responseTime: 85,
        cpuUsage: 28.7,
        memoryUsage: 512.8
      },
      {
        id: 'echo-01',
        name: 'Echo Agent',
        status: 'busy',
        version: '1.8.3',
        lastSeen: new Date(),
        tasksCompleted: 156,
        responseTime: 340,
        cpuUsage: 45.1,
        memoryUsage: 189.3
      },
      {
        id: 'theory-01',
        name: 'Theory Agent',
        status: 'online',
        version: '2.5.0',
        lastSeen: new Date(),
        tasksCompleted: 73,
        responseTime: 1250,
        cpuUsage: 12.3,
        memoryUsage: 298.7
      }
    ]
    setAgents(agentData)
  }

  const initializeMetrics = () => {
    const now = Date.now()
    const initialMetrics: SystemMetrics[] = []
    for (let i = 20; i >= 0; i--) {
      initialMetrics.push({
        timestamp: new Date(now - i * 30000),
        cpuUsage: 20 + Math.random() * 40,
        memoryUsage: 40 + Math.random() * 30,
        networkLatency: 50 + Math.random() * 100,
        activeConnections: 15 + Math.floor(Math.random() * 10),
        taskQueue: Math.floor(Math.random() * 8)
      })
    }
    setMetrics(initialMetrics)
  }

  const initializeActivities = () => {
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'tool_call',
        message: 'Lens Agent completed image analysis for compliance audit',
        timestamp: new Date(Date.now() - 120000),
        severity: 'success',
        agent: 'Lens Agent'
      },
      {
        id: '2',
        type: 'simulation',
        message: 'Multi-agent simulation started with 4 participants',
        timestamp: new Date(Date.now() - 300000),
        severity: 'info'
      },
      {
        id: '3',
        type: 'error',
        message: 'Theory Agent encountered validation error for model TR-2025-01',
        timestamp: new Date(Date.now() - 480000),
        severity: 'error',
        agent: 'Theory Agent'
      }
    ]
    setActivities(activities)
  }

  const updateMetrics = () => {
    setMetrics(prev => {
      const newMetric: SystemMetrics = {
        timestamp: new Date(),
        cpuUsage: 20 + Math.random() * 40,
        memoryUsage: 40 + Math.random() * 30,
        networkLatency: 50 + Math.random() * 100,
        activeConnections: 15 + Math.floor(Math.random() * 10),
        taskQueue: Math.floor(Math.random() * 8)
      }
      return [...prev.slice(-19), newMetric]
    })

    // Update agent metrics
    setAgents(prev => prev.map(agent => ({
      ...agent,
      cpuUsage: Math.max(0, agent.cpuUsage + (Math.random() - 0.5) * 10),
      memoryUsage: Math.max(0, agent.memoryUsage + (Math.random() - 0.5) * 20),
      responseTime: Math.max(50, agent.responseTime + (Math.random() - 0.5) * 100),
      lastSeen: agent.status === 'online' || agent.status === 'busy' ? new Date() : agent.lastSeen
    })))
  }

  const addRandomActivity = () => {
    const activityTypes: RecentActivity['type'][] = ['tool_call', 'simulation', 'chat', 'system']
    const severities: RecentActivity['severity'][] = ['info', 'success', 'warning']
    const agentNames = ['Lens Agent', 'Core Agent', 'Echo Agent', 'Theory Agent']
    
    const messages = [
      'Tool execution completed successfully',
      'Agent communication established',
      'Task queue processed',
      'System health check passed',
      'Data synchronization completed',
      'Performance optimization applied',
      'Security scan completed',
      'Network connection verified'
    ]

    const newActivity: RecentActivity = {
      id: Date.now().toString(),
      type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      severity: severities[Math.floor(Math.random() * severities.length)],
      agent: Math.random() > 0.3 ? agentNames[Math.floor(Math.random() * agentNames.length)] : undefined
    }

    setActivities(prev => [newActivity, ...prev.slice(0, 9)])
  }

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'busy': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'offline': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: RecentActivity['severity']) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const onlineAgents = agents.filter(a => a.status === 'online' || a.status === 'busy').length
  const totalTasks = agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0)
  const avgResponseTime = agents.reduce((sum, agent) => sum + agent.responseTime, 0) / agents.length
  const currentMetric = metrics[metrics.length - 1]

  const statusData = [
    { name: 'Online', value: agents.filter(a => a.status === 'online').length, color: '#10B981' },
    { name: 'Busy', value: agents.filter(a => a.status === 'busy').length, color: '#F59E0B' },
    { name: 'Error', value: agents.filter(a => a.status === 'error').length, color: '#EF4444' },
    { name: 'Offline', value: agents.filter(a => a.status === 'offline').length, color: '#6B7280' }
  ].filter(item => item.value > 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Control Station Dashboard</h1>
          <p className="text-gray-300 mt-1">
            Real-time monitoring • {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{onlineAgents}/{agents.length}</div>
          <div className="text-sm text-gray-300">Agents Online</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="control-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-green-600">{onlineAgents}</p>
            </div>
            <div className="text-3xl">🤖</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {agents.filter(a => a.status === 'busy').length} currently busy
          </p>
        </div>

        <div className="control-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-blue-600">{totalTasks.toLocaleString()}</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Avg: {Math.round(totalTasks / agents.length)} per agent
          </p>
        </div>

        <div className="control-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(avgResponseTime)}ms</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Network: {currentMetric?.networkLatency.toFixed(0)}ms
          </p>
        </div>

        <div className="control-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Load</p>
              <p className="text-2xl font-bold text-orange-600">
                {currentMetric?.cpuUsage.toFixed(1)}%
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Memory: {currentMetric?.memoryUsage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics Chart */}
        <div className="control-panel p-6">
          <h3 className="text-lg font-semibold mb-4">System Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
              />
              <Line 
                type="monotone" 
                dataKey="cpuUsage" 
                stroke="#8884d8" 
                name="CPU Usage"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="memoryUsage" 
                stroke="#82ca9d" 
                name="Memory Usage"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Status Distribution */}
        <div className="control-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Agent Status Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-4 space-y-2">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Agent Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="control-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{agent.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span>{agent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks:</span>
                  <span>{agent.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response:</span>
                  <span>{agent.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CPU:</span>
                  <span>{agent.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory:</span>
                  <span>{agent.memoryUsage.toFixed(1)}MB</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last seen: {agent.lastSeen.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-2">
          {activities.map(activity => (
            <div 
              key={activity.id} 
              className={`p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium capitalize">
                    {activity.type.replace('_', ' ')}
                  </div>
                  {activity.agent && (
                    <div className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                      {activity.agent}
                    </div>
                  )}
                </div>
                <div className="text-xs opacity-75">
                  {activity.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <p className="text-sm mt-1">{activity.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 