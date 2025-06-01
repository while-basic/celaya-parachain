// ----------------------------------------------------------------------------
//  File:        index.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Barrel exports for all dashboard components including Phase 5 features
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

// Agents
export { AgentOrb } from './agents/AgentOrb'
export { AgentGrid } from './agents/AgentGrid'
export { AgentRuntime } from './agents/AgentRuntime'

// Layout Components (Enterprise UI/UX)
export { Layout } from './layout/Layout'
export { Sidebar } from './layout/Sidebar'
export { Header } from './layout/Header'
export { NotificationPanel } from './layout/NotificationPanel'
export { CommandPalette } from './layout/CommandPalette'

// Metrics
export { RealTimeMetrics } from './metrics/RealTimeMetrics'

// Blockchain Integration (Phase 5)
export { BlockchainMonitor } from './blockchain/BlockchainMonitor'

// UI Components (re-export from ui)
export * from './ui/button'
export * from './ui/card' 