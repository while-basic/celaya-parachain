// ----------------------------------------------------------------------------
//  File:        system-logs.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Comprehensive system logs monitoring interface
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

'use client'

import React, { useState, useEffect, useRef } from 'react'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug' | 'success'
  component: string
  message: string
  details?: any
  agentId?: string
  agentName?: string
  duration?: number
  metadata?: {
    userId?: string
    sessionId?: string
    requestId?: string
    ip?: string
  }
}

interface LogFilter {
  level: string[]
  component: string[]
  timeRange: string
  search: string
}

const initialLogs: LogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 300000),
    level: 'info',
    component: 'Agent Manager',
    message: 'Agent Marcus (CEO) initialized successfully',
    agentId: 'agent-001',
    agentName: 'Marcus (CEO)',
    metadata: { sessionId: 'sess-001' }
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 250000),
    level: 'success',
    component: 'Tool Execution',
    message: 'Tool call executed: lens_analyze_image',
    duration: 1250,
    metadata: { requestId: 'req-001', userId: 'user-001' }
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 200000),
    level: 'warn',
    component: 'Network Monitor',
    message: 'High network latency detected (>500ms)',
    details: { latency: 678, threshold: 500 },
    metadata: { ip: '192.168.1.100' }
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 150000),
    level: 'info',
    component: 'Simulation Engine',
    message: 'New simulation started: Compliance Audit Workflow',
    details: { scenarioId: 'scenario-001', participants: ['agent-001', 'agent-003'] }
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 100000),
    level: 'error',
    component: 'Agent Runtime',
    message: 'Agent task execution failed: Connection timeout',
    agentId: 'agent-002',
    agentName: 'Victoria (CTO)',
    details: { error: 'TIMEOUT', duration: 30000 }
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 50000),
    level: 'debug',
    component: 'Chat Interface',
    message: 'Message processed with 94% confidence',
    details: { confidence: 0.94, processingTime: 1200 },
    metadata: { sessionId: 'sess-002' }
  }
]

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(initialLogs)
  const [filters, setFilters] = useState<LogFilter>({
    level: [],
    component: [],
    timeRange: 'all',
    search: ''
  })
  const [isLiveTail, setIsLiveTail] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate real-time log generation
    if (isLiveTail) {
      const interval = setInterval(() => {
        const newLog = generateRandomLog()
        setLogs(prev => [newLog, ...prev].slice(0, 1000)) // Keep only last 1000 logs
      }, Math.random() * 5000 + 2000) // 2-7 seconds

      return () => clearInterval(interval)
    }
  }, [isLiveTail])

  useEffect(() => {
    // Apply filters
    let filtered = logs

    if (filters.level.length > 0) {
      filtered = filtered.filter(log => filters.level.includes(log.level))
    }

    if (filters.component.length > 0) {
      filtered = filtered.filter(log => filters.component.includes(log.component))
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.component.toLowerCase().includes(searchLower) ||
        log.agentName?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.timeRange !== 'all') {
      const now = Date.now()
      const timeRanges = {
        '1h': 3600000,
        '6h': 21600000,
        '24h': 86400000,
        '7d': 604800000
      }
      const range = timeRanges[filters.timeRange as keyof typeof timeRanges]
      if (range) {
        filtered = filtered.filter(log => now - log.timestamp.getTime() < range)
      }
    }

    setFilteredLogs(filtered)
  }, [logs, filters])

  const generateRandomLog = (): LogEntry => {
    const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug', 'success']
    const components = ['Agent Manager', 'Tool Execution', 'Network Monitor', 'Simulation Engine', 'Chat Interface', 'Security', 'Database']
    const messages = [
      'Agent task completed successfully',
      'Network connection established',
      'Tool execution started',
      'Memory usage threshold exceeded',
      'User authentication successful',
      'Backup operation completed',
      'Configuration updated',
      'Performance metrics collected',
      'Security scan completed',
      'Data synchronization in progress'
    ]

    const level = levels[Math.floor(Math.random() * levels.length)]
    const component = components[Math.floor(Math.random() * components.length)]
    const message = messages[Math.floor(Math.random() * messages.length)]

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      component,
      message,
      duration: Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : undefined,
      metadata: {
        sessionId: `sess-${Math.floor(Math.random() * 1000)}`,
        requestId: `req-${Math.floor(Math.random() * 10000)}`
      }
    }
  }

  const getLevelColor = (level: LogEntry['level']) => {
    const colors = {
      'info': 'text-blue-600 bg-blue-50',
      'warn': 'text-yellow-600 bg-yellow-50',
      'error': 'text-red-600 bg-red-50',
      'debug': 'text-gray-600 bg-gray-50',
      'success': 'text-green-600 bg-green-50'
    }
    return colors[level]
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    const icons = {
      'info': 'ℹ️',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🔍',
      'success': '✅'
    }
    return icons[level]
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      component: log.component,
      message: log.message,
      agentName: log.agentName,
      duration: log.duration,
      details: log.details,
      metadata: log.metadata
    }))

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    setLogs([])
    setFilteredLogs([])
  }

  const uniqueComponents = Array.from(new Set(logs.map(log => log.component)))
  const uniqueLevels = Array.from(new Set(logs.map(log => log.level)))

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
            <p className="text-gray-600">Monitor system events and agent activities</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiveTail(!isLiveTail)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                isLiveTail 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isLiveTail ? 'Live 🟢' : 'Paused ⏸️'}
            </button>
            <button
              onClick={exportLogs}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Export 📥
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Clear 🗑️
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search logs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              multiple
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                level: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueLevels.map(level => (
                <option key={level} value={level} className="capitalize">
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Component</label>
            <select
              multiple
              value={filters.component}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                component: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueComponents.map(component => (
                <option key={component} value={component}>
                  {component}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
          <span>Total: {filteredLogs.length} logs</span>
          <span>Errors: {filteredLogs.filter(log => log.level === 'error').length}</span>
          <span>Warnings: {filteredLogs.filter(log => log.level === 'warn').length}</span>
          <span>Success: {filteredLogs.filter(log => log.level === 'success').length}</span>
        </div>
      </div>

      {/* Logs Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Log List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedLog?.id === log.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getLevelIcon(log.level)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded uppercase ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {log.component}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(log.timestamp)}
                      </span>
                      {log.duration && (
                        <span className="text-xs text-gray-500">
                          ({log.duration}ms)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {log.message}
                    </p>
                    {log.agentName && (
                      <p className="text-xs text-blue-600 mt-1">
                        Agent: {log.agentName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">📋</div>
                <p className="text-gray-500">No logs match the current filters</p>
              </div>
            )}
            
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Log Details Panel */}
        {selectedLog && (
          <div className="w-96 border-l border-gray-200 bg-gray-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded uppercase ${getLevelColor(selectedLog.level)}`}>
                    {selectedLog.level}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Component</label>
                  <p className="text-sm text-gray-900">{selectedLog.component}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-sm text-gray-900">{selectedLog.message}</p>
                </div>

                {selectedLog.agentName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                    <p className="text-sm text-gray-900">{selectedLog.agentName}</p>
                  </div>
                )}

                {selectedLog.duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <p className="text-sm text-gray-900">{selectedLog.duration}ms</p>
                  </div>
                )}

                {selectedLog.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <pre className="text-xs text-gray-900 bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metadata</label>
                    <pre className="text-xs text-gray-900 bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 