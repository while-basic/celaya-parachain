// ----------------------------------------------------------------------------
//  File:        agents.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Agent API routes for Fastify server
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { FastifyInstance } from 'fastify'

export async function agentRoutes(fastify: FastifyInstance) {
  // Get all agents
  fastify.get('/', async (request, reply) => {
    try {
      const result = await fastify.pg.query(`
        SELECT id, name, trust_score, status, capabilities, version, last_seen, metadata
        FROM agents
        ORDER BY last_seen DESC
      `)
      
      return result.rows
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch agents' })
    }
  })

  // Get agent by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      const result = await fastify.pg.query(`
        SELECT id, name, trust_score, status, capabilities, version, last_seen, metadata
        FROM agents
        WHERE id = $1
      `, [id])
      
      if (result.rows.length === 0) {
        reply.code(404).send({ error: 'Agent not found' })
        return
      }
      
      return result.rows[0]
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch agent' })
    }
  })

  // Create new agent
  fastify.post('/', async (request, reply) => {
    const { name, capabilities, version, metadata } = request.body as {
      name: string
      capabilities: string[]
      version: string
      metadata: any
    }
    
    try {
      const result = await fastify.pg.query(`
        INSERT INTO agents (name, trust_score, status, capabilities, version, metadata, last_seen)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id, name, trust_score, status, capabilities, version, last_seen, metadata
      `, [name, 100, 'active', capabilities, version, metadata])
      
      return result.rows[0]
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create agent' })
    }
  })

  // Update agent
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any
    
    try {
      const result = await fastify.pg.query(`
        UPDATE agents 
        SET trust_score = COALESCE($2, trust_score),
            status = COALESCE($3, status),
            capabilities = COALESCE($4, capabilities),
            version = COALESCE($5, version),
            metadata = COALESCE($6, metadata),
            last_seen = NOW()
        WHERE id = $1
        RETURNING id, name, trust_score, status, capabilities, version, last_seen, metadata
      `, [id, updates.trust_score, updates.status, updates.capabilities, updates.version, updates.metadata])
      
      if (result.rows.length === 0) {
        reply.code(404).send({ error: 'Agent not found' })
        return
      }
      
      return result.rows[0]
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update agent' })
    }
  })

  // Delete agent
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      const result = await fastify.pg.query(`
        DELETE FROM agents WHERE id = $1
        RETURNING id
      `, [id])
      
      if (result.rows.length === 0) {
        reply.code(404).send({ error: 'Agent not found' })
        return
      }
      
      reply.code(204).send()
    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete agent' })
    }
  })
} 