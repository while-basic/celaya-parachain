// ----------------------------------------------------------------------------
//  File:        providers.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: React providers for context management
//  Version:     2.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client'

import React from 'react'
import { ThemeProvider, PolkadotProvider, AgentProvider } from '@/lib/theme-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <PolkadotProvider>
        <AgentProvider>
          {children}
        </AgentProvider>
      </PolkadotProvider>
    </ThemeProvider>
  )
} 