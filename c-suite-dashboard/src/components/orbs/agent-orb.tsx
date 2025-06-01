// ----------------------------------------------------------------------------
//  File:        agent-orb.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: 3D orb visualization component for C-Suite agents
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface OrbProps {
  agentId: string;
  agentName: string;
  icon: string;
  isActive: boolean;
  state: 'idle' | 'speaking' | 'alert' | 'analysis' | 'insight';
  size?: number;
}

const OrbMesh: React.FC<OrbProps> = ({ agentId, isActive, state, size = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Agent-specific colors
  const getAgentColor = (id: string): [number, number, number] => {
    const colors: Record<string, [number, number, number]> = {
      lyra: [0.6, 0.4, 1.0],      // Purple - orchestrator
      echo: [0.2, 0.8, 1.0],      // Blue - auditor
      verdict: [1.0, 0.7, 0.2],   // Orange - legal
      volt: [1.0, 1.0, 0.3],      // Yellow - hardware
      core: [0.8, 0.2, 0.4],      // Red - processor
      vitals: [0.4, 1.0, 0.6],    // Green - medical
      sentinel: [0.3, 0.3, 0.3],  // Gray - security
      clarity: [0.8, 0.9, 1.0],   // Light blue - research
      beacon: [1.0, 0.5, 0.8],    // Pink - knowledge
      lens: [0.7, 0.3, 1.0],      // Violet - visual
      arc: [0.5, 0.8, 0.3],       // Lime - vehicle
      otto: [0.2, 0.6, 0.8],      // Deep blue - autonomous
      luma: [1.0, 0.8, 0.4],      // Warm yellow - environment
      arkive: [0.6, 0.6, 0.6],    // Silver - storage
    };
    return colors[id] || [0.5, 0.5, 0.5];
  };

  // State-based intensity and animation
  const getStateProperties = (state: string) => {
    switch (state) {
      case 'speaking':
        return { intensity: 1.5, speed: 2, distort: 0.4 };
      case 'alert':
        return { intensity: 2.0, speed: 4, distort: 0.6 };
      case 'analysis':
        return { intensity: 1.2, speed: 1.5, distort: 0.3 };
      case 'insight':
        return { intensity: 1.8, speed: 3, distort: 0.5 };
      default:
        return { intensity: 0.8, speed: 1, distort: 0.2 };
    }
  };

  useFrame((frameState) => {
    if (meshRef.current) {
      const stateProps = getStateProperties(state);
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(frameState.clock.elapsedTime * stateProps.speed) * 0.1;
      // Gentle rotation
      meshRef.current.rotation.y += 0.005 * stateProps.speed;
      
      // Pulse scale based on state
      const scale = size + Math.sin(frameState.clock.elapsedTime * stateProps.speed * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const baseColor = getAgentColor(agentId);
  const stateProps = getStateProperties(state);
  const opacity = isActive ? stateProps.intensity * 0.8 : 0.4;

  return (
    <Sphere
      ref={meshRef}
      args={[1, 32, 32]}
      scale={size}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MeshDistortMaterial
        color={new THREE.Color(baseColor[0], baseColor[1], baseColor[2])}
        transparent
        opacity={opacity}
        distort={hovered ? stateProps.distort * 1.5 : stateProps.distort}
        speed={stateProps.speed}
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  );
};

export const AgentOrb: React.FC<OrbProps> = (props) => {
  return (
    <div className="relative w-20 h-20">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <OrbMesh {...props} />
      </Canvas>
      
      {/* Agent info overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-lg">{props.icon}</div>
          <div className="text-xs font-medium text-white drop-shadow-lg">
            {props.agentName}
          </div>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="absolute top-1 right-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            props.isActive ? 'bg-green-400' : 'bg-gray-400'
          } ${props.state === 'speaking' ? 'animate-pulse' : ''}`}
        />
      </div>
    </div>
  );
}; 