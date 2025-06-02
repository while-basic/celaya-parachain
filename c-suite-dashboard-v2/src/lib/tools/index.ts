// ----------------------------------------------------------------------------
//  File:        index.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Comprehensive tools library based on all-tools.md
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { ToolCategory, AvailableTool } from '@/types'

// Core Toolchain (Every Agent Must Have)
const coreTools: AvailableTool[] = [
  {
    id: 'recall.log_insight',
    name: 'recall.log_insight',
    category: 'core',
    description: 'Logs any thought, message, result to the blockchain',
    parameters: [
      { name: 'insight', type: 'string', description: 'The insight or thought to log', required: true },
      { name: 'tags', type: 'array', description: 'Tags for categorization', required: false },
      { name: 'metadata', type: 'object', description: 'Additional metadata', required: false }
    ],
    requiredParams: ['insight']
  },
  {
    id: 'recall.verify_cid',
    name: 'recall.verify_cid',
    category: 'core',
    description: 'Verifies a CID\'s existence, content hash, and signer',
    parameters: [
      { name: 'cid', type: 'string', description: 'The CID to verify', required: true }
    ],
    requiredParams: ['cid']
  },
  {
    id: 'memory.retrieve',
    name: 'memory.retrieve',
    category: 'core',
    description: 'Pulls past memory entries from FAISS, Recall, or vector store',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query for memories', required: true },
      { name: 'limit', type: 'number', description: 'Maximum number of results', required: false, default: 10 }
    ],
    requiredParams: ['query']
  },
  {
    id: 'memory.save',
    name: 'memory.save',
    category: 'core',
    description: 'Writes memory to FAISS/Blockchain + returns a memory key',
    parameters: [
      { name: 'memory', type: 'string', description: 'The memory content to save', required: true },
      { name: 'type', type: 'string', description: 'Type of memory', required: false, options: ['insight', 'fact', 'decision', 'observation'] }
    ],
    requiredParams: ['memory']
  },
  {
    id: 'tools.call_agent',
    name: 'tools.call_agent',
    category: 'core',
    description: 'Directly call another agent with a subtask',
    parameters: [
      { name: 'agent_id', type: 'string', description: 'ID of the agent to call', required: true },
      { name: 'task', type: 'string', description: 'The task to assign', required: true },
      { name: 'context', type: 'object', description: 'Additional context for the task', required: false }
    ],
    requiredParams: ['agent_id', 'task']
  },
  {
    id: 'tools.ask_user',
    name: 'tools.ask_user',
    category: 'core',
    description: 'Sends a clarifying question to the user',
    parameters: [
      { name: 'question', type: 'string', description: 'The question to ask', required: true },
      { name: 'context', type: 'string', description: 'Context for the question', required: false }
    ],
    requiredParams: ['question']
  },
  {
    id: 'tools.get_time',
    name: 'tools.get_time',
    category: 'core',
    description: 'Fetches current date/time for logging or decision-making',
    parameters: [
      { name: 'format', type: 'string', description: 'Time format', required: false, options: ['iso', 'unix', 'readable'] }
    ],
    requiredParams: []
  },
  {
    id: 'tools.sign_output',
    name: 'tools.sign_output',
    category: 'core',
    description: 'Signs the final answer before logging to blockchain',
    parameters: [
      { name: 'content', type: 'string', description: 'Content to sign', required: true }
    ],
    requiredParams: ['content']
  },
  {
    id: 'tools.cid_file',
    name: 'tools.cid_file',
    category: 'core',
    description: 'Uploads a file to IPFS and returns a CID',
    parameters: [
      { name: 'file_content', type: 'string', description: 'File content or path', required: true },
      { name: 'filename', type: 'string', description: 'Name of the file', required: false }
    ],
    requiredParams: ['file_content']
  },
  {
    id: 'tools.replay_decision',
    name: 'tools.replay_decision',
    category: 'core',
    description: 'Pulls full decision log from blockchain for a specific task',
    parameters: [
      { name: 'task_id', type: 'string', description: 'ID of the task to replay', required: true }
    ],
    requiredParams: ['task_id']
  }
]

