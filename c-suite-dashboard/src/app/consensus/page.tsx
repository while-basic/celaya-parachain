// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Consensus page showing recent consensus logs and signature verification
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApi, ConsensusLog } from '@/lib/useApi';

export default function ConsensusPage() {
  const { api, isConnected } = useApi();
  const [consensusLogs, setConsensusLogs] = useState<ConsensusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsensusLogs = async () => {
    if (!api || !isConnected) return;

    try {
      setLoading(true);
      setError(null);

      // Query consensus logs (assuming there's a consensusLogs storage map)
      const entries = await api.query.consensusModule?.consensusLogs?.entries() || [];
      
      const logData: ConsensusLog[] = entries.map(([key, value]) => {
        const logId = key.args[0].toString();
        const logInfo = value.toJSON() as any;
        
        return {
          id: logId,
          agentId: logInfo.agent_id || 'Unknown',
          timestamp: logInfo.timestamp || Date.now(),
          data: logInfo.data || '',
          signatures: logInfo.signatures || [],
        };
      });

      setConsensusLogs(logData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Error fetching consensus logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch consensus logs');
      
      // Mock data for development
      const mockLogs: ConsensusLog[] = [
        {
          id: 'log_001',
          agentId: 'agent_001',
          timestamp: 1704067200000, // Fixed timestamp: 2024-01-01 00:00:00
          data: 'Market analysis consensus: BTC trend positive, confidence 87%',
          signatures: ['0x1234...abcd', '0x5678...efgh', '0x9abc...ijkl'],
        },
        {
          id: 'log_002',
          agentId: 'agent_002',
          timestamp: 1704066300000, // 15 minutes earlier
          data: 'Risk assessment consensus: Low volatility period detected',
          signatures: ['0x2345...bcde', '0x6789...fghi'],
        },
        {
          id: 'log_003',
          agentId: 'agent_001',
          timestamp: 1704065400000, // 30 minutes earlier
          data: 'Data validation consensus: Dataset integrity verified',
          signatures: ['0x3456...cdef', '0x789a...ghij', '0xabcd...klmn', '0xdefg...opqr'],
        },
        {
          id: 'log_004',
          agentId: 'agent_003',
          timestamp: 1704063600000, // 1 hour earlier
          data: 'Prediction consensus: High confidence forecast for next period',
          signatures: ['0x4567...defg'],
        },
      ];
      
      setConsensusLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsensusLogs();
  }, [api, isConnected]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSignatureCountBadge = (count: number) => {
    if (count >= 3) return { variant: 'default' as const, label: 'Strong' };
    if (count >= 2) return { variant: 'secondary' as const, label: 'Moderate' };
    return { variant: 'outline' as const, label: 'Weak' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Consensus Logs</h1>
            <p className="text-slate-600 mt-2">
              Recent consensus decisions and signature verification status
            </p>
          </div>
          <Button onClick={fetchConsensusLogs} disabled={loading || !isConnected}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate-900">{consensusLogs.length}</div>
              <p className="text-sm text-slate-600">Total Logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {consensusLogs.filter(log => log.signatures.length >= 3).length}
              </div>
              <p className="text-sm text-slate-600">Strong Consensus</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {consensusLogs.filter(log => Date.now() - log.timestamp < 3600000).length}
              </div>
              <p className="text-sm text-slate-600">Recent (1h)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {consensusLogs.length > 0 ? 
                  Math.round(consensusLogs.reduce((sum, log) => sum + log.signatures.length, 0) / consensusLogs.length) : 0}
              </div>
              <p className="text-sm text-slate-600">Avg Signatures</p>
            </CardContent>
          </Card>
        </div>

        {/* Consensus Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Consensus Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> {error}. Showing mock data for development.
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-slate-600">Loading consensus logs...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Log ID</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Consensus Data</TableHead>
                    <TableHead>Signatures</TableHead>
                    <TableHead>Strength</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consensusLogs.map((log) => {
                    const signatureBadge = getSignatureCountBadge(log.signatures.length);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.id}</TableCell>
                        <TableCell className="font-mono text-sm">{log.agentId}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate text-sm" title={log.data}>
                            {log.data}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{log.signatures.length} signatures</div>
                            <div className="space-y-1">
                              {log.signatures.slice(0, 2).map((sig, idx) => (
                                <div key={idx} className="text-xs font-mono text-slate-500">
                                  {sig.slice(0, 8)}...{sig.slice(-6)}
                                </div>
                              ))}
                              {log.signatures.length > 2 && (
                                <div className="text-xs text-slate-400">
                                  +{log.signatures.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={signatureBadge.variant}>
                            {signatureBadge.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {consensusLogs.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No consensus logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 