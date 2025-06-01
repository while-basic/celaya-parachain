// ----------------------------------------------------------------------------
//  File:        status-indicator.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Status indicator component for system monitoring
//  Version:     2.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

interface StatusIndicatorProps {
  status: string
  label: string
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'online':
        return 'bg-green-500'
      case 'active':
        return 'bg-blue-500'
      case 'disconnected':
      case 'offline':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="status-indicator">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
} 