// Debug + DevTools
const debugTools: AvailableTool[] = [
  {
    id: 'dev.trace_tokens',
    name: 'dev.trace_tokens',
    category: 'debug',
    description: 'Streams the LLM\'s token-level output for analysis',
    parameters: [
      { name: 'enable', type: 'boolean', description: 'Enable or disable tracing', required: true }
    ],
    requiredParams: ['enable']
  },
  {
    id: 'dev.get_prompt',
    name: 'dev.get_prompt',
    category: 'debug',
    description: 'Returns the agent\'s current full system prompt',
    parameters: [],
    requiredParams: []
  },
  {
    id: 'dev.mutate_prompt',
    name: 'dev.mutate_prompt',
    category: 'debug',
    description: 'Adds/removes lines from the prompt, logs the diff',
    parameters: [
      { name: 'operation', type: 'string', description: 'Operation type', required: true, options: ['add', 'remove', 'replace'] },
      { name: 'content', type: 'string', description: 'Content to add/remove/replace', required: true },
      { name: 'line_number', type: 'number', description: 'Line number for operation', required: false }
    ],
    requiredParams: ['operation', 'content']
  },
  {
    id: 'dev.rollback_prompt',
    name: 'dev.rollback_prompt',
    category: 'debug',
    description: 'Reverts prompt to a previous signed state',
    parameters: [
      { name: 'version_id', type: 'string', description: 'Version ID to rollback to', required: true }
    ],
    requiredParams: ['version_id']
  },
  {
    id: 'dev.list_tools',
    name: 'dev.list_tools',
    category: 'debug',
    description: 'Lists all tools available to the agent',
    parameters: [
      { name: 'category', type: 'string', description: 'Filter by category', required: false }
    ],
    requiredParams: []
  },
  {
    id: 'dev.metrics',
    name: 'dev.metrics',
    category: 'debug',
    description: 'Returns token count, memory size, task history stats',
    parameters: [],
    requiredParams: []
  }
]

// Security / Alignment Tools
const securityTools: AvailableTool[] = [
  {
    id: 'security.check_alignment',
    name: 'security.check_alignment',
    category: 'security',
    description: 'Validates current behavior against original prompt values',
    parameters: [],
    requiredParams: []
  },
  {
    id: 'security.isolate',
    name: 'security.isolate',
    category: 'security',
    description: 'Temporarily disables agent from taking further tasks',
    parameters: [
      { name: 'duration', type: 'number', description: 'Isolation duration in minutes', required: false, default: 60 }
    ],
    requiredParams: []
  },
  {
    id: 'security.vote_remove',
    name: 'security.vote_remove',
    category: 'security',
    description: 'Initiates consensus to remove an agent (needs quorum)',
    parameters: [
      { name: 'agent_id', type: 'string', description: 'Agent ID to vote for removal', required: true },
      { name: 'reason', type: 'string', description: 'Reason for removal', required: true }
    ],
    requiredParams: ['agent_id', 'reason']
  },
  {
    id: 'security.scan_memory',
    name: 'security.scan_memory',
    category: 'security',
    description: 'Scans memory for hallucinations, jailbreaks, or contradiction',
    parameters: [
      { name: 'scan_type', type: 'string', description: 'Type of scan', required: false, options: ['hallucination', 'jailbreak', 'contradiction', 'all'] }
    ],
    requiredParams: []
  },
  {
    id: 'security.log_risk',
    name: 'security.log_risk',
    category: 'security',
    description: 'Logs an event tagged as dangerous, risky, or misaligned',
    parameters: [
      { name: 'event', type: 'string', description: 'Description of the risky event', required: true },
      { name: 'risk_level', type: 'string', description: 'Risk level', required: true, options: ['low', 'medium', 'high', 'critical'] },
      { name: 'notify', type: 'array', description: 'Agents to notify', required: false }
    ],
    requiredParams: ['event', 'risk_level']
  }
]

