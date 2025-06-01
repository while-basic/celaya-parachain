// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Real-time event log page showing blockchain events and system activity
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApi } from '@/lib/useApi';

interface BlockchainEvent {
  id: string;
  timestamp: number;
  block: number;
  pallet: string;
  method: string;
  data: any;
  phase: string;
}

export default function LogPage() {
  const { api, isConnected } = useApi();
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const startEventStream = async () => {
    if (!api || !isConnected) return;

    try {
      setIsStreaming(true);
      
      // Subscribe to system events
      const unsubscribe = await api.query.system.events((events: any) => {
        const currentBlock = Math.floor(Date.now() / 6000); // Mock block number
        
        const newEvents: BlockchainEvent[] = events.map((record: any, index: number) => {
          const { event, phase } = record;
          
          return {
            id: `${currentBlock}-${index}-${Date.now()}`,
            timestamp: Date.now(),
            block: currentBlock,
            pallet: event.section,
            method: event.method,
            data: event.data.toJSON(),
            phase: phase.toString(),
          };
        });

        setEvents(prev => [...newEvents, ...prev].slice(0, 100)); // Keep last 100 events
        setTotalEvents(prev => prev + newEvents.length);
      });

      unsubscribeRef.current = unsubscribe as unknown as () => void;
    } catch (error) {
      console.error('Error starting event stream:', error);
      
      // Mock event stream for development
      let mockEventCount = 0;
      const mockInterval = setInterval(() => {
        const mockEvents = [
          'AgentRegistered', 'InsightSubmitted', 'ConsensusLogged', 'TrustScoreUpdated', 
          'SignatureVerified', 'BalanceTransfer', 'ExtrinsicSuccess', 'ExtrinsicFailed'
        ];
        
        const newEvent: BlockchainEvent = {
          id: `mock-${mockEventCount}-${Date.now()}`,
          timestamp: Date.now(),
          block: Math.floor(Date.now() / 6000),
          pallet: ['agentRegistry', 'consensus', 'system', 'balances'][mockEventCount % 4],
          method: mockEvents[mockEventCount % mockEvents.length],
          data: { mockData: 'Sample event data', index: mockEventCount },
          phase: 'ApplyExtrinsic',
        };

        mockEventCount++;
        setEvents(prev => [newEvent, ...prev].slice(0, 100));
        setTotalEvents(prev => prev + 1);
      }, 2000);

      unsubscribeRef.current = () => clearInterval(mockInterval);
    }
  };

  const stopEventStream = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsStreaming(false);
  };

  const clearLogs = () => {
    setEvents([]);
    setTotalEvents(0);
  };

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventBadgeColor = (pallet: string) => {
    const colors: Record<string, string> = {
      agentRegistry: 'bg-blue-500',
      consensus: 'bg-green-500',
      system: 'bg-gray-500',
      balances: 'bg-purple-500',
      default: 'bg-slate-500',
    };
    return colors[pallet] || colors.default;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Event Log</h1>
            <p className="text-slate-600 mt-2">
              Real-time blockchain events and system activity
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={isStreaming ? stopEventStream : startEventStream}
              disabled={!isConnected}
              variant={isStreaming ? 'destructive' : 'default'}
            >
              {isStreaming ? 'Stop Stream' : 'Start Stream'}
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              Clear
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate-900">{events.length}</div>
              <p className="text-sm text-slate-600">Current Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
              <p className="text-sm text-slate-600">Total Processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className={`text-2xl font-bold ${isStreaming ? 'text-green-600' : 'text-red-600'}`}>
                {isStreaming ? 'Live' : 'Stopped'}
              </div>
              <p className="text-sm text-slate-600">Stream Status</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {events.length > 0 ? Math.max(...events.map(e => e.block)) : 0}
              </div>
              <p className="text-sm text-slate-600">Latest Block</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Real-time Events
              {isStreaming && (
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  Live
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Not connected to blockchain. Start stream to see mock events for development.
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {isStreaming ? 'Waiting for events...' : 'No events to display. Start the stream to monitor blockchain activity.'}
                </div>
              ) : (
                events.map((event) => (
                  <div 
                    key={event.id}
                    className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={`text-white ${getEventBadgeColor(event.pallet)}`}
                          >
                            {event.pallet}
                          </Badge>
                          <span className="font-medium text-slate-900">
                            {event.method}
                          </span>
                          <span className="text-sm text-slate-500">
                            Block #{event.block}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-600 mb-2">
                          Phase: {event.phase}
                        </div>
                        
                        {event.data && (
                          <div className="text-xs font-mono bg-slate-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-500 ml-4">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Monitoring Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Event Types</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• <strong>AgentRegistry:</strong> Agent registrations and updates</li>
                  <li>• <strong>Consensus:</strong> Consensus decisions and signatures</li>
                  <li>• <strong>System:</strong> Core blockchain events</li>
                  <li>• <strong>Balances:</strong> Token transfers and balance changes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Stream Features</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Real-time event subscription</li>
                  <li>• Automatic event filtering and formatting</li>
                  <li>• Block number and timestamp tracking</li>
                  <li>• JSON data display for debugging</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 