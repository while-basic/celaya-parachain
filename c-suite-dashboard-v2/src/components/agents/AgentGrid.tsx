// ----------------------------------------------------------------------------
//  File:        AgentGrid.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: 3D grid of agent orbs with Three.js Canvas
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { Suspense, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAgentStore } from '@/lib/stores'
import type { Agent } from '@/types'

// Dynamically import Three.js components to avoid SSR issues
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
)

const OrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
)

const Environment = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Environment),
  { ssr: false }
)

const AgentOrb = dynamic(
  () => import('./AgentOrb').then((mod) => mod.AgentOrb),
  { ssr: false }
)

interface AgentGridProps {
  onAgentSelect?: (agent: Agent) => void
}

export function AgentGrid({ onAgentSelect }: AgentGridProps) {
  const { agents } = useAgentStore()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Generate grid positions for agents
  const generatePositions = (count: number): [number, number, number][] => {
    const positions: [number, number, number][] = []
    const cols = Math.ceil(Math.sqrt(count))
    const spacing = isMobile ? 2.5 : 3 // Tighter spacing on mobile
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      
      const x = (col - cols / 2) * spacing
      const z = (row - cols / 2) * spacing
      const y = 0
      
      positions.push([x, y, z])
    }
    
    return positions
  }

  const positions = generatePositions(agents.length)

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/70 text-sm">Loading 3D visualization...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white/70 text-sm">Loading 3D visualization...</div>
        </div>
      }>
        <Canvas
          camera={{ 
            position: isMobile ? [0, 4, 8] : [0, 5, 10], 
            fov: isMobile ? 70 : 60 
          }}
          style={{ background: 'transparent' }}
          dpr={isMobile ? 1 : window.devicePixelRatio} // Lower DPR on mobile for performance
        >
          {/* Lighting - Simplified for mobile */}
          <ambientLight intensity={isMobile ? 0.5 : 0.4} />
          <pointLight position={[10, 10, 10]} intensity={isMobile ? 0.8 : 1} />
          {!isMobile && (
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
          )}
          
          {/* Environment - Conditional for performance */}
          {!isMobile && <Environment preset="night" />}
          
          {/* Agent Orbs */}
          {agents.map((agent, index) => (
            <AgentOrb
              key={agent.id}
              agent={agent}
              position={positions[index] || [0, 0, 0]}
              onSelect={onAgentSelect}
            />
          ))}
          
          {/* Camera Controls - Mobile optimized */}
          <OrbitControls
            enablePan={!isMobile} // Disable pan on mobile to avoid conflicts
            enableZoom={true}
            enableRotate={true}
            maxDistance={isMobile ? 15 : 20}
            minDistance={isMobile ? 4 : 5}
            dampingFactor={isMobile ? 0.1 : 0.05} // More responsive on mobile
            enableDamping={true}
          />
        </Canvas>
      </Suspense>
    </div>
  )
} 