// ----------------------------------------------------------------------------
//  File:        CognitionRegistry.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Registry interface for browsing and selecting cognition scenarios
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  RotateCcw, 
  MessageSquare, 
  Search, 
  Users, 
  Zap, 
  Shield, 
  Vote, 
  MessageCircle, 
  Cog, 
  Scale,
  Filter,
  Play,
  Brain,
  Clock,
  AlertTriangle
} from "lucide-react"
import type { Cognition, CognitionTemplate } from "@/types/cognitions"

interface CognitionRegistryProps {
  onCognitionSelect: (cognition: Cognition) => void
}

// Pre-built cognition templates based on the examples
const cognitionTemplates: CognitionTemplate[] = [
  {
    id: 'cyclic_cognition',
    name: 'Cyclic Cognition',
    description: 'Deterministic loop where agents pass problems around in a circle, each adding unique perspective',
    category: 'cyclic',
    template_phases: [
      { name: 'Theory', actions: ['Generate hypothesis', 'Theoretical analysis'] },
      { name: 'Echo', actions: ['Find historical precedent', 'Log validation'] },
      { name: 'Verdict', actions: ['Legal compliance check', 'Risk assessment'] },
      { name: 'Lens', actions: ['Visual validation', 'Pattern recognition'] },
      { name: 'Core', actions: ['Final synthesis', 'Decision output'] }
    ],
    required_agents: 5,
    recommended_agents: ['Theory', 'Echo', 'Verdict', 'Lens', 'Core'],
    risk_level: 'moderate',
    example_use_cases: ['Scientific roundtable', 'Complex problem solving', 'Multi-perspective analysis']
  },
  {
    id: 'multi_perspective_debate',
    name: 'Multi-Perspective Debates',
    description: 'Split agents into voting blocks for structured debates with moderated outcomes',
    category: 'debate',
    template_phases: [
      { name: 'Position Formation', actions: ['Form pro/con/neutral groups', 'Prepare arguments'] },
      { name: 'Debate Phase', actions: ['Present arguments', 'Counter-arguments', 'Evidence submission'] },
      { name: 'Moderation', actions: ['Evaluate arguments', 'Score positions', 'Determine winner'] }
    ],
    required_agents: 7,
    recommended_agents: ['Volt', 'Verdict', 'Lens', 'Sentinel', 'Echo', 'Vitals', 'Lyra'],
    risk_level: 'low',
    example_use_cases: ['Decision validation', 'Risk assessment', 'Policy evaluation']
  },
  {
    id: 'recursive_introspection',
    name: 'Recursive Introspection',
    description: 'One agent audits another\'s output with rotating reviewers for quality assurance',
    category: 'introspection',
    template_phases: [
      { name: 'Source Fetch', actions: ['Beacon fetches source data'] },
      { name: 'Logging', actions: ['Echo logs the data'] },
      { name: 'Risk Check', actions: ['Sentinel checks for risks'] },
      { name: 'Introspection', actions: ['Theory validates logic soundness'] }
    ],
    required_agents: 4,
    recommended_agents: ['Beacon', 'Echo', 'Sentinel', 'Theory'],
    risk_level: 'low',
    example_use_cases: ['Quality assurance', 'Logic validation', 'Error detection']
  },
  {
    id: 'authority_handoff',
    name: 'Task-Aware Authority Handoff',
    description: 'Dynamic reassignment of orchestration authority based on domain expertise',
    category: 'handoff',
    template_phases: [
      { name: 'Domain Detection', actions: ['Analyze task domain', 'Identify specialist'] },
      { name: 'Authority Transfer', actions: ['Transfer orchestration', 'Update permissions'] },
      { name: 'Specialized Execution', actions: ['Execute with domain expertise'] },
      { name: 'Escalation Check', actions: ['Monitor for escalation needs'] }
    ],
    required_agents: 3,
    recommended_agents: ['Lyra', 'Volt', 'Core'],
    risk_level: 'moderate',
    example_use_cases: ['Electrical diagnostics', 'Medical analysis', 'Legal review']
  },
  {
    id: 'memory_shards',
    name: 'Cross-Agent Memory Shards',
    description: 'Each agent develops subjective context that merges on demand for emergent cognition',
    category: 'memory',
    template_phases: [
      { name: 'Individual Memory', actions: ['Build specialized memories', 'Store domain knowledge'] },
      { name: 'Context Sharing', actions: ['Share relevant memories', 'Cross-reference data'] },
      { name: 'Memory Fusion', actions: ['Merge perspectives', 'Generate insights'] }
    ],
    required_agents: 3,
    recommended_agents: ['Lens', 'Verdict', 'Vitals'],
    risk_level: 'low',
    example_use_cases: ['Case analysis', 'Pattern recognition', 'Parallel processing']
  },
  {
    id: 'ambient_monitoring',
    name: 'Ambient Monitoring & Interrupts',
    description: 'Idle agents monitor background feeds and interrupt when thresholds are crossed',
    category: 'monitoring',
    template_phases: [
      { name: 'Background Monitor', actions: ['Monitor telemetry', 'Watch for anomalies'] },
      { name: 'Threshold Detection', actions: ['Detect threshold breach', 'Assess severity'] },
      { name: 'Interrupt Trigger', actions: ['Interrupt active processes', 'Alert core systems'] }
    ],
    required_agents: 3,
    recommended_agents: ['Sentinel', 'Vitals', 'Luma'],
    risk_level: 'high',
    example_use_cases: ['Security monitoring', 'Health alerts', 'Environmental control']
  },
  {
    id: 'weighted_voting',
    name: 'Weighted Voting System',
    description: 'Consensus model based on expertise, reputation, and subject-matter relevance',
    category: 'voting',
    template_phases: [
      { name: 'Weight Calculation', actions: ['Calculate expertise scores', 'Assess reputation'] },
      { name: 'Vote Collection', actions: ['Collect weighted votes', 'Record positions'] },
      { name: 'Consensus Decision', actions: ['Calculate outcome', 'Update trust scores'] }
    ],
    required_agents: 5,
    recommended_agents: ['Lyra', 'Echo', 'Verdict', 'Core', 'Sentinel'],
    risk_level: 'moderate',
    example_use_cases: ['Critical decisions', 'Resource allocation', 'Policy changes']
  },
  {
    id: 'gossip_networks',
    name: 'Inter-Agent Gossip Networks',
    description: 'Agents share observations and suspicions through organic information spreading',
    category: 'gossip',
    template_phases: [
      { name: 'Observation', actions: ['Detect patterns', 'Form suspicions'] },
      { name: 'Gossip Spread', actions: ['Share with trusted agents', 'Propagate information'] },
      { name: 'Emergence', actions: ['Form collective understanding', 'Generate insights'] }
    ],
    required_agents: 4,
    recommended_agents: ['Lens', 'Sentinel', 'Theory', 'Core'],
    risk_level: 'low',
    example_use_cases: ['Trend detection', 'Threat awareness', 'Collective intelligence']
  },
  {
    id: 'synthetic_tasks',
    name: 'Synthetic Task Generation',
    description: 'Simulate future failures and pre-plan mitigations across agent network',
    category: 'synthetic',
    template_phases: [
      { name: 'Scenario Generation', actions: ['Create hypothetical failures', 'Define parameters'] },
      { name: 'Precedent Check', actions: ['Check historical data', 'Find similar cases'] },
      { name: 'Mitigation Planning', actions: ['Design response plans', 'Allocate resources'] }
    ],
    required_agents: 4,
    recommended_agents: ['Theory', 'Echo', 'Volt', 'Otto'],
    risk_level: 'moderate',
    example_use_cases: ['Disaster planning', 'Risk mitigation', 'Strategic planning']
  },
  {
    id: 'compliance_engine',
    name: 'Legal Compliance Engine',
    description: 'Court-level review of plans through evidence archival and historical context',
    category: 'compliance',
    template_phases: [
      { name: 'Legal Review', actions: ['Check legal compliance', 'Identify violations'] },
      { name: 'Evidence Archive', actions: ['Archive supporting evidence', 'Create audit trail'] },
      { name: 'Historical Context', actions: ['Add historical precedent', 'Document rationale'] }
    ],
    required_agents: 3,
    recommended_agents: ['Verdict', 'Beacon', 'Echo'],
    risk_level: 'high',
    example_use_cases: ['Legal validation', 'Compliance checking', 'Audit preparation']
  }
]

