// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Cognition simulation interface for multi-agent scenarios
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Play, Pause, RotateCcw, Settings, Users, Zap, FileText, Home } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { CognitionRegistry } from "@/components/cognitions/CognitionRegistry"
import { CognitionSimulator } from "@/components/cognitions/CognitionSimulator"
import { CognitionResults } from "@/components/cognitions/CognitionResults"
import { CognitionBuilder } from "@/components/cognitions/CognitionBuilder"
import { useSystemStore } from "@/lib/stores"
import type { Cognition, CognitionResult } from "@/types/cognitions"

export default function CognitionsPage() {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'simulator' | 'builder' | 'results'>('scenarios')
  const [selectedCognition, setSelectedCognition] = useState<Cognition | null>(null)
  const [simulationResults, setSimulationResults] = useState<CognitionResult[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const { addNotification } = useSystemStore()

  useEffect(() => {
    addNotification({
      type: 'info',
      title: 'Cognitions Module Loaded',
      message: 'Multi-agent cognition simulation interface is now available'
    })
  }, [addNotification])

  const handleCognitionSelect = (cognition: Cognition) => {
    setSelectedCognition(cognition)
    setActiveTab('simulator')
    addNotification({
      type: 'info',
      title: 'Cognition Selected',
      message: `Selected: ${cognition.name} - Ready for simulation`
    })
  }

  const handleSimulationComplete = (result: CognitionResult) => {
    setSimulationResults(prev => [result, ...prev])
    setActiveTab('results')
    addNotification({
      type: 'success',
      title: 'Simulation Complete',
      message: `${result.cognitionName} completed with ${result.status} status`
    })
  }

  const breadcrumbs = [
    { label: "Dashboard", icon: <Home className="w-4 h-4" />, href: "/" },
    { label: "Cognitions", icon: <Brain className="w-4 h-4" /> }
  ]

  const tabs = [
    {
      id: 'scenarios' as const,
      label: 'Scenarios',
      icon: <FileText className="w-4 h-4" />,
      description: 'Browse and select cognition scenarios'
    },
    {
      id: 'simulator' as const,
      label: 'Simulator',
      icon: <Play className="w-4 h-4" />,
      description: 'Configure and run simulations'
    },
    {
      id: 'builder' as const,
      label: 'Builder',
      icon: <Settings className="w-4 h-4" />,
      description: 'Create custom cognitions'
    },
    {
      id: 'results' as const,
      label: 'Results',
      icon: <Zap className="w-4 h-4" />,
      description: 'View simulation outcomes'
    }
  ]

  return (
    <Layout title="Cognitions" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Cognition Simulations
          </h1>
          <p className="text-white/70 text-lg">
            Multi-agent reasoning scenarios and behavioral simulation platform
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'scenarios' && (
            <CognitionRegistry onCognitionSelect={handleCognitionSelect} />
          )}
          
          {activeTab === 'simulator' && (
            <CognitionSimulator
              selectedCognition={selectedCognition}
              onSimulationComplete={handleSimulationComplete}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
            />
          )}
          
          {activeTab === 'builder' && (
            <CognitionBuilder onCognitionCreate={handleCognitionSelect} />
          )}
          
          {activeTab === 'results' && (
            <CognitionResults results={simulationResults} />
          )}
        </div>
      </div>
    </Layout>
  )
} 