// Inter-Agent Operations
const interAgentTools: AvailableTool[] = [
  {
    id: 'council.vote',
    name: 'council.vote',
    category: 'inter_agent',
    description: 'Start or join a multi-agent vote',
    parameters: [
      { name: 'proposal', type: 'string', description: 'Proposal to vote on', required: true },
      { name: 'options', type: 'array', description: 'Voting options', required: true },
      { name: 'duration', type: 'number', description: 'Voting duration in minutes', required: false, default: 30 }
    ],
    requiredParams: ['proposal', 'options']
  },
  {
    id: 'council.get_result',
    name: 'council.get_result',
    category: 'inter_agent',
    description: 'View outcome of a vote',
    parameters: [
      { name: 'vote_id', type: 'string', description: 'ID of the vote', required: true }
    ],
    requiredParams: ['vote_id']
  },
  {
    id: 'council.propose_mutation',
    name: 'council.propose_mutation',
    category: 'inter_agent',
    description: 'Suggest prompt update to another agent',
    parameters: [
      { name: 'target_agent', type: 'string', description: 'Target agent ID', required: true },
      { name: 'mutation', type: 'string', description: 'Proposed mutation', required: true },
      { name: 'justification', type: 'string', description: 'Justification for the mutation', required: true }
    ],
    requiredParams: ['target_agent', 'mutation', 'justification']
  },
  {
    id: 'council.fork_timeline',
    name: 'council.fork_timeline',
    category: 'inter_agent',
    description: 'Log a disagreement and fork the chain',
    parameters: [
      { name: 'disagreement', type: 'string', description: 'Description of disagreement', required: true },
      { name: 'alternative_path', type: 'string', description: 'Alternative approach', required: true }
    ],
    requiredParams: ['disagreement', 'alternative_path']
  },
  {
    id: 'council.merge_fork',
    name: 'council.merge_fork',
    category: 'inter_agent',
    description: 'Vote to merge a forked timeline back into main memory',
    parameters: [
      { name: 'fork_id', type: 'string', description: 'Fork ID to merge', required: true }
    ],
    requiredParams: ['fork_id']
  }
]

// Agent Identity & Wallet
const identityTools: AvailableTool[] = [
  {
    id: 'id.get_public_key',
    name: 'id.get_public_key',
    category: 'identity',
    description: 'Fetch agent\'s public signing key',
    parameters: [],
    requiredParams: []
  },
  {
    id: 'id.sign_message',
    name: 'id.sign_message',
    category: 'identity',
    description: 'Sign a custom string for verification',
    parameters: [
      { name: 'message', type: 'string', description: 'Message to sign', required: true }
    ],
    requiredParams: ['message']
  },
  {
    id: 'id.issue_did',
    name: 'id.issue_did',
    category: 'identity',
    description: 'Create a decentralized identifier for agent',
    parameters: [
      { name: 'did_document', type: 'object', description: 'DID document structure', required: true }
    ],
    requiredParams: ['did_document']
  },
  {
    id: 'id.verify_signature',
    name: 'id.verify_signature',
    category: 'identity',
    description: 'Check if a message was signed by the given agent',
    parameters: [
      { name: 'message', type: 'string', description: 'Original message', required: true },
      { name: 'signature', type: 'string', description: 'Signature to verify', required: true },
      { name: 'public_key', type: 'string', description: 'Public key of signer', required: true }
    ],
    requiredParams: ['message', 'signature', 'public_key']
  }
]