export function CognitionRegistry({ onCognitionSelect }: CognitionRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'All Categories', icon: <Brain className="w-4 h-4" /> },
    { id: 'cyclic', label: 'Cyclic', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'debate', label: 'Debate', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'introspection', label: 'Introspection', icon: <Search className="w-4 h-4" /> },
    { id: 'handoff', label: 'Handoff', icon: <Users className="w-4 h-4" /> },
    { id: 'memory', label: 'Memory', icon: <Zap className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <Shield className="w-4 h-4" /> },
    { id: 'voting', label: 'Voting', icon: <Vote className="w-4 h-4" /> },
    { id: 'gossip', label: 'Gossip', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'synthetic', label: 'Synthetic', icon: <Cog className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance', icon: <Scale className="w-4 h-4" /> }
  ]

  const filteredTemplates = useMemo(() => {
    return cognitionTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const createCognitionFromTemplate = (template: CognitionTemplate): Cognition => {
    return {
      id: `${template.id}_${Date.now()}`,
      name: template.name,
      description: template.description,
      category: template.category,
      initiator: 'Lyra',
      agents: template.recommended_agents.map(name => ({
        name,
        role: 'participant',
        trustScore: 90 + Math.random() * 10,
        capabilities: ['reasoning', 'analysis']
      })),
      phases: template.template_phases.map((phase, index) => ({
        id: `phase_${index}`,
        name: phase.name,
        actions: phase.actions,
        duration: 30 + Math.random() * 60,
        dependencies: index > 0 ? [`phase_${index - 1}`] : []
      })),
      success_criteria: 'All phases completed successfully with consensus',
      risk_level: template.risk_level,
      memory_policy: {
        store_insights: true,
        inject_recap: 'Core',
        retention_period: 30
      },
      security_hooks: {
        min_trust_score: 80,
        quorum_required: template.risk_level === 'high' || template.risk_level === 'critical'
      },
      version: '1.0.0',
      created_at: new Date(),
      updated_at: new Date()
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRiskIcon = (risk: string) => {
    if (risk === 'high' || risk === 'critical') {
      return <AlertTriangle className="w-3 h-3" />
    }
    return <Clock className="w-3 h-3" />
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search cognition scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`glass ${selectedCategory === category.id ? 'bg-blue-500/20 border-blue-500/30' : ''}`}
            >
              {category.icon}
              <span className="ml-1">{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="glass glass-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {categories.find(c => c.id === template.category)?.icon}
                  <span>{template.name}</span>
                </CardTitle>
                <Badge variant="outline" className={`${getRiskColor(template.risk_level)} flex items-center gap-1`}>
                  {getRiskIcon(template.risk_level)}
                  {template.risk_level}
                </Badge>
              </div>
              <CardDescription className="text-white/60">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Phases */}
              <div>
                <div className="text-sm font-medium text-white/70 mb-2">Phases ({template.template_phases.length})</div>
                <div className="space-y-1">
                  {template.template_phases.slice(0, 3).map((phase, index) => (
                    <div key={index} className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
                      {phase.name}
                    </div>
                  ))}
                  {template.template_phases.length > 3 && (
                    <div className="text-xs text-white/40">
                      +{template.template_phases.length - 3} more phases
                    </div>
                  )}
                </div>
              </div>

              {/* Agents */}
              <div>
                <div className="text-sm font-medium text-white/70 mb-2">Required Agents</div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/60">{template.required_agents} agents</span>
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <div className="text-sm font-medium text-white/70 mb-2">Use Cases</div>
                <div className="flex flex-wrap gap-1">
                  {template.example_use_cases.slice(0, 2).map((useCase, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/70">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10">
                <Button
                  onClick={() => onCognitionSelect(createCognitionFromTemplate(template))}
                  className="w-full glass"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Create Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <h3 className="text-xl font-medium text-white/70 mb-2">No scenarios found</h3>
          <p className="text-white/50">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
} 