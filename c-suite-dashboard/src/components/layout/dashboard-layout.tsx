// ----------------------------------------------------------------------------
//  File:        dashboard-layout.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Main dashboard layout with navigation and blockchain connection status
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApi } from '@/lib/useApi';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Agents', href: '/agents', description: 'Live agent registry & trust scores' },
  { name: 'Chat', href: '/chat', description: 'Communicate with agents' },
  { name: 'Consensus', href: '/consensus', description: 'Recent consensus logs' },
  { name: 'Signatures', href: '/signatures', description: 'Agent signature validator' },
  { name: 'Log', href: '/log', description: 'Real-time event stream' },
  { name: 'Submit', href: '/submit', description: 'Dev extrinsic interface' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { isConnected, isLoading, error, connect } = useApi();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing dynamic content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return static version for SSR
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold text-slate-900">
                  C-Suite Dashboard
                </Link>
                <Badge variant="outline" className="text-xs">
                  Phase 2
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-sm text-slate-600">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "block p-3 rounded-lg transition-colors",
                          "hover:bg-slate-100",
                          isActive 
                            ? "bg-blue-50 border border-blue-200 text-blue-700" 
                            : "text-slate-700"
                        )}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {item.description}
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-slate-900">
                C-Suite Dashboard
              </Link>
              <Badge variant="outline" className="text-xs">
                Phase 2
              </Badge>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : error ? "bg-red-500" : "bg-yellow-500"
                  )}
                />
                <span className="text-sm text-slate-600">
                  {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {error && !isConnected && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={connect}
                  className="text-xs"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "block p-3 rounded-lg transition-colors",
                        "hover:bg-slate-100",
                        isActive 
                          ? "bg-blue-50 border border-blue-200 text-blue-700" 
                          : "text-slate-700"
                      )}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {item.description}
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Connection Info Card */}
            {(isConnected || error) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {isConnected ? 'Blockchain Info' : 'Connection Debug'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  {isConnected ? (
                    <>
                      <div>
                        <span className="text-slate-500">Endpoint:</span>
                        <div className="font-mono">ws://localhost:61279</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          Connected
                        </Badge>
                      </div>
                      <div className="text-slate-400 mt-2">
                        🧟 Connected to C-Suite parachain
                      </div>
                    </>
                  ) : error ? (
                    <>
                      <div>
                        <span className="text-slate-500">Endpoint:</span>
                        <div className="font-mono">ws://localhost:61279</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Error:</span>
                        <div className="text-red-600 text-xs mt-1">{error}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Disconnected
                        </Badge>
                      </div>
                      <div className="text-slate-400 mt-2">
                        💡 Check console for details
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && !isConnected && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-800">Connection Error</div>
                      <div className="text-sm text-red-600">{error}</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={connect}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Retry Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 