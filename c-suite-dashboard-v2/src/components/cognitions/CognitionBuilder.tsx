// ----------------------------------------------------------------------------
//  File:        CognitionBuilder.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Visual builder for creating custom cognition scenarios
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Settings, 
  Users,
  Brain,
  Save,
  Play,
  Copy,
  ArrowDown,
  ArrowUp,
  Wand2,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import type { Cognition, CognitionPhase, Agent } from "@/types/cognitions"

interface CognitionBuilderProps {
  onCognitionCreate: (cognition: Cognition) => void
}

const AVAILABLE_AGENTS = [
  'Lyra', 'Echo', 'Verdict', 'Nexus', 'Volt', 'Sentinel', 'Theory', 
  'Lens', 'Core', 'Beacon', 'Vitals', 'Luma', 'Otto', 'Arc'
]

const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-400' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400' }
]

const CATEGORIES = [
  'cyclic', 'debate', 'introspection', 'handoff', 'memory', 
  'monitoring', 'voting', 'gossip', 'synthetic', 'compliance', 'custom'
]

export function CognitionBuilder({ onCognitionCreate }: CognitionBuilderProps) {
  const [cognition, setCognition] = useState<Partial<Cognition>>({
    name: '',
    description: '',
    category: 'custom',
    initiator: 'Lyra',
    agents: [],
    phases: [],
    success_criteria: '',
    risk_level: 'low',
    memory_policy: {
      store_insights: true,
      inject_recap: 'Core',
      retention_period: 30
    },
    security_hooks: {
      min_trust_score: 80,
      quorum_required: false
    },
    version: '1.0.0'
  })

  const [currentPhase, setCurrentPhase] = useState<Partial<CognitionPhase>>({
    name: '',
    actions: [],
    duration: 60
  })

  const [newAction, setNewAction] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const addAgent = (agentName: string) => {
    if (cognition.agents?.find(a => a.name === agentName)) return
    
    setCognition(prev => ({
      ...prev,
      agents: [
        ...(prev.agents || []),
        {
          name: agentName,
          role: 'participant',
          trustScore: 90 + Math.random() * 10,
          capabilities: ['reasoning', 'analysis']
        }
      ]
    }))
  }

  const removeAgent = (agentName: string) => {
    setCognition(prev => ({
      ...prev,
      agents: prev.agents?.filter(a => a.name !== agentName) || []
    }))
  }

  const addAction = () => {
    if (!newAction.trim()) return
    
    setCurrentPhase(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction.trim()]
    }))
    setNewAction('')
  }

  const removeAction = (index: number) => {
    setCurrentPhase(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }))
  }

  const addPhase = () => {
    if (!currentPhase.name || !currentPhase.actions?.length) return
    
    const phase: CognitionPhase = {
      id: `phase_${(cognition.phases?.length || 0) + 1}`,
      name: currentPhase.name,
      actions: currentPhase.actions,
      duration: currentPhase.duration || 60,
      dependencies: cognition.phases?.length ? [`phase_${cognition.phases.length}`] : []
    }
    
    setCognition(prev => ({
      ...prev,
      phases: [...(prev.phases || []), phase]
    }))
    
    setCurrentPhase({
      name: '',
      actions: [],
      duration: 60
    })
  }

  const removePhase = (index: number) => {
    setCognition(prev => ({
      ...prev,
      phases: prev.phases?.filter((_, i) => i !== index) || []
    }))
  }

  const movePhase = (index: number, direction: 'up' | 'down') => {
    const phases = [...(cognition.phases || [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= phases.length) return
    
    [phases[index], phases[newIndex]] = [phases[newIndex], phases[index]]
    
    setCognition(prev => ({ ...prev, phases }))
  }

  const validateCognition = (): string[] => {
    const errors: string[] = []
    
    if (!cognition.name?.trim()) errors.push('Name is required')
    if (!cognition.description?.trim()) errors.push('Description is required')
    if (!cognition.agents?.length) errors.push('At least one agent is required')
    if (!cognition.phases?.length) errors.push('At least one phase is required')
    if (!cognition.success_criteria?.trim()) errors.push('Success criteria is required')
    
    return errors
  }

  const generateCognitionId = () => {
    return `custom_${cognition.name?.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
  }

  const createCognition = () => {
    const validationErrors = validateCognition()
    setErrors(validationErrors)
    
    if (validationErrors.length > 0) return
    
    const newCognition: Cognition = {
      id: generateCognitionId(),
      name: cognition.name!,
      description: cognition.description!,
      category: cognition.category as any,
      initiator: cognition.initiator!,
      agents: cognition.agents!,
      phases: cognition.phases!,
      success_criteria: cognition.success_criteria!,
      risk_level: cognition.risk_level as any,
      memory_policy: cognition.memory_policy!,
      security_hooks: cognition.security_hooks,
      version: cognition.version!,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    onCognitionCreate(newCognition)
  }

  const generateSampleCognition = () => {
    setCognition({
      name: 'Sample Multi-Agent Analysis',
      description: 'A sample cognition that demonstrates multi-agent collaborative analysis',
      category: 'custom',
      initiator: 'Lyra',
      agents: [
        { name: 'Theory', role: 'analyst', trustScore: 95, capabilities: ['reasoning', 'hypothesis'] },
        { name: 'Echo', role: 'historian', trustScore: 92, capabilities: ['verification', 'logging'] },
        { name: 'Verdict', role: 'evaluator', trustScore: 98, capabilities: ['judgment', 'analysis'] }
      ],
      phases: [
        {
          id: 'phase_1',
          name: 'Initial Analysis',
          actions: ['Gather initial data', 'Form preliminary hypothesis'],
          duration: 45,
          dependencies: []
        },
        {
          id: 'phase_2',
          name: 'Historical Context',
          actions: ['Search historical precedents', 'Log findings'],
          duration: 60,
          dependencies: ['phase_1']
        },
        {
          id: 'phase_3',
          name: 'Final Evaluation',
          actions: ['Synthesize findings', 'Make final determination'],
          duration: 30,
          dependencies: ['phase_2']
        }
      ],
      success_criteria: 'All phases completed with agent consensus',
      risk_level: 'low',
      memory_policy: {
        store_insights: true,
        inject_recap: 'Core',
        retention_period: 30
      },
      security_hooks: {
        min_trust_score: 80,
        quorum_required: false
      },
      version: '1.0.0'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cognition Builder</h2>
          <p className="text-white/60">Create custom multi-agent reasoning scenarios</p>
        </div>
        <Button
          onClick={generateSampleCognition}
          variant="outline"
          className="glass"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Generate Sample
        </Button>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400 mb-2">Validation Errors</h4>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-300">• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={cognition.name || ''}
                onChange={(e) => setCognition(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter cognition name"
                className="glass"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={cognition.description || ''}
                onChange={(e) => setCognition(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this cognition does"
                className="glass"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={cognition.category}
                  onValueChange={(value) => setCognition(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="risk">Risk Level</Label>
                <Select
                  value={cognition.risk_level}
                  onValueChange={(value) => setCognition(prev => ({ ...prev, risk_level: value as any }))}
                >
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RISK_LEVELS.map((risk) => (
                      <SelectItem key={risk.value} value={risk.value}>
                        {risk.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="criteria">Success Criteria</Label>
              <Input
                id="criteria"
                value={cognition.success_criteria || ''}
                onChange={(e) => setCognition(prev => ({ ...prev, success_criteria: e.target.value }))}
                placeholder="Define what constitutes success"
                className="glass"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agent Selection */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Available Agents</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_AGENTS.map((agent) => (
                  <Button
                    key={agent}
                    variant="outline"
                    size="sm"
                    onClick={() => addAgent(agent)}
                    disabled={cognition.agents?.find(a => a.name === agent) !== undefined}
                    className="glass"
                  >
                    {agent}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Selected Agents ({cognition.agents?.length || 0})</Label>
              <div className="space-y-2 mt-2">
                {cognition.agents?.map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                    <div>
                      <span className="font-medium text-white">{agent.name}</span>
                      <span className="text-sm text-white/60 ml-2">({agent.role})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAgent(agent.name)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {cognition.agents?.length === 0 && (
                  <p className="text-white/50 text-sm">No agents selected</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Builder */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Phase Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Phase Builder */}
          <div className="border border-white/20 rounded-lg p-4 bg-white/5">
            <h4 className="font-medium text-white mb-4">Add New Phase</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="phaseName">Phase Name</Label>
                <Input
                  id="phaseName"
                  value={currentPhase.name || ''}
                  onChange={(e) => setCurrentPhase(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter phase name"
                  className="glass"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={currentPhase.duration || 60}
                  onChange={(e) => setCurrentPhase(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="glass"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label>Actions</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="Add an action for this phase"
                  className="flex-1 glass"
                  onKeyPress={(e) => e.key === 'Enter' && addAction()}
                />
                <Button onClick={addAction} className="glass">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-1 mt-2">
                {currentPhase.actions?.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                    <span className="text-white text-sm">{action}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={addPhase}
              disabled={!currentPhase.name || !currentPhase.actions?.length}
              className="glass"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>

          {/* Existing Phases */}
          <div>
            <h4 className="font-medium text-white mb-4">Configured Phases ({cognition.phases?.length || 0})</h4>
            <div className="space-y-3">
              {cognition.phases?.map((phase, index) => (
                <div key={phase.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-white">{phase.name}</h5>
                      <p className="text-sm text-white/60">{phase.duration}s duration</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePhase(index, 'up')}
                        disabled={index === 0}
                        className="glass"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => movePhase(index, 'down')}
                        disabled={index === (cognition.phases?.length || 0) - 1}
                        className="glass"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhase(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {phase.actions.map((action, actionIndex) => (
                      <Badge key={actionIndex} variant="secondary" className="text-xs bg-white/10 text-white/70">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              {cognition.phases?.length === 0 && (
                <p className="text-white/50 text-sm">No phases configured</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={createCognition}
          className="glass"
          disabled={validateCognition().length > 0}
        >
          <Save className="w-4 h-4 mr-2" />
          Create Cognition
        </Button>
        
        <Button
          onClick={() => {
            createCognition()
            // Additional logic to immediately start simulation could go here
          }}
          disabled={validateCognition().length > 0}
        >
          <Play className="w-4 h-4 mr-2" />
          Create & Run
        </Button>
      </div>
    </div>
  )
} 