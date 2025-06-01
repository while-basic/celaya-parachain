import React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}

export function PolkadotProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
} 