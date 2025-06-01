// ----------------------------------------------------------------------------
//  File:        agent-control-panel.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Comprehensive agent management and control interface
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Agent {
  id: string
  name: string
  type: 'CEO' | 'CTO' | 'CFO' | 'CMO' | 'COO' | 'CHRO' | 'Custom'
  status: 'active' | 'idle' | 'busy' | 'offline' | 'error'
  capabilities: string[]
  currentTask?: string
  performance: {
    tasksCompleted: number
    successRate: number
    avgResponseTime: number
    uptime: number
  }
  resources: {
    cpu: number
    memory: number
    network: number
  }
  lastActive: Date
}

const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Marcus (CEO)',
    type: 'CEO',
    status: 'active',
    capabilities: ['strategic-planning', 'decision-making', 'stakeholder-management'],
    currentTask: 'Analyzing Q4 strategic objectives',
    performance: {
      tasksCompleted: 47,
      successRate: 94.5,
      avgResponseTime: 1.2,
      uptime: 99.8
    },
    resources: {
      cpu: 23,
      memory: 45,
      network: 12
    },
    lastActive: new Date()
  },
  {
    id: 'agent-002',
    name: 'Victoria (CTO)',
    type: 'CTO',
    status: 'busy',
    capabilities: ['technical-architecture', 'system-design', 'security-audit'],
    currentTask: 'Reviewing blockchain integration protocols',
    performance: {
      tasksCompleted: 63,
      successRate: 97.2,
      avgResponseTime: 0.8,
      uptime: 98.9
    },
    resources: {
      cpu: 67,
      memory: 73,
      network: 34
    },
    lastActive: new Date()
  },
  {
    id: 'agent-003',
    name: 'Alexander (CFO)',
    type: 'CFO',
    status: 'idle',
    capabilities: ['financial-analysis', 'risk-assessment', 'compliance-monitoring'],
    currentTask: undefined,
    performance: {
      tasksCompleted: 38,
      successRate: 96.1,
      avgResponseTime: 1.5,
      uptime: 97.3
    },
    resources: {
      cpu: 15,
      memory: 28,
      network: 8
    },
    lastActive: new Date(Date.now() - 300000)
  },
  {
    id: 'agent-004',
    name: 'Sophia (CMO)',
    type: 'CMO',
    status: 'active',
    capabilities: ['market-analysis', 'brand-strategy', 'customer-insights'],
    currentTask: 'Processing customer sentiment analysis',
    performance: {
      tasksCompleted: 52,
      successRate: 92.8,
      avgResponseTime: 1.1,
      uptime: 96.7
    },
    resources: {
      cpu: 41,
      memory: 56,
      network: 29
    },
    lastActive: new Date()
  }
]

