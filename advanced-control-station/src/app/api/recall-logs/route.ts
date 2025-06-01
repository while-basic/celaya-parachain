// ----------------------------------------------------------------------------
//  File:        route.ts
//  Project:     Celaya Solutions (Parachain Template)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: API endpoint for fetching IPFS CID content from recall logs
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: January 2025
// ----------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cid = searchParams.get('cid')

    if (!cid) {
      return NextResponse.json({ error: 'CID parameter is required' }, { status: 400 })
    }

    // Search for CID in various log files
    const content = await searchForCidContent(cid)
    
    if (content) {
      return NextResponse.json({
        cid,
        content,
        found: true,
        source: 'recall-logs'
      })
    }

    // Return not found
    return NextResponse.json({
      cid,
      content: null,
      found: false,
      message: 'CID not found in local storage'
    }, { status: 404 })

  } catch (error) {
    console.error('Error fetching CID content:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function searchForCidContent(cid: string): Promise<string | null> {
  const searchPaths = [
    '../../../tool_calling/storage/logs',
    '../../../../tool_calling/storage/logs', 
    './tool_calling/storage/logs',
    './storage/logs'
  ]

  for (const basePath of searchPaths) {
    try {
      const content = await searchInDirectory(basePath, cid)
      if (content) return content
    } catch (error) {
      // Continue searching in other paths
      continue
    }
  }

  return null
}

async function searchInDirectory(dirPath: string, cid: string): Promise<string | null> {
  try {
    const resolvedPath = path.resolve(dirPath)
    const stats = await fs.stat(resolvedPath)
    
    if (!stats.isDirectory()) {
      return null
    }

    const entries = await fs.readdir(resolvedPath, { withFileTypes: true })

    // Search in files first
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        const filePath = path.join(resolvedPath, entry.name)
        const content = await searchInFile(filePath, cid)
        if (content) return content
      }
    }

    // Then search in subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDirPath = path.join(resolvedPath, entry.name)
        const content = await searchInDirectory(subDirPath, cid)
        if (content) return content
      }
    }

    return null
  } catch (error) {
    return null
  }
}

async function searchInFile(filePath: string, cid: string): Promise<string | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    
    // Check if file contains the CID
    if (fileContent.includes(cid)) {
      try {
        // Try to parse as JSON and extract relevant content
        const jsonData = JSON.parse(fileContent)
        
        // If it's an array, search through entries
        if (Array.isArray(jsonData)) {
          for (const entry of jsonData) {
            if (typeof entry === 'object' && entry !== null) {
              const entryStr = JSON.stringify(entry)
              if (entryStr.includes(cid)) {
                return JSON.stringify(entry, null, 2)
              }
            }
          }
        }
        
        // If it's an object that contains the CID, return the whole object
        if (typeof jsonData === 'object' && jsonData !== null) {
          const jsonStr = JSON.stringify(jsonData)
          if (jsonStr.includes(cid)) {
            return JSON.stringify(jsonData, null, 2)
          }
        }
        
        return fileContent
      } catch {
        // If not valid JSON, return raw content
        return fileContent
      }
    }

    return null
  } catch (error) {
    return null
  }
} 