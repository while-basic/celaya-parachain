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

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate grid positions for agents
  const generatePositions = (count: number): [number, number, number][] => {
    const positions: [number, number, number][] = []
    const cols = Math.ceil(Math.sqrt(count))
    const spacing = 3
    
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
        <div className="text-white/70">Loading 3D visualization...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white/70">Loading 3D visualization...</div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 5, 10], fov: 60 }}
          style={{ background: 'transparent' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* Agent Orbs */}
          {agents.map((agent, index) => (
            <AgentOrb
              key={agent.id}
              agent={agent}
              position={positions[index] || [0, 0, 0]}
              onSelect={onAgentSelect}
            />
          ))}
          
          {/* Camera Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={20}
            minDistance={5}
          />
        </Canvas>
      </Suspense>
    </div>
  )
} 