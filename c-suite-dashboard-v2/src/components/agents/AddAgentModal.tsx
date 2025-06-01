// ----------------------------------------------------------------------------
//  File:        AddAgentModal.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Modal for adding new AI agents to the registry
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Plus, X, Users, Shield, Activity, Settings, Zap } from "lucide-react"
import { useAgentStore } from "@/lib/stores"
import type { Agent } from "@/types"

interface AddAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const availableCapabilities = [
  { id: 'consensus', label: 'Consensus', icon: <Shield className="w-4 h-4" /> },
  { id: 'analysis', label: 'Analysis', icon: <Activity className="w-4 h-4" /> },
  { id: 'verification', label: 'Verification', icon: <Zap className="w-4 h-4" /> },
  { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
  { id: 'judgment', label: 'Judgment', icon: <Shield className="w-4 h-4" /> },
  { id: 'integration', label: 'Integration', icon: <Settings className="w-4 h-4" /> },
  { id: 'coordination', label: 'Coordination', icon: <Users className="w-4 h-4" /> }
]

export function AddAgentModal({ open, onOpenChange }: AddAgentModalProps) {
  const { addAgent } = useAgentStore()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialization: '',
    version: '1.0.0',
    capabilities: [] as string[]
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCapabilityToggle = (capabilityId: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capabilityId)
        ? prev.capabilities.filter(c => c !== capabilityId)
        : [...prev.capabilities, capabilityId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newAgent: Agent = {
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        trustScore: 75, // Starting trust score
        status: 'idle' as const,
        capabilities: formData.capabilities,
        version: formData.version,
        lastSeen: new Date(),
        metadata: {
          description: formData.description,
          specialization: formData.specialization,
          processingPower: Math.floor(Math.random() * 100) + 50, // Random between 50-150
          responseTime: Math.floor(Math.random() * 200) + 50, // Random between 50-250ms
          successRate: Math.floor(Math.random() * 20) + 80 // Random between 80-100%
        }
      }

      addAgent(newAgent)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        specialization: '',
        version: '1.0.0',
        capabilities: []
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add agent:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = formData.name.trim() && formData.description.trim() && formData.capabilities.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Agent
          </DialogTitle>
          <DialogDescription>
            Register a new AI agent to the blockchain registry
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Agent Name</label>
            <Input
              placeholder="e.g., Consensus Validator Alpha"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description</label>
            <Input
              placeholder="Brief description of the agent's purpose"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Specialization</label>
            <Input
              placeholder="e.g., Blockchain Consensus, Data Analysis"
              value={formData.specialization}
              onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Version</label>
            <Input
              placeholder="1.0.0"
              value={formData.version}
              onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Capabilities</label>
            <div className="grid grid-cols-2 gap-2">
              {availableCapabilities.map(capability => (
                <button
                  key={capability.id}
                  type="button"
                  onClick={() => handleCapabilityToggle(capability.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-sm ${
                    formData.capabilities.includes(capability.id)
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {capability.icon}
                  {capability.label}
                </button>
              ))}
            </div>
            {formData.capabilities.length === 0 && (
              <p className="text-xs text-red-400">Please select at least one capability</p>
            )}
          </div>

          {formData.capabilities.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Selected Capabilities</label>
              <div className="flex flex-wrap gap-2">
                {formData.capabilities.map(capId => {
                  const capability = availableCapabilities.find(c => c.id === capId)
                  return (
                    <Badge 
                      key={capId} 
                      variant="outline" 
                      className="border-blue-500/30 text-blue-400 bg-blue-500/10"
                    >
                      <span className="mr-1">{capability?.icon}</span>
                      {capability?.label}
                      <button
                        type="button"
                        onClick={() => handleCapabilityToggle(capId)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="glass"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Adding...' : 'Add Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 