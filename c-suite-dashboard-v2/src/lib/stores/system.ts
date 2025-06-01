// ----------------------------------------------------------------------------
//  File:        system.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Zustand store for system-wide state management
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SystemMetrics } from '@/types'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface SystemStore {
  metrics: SystemMetrics
  notifications: Notification[]
  darkMode: boolean
  sidebarCollapsed: boolean
  loading: boolean
  
  // Actions
  updateMetrics: (metrics: Partial<SystemMetrics>) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
  
  // Selectors
  getUnreadNotifications: () => Notification[]
  getNotificationCount: () => number
}

export const useSystemStore = create<SystemStore>()(
  devtools(
    (set, get) => ({
      metrics: {
        totalAgents: 0,
        activeAgents: 0,
        averageTrustScore: 0,
        totalEvents: 0,
        lastBlockNumber: 0,
        consensusCount: 0,
      },
      notifications: [],
      darkMode: true,
      sidebarCollapsed: false,
      loading: false,

      updateMetrics: (newMetrics) => set((state) => ({
        metrics: { ...state.metrics, ...newMetrics }
      })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            read: false,
          },
          ...state.notifications
        ].slice(0, 50) // Keep last 50 notifications
      })),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setLoading: (loading) => set({ loading }),
      
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(notif => !notif.read)
      },
      
      getNotificationCount: () => {
        const { notifications } = get()
        return notifications.filter(notif => !notif.read).length
      },
    }),
    { name: 'system-store' }
  )
) 