// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Developer interface for submitting extrinsics to the C-Suite blockchain
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi } from '@/lib/useApi';

interface ExtrinsicResult {
  success: boolean;
  hash?: string;
  error?: string;
  details?: any;
}

export default function SubmitPage() {
  const { api, isConnected } = useApi();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtrinsicResult | null>(null);

  // Agent Registration Form
  const [agentForm, setAgentForm] = useState({
    agentId: '',
    metadata: '',
    publicKey: '',
  });

  // Insight Submission Form
  const [insightForm, setInsightForm] = useState({
    cid: '',
    agentId: '',
    data: '',
  });

  // Consensus Log Form
  const [consensusForm, setConsensusForm] = useState({
    logId: '',
    agentId: '',
    data: '',
    signatures: '',
  });

  const submitExtrinsic = async (pallet: string, method: string, args: any[]) => {
    if (!api || !isConnected) {
      setResult({
        success: false,
        error: 'Not connected to blockchain',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Mock extrinsic submission for development
      setTimeout(() => {
        const mockHash = '0x' + Math.random().toString(16).substr(2, 64);
        setResult({
          success: true,
          hash: mockHash,
          details: {
            pallet,
            method,
            args,
            blockNumber: Math.floor(Date.now() / 6000),
            timestamp: new Date().toISOString(),
          },
        });
        setLoading(false);
      }, 2000);

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Extrinsic failed',
      });
      setLoading(false);
    }
  };

  const registerAgent = () => {
    if (!agentForm.agentId || !agentForm.metadata) {
      setResult({ success: false, error: 'Please fill in all required fields' });
      return;
    }

    const metadata = JSON.parse(agentForm.metadata || '{}');
    submitExtrinsic('agentRegistry', 'registerAgent', [
      agentForm.agentId,
      metadata,
      agentForm.publicKey,
    ]);
  };

  const submitInsight = () => {
    if (!insightForm.cid || !insightForm.agentId) {
      setResult({ success: false, error: 'Please fill in all required fields' });
      return;
    }

    submitExtrinsic('insightModule', 'submitInsight', [
      insightForm.cid,
      insightForm.agentId,
      insightForm.data,
    ]);
  };

  const logConsensus = () => {
    if (!consensusForm.logId || !consensusForm.agentId || !consensusForm.data) {
      setResult({ success: false, error: 'Please fill in all required fields' });
      return;
    }

    const signatures = consensusForm.signatures ? consensusForm.signatures.split(',').map(s => s.trim()) : [];
    submitExtrinsic('consensusModule', 'logConsensus', [
      consensusForm.logId,
      consensusForm.agentId,
      consensusForm.data,
      signatures,
    ]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Submit Extrinsics</h1>
          <p className="text-slate-600 mt-2">
            Developer interface for testing blockchain interactions
          </p>
          <Badge variant="outline" className="mt-2">
            Development Only
          </Badge>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="text-yellow-800">
                <strong>Warning:</strong> Not connected to blockchain. Extrinsics will be simulated with mock responses.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forms */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Extrinsic Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="agent" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="agent">Register Agent</TabsTrigger>
                    <TabsTrigger value="insight">Submit Insight</TabsTrigger>
                    <TabsTrigger value="consensus">Log Consensus</TabsTrigger>
                  </TabsList>

                  {/* Register Agent Tab */}
                  <TabsContent value="agent" className="space-y-4">
                    <div>
                      <Label htmlFor="agentId">Agent ID *</Label>
                      <Input
                        id="agentId"
                        placeholder="agent_001"
                        value={agentForm.agentId}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, agentId: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metadata">Metadata (JSON) *</Label>
                      <Textarea
                        id="metadata"
                        placeholder='{"name": "My Agent", "version": "1.0.0", "capabilities": ["analysis"]}'
                        value={agentForm.metadata}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, metadata: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="publicKey">Public Key (Optional)</Label>
                      <Input
                        id="publicKey"
                        placeholder="0x1234abcd..."
                        value={agentForm.publicKey}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, publicKey: e.target.value }))}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button 
                      onClick={registerAgent} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Submitting...' : 'Register Agent'}
                    </Button>
                  </TabsContent>

                  {/* Submit Insight Tab */}
                  <TabsContent value="insight" className="space-y-4">
                    <div>
                      <Label htmlFor="cid">Content ID (CID) *</Label>
                      <Input
                        id="cid"
                        placeholder="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
                        value={insightForm.cid}
                        onChange={(e) => setInsightForm(prev => ({ ...prev, cid: e.target.value }))}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insightAgentId">Agent ID *</Label>
                      <Input
                        id="insightAgentId"
                        placeholder="agent_001"
                        value={insightForm.agentId}
                        onChange={(e) => setInsightForm(prev => ({ ...prev, agentId: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="insightData">Insight Data</Label>
                      <Textarea
                        id="insightData"
                        placeholder="Additional insight metadata or description..."
                        value={insightForm.data}
                        onChange={(e) => setInsightForm(prev => ({ ...prev, data: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={submitInsight} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Submitting...' : 'Submit Insight'}
                    </Button>
                  </TabsContent>

                  {/* Log Consensus Tab */}
                  <TabsContent value="consensus" className="space-y-4">
                    <div>
                      <Label htmlFor="logId">Log ID *</Label>
                      <Input
                        id="logId"
                        placeholder="log_001"
                        value={consensusForm.logId}
                        onChange={(e) => setConsensusForm(prev => ({ ...prev, logId: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="consensusAgentId">Agent ID *</Label>
                      <Input
                        id="consensusAgentId"
                        placeholder="agent_001"
                        value={consensusForm.agentId}
                        onChange={(e) => setConsensusForm(prev => ({ ...prev, agentId: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="consensusData">Consensus Data *</Label>
                      <Textarea
                        id="consensusData"
                        placeholder="Market analysis consensus: BTC trend positive..."
                        value={consensusForm.data}
                        onChange={(e) => setConsensusForm(prev => ({ ...prev, data: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signatures">Signatures (comma-separated)</Label>
                      <Textarea
                        id="signatures"
                        placeholder="0x1234..., 0x5678..., 0x9abc..."
                        value={consensusForm.signatures}
                        onChange={(e) => setConsensusForm(prev => ({ ...prev, signatures: e.target.value }))}
                        rows={2}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button 
                      onClick={logConsensus} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Submitting...' : 'Log Consensus'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Result Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Extrinsic Result</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? '✓ Success' : '✗ Failed'}
                      </Badge>
                    </div>

                    {result.success ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="font-medium text-slate-700">Transaction Hash:</div>
                          <div className="font-mono text-xs bg-slate-100 p-2 rounded break-all">
                            {result.hash}
                          </div>
                        </div>
                        {result.details && (
                          <div>
                            <div className="font-medium text-slate-700 mb-2">Details:</div>
                            <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        {result.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Submit an extrinsic to see results
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <div className="font-medium">Example CID:</div>
                  <div className="font-mono">QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG</div>
                </div>
                <div>
                  <div className="font-medium">Example Signature:</div>
                  <div className="font-mono">0x1234567890abcdef...</div>
                </div>
                <div>
                  <div className="font-medium">Metadata Format:</div>
                  <div className="font-mono">JSON object with agent info</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 