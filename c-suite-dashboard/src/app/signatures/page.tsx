// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Signatures page for validating agent signatures and verification
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

interface VerificationResult {
  isValid: boolean;
  agentId: string;
  message: string;
  publicKey?: string;
}

export default function SignaturesPage() {
  const [signature, setSignature] = useState('');
  const [message, setMessage] = useState('');
  const [agentId, setAgentId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validateSignature = async () => {
    if (!signature || !message || !agentId) {
      setVerificationResult({
        isValid: false,
        agentId,
        message: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);
    
    // Simulate signature verification (in real implementation, this would call the blockchain)
    setTimeout(() => {
      // Mock verification logic
      const isValidFormat = signature.startsWith('0x') && signature.length >= 10;
      const hasValidAgent = agentId.startsWith('agent_');
      
      const mockResult: VerificationResult = {
        isValid: isValidFormat && hasValidAgent && message.length > 0,
        agentId,
        message: isValidFormat && hasValidAgent 
          ? 'Signature verified successfully' 
          : 'Invalid signature or agent ID format',
        publicKey: isValidFormat ? '0xabcd1234...5678' : undefined,
      };
      
      setVerificationResult(mockResult);
      setLoading(false);
    }, 1500);
  };

  const clearForm = () => {
    setSignature('');
    setMessage('');
    setAgentId('');
    setVerificationResult(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Signature Validator</h1>
          <p className="text-slate-600 mt-2">
            Verify agent signatures and validate message authenticity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle>Signature Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agentId">Agent ID</Label>
                <Input
                  id="agentId"
                  placeholder="e.g., agent_001"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="signature">Signature</Label>
                <Input
                  id="signature"
                  placeholder="0x1234abcd..."
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Original Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter the original message that was signed..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={validateSignature} 
                  disabled={loading || !signature || !message || !agentId}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify Signature'}
                </Button>
                <Button variant="outline" onClick={clearForm}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Result</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={verificationResult.isValid ? 'default' : 'destructive'}
                      className="text-sm"
                    >
                      {verificationResult.isValid ? '✓ Valid' : '✗ Invalid'}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      {verificationResult.message}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-slate-700">Agent ID:</div>
                      <div className="font-mono text-slate-600">{verificationResult.agentId}</div>
                    </div>
                    
                    {verificationResult.publicKey && (
                      <div>
                        <div className="font-medium text-slate-700">Public Key:</div>
                        <div className="font-mono text-slate-600">{verificationResult.publicKey}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className="font-medium text-slate-700">Verification Status:</div>
                      <div className={verificationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                        {verificationResult.isValid 
                          ? 'Signature matches the provided message and agent identity'
                          : 'Signature verification failed'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Enter signature details above to verify
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Signature Verification Works</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Each agent has a unique ED25519 keypair for signing</li>
                <li>• Messages are hashed before signing for security</li>
                <li>• Public keys are registered on-chain during agent registration</li>
                <li>• Verification confirms the signature matches the agent's identity</li>
                <li>• Invalid signatures indicate potential tampering or fraud</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signature Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-slate-700 mb-1">Expected Format:</div>
                  <div className="font-mono text-xs bg-slate-100 p-2 rounded">
                    0x[64 hex characters]
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-700 mb-1">Example:</div>
                  <div className="font-mono text-xs bg-slate-100 p-2 rounded break-all">
                    0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 