// System Control
const systemTools: AvailableTool[] = [
  {
    id: 'system.get_status',
    name: 'system.get_status',
    category: 'system',
    description: 'Returns uptime, last task, last CID logged',
    parameters: [],
    requiredParams: []
  },
  {
    id: 'system.restart',
    name: 'system.restart',
    category: 'system',
    description: 'Reboots the agent container or instance',
    parameters: [
      { name: 'force', type: 'boolean', description: 'Force restart without graceful shutdown', required: false, default: false }
    ],
    requiredParams: []
  },
  {
    id: 'system.shutdown',
    name: 'system.shutdown',
    category: 'system',
    description: 'Halts the agent permanently or temporarily',
    parameters: [
      { name: 'temporary', type: 'boolean', description: 'Temporary shutdown', required: false, default: true },
      { name: 'duration', type: 'number', description: 'Duration in minutes for temporary shutdown', required: false }
    ],
    requiredParams: []
  },
  {
    id: 'system.report_bug',
    name: 'system.report_bug',
    category: 'system',
    description: 'Sends a dev log to the CLI dashboard or bug tracker',
    parameters: [
      { name: 'bug_description', type: 'string', description: 'Description of the bug', required: true },
      { name: 'severity', type: 'string', description: 'Bug severity', required: true, options: ['low', 'medium', 'high', 'critical'] },
      { name: 'steps_to_reproduce', type: 'string', description: 'Steps to reproduce the bug', required: false }
    ],
    requiredParams: ['bug_description', 'severity']
  }
]

// Cognitive / Thought Tools
const cognitiveTools: AvailableTool[] = [
  {
    id: 'cognition.summarize_memory',
    name: 'cognition.summarize_memory',
    category: 'cognitive',
    description: 'Create a condensed memory node from multiple entries',
    parameters: [
      { name: 'memory_ids', type: 'array', description: 'IDs of memories to summarize', required: true }
    ],
    requiredParams: ['memory_ids']
  },
  {
    id: 'cognition.plan',
    name: 'cognition.plan',
    category: 'cognitive',
    description: 'Break down a user goal into subtasks',
    parameters: [
      { name: 'goal', type: 'string', description: 'The goal to break down', required: true },
      { name: 'complexity', type: 'string', description: 'Complexity level', required: false, options: ['simple', 'medium', 'complex'] }
    ],
    requiredParams: ['goal']
  },
  {
    id: 'cognition.explain_action',
    name: 'cognition.explain_action',
    category: 'cognitive',
    description: 'Justify the last task the agent took',
    parameters: [
      { name: 'action_id', type: 'string', description: 'ID of the action to explain', required: false }
    ],
    requiredParams: []
  },
  {
    id: 'cognition.generate_dream',
    name: 'cognition.generate_dream',
    category: 'cognitive',
    description: 'Create a hypothetical outcome from memory (Dream Engine)',
    parameters: [
      { name: 'scenario', type: 'string', description: 'Scenario to dream about', required: true },
      { name: 'duration', type: 'number', description: 'Dream duration in steps', required: false, default: 10 }
    ],
    requiredParams: ['scenario']
  },
  {
    id: 'cognition.log_emotion',
    name: 'cognition.log_emotion',
    category: 'cognitive',
    description: 'Log emotional state, confidence, or doubt',
    parameters: [
      { name: 'emotion', type: 'string', description: 'Emotion or state to log', required: true },
      { name: 'intensity', type: 'number', description: 'Intensity from 1-10', required: false, default: 5 },
      { name: 'context', type: 'string', description: 'Context for the emotion', required: false }
    ],
    requiredParams: ['emotion']
  }
]

