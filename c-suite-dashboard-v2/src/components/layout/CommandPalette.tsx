// ----------------------------------------------------------------------------
//  File:        CommandPalette.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Apple Spotlight-inspired command palette for quick navigation
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Command, 
  ArrowUp, 
  ArrowDown,
  Home,
  Users,
  Activity,
  Database,
  Shield,
  Settings,
  BarChart3,
  Network,
  FileText,
  Zap,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useSystemStore, useAgentStore, useStreamStore } from '@/lib/stores'
import { useDataSimulator } from '@/lib/api/dataSimulator'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  action: () => void
  category: 'Navigation' | 'Actions' | 'Agents' | 'Data' | 'System'
  keywords: string[]
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { addNotification, toggleSidebar } = useSystemStore()
  const { agents } = useAgentStore()
  const { start: startSimulator, stop: stopSimulator, isActive } = useDataSimulator()

  // Define available commands
  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'Navigate to main dashboard overview',
      icon: <Home className="w-4 h-4" />,
      action: () => console.log('Navigate to dashboard'),
      category: 'Navigation',
      keywords: ['dashboard', 'home', 'overview', 'main']
    },
    {
      id: 'nav-agents',
      label: 'Go to Agents',
      description: 'View AI agent registry and management',
      icon: <Users className="w-4 h-4" />,
      action: () => console.log('Navigate to agents'),
      category: 'Navigation',
      keywords: ['agents', 'ai', 'registry', 'management']
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      description: 'View performance metrics and insights',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => console.log('Navigate to analytics'),
      category: 'Navigation',
      keywords: ['analytics', 'metrics', 'performance', 'insights', 'charts']
    },
    {
      id: 'nav-streams',
      label: 'Go to Live Streams',
      description: 'Monitor real-time data feeds',
      icon: <Activity className="w-4 h-4" />,
      action: () => console.log('Navigate to streams'),
      category: 'Navigation',
      keywords: ['streams', 'live', 'realtime', 'monitoring', 'data']
    },
    
    // Actions
    {
      id: 'action-toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the navigation sidebar',
      icon: <Command className="w-4 h-4" />,
      action: () => {
        toggleSidebar()
        addNotification({
          type: 'info',
          title: 'Sidebar Toggled',
          message: 'Navigation sidebar visibility changed'
        })
      },
      category: 'Actions',
      keywords: ['sidebar', 'navigation', 'toggle', 'hide', 'show']
    },
    {
      id: 'action-start-simulator',
      label: isActive() ? 'Stop Data Simulator' : 'Start Data Simulator',
      description: isActive() ? 'Stop real-time data simulation' : 'Start high-frequency data simulation',
      icon: isActive() ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />,
      action: () => {
        if (isActive()) {
          stopSimulator()
          addNotification({
            type: 'info',
            title: 'Data Simulator Stopped',
            message: 'Real-time data simulation has been disabled'
          })
        } else {
          startSimulator()
          addNotification({
            type: 'success',
            title: 'Data Simulator Started',
            message: 'High-frequency data simulation is now active'
          })
        }
      },
      category: 'Actions',
      keywords: ['simulator', 'data', 'start', 'stop', 'realtime', 'simulation']
    },
    {
      id: 'action-refresh-data',
      label: 'Refresh Data',
      description: 'Reload all dashboard data and metrics',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => {
        addNotification({
          type: 'info',
          title: 'Data Refreshed',
          message: 'All dashboard data has been reloaded'
        })
      },
      category: 'Actions',
      keywords: ['refresh', 'reload', 'update', 'data', 'sync']
    },
    {
      id: 'action-export-data',
      label: 'Export Dashboard Data',
      description: 'Download current metrics and agent data',
      icon: <Download className="w-4 h-4" />,
      action: () => {
        addNotification({
          type: 'success',
          title: 'Export Started',
          message: 'Dashboard data export is being prepared'
        })
      },
      category: 'Data',
      keywords: ['export', 'download', 'data', 'backup', 'save']
    },

    // Agent-specific commands
    ...agents.map(agent => ({
      id: `agent-${agent.id}`,
      label: `View Agent: ${agent.name}`,
      description: `Trust Score: ${agent.trustScore.toFixed(1)}% | Status: ${agent.status}`,
      icon: <Users className="w-4 h-4" />,
      action: () => {
        addNotification({
          type: 'info',
          title: 'Agent Selected',
          message: `Viewing details for ${agent.name}`
        })
      },
      category: 'Agents' as const,
      keywords: ['agent', agent.name.toLowerCase(), agent.status, 'trust', 'score']
    })),

    // System commands
    {
      id: 'system-settings',
      label: 'Open Settings',
      description: 'Access application settings and preferences',
      icon: <Settings className="w-4 h-4" />,
      action: () => console.log('Open settings'),
      category: 'System',
      keywords: ['settings', 'preferences', 'config', 'configuration']
    },
    {
      id: 'system-logs',
      label: 'View System Logs',
      description: 'Access system events and activity logs',
      icon: <FileText className="w-4 h-4" />,
      action: () => console.log('View logs'),
      category: 'System',
      keywords: ['logs', 'events', 'activity', 'history', 'debug']
    }
  ], [agents, addNotification, toggleSidebar, startSimulator, stopSimulator, isActive])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands.slice(0, 8) // Show first 8 when no query

    const searchTerms = query.toLowerCase().split(' ')
    
    return commands
      .filter(command => {
        const searchText = `${command.label} ${command.description} ${command.keywords.join(' ')}`.toLowerCase()
        return searchTerms.every(term => searchText.includes(term))
      })
      .slice(0, 8) // Limit to 8 results
  }, [query, commands])

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        return
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        setSelectedIndex(0)
        return
      }

      // Navigation within palette
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => prev === 0 ? filteredCommands.length - 1 : prev - 1)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            setIsOpen(false)
            setQuery('')
            setSelectedIndex(0)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Navigation': return 'text-blue-400'
      case 'Actions': return 'text-green-400'
      case 'Agents': return 'text-purple-400'
      case 'Data': return 'text-orange-400'
      case 'System': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center px-6 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/40 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search commands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
                />
                <div className="flex items-center space-x-2 text-white/40 text-sm">
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">↑↓</kbd>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⏎</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-6 py-8 text-center text-white/60">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No commands found</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredCommands.map((command, index) => (
                      <motion.button
                        key={command.id}
                        onClick={() => {
                          command.action()
                          setIsOpen(false)
                          setQuery('')
                          setSelectedIndex(0)
                        }}
                        className={cn(
                          "w-full flex items-center space-x-4 px-6 py-3 text-left transition-colors",
                          index === selectedIndex
                            ? "bg-blue-500/20 border-l-2 border-blue-500"
                            : "hover:bg-white/5"
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg",
                          index === selectedIndex ? "bg-blue-500/20" : "bg-white/10"
                        )}>
                          {command.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white truncate">
                              {command.label}
                            </h3>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              getCategoryColor(command.category)
                            )}>
                              {command.category}
                            </span>
                          </div>
                          <p className="text-sm text-white/60 truncate">
                            {command.description}
                          </p>
                        </div>

                        {index === selectedIndex && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-white/40"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Use ↑↓ to navigate, ⏎ to select, esc to close</span>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘K</kbd>
                    <span>to open</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 