// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard v2)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Consensus page for viewing consensus logs and decisions
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, TrendingUp, Users, Clock, AlertCircle } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { useConsensusStore, useAgentStore } from "@/lib/stores"

export default function ConsensusPage() {
  const { consensusLogs, getVerifiedConsensus, getRecentConsensus } = useConsensusStore()
  const { agents, getAgentById } = useAgentStore()

  const consensusMetrics = useMemo(() => {
    const verifiedLogs = getVerifiedConsensus()
    const recentLogs = getRecentConsensus(10)
    const averageStrength = consensusLogs.length > 0 
      ? consensusLogs.reduce((sum, log) => sum + log.strength, 0) / consensusLogs.length 
      : 0
    const successRate = consensusLogs.length > 0
      ? (verifiedLogs.length / consensusLogs.length) * 100
      : 0

    return {
      totalDecisions: consensusLogs.length,
      verifiedDecisions: verifiedLogs.length,
      averageStrength,
      successRate,
      recentLogs
    }
  }, [consensusLogs, getVerifiedConsensus, getRecentConsensus])

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Consensus", icon: <Shield className="w-4 h-4" /> }
  ]

  return (
    <Layout title="Consensus" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Consensus Monitoring</h1>
            <p className="text-white/70">Track consensus decisions and agent agreement</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{consensusMetrics.totalDecisions}</div>
                  <div className="text-sm text-white/60">Total Decisions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{consensusMetrics.verifiedDecisions}</div>
                  <div className="text-sm text-white/60">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {consensusMetrics.averageStrength.toFixed(2)}
                  </div>
                  <div className="text-sm text-white/60">Avg Strength</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {consensusMetrics.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-white/60">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consensus Logs */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Recent Consensus Decisions
            </CardTitle>
            <CardDescription>Latest consensus decisions by the agent network</CardDescription>
          </CardHeader>
          <CardContent>
            {consensusMetrics.recentLogs.length > 0 ? (
              <div className="space-y-4">
                {consensusMetrics.recentLogs.map((log) => {
                  const agent = getAgentById(log.agentId)
                  const verifiedSignatures = log.signatures.filter(s => s.verified)
                  
                  return (
                    <div key={log.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${log.verified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                          <div>
                            <div className="text-white font-medium">{log.decision}</div>
                            <div className="text-white/60 text-sm">
                              Initiated by {agent?.name || `Agent ${log.agentId.slice(0, 8)}...`}
                            </div>
                          </div>
                        </div>
                        <Badge className={`border ${log.verified ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                          {log.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-white/70">Consensus Strength</div>
                          <div className="flex items-center gap-2">
                            <div className="text-white font-medium">{log.strength.toFixed(2)}</div>
                            <div className="w-20 bg-white/10 rounded-full h-1">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full"
                                style={{ width: `${Math.min(100, log.strength * 20)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70">Signatures</div>
                          <div className="text-white font-medium">
                            {verifiedSignatures.length}/{log.signatures.length}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70">Timestamp</div>
                          <div className="text-white font-medium">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Signatures */}
                      {log.signatures.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-white/70 text-sm mb-2">Agent Signatures:</div>
                          <div className="flex flex-wrap gap-2">
                            {log.signatures.map((signature, index) => {
                              const signingAgent = getAgentById(signature.agentId)
                              return (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`text-xs ${signature.verified ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}
                                >
                                  {signingAgent?.name || `Agent ${signature.agentId.slice(0, 6)}...`}
                                  {signature.verified ? ' ✓' : ' ✗'}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No consensus decisions</h3>
                <p className="text-white/60">
                  Consensus decisions will appear here as agents make collective decisions
                </p>
                <div className="mt-4 text-sm text-white/50">
                  Connect agents and enable consensus protocols to start seeing decisions
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consensus Insights */}
        {consensusMetrics.totalDecisions > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Consensus Insights
              </CardTitle>
              <CardDescription>Analysis of consensus patterns and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consensusMetrics.successRate > 90 && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h4 className="text-green-400 font-semibold">Excellent Consensus Rate</h4>
                    </div>
                    <p className="text-white/70 text-sm">
                      {consensusMetrics.successRate.toFixed(1)}% success rate indicates strong network agreement
                    </p>
                  </div>
                )}

                {consensusMetrics.averageStrength > 3 && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <h4 className="text-blue-400 font-semibold">Strong Consensus Strength</h4>
                    </div>
                    <p className="text-white/70 text-sm">
                      Average strength of {consensusMetrics.averageStrength.toFixed(2)} shows high agent confidence
                    </p>
                  </div>
                )}

                {consensusMetrics.successRate < 70 && consensusMetrics.totalDecisions > 3 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-yellow-400 font-semibold">Low Success Rate</h4>
                    </div>
                    <p className="text-white/70 text-sm">
                      {consensusMetrics.successRate.toFixed(1)}% success rate may indicate network issues
                    </p>
                  </div>
                )}

                {consensusMetrics.averageStrength < 2 && consensusMetrics.totalDecisions > 0 && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <h4 className="text-orange-400 font-semibold">Weak Consensus</h4>
                    </div>
                    <p className="text-white/70 text-sm">
                      Low average strength suggests agents may need more coordination
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
} 