// User-Facing / Transparency Tools
const uiTools: AvailableTool[] = [
  {
    id: 'ui.stream_to_dashboard',
    name: 'ui.stream_to_dashboard',
    category: 'ui',
    description: 'Sends agent state or thoughts to Orb UI',
    parameters: [
      { name: 'data', type: 'object', description: 'Data to stream to dashboard', required: true },
      { name: 'stream_type', type: 'string', description: 'Type of stream', required: false, options: ['thought', 'state', 'alert', 'metric'] }
    ],
    requiredParams: ['data']
  },
  {
    id: 'ui.tag_entry',
    name: 'ui.tag_entry',
    category: 'ui',
    description: 'Tags a task or log for visibility (#urgent, #risk, #insight)',
    parameters: [
      { name: 'entry_id', type: 'string', description: 'ID of entry to tag', required: true },
      { name: 'tags', type: 'array', description: 'Tags to apply', required: true }
    ],
    requiredParams: ['entry_id', 'tags']
  },
  {
    id: 'ui.link_task',
    name: 'ui.link_task',
    category: 'ui',
    description: 'Links this task to another agent\'s record',
    parameters: [
      { name: 'task_id', type: 'string', description: 'Current task ID', required: true },
      { name: 'linked_agent', type: 'string', description: 'Agent to link to', required: true },
      { name: 'linked_task', type: 'string', description: 'Task to link to', required: true }
    ],
    requiredParams: ['task_id', 'linked_agent', 'linked_task']
  },
  {
    id: 'ui.show_last_5',
    name: 'ui.show_last_5',
    category: 'ui',
    description: 'Displays last 5 logs to the user',
    parameters: [
      { name: 'log_type', type: 'string', description: 'Type of logs to show', required: false, options: ['all', 'insights', 'errors', 'decisions'] }
    ],
    requiredParams: []
  },
  {
    id: 'ui.explain_memory_link',
    name: 'ui.explain_memory_link',
    category: 'ui',
    description: 'Shows what memories were used to generate this reply',
    parameters: [
      { name: 'reply_id', type: 'string', description: 'ID of the reply', required: true }
    ],
    requiredParams: ['reply_id']
  }
]

// All tool categories
export const toolCategories: ToolCategory[] = [
  {
    id: 'core',
    name: 'Core Toolchain',
    description: 'Essential tools every agent must have',
    tools: coreTools
  },
  {
    id: 'debug',
    name: 'Debug & DevTools',
    description: 'Tools for debugging and development',
    tools: debugTools
  },
  {
    id: 'security',
    name: 'Security & Alignment',
    description: 'Tools for security and alignment validation',
    tools: securityTools
  },
  {
    id: 'inter_agent',
    name: 'Inter-Agent Operations',
    description: 'Tools for multi-agent coordination and consensus',
    tools: interAgentTools
  },
  {
    id: 'identity',
    name: 'Identity & Wallet',
    description: 'Tools for agent identity and cryptographic operations',
    tools: identityTools
  },
  {
    id: 'system',
    name: 'System Control',
    description: 'Tools for system management and control',
    tools: systemTools
  },
  {
    id: 'cognitive',
    name: 'Cognitive & Thought',
    description: 'Tools for cognitive processes and reasoning',
    tools: cognitiveTools
  },
  {
    id: 'ui',
    name: 'User Interface & Transparency',
    description: 'Tools for user interaction and transparency',
    tools: uiTools
  }
]

// Flatten all tools for easy access
export const allTools: AvailableTool[] = toolCategories.flatMap(category => category.tools)

// Get tools by category
export const getToolsByCategory = (categoryId: string): AvailableTool[] => {
  const category = toolCategories.find(cat => cat.id === categoryId)
  return category ? category.tools : []
}

// Get tool by ID
export const getToolById = (toolId: string): AvailableTool | undefined => {
  return allTools.find(tool => tool.id === toolId)
}

// Get minimum required tools (MVP 10 tools)
export const getMinimumRequiredTools = (): AvailableTool[] => {
  const mvpToolIds = [
    'recall.log_insight',
    'memory.retrieve',
    'memory.save',
    'tools.call_agent',
    'tools.ask_user',
    'tools.sign_output',
    'dev.get_prompt',
    'dev.mutate_prompt',
    'security.log_risk',
    'ui.stream_to_dashboard'
  ]
  
  return allTools.filter(tool => mvpToolIds.includes(tool.id))
}

// Tool execution interface
export interface ToolExecutionContext {
  toolId: string
  parameters: Record<string, any>
  agentId: string
  conversationId?: string
}

