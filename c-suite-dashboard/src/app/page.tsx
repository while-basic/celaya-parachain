// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Main dashboard home page with overview of C-Suite blockchain features
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApi } from '@/lib/useApi';

interface SystemStats {
  totalAgents: number;
  activeAgents: number;
  avgTrustScore: number;
  lastBlockHeight: number;
  systemHealth: string;
  uptime: string;
}

export default function DashboardHome() {
  const { api, isConnected, isLoading, error, connect } = useApi();
  const [stats, setStats] = useState<SystemStats>({
    totalAgents: 0,
    activeAgents: 0,
    avgTrustScore: 0,
    lastBlockHeight: 0,
    systemHealth: 'Unknown',
    uptime: '0h 0m',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSystemStats = async () => {
    if (!api || !isConnected) {
      // Mock data for development
      setStats({
        totalAgents: 13,
        activeAgents: 9,
        avgTrustScore: 92,
        lastBlockHeight: Math.floor(Math.random() * 1000) + 500,
        systemHealth: 'Operational',
        uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      });
      return;
    }

    try {
      // Get real blockchain data
      const header = await api.rpc.chain.getHeader();
      const health = await api.rpc.system.health();
      
      setStats({
        totalAgents: 13, // Known C-Suite agents
        activeAgents: 9,  // Simulated active count
        avgTrustScore: 92,
        lastBlockHeight: header.number.toNumber(),
        systemHealth: health.isSyncing ? 'Syncing' : 'Operational',
        uptime: '24h 15m', // Would be calculated from node start time
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchSystemStats();
    }
  }, [api, isConnected, mounted]);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const quickActions = [
    {
      title: 'Agent Registry',
      description: 'View and manage all registered C-Suite agents',
      href: '/agents',
      icon: '🤖',
      status: `${stats.activeAgents} active`,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      title: 'Agent Chat',
      description: 'Communicate with individual agents or broadcast to all',
      href: '/chat',
      icon: '💬',
      status: 'Real-time messaging',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
    {
      title: 'Consensus Logs',
      description: 'Monitor consensus decisions and agent agreements',
      href: '/consensus',
      icon: '🤝',
      status: 'Live monitoring',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      title: 'Signature Verification',
      description: 'Validate agent signatures and authentication',
      href: '/signatures',
      icon: '✅',
      status: 'Crypto validation',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    },
    {
      title: 'Event Stream',
      description: 'Real-time blockchain events and agent activities',
      href: '/log',
      icon: '📋',
      status: 'Live feed',
      color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    },
    {
      title: 'Submit Transactions',
      description: 'Developer interface for blockchain interactions',
      href: '/submit',
      icon: '⚙️',
      status: 'Dev tools',
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            C-Suite Blockchain Dashboard
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Real-time monitoring and interaction with your AI agent infrastructure
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              Phase 2 - Full Integration
            </Badge>
            <Badge 
              variant={isConnected ? 'default' : 'destructive'} 
              className="text-sm"
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Badge>
          </div>
        </div>

        {/* Connection Error Alert */}
        {!isConnected && error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-800">Blockchain Connection Issue</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <p className="text-red-500 text-xs mt-2">
                    💡 Ensure zombienet is running: <code className="bg-red-100 px-1 rounded">./c-suite-blockchain.sh zombienet</code>
                  </p>
                </div>
                <Button 
                  onClick={connect} 
                  disabled={isLoading}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  {isLoading ? 'Connecting...' : 'Retry'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Agents</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalAgents}</p>
                </div>
                <div className="text-2xl">🤖</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Agents</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeAgents}</p>
                </div>
                <div className="text-2xl">🟢</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Trust Score</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.avgTrustScore}</p>
                </div>
                <div className="text-2xl">⭐</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Block Height</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.lastBlockHeight}</p>
                </div>
                <div className="text-2xl">⛓️</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className={`cursor-pointer transition-all hover:shadow-md border-2 ${action.color}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{action.icon}</div>
                      <Badge variant="outline" className="text-xs">
                        {action.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Blockchain Status</span>
                <Badge variant={stats.systemHealth === 'Operational' ? 'default' : 'secondary'}>
                  {stats.systemHealth}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Uptime</span>
                <span className="text-sm font-medium">{stats.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Connection</span>
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Endpoint</span>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                  ws://localhost:61279
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Orchestrator (Lyra)</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Core Processor</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Security (Sentinel)</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Autonomous (Otto)</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <Link href="/agents">
                  <Button variant="outline" className="w-full">
                    View All Agents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-500">{new Date().toLocaleTimeString()}</span>
                <span>Agent Lyra coordinated system startup</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-500">{new Date(Date.now() - 60000).toLocaleTimeString()}</span>
                <span>Consensus log created for agent verification</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-slate-500">{new Date(Date.now() - 120000).toLocaleTimeString()}</span>
                <span>New block mined: #{stats.lastBlockHeight}</span>
              </div>
            </div>
            <div className="pt-4 border-t mt-4">
              <Link href="/log">
                <Button variant="outline" className="w-full">
                  View Full Event Log
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
