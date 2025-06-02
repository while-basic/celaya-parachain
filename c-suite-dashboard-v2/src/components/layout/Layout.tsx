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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none animate-gradient" />
      
      {/* Command Palette */}
      <CommandPalette />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10",
        // On mobile and tablet, always use full width
        "ml-0",
        // On desktop and larger, respect sidebar state
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"
      )}>
        {/* Header */}
        <Header 
          title={title} 
          breadcrumbs={breadcrumbs}
        />
        
        {/* Page Content - Enhanced with better scrolling */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            // Add safe area padding for mobile devices
            "pb-safe-area-inset-bottom",
            // Enhanced scrolling behavior
            "scroll-smooth",
            // Better backdrop for content
            "relative",
            className
          )}
        >
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 