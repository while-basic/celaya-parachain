// ----------------------------------------------------------------------------
//  File:        utils.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Utility functions for the dashboard application
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than a minute
  if (diff < 60000) {
    return 'Just now'
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  
  // More than a day
  const days = Math.floor(diff / 86400000)
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
  
  // Format as date for older items
  return date.toLocaleDateString()
}

export function formatTrustScore(score: number): string {
  return `${score.toFixed(1)}%`
}

export function formatBlockNumber(blockNumber: number): string {
  return blockNumber.toLocaleString()
}

export function formatCID(cid: string, length: number = 8): string {
  if (cid.length <= length) return cid
  return `${cid.substring(0, length)}...`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-green-400'
    case 'processing': return 'text-yellow-400'
    case 'idle': return 'text-gray-400'
    case 'error': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-400/20 text-green-400'
    case 'processing': return 'bg-yellow-400/20 text-yellow-400'
    case 'idle': return 'bg-gray-400/20 text-gray-400'
    case 'error': return 'bg-red-400/20 text-red-400'
    default: return 'bg-gray-400/20 text-gray-400'
  }
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`
  return num.toFixed(decimals)
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
} 