// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Agents page for AI agent registry and management
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Search, Plus, Settings, Activity, Shield, Zap } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { useAgentStore } from "@/lib/stores"
import { AddAgentModal } from "@/components/agents/AddAgentModal"
import { ConfigureAgentModal } from "@/components/agents/ConfigureAgentModal"
import { MonitorAgentModal } from "@/components/agents/MonitorAgentModal"
import type { Agent } from "@/types"

export default function AgentsPage() {
  const { agents, loading, getActiveAgents, getAverageTrustScore } = useAgentStore()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const [showMonitorModal, setShowMonitorModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const activeAgents = getActiveAgents()
  const averageTrustScore = getAverageTrustScore()
  const processingAgents = agents.filter(a => a.status === 'processing')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'idle': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'consensus': return <Shield className="w-4 h-4" />
      case 'analysis': return <Activity className="w-4 h-4" />
      case 'verification': return <Zap className="w-4 h-4" />
      case 'monitoring': return <Activity className="w-4 h-4" />
      case 'judgment': return <Shield className="w-4 h-4" />
      case 'integration': return <Settings className="w-4 h-4" />
      case 'coordination': return <Users className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const handleConfigureAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowConfigureModal(true)
  }

  const handleMonitorAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowMonitorModal(true)
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Agents", icon: <Users className="w-4 h-4" /> }
  ]

  if (loading) {
    return (
      <Layout title="AI Agents" breadcrumbs={breadcrumbs}>
        <div className="p-6 flex items-center justify-center">
          <div className="text-white">Loading agents...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="AI Agents" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Agent Registry</h1>
            <p className="text-white/70">Manage and monitor your autonomous agents</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/40"
              />
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{agents.length}</div>
                  <div className="text-sm text-white/60">Total Agents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{activeAgents.length}</div>
                  <div className="text-sm text-white/60">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{processingAgents.length}</div>
                  <div className="text-sm text-white/60">Processing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {averageTrustScore > 0 ? averageTrustScore.toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-sm text-white/60">Avg Trust</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="glass glass-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{agent.name}</CardTitle>
                    <Badge className={`border ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-white/70">
                    {agent.metadata?.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Trust Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Trust Score</span>
                      <span className="text-white font-medium">{agent.trustScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${agent.trustScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <div className="text-sm text-white/70 mb-2">Capabilities</div>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs border-white/20 text-white/80">
                          <span className="mr-1">{getCapabilityIcon(capability)}</span>
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {agent.metadata && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-white/70">Response Time</div>
                        <div className="text-white font-medium">{agent.metadata.responseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-white/70">Success Rate</div>
                        <div className="text-white font-medium">{agent.metadata.successRate?.toFixed(1)}%</div>
                      </div>
                    </div>
                  )}

                  {/* Last Seen */}
                  <div className="text-sm">
                    <div className="text-white/70">Last Seen</div>
                    <div className="text-white font-medium">
                      {agent.lastSeen ? new Date(agent.lastSeen).toLocaleString() : 'Never'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 glass"
                      onClick={() => handleConfigureAgent(agent)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 glass"
                      onClick={() => handleMonitorAgent(agent)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Monitor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No agents found' : 'No agents registered'}
              </h3>
              <p className="text-white/60">
                {searchQuery 
                  ? `No agents match "${searchQuery}". Try a different search term.`
                  : "Connect your first AI agent to get started with the registry."
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Agent
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <AddAgentModal 
          open={showAddModal} 
          onOpenChange={setShowAddModal} 
        />
        
        <ConfigureAgentModal 
          open={showConfigureModal} 
          onOpenChange={setShowConfigureModal}
          agent={selectedAgent}
        />
        
        <MonitorAgentModal 
          open={showMonitorModal} 
          onOpenChange={setShowMonitorModal}
          agent={selectedAgent}
        />
      </div>
    </Layout>
  )
} 