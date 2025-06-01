// ----------------------------------------------------------------------------
//  File:        control-station-layout.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Main layout component for the control station
//  Version:     2.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

import React from 'react'

interface ControlStationLayoutProps {
  children: React.ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
  systemStatus: {
    blockchain: string
    agents: number
    simulations: number
    tools: number
  }
}

export function ControlStationLayout({ 
  children, 
  activeSection, 
  onSectionChange, 
  systemStatus 
}: ControlStationLayoutProps) {
  const sections = [
    { id: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
    { id: 'agents', label: '🤖 Agents', icon: '🤖' },
    { id: 'tools', label: '🔧 Tools', icon: '🔧' },
    { id: 'simulation', label: '🎮 Simulation', icon: '🎮' },
    { id: 'chat', label: '💬 Chat', icon: '💬' },
    { id: 'logs', label: '📊 Logs', icon: '📊' },
    { id: 'signatures', label: '✍️ Signatures', icon: '✍️' },
    { id: 'network', label: '🌐 Network', icon: '🌐' },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Control Station
          </h1>
          <p className="text-sm text-gray-600">C-Suite Edition</p>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Blockchain: {systemStatus.blockchain}</div>
            <div>Agents: {systemStatus.agents}</div>
            <div>Tools: {systemStatus.tools}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
} 