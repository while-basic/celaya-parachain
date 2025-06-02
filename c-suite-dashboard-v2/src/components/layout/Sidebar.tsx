// ----------------------------------------------------------------------------
//  File:        Sidebar.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Apple-inspired sidebar navigation with smooth animations
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Users, 
  Activity, 
  Database, 
  Shield, 
  Settings, 
  Search,
  BarChart3,
  Network,
  FileText,
  Zap,
  ChevronLeft,
  ChevronRight,
  Brain,
  Wrench,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSystemStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
  description: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home className="w-5 h-5" />,
        href: '/',
        description: 'Main dashboard overview'
      },
      {
        id: 'agents',
        label: 'Agents',
        icon: <Users className="w-5 h-5" />,
        href: '/agents',
        badge: 4,
        description: 'AI agent registry and management'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 className="w-5 h-5" />,
        href: '/analytics',
        description: 'Performance metrics and insights'
      }
    ]
  },
  {
    title: 'Real-time',
    items: [
      {
        id: 'streams',
        label: 'Live Streams',
        icon: <Activity className="w-5 h-5" />,
        href: '/streams',
        description: 'Real-time data feeds and monitoring'
      },
      {
        id: 'consensus',
        label: 'Consensus',
        icon: <Shield className="w-5 h-5" />,
        href: '/consensus',
        description: 'Consensus logs and decisions'
      },
      {
        id: 'chat',
        label: 'Chat',
        icon: <MessageSquare className="w-5 h-5" />,
        href: '/chat',
        description: 'Multi-agent chat interface with tool calling'
      },
      {
        id: 'cognitions',
        label: 'Cognitions',
        icon: <Brain className="w-5 h-5" />,
        href: '/cognitions',
        description: 'Multi-agent cognition simulations'
      },
      {
        id: 'network',
        label: 'Network',
        icon: <Network className="w-5 h-5" />,
        href: '/network',
        description: 'Blockchain network status'
      }
    ]
  },
  {
    title: 'Tools & Development',
    items: [
      {
        id: 'toolshop',
        label: 'Tool Shop',
        icon: <Wrench className="w-5 h-5" />,
        href: '/toolshop',
        description: 'Generate and manage ultimate tools for agents'
      },
      {
        id: 'cids',
        label: 'CID Browser',
        icon: <Database className="w-5 h-5" />,
        href: '/cids',
        description: 'IPFS content identifier browser'
      },
      {
        id: 'logs',
        label: 'System Logs',
        icon: <FileText className="w-5 h-5" />,
        href: '/logs',
        description: 'System events and activity logs'
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: <Zap className="w-5 h-5" />,
        href: '/performance',
        description: 'System performance monitoring'
      }
    ]
  }
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [isHovered, setIsHovered] = useState(false)
  const { sidebarCollapsed, toggleSidebar, addNotification } = useSystemStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Set active item based on current path
    const activeNav = navigationSections
      .flatMap(section => section.items)
      .find(item => item.href === pathname)
    
    if (activeNav) {
      setActiveItem(activeNav.id)
    }
  }, [pathname])

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item.id)
    
    // Navigate to the page
    router.push(item.href)
    
    // Add notification for page navigation
    addNotification({
      type: 'info',
      title: 'Navigation',
      message: `Navigating to ${item.label}`
    })
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      toggleSidebar()
    }
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {!sidebarCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? 0 : 280,
          x: 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 h-full z-50 bg-black/40 backdrop-blur-xl border-r border-white/10",
          "flex flex-col",
          // Hide on mobile when collapsed, show on desktop
          sidebarCollapsed ? "lg:w-[72px] w-0" : "w-[280px]",
          // Ensure it's above other content on mobile
          "lg:relative lg:z-auto"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-lg sm:text-xl font-bold text-white">C-Suite</h1>
                  <p className="text-xs sm:text-sm text-white/60">Console</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white/70 hover:text-white touch-manipulation"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 sm:p-4 border-b border-white/10"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent touch-manipulation"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 sm:py-4">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-4 sm:mb-6">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 sm:px-6 mb-2"
                  >
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1 px-2 sm:px-3">
                {section.items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-3 sm:py-2 rounded-lg transition-all duration-200",
                      "hover:bg-white/10 group relative touch-manipulation",
                      // Increase touch target on mobile
                      "min-h-[44px] sm:min-h-auto",
                      activeItem === item.id
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "text-white/70 hover:text-white"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-5 h-5 flex-shrink-0",
                      activeItem === item.id ? "text-blue-400" : "text-white/70 group-hover:text-white"
                    )}>
                      {item.icon}
                    </div>

                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 flex items-center justify-between min-w-0"
                        >
                          <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
                          {item.badge && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center flex-shrink-0 ml-2"
                            >
                              {item.badge}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state - only show on desktop */}
                    {sidebarCollapsed && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute left-16 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap hidden lg:block"
                      >
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-white/70">{item.description}</div>
                        {/* Arrow */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10">
          <motion.button
            onClick={() => handleItemClick({
              id: 'settings',
              label: 'Settings',
              icon: <Settings className="w-5 h-5" />,
              href: '/settings',
              description: 'Application settings'
            })}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
              "hover:bg-white/10 group",
              activeItem === 'settings'
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-white/70 hover:text-white"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-5 h-5" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </>
  )
} 