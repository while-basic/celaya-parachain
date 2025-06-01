// ----------------------------------------------------------------------------
//  File:        Layout.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Main layout component with Apple-inspired design system
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from './CommandPalette'
import { useSystemStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface LayoutProps {
  children: React.ReactNode
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export function Layout({ 
  children, 
  title = "Dashboard", 
  breadcrumbs,
  className 
}: LayoutProps) {
  const { sidebarCollapsed } = useSystemStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900">
      {/* Command Palette */}
      <CommandPalette />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"
      )}>
        {/* Header */}
        <Header 
          title={title} 
          breadcrumbs={breadcrumbs}
        />
        
        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "flex-1 overflow-auto",
            className
          )}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
} 