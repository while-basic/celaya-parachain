// ----------------------------------------------------------------------------
//  File:        index.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Main Fastify server with WebSocket and API routes
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import { createClient } from 'redis'
import { Pool } from 'pg'

// Import route handlers
import { agentRoutes } from './routes/agents'
import { consensusRoutes } from './routes/consensus'
import { cidRoutes } from './routes/cids'
import { streamRoutes } from './routes/streams'

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  }
})

// Redis client for event queuing
const redis = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
})

// PostgreSQL connection pool
const pg = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'c_suite_dashboard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000
})

// Register WebSocket support
fastify.register(websocket)

// CORS configuration
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})

// Add database and redis to fastify instance
fastify.decorate('redis', redis)
fastify.decorate('pg', pg)

// Health check endpoint
fastify.get('/health', async () => {
  try {
    await pg.query('SELECT 1')
    await redis.ping()
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }
  }
})

// Register API routes
fastify.register(agentRoutes, { prefix: '/api/agents' })
fastify.register(consensusRoutes, { prefix: '/api/consensus' })
fastify.register(cidRoutes, { prefix: '/api/cids' })
fastify.register(streamRoutes, { prefix: '/api/streams' })

// WebSocket endpoint for real-time updates
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            // Subscribe to specific event types
            await redis.sadd(`subscribers:${data.channel}`, connection.socket.id)
            connection.socket.send(JSON.stringify({
              type: 'subscription_confirmed',
              channel: data.channel
            }))
            break
            
          case 'unsubscribe':
            await redis.srem(`subscribers:${data.channel}`, connection.socket.id)
            break
            
          default:
            connection.socket.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type'
            }))
        }
      } catch (error) {
        connection.socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }))
      }
    })
    
    connection.socket.on('close', async () => {
      // Clean up subscriptions when connection closes
      const keys = await redis.keys('subscribers:*')
      for (const key of keys) {
        await redis.srem(key, connection.socket.id)
      }
    })
  })
})

// Start server
const start = async () => {
  try {
    // Connect to Redis
    await redis.connect()
    fastify.log.info('Connected to Redis')
    
    // Test database connection
    await pg.query('SELECT NOW()')
    fastify.log.info('Connected to PostgreSQL')
    
    // Start server
    const port = parseInt(process.env.PORT || '8080')
    await fastify.listen({ port, host: '0.0.0.0' })
    
    fastify.log.info(`C-Suite Dashboard API server running on port ${port}`)
  } catch (err) {
    fastify.log.error('Error starting server:', err)
    process.exit(1)
  }
}

start() 