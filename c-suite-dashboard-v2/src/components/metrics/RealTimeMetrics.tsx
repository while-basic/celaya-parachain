// ----------------------------------------------------------------------------
//  File:        RealTimeMetrics.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Real-time metrics component with animated counters
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Shield, Database, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSystemStore, useStreamStore } from '@/lib/stores'

interface MetricCardProps {
  title: string
  value: number | string
  previousValue?: number
  icon: React.ReactNode
  color: string
  suffix?: string
  precision?: number
}

function MetricCard({ title, value, previousValue, icon, color, suffix = '', precision = 0 }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? previousValue || value : value)
  
  useEffect(() => {
    if (typeof value === 'number' && typeof displayValue === 'number') {
      const difference = value - displayValue
      if (Math.abs(difference) > 0.1) {
        const increment = difference / 20
        const timer = setInterval(() => {
          setDisplayValue(prev => {
            const newVal = typeof prev === 'number' ? prev + increment : value
            if (Math.abs(value - newVal) < Math.abs(increment)) {
              clearInterval(timer)
              return value
            }
            return newVal
          })
        }, 50)
        return () => clearInterval(timer)
      }
    } else {
      setDisplayValue(value)
    }
  }, [value, displayValue])

  const formattedValue = typeof displayValue === 'number' 
    ? displayValue.toFixed(precision) 
    : displayValue

  const isIncreasing = typeof value === 'number' && typeof previousValue === 'number' 
    ? value > previousValue 
    : false

  return (
    <Card className="glass glass-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90">
          {title}
        </CardTitle>
        <div className={`${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end space-x-2">
          <motion.div 
            className="text-2xl font-bold text-white"
            key={formattedValue}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formattedValue}{suffix}
          </motion.div>
          {typeof previousValue === 'number' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs ${isIncreasing ? 'text-green-400' : 'text-red-400'} flex items-center`}
            >
              <TrendingUp className={`w-3 h-3 mr-1 ${isIncreasing ? '' : 'rotate-180'}`} />
              {Math.abs(((typeof value === 'number' ? value : 0) - previousValue) / previousValue * 100).toFixed(1)}%
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function RealTimeMetrics() {
  const { metrics } = useSystemStore()
  const { streamStatus, events, cidLogs } = useStreamStore()
  const [previousMetrics, setPreviousMetrics] = useState(metrics)

  useEffect(() => {
    const timer = setInterval(() => {
      setPreviousMetrics(metrics)
    }, 5000) // Update comparison baseline every 5 seconds

    return () => clearInterval(timer)
  }, [metrics])

  const eventsPerSecond = events.length > 0 
    ? events.filter(e => new Date().getTime() - e.timestamp.getTime() < 60000).length / 60
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        title="Active Agents"
        value={metrics.activeAgents}
        previousValue={previousMetrics.activeAgents}
        icon={<Users className="h-4 w-4" />}
        color="text-blue-400"
      />

      <MetricCard
        title="Trust Score"
        value={metrics.averageTrustScore}
        previousValue={previousMetrics.averageTrustScore}
        icon={<Shield className="h-4 w-4" />}
        color="text-green-400"
        suffix="%"
        precision={1}
      />

      <MetricCard
        title="Events/min"
        value={eventsPerSecond * 60}
        icon={<Activity className="h-4 w-4" />}
        color="text-yellow-400"
        precision={0}
      />

      <MetricCard
        title="Consensus"
        value={metrics.consensusCount}
        previousValue={previousMetrics.consensusCount}
        icon={<Database className="h-4 w-4" />}
        color="text-purple-400"
      />

      <MetricCard
        title="CID Logs"
        value={cidLogs.length}
        icon={<Zap className="h-4 w-4" />}
        color="text-orange-400"
      />

      <MetricCard
        title="Status"
        value={streamStatus === 'connected' ? 'ONLINE' : streamStatus.toUpperCase()}
        icon={
          <div className={`w-3 h-3 rounded-full ${
            streamStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
            streamStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
            'bg-red-400'
          }`} />
        }
        color={
          streamStatus === 'connected' ? 'text-green-400' :
          streamStatus === 'connecting' ? 'text-yellow-400' :
          'text-red-400'
        }
      />
    </div>
  )
} 