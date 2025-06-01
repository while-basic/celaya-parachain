// ----------------------------------------------------------------------------
//  File:        simulation-engine.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Advanced multi-agent simulation engine with scenario modeling
//  Version:     2.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface SimulationAgent {
  id: string
  name: string
  type: 'lens' | 'core' | 'echo' | 'theory'
  status: 'active' | 'idle' | 'processing' | 'error'
  interactions: number
  performance: number
  position: { x: number; y: number }
}

interface SimulationScenario {
  id: string
  name: string
  description: string
  participants: string[]
  duration: number
  complexity: 'simple' | 'moderate' | 'complex'
  objectives: string[]
}

interface SimulationMetric {
  timestamp: Date
  totalInteractions: number
  successRate: number
  avgResponseTime: number
  systemLoad: number
  collaborationIndex: number
}

interface SimulationRun {
  id: string
  scenario: string
  status: 'preparing' | 'running' | 'completed' | 'error'
  startTime: Date
  endTime?: Date
  progress: number
  participants: SimulationAgent[]
  metrics: SimulationMetric[]
  results?: any
}

const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'compliance-audit',
    name: 'Compliance Audit Workflow',
    description: 'Multi-agent collaboration for comprehensive compliance auditing',
    participants: ['Lens Agent', 'Echo Agent', 'Core Agent'],
    duration: 300, // seconds
    complexity: 'moderate',
    objectives: [
      'Document analysis and classification',
      'Risk assessment and scoring',
      'Compliance report generation',
      'Recommendation synthesis'
    ]
  },
  {
    id: 'image-analysis-pipeline',
    name: 'Image Analysis Pipeline',
    description: 'Computer vision workflow with quality assurance and validation',
    participants: ['Lens Agent', 'Core Agent', 'Theory Agent'],
    duration: 180,
    complexity: 'simple',
    objectives: [
      'Image preprocessing and enhancement',
      'Object detection and classification',
      'Quality validation and scoring',
      'Results formatting and export'
    ]
  },
  {
    id: 'theoretical-validation',
    name: 'Theoretical Model Validation',
    description: 'Complex multi-step validation of mathematical models',
    participants: ['Theory Agent', 'Core Agent', 'Echo Agent', 'Lens Agent'],
    duration: 600,
    complexity: 'complex',
    objectives: [
      'Model parameter extraction',
      'Statistical validation testing',
      'Cross-validation analysis',
      'Compliance verification',
      'Comprehensive reporting'
    ]
  },
  {
    id: 'crisis-response',
    name: 'Crisis Response Simulation',
    description: 'Emergency response coordination between all agents',
    participants: ['Core Agent', 'Lens Agent', 'Echo Agent', 'Theory Agent'],
    duration: 450,
    complexity: 'complex',
    objectives: [
      'Situation assessment',
      'Resource allocation',
      'Risk mitigation planning',
      'Communication coordination',
      'Recovery strategy development'
    ]
  }
]

