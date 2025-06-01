// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Responsive main dashboard page for the Advanced Control Station
//  Version:     2.1.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

'use client'

import { useState, useEffect } from 'react'
import { ControlStationLayout } from '@/components/layout/control-station-layout'
import { AgentControlPanel } from '@/components/agents/agent-control-panel'
import { ToolCallInterface } from '@/components/tools/tool-call-interface'
import { SimulationEngine } from '@/components/simulation/simulation-engine'
import { AdvancedChat } from '@/components/chat/advanced-chat'
import { SystemLogs } from '@/components/logs/system-logs'
import { SignatureManager } from '@/components/signature/signature-manager'
import { NetworkMonitor } from '@/components/network/network-monitor'
import { IPFSContentViewer } from '@/components/ipfs/ipfs-content-viewer'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { agentRuntime, Agent } from '@/lib/agent-runtime'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, MessageSquare, Activity } from 'lucide-react'

export default function AdvancedControlStation() {
  const [activeSection, setActiveSection] = useState<string>('dashboard')
  const [systemStatus, setSystemStatus] = useState({
    blockchain: 'disconnected',
    agents: 0,
    simulations: 0,
    tools: 0,
  })
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    // Initialize system status
    checkSystemStatus()
    // Load agents for debugging
    const loadAgents = () => {
      const runtimeAgents = agentRuntime.getAgents()
      setAgents(runtimeAgents)
      console.log('Loaded agents:', runtimeAgents.map(a => ({ id: a.id, name: a.name, type: a.type, status: a.status })))
    }

    loadAgents()
    const interval = setInterval(loadAgents, 5000)

    return () => clearInterval(interval)
  }, [])

  const checkSystemStatus = async () => {
    // This will be implemented with actual polkadot-api calls
    setSystemStatus({
      blockchain: 'connected',
      agents: 13,
      simulations: 2,
      tools: 12,
    })
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview setActiveSection={setActiveSection} />
      case 'agents':
        return <AgentControlPanel />
      case 'tools':
        return <ToolCallInterface />
      case 'simulation':
        return <SimulationEngine />
      case 'chat':
        return <AdvancedChat />
      case 'logs':
        return <SystemLogs />
      case 'signatures':
        return <SignatureManager />
      case 'network':
        return <NetworkMonitor />
      case 'ipfs':
        return <IPFSContentViewer />
      case 'debug':
        return (
          <div className="p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold mb-4">Debug Information</h1>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Loaded Agents ({agents.length})</h2>
                <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {agents.map(agent => (
                    <div key={agent.id} className="p-3 border rounded-lg bg-white/50">
                      <div className="font-medium text-sm md:text-base">{agent.name}</div>
                      <div className="text-xs md:text-sm text-gray-600">Type: {agent.type} | Status: {agent.status}</div>
                      <div className="text-xs text-gray-600">ID: {agent.id}</div>
                      <div className="text-xs text-gray-600">Capabilities: {agent.capabilities.join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <DashboardOverview setActiveSection={setActiveSection} />
    }
  }

  return (
    <ControlStationLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      systemStatus={systemStatus}
    >
      <div className="flex-1 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                Advanced Control Station
              </h1>
              <p className="text-gray-600 text-xs md:text-sm truncate">
                Specialized AI Agent Simulation & Tool Calling Platform
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 ml-4">
              <StatusIndicator
                status={systemStatus.blockchain}
                label="Blockchain"
                className="hidden sm:flex"
              />
              <StatusIndicator
                status={systemStatus.agents > 0 ? 'online' : 'offline'}
                label={`${systemStatus.agents} Agents`}
                className="hidden md:flex"
              />
              <StatusIndicator
                status={systemStatus.simulations > 0 ? 'active' : 'idle'}
                label={`${systemStatus.simulations} Sims`}
                className="hidden lg:flex"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderMainContent()}
        </main>
      </div>
    </ControlStationLayout>
  )
}

// Dashboard Overview Component
function DashboardOverview({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  const [recentCids] = useState([
    { cid: 'df0544218d0bbb51', type: 'Test Insight', timestamp: '2 min ago' },
    { cid: 'a6c0372997c4425c', type: 'AI Knowledge Search', timestamp: '5 min ago' },
    { cid: 'cb6b2e57339886ae', type: 'Dashboard Update', timestamp: '8 min ago' },
    { cid: '9891ab807e2300e6', type: 'Healthcare Data', timestamp: '12 min ago' },
    { cid: '79cb686ac916f693', type: 'Energy Consensus', timestamp: '15 min ago' },
  ])

  const openIPFSViewer = (cid: string) => {
    // Navigate to IPFS page with pre-filled CID
    setActiveSection('ipfs')
    // Store CID in localStorage for the IPFS viewer to pick up
    localStorage.setItem('selectedCid', cid)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
            <p className="text-xs text-muted-foreground">Agents running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">IPFS Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{recentCids.length}</div>
            <p className="text-xs text-muted-foreground">Recent CIDs available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consensus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Active</div>
            <p className="text-xs text-muted-foreground">Stake-weighted voting</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent IPFS Content Section */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            📄 Recent IPFS Content
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
              {recentCids.length} CIDs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCids.map((item, index) => (
              <div key={item.cid} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded border">
                        {item.cid}
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => openIPFSViewer(item.cid)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  📄 View
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-200">
            <Button
              onClick={() => setActiveSection('ipfs')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              📄 View IPFS Content Viewer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => setActiveSection('agents')} className="h-20 flex-col">
              <Users className="w-6 h-6 mb-2" />
              Manage Agents
            </Button>
            <Button onClick={() => setActiveSection('chat')} className="h-20 flex-col" variant="outline">
              <MessageSquare className="w-6 h-6 mb-2" />
              AI Chat
            </Button>
            <Button onClick={() => setActiveSection('ipfs')} className="h-20 flex-col bg-yellow-600 hover:bg-yellow-700 text-white">
              📄
              <span className="mt-1">View IPFS Content</span>
            </Button>
            <Button onClick={() => setActiveSection('logs')} className="h-20 flex-col" variant="outline">
              <Activity className="w-6 h-6 mb-2" />
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 