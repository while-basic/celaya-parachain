// ----------------------------------------------------------------------------
//  File:        Header.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Apple-inspired header with breadcrumbs and global controls
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Command, 
  Bell, 
  Settings, 
  Menu,
  ChevronRight,
  Zap,
  Sun,
  Moon,
  User,
  LogOut,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationPanel } from './NotificationPanel'
import { useSystemStore, useStreamStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface HeaderProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  onMenuClick?: () => void
}

export function Header({ 
  title = "Dashboard", 
  breadcrumbs = [{ label: "Dashboard", icon: <Zap className="w-4 h-4" /> }],
  onMenuClick
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar } = useSystemStore()
  const { streamStatus } = useStreamStore()

  const getConnectionStatus = (status: string) => {
    const statusMap = {
      connected: { color: 'bg-green-500', text: 'Connected', pulse: true },
      connecting: { color: 'bg-yellow-500', text: 'Connecting', pulse: true },
      error: { color: 'bg-red-500', text: 'Disconnected', pulse: false },
      idle: { color: 'bg-gray-500', text: 'Idle', pulse: false }
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.idle
  }

  const connectionStatus = getConnectionStatus(streamStatus)

  return (
    <header className="sticky top-0 z-40 w-full bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3">
        {/* Left Section - Menu & Breadcrumbs */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick || toggleSidebar}
            className="lg:hidden text-white/70 hover:text-white touch-manipulation flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {index > 0 && (
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/40 flex-shrink-0" />
                )}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors min-w-0",
                    index === breadcrumbs.length - 1
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5 cursor-pointer"
                  )}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
                </motion.div>
              </div>
            ))}
          </nav>
        </div>

        {/* Center Section - Global Search (Desktop only) */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center space-x-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => {
                // This would trigger the command palette
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  bubbles: true
                })
                document.dispatchEvent(event)
              }}
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left truncate">Search anything...</span>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘K</kbd>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Right Section - Status & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 justify-end">
          {/* Connection Status */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              connectionStatus.color,
              connectionStatus.pulse ? "animate-pulse" : ""
            )} />
            <span className="text-xs sm:text-sm text-white/70 truncate">
              {connectionStatus.text}
            </span>
          </div>

          {/* Quick Search (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white/70 hover:text-white touch-manipulation flex-shrink-0"
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true
              })
              document.dispatchEvent(event)
            }}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-white/70 hover:text-white touch-manipulation flex-shrink-0"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>

          {/* Notifications */}
          <div className="flex-shrink-0">
            <NotificationPanel />
          </div>

          {/* User Menu */}
          <div className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-white/70 hover:text-white touch-manipulation"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* User Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-56 sm:w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">CC</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Chris Celaya</p>
                      <p className="text-white/60 text-sm">chris@celayasolutions.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                    <span>Help & Support</span>
                  </button>
                  <hr className="my-2 border-white/10" />
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Backdrop for user menu */}
            {showUserMenu && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Connection Status Bar */}
      <div className="sm:hidden px-6 pb-1">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            connectionStatus.color,
            connectionStatus.pulse ? "animate-pulse" : ""
          )} />
          <span className="text-xs text-white/70">
            System {connectionStatus.text}
          </span>
        </div>
      </div>
    </header>
  )
} 