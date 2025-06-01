// ----------------------------------------------------------------------------
//  File:        ConfigureAgentModal.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Modal for configuring existing AI agents
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useEffect } from 'react'
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
import { Settings, X, Users, Shield, Activity, Zap, Trash2 } from "lucide-react"
import { useAgentStore } from "@/lib/stores"
import type { Agent } from "@/types"

interface ConfigureAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
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

const statusOptions = [
  { value: 'active', label: 'Active', color: 'text-green-400' },
  { value: 'idle', label: 'Idle', color: 'text-gray-400' },
  { value: 'processing', label: 'Processing', color: 'text-yellow-400' },
  { value: 'error', label: 'Error', color: 'text-red-400' }
] as const

export function ConfigureAgentModal({ open, onOpenChange, agent }: ConfigureAgentModalProps) {
  const { updateAgent, removeAgent } = useAgentStore()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialization: '',
    version: '',
    status: 'idle' as Agent['status'],
    trustScore: 0,
    capabilities: [] as string[]
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.metadata.description,
        specialization: agent.metadata.specialization,
        version: agent.version,
        status: agent.status,
        trustScore: agent.trustScore,
        capabilities: [...agent.capabilities]
      })
    }
  }, [agent])

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
    if (!agent) return
    
    setIsSubmitting(true)

    try {
      const updates: Partial<Agent> = {
        name: formData.name,
        version: formData.version,
        status: formData.status,
        trustScore: formData.trustScore,
        capabilities: formData.capabilities,
        metadata: {
          ...agent.metadata,
          description: formData.description,
          specialization: formData.specialization
        }
      }

      updateAgent(agent.id, updates)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update agent:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!agent) return
    
    try {
      removeAgent(agent.id)
      onOpenChange(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete agent:', error)
    }
  }

  const isValid = formData.name.trim() && formData.description.trim() && formData.capabilities.length > 0

  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure Agent
          </DialogTitle>
          <DialogDescription>
            Modify agent settings and capabilities
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Agent Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Specialization</label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Version</label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Trust Score</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.trustScore}
                onChange={(e) => setFormData(prev => ({ ...prev, trustScore: Number(e.target.value) }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all text-sm ${
                    formData.status === status.value
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className={status.color}>{status.label}</span>
                </button>
              ))}
            </div>
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
          <div className="flex justify-between w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(true)}
              className="glass border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            
            <div className="flex gap-2">
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete Agent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{agent.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              className="glass"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
} 