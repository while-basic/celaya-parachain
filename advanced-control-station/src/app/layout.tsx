// ----------------------------------------------------------------------------
//  File:        layout.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Root layout for the Advanced Control Station
//  Version:     2.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
})

export const metadata: Metadata = {
  title: 'Advanced Control Station | Celaya Solutions',
  description: 'Advanced Control Station for C-Suite Agent Simulation & Tool Calling',
  keywords: [
    'Polkadot',
    'Substrate',
    'Control Station',
    'Agent Simulation',
    'Tool Calling',
    'Blockchain',
    'C-Suite',
  ],
  authors: [{ name: 'Christopher Celaya', email: 'chris@celayasolutions.com' }],
  creator: 'Celaya Solutions',
  publisher: 'Celaya Solutions',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
} 