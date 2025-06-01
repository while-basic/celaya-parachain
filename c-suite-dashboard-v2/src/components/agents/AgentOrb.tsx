// ----------------------------------------------------------------------------
//  File:        AgentOrb.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Three.js agent orb component for 3D visualization
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Text } from '@react-three/drei'
import type { Mesh } from 'three'
import type { Agent } from '@/types'

interface AgentOrbProps {
  agent: Agent
  position: [number, number, number]
  onSelect?: (agent: Agent) => void
}

export function AgentOrb({ agent, position, onSelect }: AgentOrbProps) {
  const meshRef = useRef<Mesh>(null)
  
  // Color based on agent status
  const color = useMemo(() => {
    switch (agent.status) {
      case 'active': return '#22c55e'
      case 'processing': return '#eab308'
      case 'idle': return '#6b7280'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }, [agent.status])

  // Animation based on status
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    // Base rotation
    meshRef.current.rotation.y = time * 0.5
    
    // Pulsing effect for active agents
    if (agent.status === 'active' || agent.status === 'processing') {
      meshRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1)
    }
    
    // Floating animation
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2
  })

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.5, 32, 32]}
        onClick={() => onSelect?.(agent)}
        onPointerOver={() => {
          if (meshRef.current) {
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.5}
        />
      </Sphere>
      
      {/* Agent name */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.name}
      </Text>
      
      {/* Trust score indicator */}
      <Text
        position={[0, -1.3, 0]}
        fontSize={0.15}
        color={agent.trustScore > 90 ? '#22c55e' : agent.trustScore > 70 ? '#eab308' : '#ef4444'}
        anchorX="center"
        anchorY="middle"
      >
        {agent.trustScore.toFixed(1)}%
      </Text>
    </group>
  )
} 