export function AgentControlPanel() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentType, setNewAgentType] = useState<Agent['type']>('Custom')

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        resources: {
          cpu: Math.max(5, Math.min(95, agent.resources.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(10, Math.min(90, agent.resources.memory + (Math.random() - 0.5) * 8)),
          network: Math.max(0, Math.min(50, agent.resources.network + (Math.random() - 0.5) * 15))
        },
        performance: {
          ...agent.performance,
          avgResponseTime: Math.max(0.1, agent.performance.avgResponseTime + (Math.random() - 0.5) * 0.2)
        }
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) return

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      type: newAgentType,
      status: 'idle',
      capabilities: getDefaultCapabilities(newAgentType),
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        avgResponseTime: 0,
        uptime: 100
      },
      resources: {
        cpu: 10,
        memory: 15,
        network: 5
      },
      lastActive: new Date()
    }

    setAgents(prev => [...prev, newAgent])
    setNewAgentName('')
    setNewAgentType('Custom')
    setShowCreateAgent(false)
  }

  const getDefaultCapabilities = (type: Agent['type']): string[] => {
    const capabilityMap = {
      'CEO': ['strategic-planning', 'decision-making', 'stakeholder-management'],
      'CTO': ['technical-architecture', 'system-design', 'security-audit'],
      'CFO': ['financial-analysis', 'risk-assessment', 'compliance-monitoring'],
      'CMO': ['market-analysis', 'brand-strategy', 'customer-insights'],
      'COO': ['operations-management', 'process-optimization', 'supply-chain'],
      'CHRO': ['talent-management', 'culture-development', 'performance-management'],
      'Custom': ['data-processing', 'task-automation', 'report-generation']
    }
    return capabilityMap[type] || ['general-purpose']
  }

  const getStatusColor = (status: Agent['status']) => {
    const colors = {
      'active': 'bg-green-500',
      'idle': 'bg-yellow-500',
      'busy': 'bg-blue-500',
      'offline': 'bg-gray-500',
      'error': 'bg-red-500'
    }
    return colors[status]
  }

  const handleAssignTask = (agentId: string, task: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, currentTask: task, status: 'busy' as const }
        : agent
    ))
  }

  const handleStopAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'offline' as const, currentTask: undefined }
        : agent
    ))
  }

  const handleStartAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'idle' as const }
        : agent
    ))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Control Panel</h1>
          <p className="text-gray-600">Manage and monitor C-Suite agents</p>
        </div>
        <Button onClick={() => setShowCreateAgent(true)}>
          + Create Agent
        </Button>
      </div>

      {/* Agent Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map(agent => (
          <Card 
            key={agent.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedAgent(agent)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
              </div>
              <Badge variant="outline">{agent.type}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Status:</span> {agent.status}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Tasks:</span> {agent.performance.tasksCompleted}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Success:</span> {agent.performance.successRate.toFixed(1)}%
                </div>
                {agent.currentTask && (
                  <div className="text-xs text-blue-600 truncate">
                    {agent.currentTask}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Details Panel */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedAgent.name} - Detailed View</CardTitle>
              <div className="flex gap-2">
                {selectedAgent.status === 'offline' ? (
                  <Button 
                    size="sm" 
                    onClick={() => handleStartAgent(selectedAgent.id)}
                  >
                    Start Agent
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleStopAgent(selectedAgent.id)}
                  >
                    Stop Agent
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const task = prompt('Enter task for agent:')
                    if (task) handleAssignTask(selectedAgent.id, task)
                  }}
                >
                  Assign Task
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tasks Completed:</span>
                    <span className="font-medium">{selectedAgent.performance.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium">{selectedAgent.performance.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">{selectedAgent.performance.avgResponseTime.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium">{selectedAgent.performance.uptime.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Resource Usage */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Resources</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU</span>
                      <span>{selectedAgent.resources.cpu.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${selectedAgent.resources.cpu}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory</span>
                      <span>{selectedAgent.resources.memory.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${selectedAgent.resources.memory}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network</span>
                      <span>{selectedAgent.resources.network.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${selectedAgent.resources.network}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities & Current Task */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
                <div className="space-y-2 mb-4">
                  {selectedAgent.capabilities.map(capability => (
                    <Badge key={capability} variant="secondary" className="mr-1 mb-1">
                      {capability}
                    </Badge>
                  ))}
                </div>
                {selectedAgent.currentTask && (
                  <div>
                    <h4 className="font-medium mb-2">Current Task:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedAgent.currentTask}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Agent Name</label>
                  <Input
                    value={newAgentName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAgentName(e.target.value)}
                    placeholder="Enter agent name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Agent Type</label>
                  <Select value={newAgentType} onValueChange={(value: Agent['type']) => setNewAgentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="CTO">CTO</SelectItem>
                      <SelectItem value="CFO">CFO</SelectItem>
                      <SelectItem value="CMO">CMO</SelectItem>
                      <SelectItem value="COO">COO</SelectItem>
                      <SelectItem value="CHRO">CHRO</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAgent} className="flex-1">
                    Create Agent
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateAgent(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 