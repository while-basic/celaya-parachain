// ----------------------------------------------------------------------------
//  File:        ExecutionReports.tsx
//  Project:     Celaya Solutions (C-Suite Blockchain)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Comprehensive execution reports viewer with blockchain integration
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Users,
  BarChart3,
  ExternalLink,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Database,
  Shield,
  Zap,
  RefreshCw
} from 'lucide-react'

interface ExecutionReport {
  execution_id: string
  cognition_id: string
  cognition_name: string
  status: string
  report_id?: string
  blockchain_hash?: string
  ipfs_cid?: string
  report_generated_at?: string
  start_time: string
  end_time: string
  duration: number
  agents_participated: string[]
  phases_completed: number
}

interface DetailedReport {
  report_id: string
  report_version: string
  generation_timestamp: string
  execution_id: string
  cognition_name: string
  execution_status: string
  total_duration_ms: number
  participating_agents: any[]
  key_insights: string[]
  recommendations: string[]
  execution_quality_score: number
  reliability_index: number
  innovation_score: number
  efficiency_rating: number
  blockchain_hash: string
  ipfs_cid: string
  merkle_root: string
  verification_signature: string
  compliance_checks: Record<string, boolean>
  agent_performance_metrics: Record<string, any>
  llm_models_used: Record<string, string>
}

const API_BASE_URL = 'http://localhost:8000'

export function ExecutionReports() {
  const [reports, setReports] = useState<ExecutionReport[]>([])
  const [selectedReport, setSelectedReport] = useState<DetailedReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/reports/`)
      const data = await response.json()
      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDetailedReport = async (executionId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/reports/execution/${executionId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedReport(data.report)
        setViewMode('detail')
      }
    } catch (error) {
      console.error('Failed to load detailed report:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (executionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/generate/${executionId}`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        await loadReports() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const openHtmlReport = (reportId: string) => {
    window.open(`${API_BASE_URL}/reports/html/${reportId}`, '_blank')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.cognition_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.execution_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (viewMode === 'detail' && selectedReport) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Execution Report</h2>
            <p className="text-white/60">Detailed analysis and blockchain verification</p>
          </div>
          <Button
            onClick={() => {
              setViewMode('list')
              setSelectedReport(null)
            }}
            variant="outline"
            className="glass"
          >
            ← Back to Reports
          </Button>
        </div>

        {/* Report Overview */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  {selectedReport.cognition_name}
                </CardTitle>
                <CardDescription>Report ID: {selectedReport.report_id}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => selectedReport.report_id && openHtmlReport(selectedReport.report_id)}
                  variant="outline"
                  size="sm"
                  className="glass"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View HTML
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-black/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {(selectedReport.execution_quality_score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/60">Quality Score</div>
              </div>
              <div className="text-center p-4 bg-black/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {(selectedReport.reliability_index * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/60">Reliability</div>
              </div>
              <div className="text-center p-4 bg-black/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">
                  {(selectedReport.innovation_score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/60">Innovation</div>
              </div>
              <div className="text-center p-4 bg-black/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">
                  {(selectedReport.efficiency_rating * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/60">Efficiency</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain & IPFS Information */}
        <Card className="glass border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Blockchain & IPFS Storage
            </CardTitle>
            <CardDescription>Immutable storage and verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/40 rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white/70">Blockchain Hash</span>
                  <Button
                    onClick={() => copyToClipboard(selectedReport.blockchain_hash)}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <FileText className="w-3 h-3" />
                  </Button>
                </div>
                <div className="font-mono text-xs text-blue-400 break-all bg-blue-900/20 p-2 rounded">
                  {selectedReport.blockchain_hash}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white/70">IPFS CID</span>
                  <Button
                    onClick={() => copyToClipboard(selectedReport.ipfs_cid)}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <FileText className="w-3 h-3" />
                  </Button>
                </div>
                <div className="font-mono text-xs text-green-400 break-all bg-green-900/20 p-2 rounded">
                  {selectedReport.ipfs_cid}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white/70">Verification Signature</span>
                  <Button
                    onClick={() => copyToClipboard(selectedReport.verification_signature)}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                  >
                    <Shield className="w-3 h-3" />
                  </Button>
                </div>
                <div className="font-mono text-xs text-purple-400 break-all bg-purple-900/20 p-2 rounded">
                  {selectedReport.verification_signature}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedReport.key_insights.map((insight, index) => (
                <div key={index} className="bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded-r">
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedReport.recommendations.map((rec, index) => (
                <div key={index} className="bg-green-900/20 border-l-4 border-green-400 p-3 rounded-r">
                  {rec}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Agent Performance & Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white/80 mb-3">Performance Metrics</h4>
                <div className="space-y-3">
                  {Object.entries(selectedReport.agent_performance_metrics).map(([agent, metrics]: [string, any]) => (
                    <div key={agent} className="bg-black/20 p-3 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{agent}</span>
                        <span className="text-sm text-white/60">
                          {(metrics.overall_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={metrics.overall_score * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white/80 mb-3">LLM Models Used</h4>
                <div className="space-y-2">
                  {Object.entries(selectedReport.llm_models_used).map(([agent, model]) => (
                    <div key={agent} className="flex items-center justify-between p-2 bg-black/20 rounded">
                      <span className="font-medium">{agent}</span>
                      <Badge variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedReport.compliance_checks).map(([check, passed]) => (
                <div key={check} className="flex items-center justify-between p-3 bg-black/20 rounded">
                  <span className="text-sm">{check.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  {passed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Execution Reports</h2>
          <p className="text-white/60">
            Comprehensive analysis with blockchain verification
          </p>
        </div>
        <Button
          onClick={loadReports}
          disabled={loading}
          className="glass"
        >
          {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <Input
                  placeholder="Search by cognition name or execution ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-white/40 animate-spin mb-4" />
              <p className="text-white/60">Loading reports...</p>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <h3 className="text-xl font-medium text-white/70 mb-2">No Reports Found</h3>
              <p className="text-white/50">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Run some cognitions to generate reports'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.execution_id} className="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {report.cognition_name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`
                          ${report.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            report.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}
                        `}
                      >
                        {report.status}
                      </Badge>
                      {report.report_id && (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Report Available
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/60 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDuration(report.duration)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {report.agents_participated.length} agents
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {report.phases_completed} phases
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatTimestamp(report.start_time)}
                      </div>
                    </div>

                    {/* Blockchain Information */}
                    {report.blockchain_hash && (
                      <div className="bg-black/20 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-white/50">Blockchain Hash:</span>
                            <div className="font-mono text-blue-400 truncate">
                              {report.blockchain_hash}
                            </div>
                          </div>
                          <div>
                            <span className="text-white/50">IPFS CID:</span>
                            <div className="font-mono text-green-400 truncate">
                              {report.ipfs_cid}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {report.report_id ? (
                      <>
                        <Button
                          onClick={() => loadDetailedReport(report.execution_id)}
                          className="glass"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Report
                        </Button>
                        <Button
                          onClick={() => report.report_id && openHtmlReport(report.report_id)}
                          variant="outline"
                          size="sm"
                          className="glass"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => generateReport(report.execution_id)}
                        variant="outline"
                        size="sm"
                        className="glass"
                        disabled={report.status !== 'completed'}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 