export function SimulationEngine() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null)
  const [currentRun, setCurrentRun] = useState<SimulationRun | null>(null)
  const [simulationHistory, setSimulationHistory] = useState<SimulationRun[]>([])
  const [isConfiguring, setIsConfiguring] = useState(false)

  const initializeAgents = (participants: string[]): SimulationAgent[] => {
    const agentTypes: Record<string, SimulationAgent['type']> = {
      'Lens Agent': 'lens',
      'Core Agent': 'core',
      'Echo Agent': 'echo',
      'Theory Agent': 'theory'
    }

    return participants.map((name, index) => ({
      id: `agent-${index}`,
      name,
      type: agentTypes[name],
      status: 'idle',
      interactions: 0,
      performance: 85 + Math.random() * 15,
      position: {
        x: 100 + (index % 2) * 300,
        y: 100 + Math.floor(index / 2) * 200
      }
    }))
  }

  const startSimulation = async () => {
    if (!selectedScenario) return

    const newRun: SimulationRun = {
      id: `sim-${Date.now()}`,
      scenario: selectedScenario.name,
      status: 'preparing',
      startTime: new Date(),
      progress: 0,
      participants: initializeAgents(selectedScenario.participants),
      metrics: []
    }

    setCurrentRun(newRun)

    // Simulate preparation phase
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    newRun.status = 'running'
    setCurrentRun({ ...newRun })

    // Run simulation with progress updates
    const duration = selectedScenario.duration * 1000 // Convert to milliseconds
    const updateInterval = 1000 // Update every second
    const totalUpdates = duration / updateInterval

    for (let i = 0; i <= totalUpdates; i++) {
      await new Promise(resolve => setTimeout(resolve, updateInterval))
      
      const progress = (i / totalUpdates) * 100
      const newMetric: SimulationMetric = {
        timestamp: new Date(),
        totalInteractions: Math.floor(Math.random() * 20) + 10,
        successRate: 0.8 + Math.random() * 0.15,
        avgResponseTime: 100 + Math.random() * 200,
        systemLoad: 30 + Math.random() * 40,
        collaborationIndex: 0.7 + Math.random() * 0.25
      }

      // Update agent statuses randomly
      const updatedParticipants = newRun.participants.map(agent => ({
        ...agent,
        status: Math.random() > 0.7 ? 'processing' : 'active' as SimulationAgent['status'],
        interactions: agent.interactions + Math.floor(Math.random() * 3),
        performance: Math.max(50, Math.min(100, agent.performance + (Math.random() - 0.5) * 10))
      }))

      setCurrentRun(prev => prev ? {
        ...prev,
        progress,
        participants: updatedParticipants,
        metrics: [...prev.metrics, newMetric]
      } : null)
    }

    // Complete simulation
    const completedRun: SimulationRun = {
      ...newRun,
      status: 'completed',
      endTime: new Date(),
      progress: 100,
      results: generateSimulationResults(selectedScenario)
    }

    setCurrentRun(completedRun)
    setSimulationHistory(prev => [completedRun, ...prev.slice(0, 9)])
  }

  const generateSimulationResults = (scenario: SimulationScenario) => {
    return {
      overallSuccess: Math.random() > 0.2,
      efficiency: 0.75 + Math.random() * 0.2,
      collaborationScore: 0.8 + Math.random() * 0.15,
      objectivesCompleted: Math.floor(scenario.objectives.length * (0.7 + Math.random() * 0.3)),
      totalObjectives: scenario.objectives.length,
      keyInsights: [
        'Agent collaboration exceeded baseline expectations',
        'Response time optimization opportunities identified',
        'Communication patterns show potential for improvement',
        'Task distribution was well-balanced across participants'
      ],
      recommendations: [
        'Implement caching for frequently accessed resources',
        'Optimize inter-agent communication protocols',
        'Consider load balancing adjustments for complex scenarios',
        'Enhance error recovery mechanisms'
      ]
    }
  }

  const stopSimulation = () => {
    if (currentRun && currentRun.status === 'running') {
      const stoppedRun = {
        ...currentRun,
        status: 'completed' as const,
        endTime: new Date(),
        results: { message: 'Simulation stopped by user', incomplete: true }
      }
      setCurrentRun(stoppedRun)
      setSimulationHistory(prev => [stoppedRun, ...prev.slice(0, 9)])
    }
  }

  const resetSimulation = () => {
    setCurrentRun(null)
    setSelectedScenario(null)
    setIsConfiguring(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Simulation Engine</h1>
        <div className="flex gap-2">
          {!currentRun && (
            <button
              onClick={() => setIsConfiguring(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              New Simulation
            </button>
          )}
          {currentRun?.status === 'running' && (
            <button
              onClick={stopSimulation}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Stop Simulation
            </button>
          )}
          {currentRun && (
            <button
              onClick={resetSimulation}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Scenario Selection */}
      {isConfiguring && !currentRun && (
        <div className="control-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Select Simulation Scenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SIMULATION_SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => {
                  setSelectedScenario(scenario)
                  setIsConfiguring(false)
                }}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  selectedScenario?.id === scenario.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    scenario.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                    scenario.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {scenario.complexity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                <div className="text-xs text-gray-500">
                  <div>Duration: {Math.floor(scenario.duration / 60)}m {scenario.duration % 60}s</div>
                  <div>Participants: {scenario.participants.join(', ')}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Configuration */}
      {selectedScenario && !currentRun && (
        <div className="control-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Configure: {selectedScenario.name}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Scenario Details</h4>
              <p className="text-sm text-gray-600 mb-4">{selectedScenario.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Complexity:</span>
                  <span className="capitalize">{selectedScenario.complexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>{Math.floor(selectedScenario.duration / 60)}m {selectedScenario.duration % 60}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span>{selectedScenario.participants.length}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Objectives</h4>
              <ul className="space-y-1 text-sm">
                {selectedScenario.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"/>
                    {objective}
                  </li>
                ))}
              </ul>

              <button
                onClick={startSimulation}
                className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Start Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Simulation */}
      {currentRun && (
        <div className="space-y-6">
          {/* Simulation Status */}
          <div className="control-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{currentRun.scenario}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                currentRun.status === 'running' ? 'bg-blue-100 text-blue-800' :
                currentRun.status === 'completed' ? 'bg-green-100 text-green-800' :
                currentRun.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentRun.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{currentRun.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentRun.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Start Time:</span>
                <div>{currentRun.startTime.toLocaleTimeString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <div>
                  {currentRun.endTime 
                    ? `${Math.round((currentRun.endTime.getTime() - currentRun.startTime.getTime()) / 1000)}s`
                    : `${Math.round((Date.now() - currentRun.startTime.getTime()) / 1000)}s`
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-600">Participants:</span>
                <div>{currentRun.participants.length} agents</div>
              </div>
            </div>
          </div>

          {/* Agent Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRun.participants.map(agent => (
              <div key={agent.id} className="control-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{agent.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    agent.status === 'active' ? 'bg-green-100 text-green-800' :
                    agent.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    agent.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interactions:</span>
                    <span>{agent.interactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Performance:</span>
                    <span>{agent.performance.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Metrics */}
          {currentRun.metrics.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="control-panel p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={currentRun.metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="successRate" 
                      stroke="#10B981" 
                      name="Success Rate"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="collaborationIndex" 
                      stroke="#8B5CF6" 
                      name="Collaboration"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="control-panel p-6">
                <h3 className="text-lg font-semibold mb-4">System Load</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={currentRun.metrics.slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <Bar dataKey="totalInteractions" fill="#3B82F6" name="Interactions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Results */}
          {currentRun.results && currentRun.status === 'completed' && (
            <div className="control-panel p-6">
              <h3 className="text-lg font-semibold mb-4">Simulation Results</h3>
              
              {!currentRun.results.incomplete ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Performance Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overall Success:</span>
                        <span className={currentRun.results.overallSuccess ? 'text-green-600' : 'text-red-600'}>
                          {currentRun.results.overallSuccess ? 'Success' : 'Partial'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency:</span>
                        <span>{(currentRun.results.efficiency * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Collaboration Score:</span>
                        <span>{(currentRun.results.collaborationScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Objectives Completed:</span>
                        <span>{currentRun.results.objectivesCompleted}/{currentRun.results.totalObjectives}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Key Insights</h4>
                    <ul className="space-y-1 text-sm">
                      {currentRun.results.keyInsights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"/>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600 py-4">
                  {currentRun.results.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Simulation History */}
      {simulationHistory.length > 0 && !currentRun && (
        <div className="control-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Simulations</h3>
          <div className="space-y-2">
            {simulationHistory.map(run => (
              <div key={run.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{run.scenario}</div>
                  <div className="text-sm text-gray-600">
                    {run.startTime.toLocaleString()} • {run.participants.length} participants
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  run.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 