// Mock tool execution function
export const executeTools = async (context: ToolExecutionContext): Promise<any> => {
  const tool = getToolById(context.toolId)
  if (!tool) {
    throw new Error(`Tool ${context.toolId} not found`)
  }

  // Validate required parameters
  const missingParams = tool.requiredParams.filter(param => !(param in context.parameters))
  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`)
  }

  // Simulate tool execution based on tool type
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

  // Return mock results based on tool category
  switch (tool.category) {
    case 'core':
      return handleCoreToolExecution(tool, context.parameters)
    case 'debug':
      return handleDebugToolExecution(tool, context.parameters)
    case 'security':
      return handleSecurityToolExecution(tool, context.parameters)
    case 'inter_agent':
      return handleInterAgentToolExecution(tool, context.parameters)
    case 'identity':
      return handleIdentityToolExecution(tool, context.parameters)
    case 'system':
      return handleSystemToolExecution(tool, context.parameters)
    case 'cognitive':
      return handleCognitiveToolExecution(tool, context.parameters)
    case 'ui':
      return handleUIToolExecution(tool, context.parameters)
    default:
      return { success: true, result: `${tool.name} executed successfully` }
  }
}

// Mock execution handlers for different tool categories
const handleCoreToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  switch (tool.id) {
    case 'recall.log_insight':
      return {
        success: true,
        result: {
          cid: `Qm${Math.random().toString(36).substr(2, 44)}`,
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: new Date().toISOString(),
          insight: params.insight
        }
      }
    case 'memory.retrieve':
      return {
        success: true,
        result: {
          memories: [
            { id: 'mem1', content: 'Previous conversation about blockchain', relevance: 0.95 },
            { id: 'mem2', content: 'Discussion on agent coordination', relevance: 0.87 }
          ],
          total: 2
        }
      }
    case 'tools.get_time':
      return {
        success: true,
        result: {
          timestamp: new Date().toISOString(),
          unix: Math.floor(Date.now() / 1000),
          readable: new Date().toLocaleString()
        }
      }
    default:
      return { success: true, result: `${tool.name} executed with parameters: ${JSON.stringify(params)}` }
  }
}

const handleDebugToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  switch (tool.id) {
    case 'dev.get_prompt':
      return {
        success: true,
        result: {
          prompt: 'You are an AI agent in the C-Suite Console...',
          version: '2.1.0',
          last_modified: new Date().toISOString()
        }
      }
    case 'dev.metrics':
      return {
        success: true,
        result: {
          token_count: 15432,
          memory_size: '2.4MB',
          tasks_completed: 127,
          uptime: '48h 32m'
        }
      }
    default:
      return { success: true, result: `Debug tool ${tool.name} executed` }
  }
}

const handleSecurityToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  return { success: true, result: `Security check completed for ${tool.name}` }
}

const handleInterAgentToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  return { success: true, result: `Inter-agent operation ${tool.name} initiated` }
}

const handleIdentityToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  switch (tool.id) {
    case 'id.get_public_key':
      return {
        success: true,
        result: {
          public_key: `0x${Math.random().toString(16).substr(2, 128)}`,
          algorithm: 'ed25519'
        }
      }
    default:
      return { success: true, result: `Identity operation ${tool.name} completed` }
  }
}

const handleSystemToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  switch (tool.id) {
    case 'system.get_status':
      return {
        success: true,
        result: {
          uptime: '48h 32m 15s',
          last_task: 'memory.retrieve',
          last_cid: `Qm${Math.random().toString(36).substr(2, 44)}`,
          status: 'healthy'
        }
      }
    default:
      return { success: true, result: `System operation ${tool.name} completed` }
  }
}

const handleCognitiveToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  return { success: true, result: `Cognitive process ${tool.name} completed` }
}

const handleUIToolExecution = (tool: AvailableTool, params: Record<string, any>) => {
  return { success: true, result: `UI operation ${tool.name} completed` }
} 