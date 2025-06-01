// ----------------------------------------------------------------------------
//  File:        layout.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Root layout with Apple-inspired enterprise styling
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { BlockchainProvider } from "@/components/blockchain/BlockchainProvider"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "C-Suite Console | Celaya Solutions",
  description: "Enterprise-grade real-time dashboard for C-Suite blockchain agent registry with AI orb visualizations",
  authors: [{ name: "Christopher Celaya" }],
  keywords: ["blockchain", "ai-agents", "dashboard", "enterprise", "real-time"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
          {/* Background Effects */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
          <div className="fixed inset-0 bg-grid-white/[0.02] pointer-events-none" />
          
          {/* Main Content */}
          <div className="relative z-10">
            <BlockchainProvider>
              {children}
            </BlockchainProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
