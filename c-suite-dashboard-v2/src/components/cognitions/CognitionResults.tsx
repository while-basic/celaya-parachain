// ----------------------------------------------------------------------------
//  File:        CognitionResults.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Results display component for cognition simulation outcomes
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Download,
  Eye,
  Calendar,
  Zap,
  AlertTriangle,
  Info
} from "lucide-react"
import type { CognitionResult } from "@/types/cognitions"

interface CognitionResultsProps {
  results: CognitionResult[]
}

export function CognitionResults({ results }: CognitionResultsProps) {
  const [selectedResult, setSelectedResult] = useState<CognitionResult | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'logs'>('overview')

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto text-white/20 mb-4" />
        <h3 className="text-xl font-medium text-white/70 mb-2">No Results Yet</h3>
        <p className="text-white/50">Run some cognition simulations to see results here</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failure': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'timeout': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'failure': 
      case 'error': return <XCircle className="w-4 h-4" />
      case 'partial': return <AlertTriangle className="w-4 h-4" />
      case 'timeout': return <Clock className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const calculateSuccessRate = () => {
    const successCount = results.filter(r => r.status === 'success').length
    return Math.round((successCount / results.length) * 100)
  }

  const getAverageConsensusScore = () => {
    const validScores = results.filter(r => r.consensus_score !== undefined)
    if (validScores.length === 0) return 0
    const sum = validScores.reduce((acc, r) => acc + (r.consensus_score || 0), 0)
    return Math.round(sum / validScores.length)
  }

  if (selectedResult) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedResult.cognitionName}</h2>
            <p className="text-white/60">Execution ID: {selectedResult.execution_id}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedResult(null)}
            className="glass"
          >
            Back to Overview
          </Button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
            { id: 'detailed', label: 'Detailed', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'logs', label: 'Logs', icon: <FileText className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                viewMode === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Execution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Status</span>
                  <Badge variant="outline" className={`${getStatusColor(selectedResult.status)} flex items-center gap-1`}>
                    {getStatusIcon(selectedResult.status)}
                    {selectedResult.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Duration</span>
                  <span className="text-white">{formatDuration(selectedResult.duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Agents</span>
                  <span className="text-white">{selectedResult.participating_agents.length}</span>
                </div>

                {selectedResult.consensus_score && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70">Consensus Score</span>
                      <span className="text-white">{Math.round(selectedResult.consensus_score)}%</span>
                    </div>
                    <Progress value={selectedResult.consensus_score} className="w-full" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Phases Completed</span>
                  <span className="text-white">
                    {selectedResult.phase_results.filter(p => p.status === 'completed').length} / {selectedResult.phase_results.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trust Impact */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Trust Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(selectedResult.trust_impact).map(([agent, impact]) => (
                  <div key={agent} className="flex items-center justify-between">
                    <span className="text-white/70">{agent}</span>
                    <div className="flex items-center gap-2">
                      {impact > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm ${impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {impact > 0 ? '+' : ''}{impact.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="glass lg:col-span-2">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedResult.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {/* Phase Results */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Phase-by-Phase Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedResult.phase_results.map((phase, index) => (
                    <div key={phase.phase_id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">Phase {index + 1}</h4>
                        <Badge variant="outline" className={`${getStatusColor(phase.status)}`}>
                          {phase.status}
                        </Badge>
                      </div>
                      
                      <p className="text-white/70 text-sm mb-3">{phase.output}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Duration:</span>
                          <span className="text-white ml-2">{formatDuration(phase.duration * 1000)}</span>
                        </div>
                        {phase.agent_contributions && (
                          <div>
                            <span className="text-white/60">Top Contributor:</span>
                            <span className="text-white ml-2">
                              {Object.entries(phase.agent_contributions).reduce((a, b) => 
                                (phase.agent_contributions as any)[a[0]] > (phase.agent_contributions as any)[b[0]] ? a : b
                              )[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'logs' && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Execution Logs</span>
                <Button variant="outline" size="sm" className="glass">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {selectedResult.logs.map((log, index) => (
                  <div key={index} className="text-white/80 mb-1">
                    {typeof log === 'string' ? log : JSON.stringify(log)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Simulations</p>
                <p className="text-xl font-bold text-white">{results.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Success Rate</p>
                <p className="text-xl font-bold text-white">{calculateSuccessRate()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Avg Consensus</p>
                <p className="text-xl font-bold text-white">{getAverageConsensusScore()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Avg Duration</p>
                <p className="text-xl font-bold text-white">
                  {formatDuration(results.reduce((acc, r) => acc + r.duration, 0) / results.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
          <CardDescription>Click on any result to view detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className="p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{result.cognitionName}</h4>
                    <p className="text-sm text-white/60">
                      {new Date(result.start_time).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(result.status)} flex items-center gap-1`}>
                    {getStatusIcon(result.status)}
                    {result.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Duration:</span>
                    <span className="text-white ml-2">{formatDuration(result.duration)}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Agents:</span>
                    <span className="text-white ml-2">{result.participating_agents.length}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Phases:</span>
                    <span className="text-white ml-2">
                      {result.phase_results.filter(p => p.status === 'completed').length}/{result.phase_results.length}
                    </span>
                  </div>
                  {result.consensus_score && (
                    <div>
                      <span className="text-white/60">Consensus:</span>
                      <span className="text-white ml-2">{Math.round(result.consensus_score)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 