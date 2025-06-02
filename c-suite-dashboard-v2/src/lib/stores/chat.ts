// ----------------------------------------------------------------------------
//  File:        chat.ts
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Chat store for managing conversations, tool calling, and IPFS integration
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  ChatState, 
  Conversation, 
  ChatMessage, 
  ChatParticipant, 
  AgentGroup, 
  ToolCall, 
  ToolResult,
  SavedInteraction
} from '@/types'
import { executeTools, ToolExecutionContext } from '@/lib/tools'

interface ChatStore extends ChatState {
  // Conversation Management
  createConversation: (name: string, type: 'individual' | 'group' | 'all_agents', participants: string[]) => void
  setActiveConversation: (conversationId: string) => void
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void
  deleteConversation: (conversationId: string) => void
  archiveConversation: (conversationId: string) => void
  
  // Message Management
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (messageId: string) => void
  
  // Tool Calling
  executeToolCall: (toolCall: ToolCall) => Promise<ToolResult>
  addToolResult: (result: ToolResult) => void
  
  // Participants & Groups
  addParticipant: (participant: ChatParticipant) => void
  updateParticipantStatus: (participantId: string, status: ChatParticipant['status']) => void
  createGroup: (group: Omit<AgentGroup, 'id' | 'createdAt'>) => void
  updateGroup: (groupId: string, updates: Partial<AgentGroup>) => void
  deleteGroup: (groupId: string) => void
  
  // Typing Indicators
  setTyping: (conversationId: string, participantId: string, isTyping: boolean) => void
  
  // IPFS & Blockchain Integration
  saveConversationToIPFS: (conversationId: string, messageRange?: { startMessageId: string; endMessageId: string }) => Promise<SavedInteraction>
  getSavedInteractions: (conversationId: string) => SavedInteraction[]
  exportConversation: (conversationId: string, format: 'markdown' | 'json') => string
  
  // Real-time
  setConnectionStatus: (isConnected: boolean) => void
  
  // Utilities
  getActiveConversation: () => Conversation | null
  getConversationParticipants: (conversationId: string) => ChatParticipant[]
  searchMessages: (query: string, conversationId?: string) => ChatMessage[]
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      conversations: [],
      activeConversationId: null,
      participants: [],
      groups: [],
      typingIndicators: {},
      isConnected: false,

      // Conversation Management
      createConversation: (name, type, participants) => {
        const conversation: Conversation = {
          id: `conv_${Date.now()}`,
          name,
          type,
          participants,
          messages: [],
          createdAt: new Date(),
          lastActivity: new Date(),
          metadata: {
            totalMessages: 0,
            savedCIDs: [],
            totalToolCalls: 0,
            autoSave: true,
            archived: false
          }
        }

        set(state => ({
          conversations: [...state.conversations, conversation],
          activeConversationId: conversation.id
        }))
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId })
      },

      updateConversation: (conversationId, updates) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId ? { ...conv, ...updates, lastActivity: new Date() } : conv
          )
        }))
      },

      deleteConversation: (conversationId) => {
        set(state => ({
          conversations: state.conversations.filter(conv => conv.id !== conversationId),
          activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
        }))
      },

      archiveConversation: (conversationId) => {
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (conversation) {
          get().updateConversation(conversationId, { 
            metadata: { ...conversation.metadata, archived: true } 
          })
        }
      },

      // Message Management
      addMessage: (messageData) => {
        const message: ChatMessage = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        }

        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === message.conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  lastActivity: new Date(),
                  metadata: {
                    ...conv.metadata,
                    totalMessages: conv.metadata.totalMessages + 1,
                    totalToolCalls: message.type === 'tool_call' ? conv.metadata.totalToolCalls + 1 : conv.metadata.totalToolCalls
                  }
                }
              : conv
          )
        }))

        // Auto-save to IPFS if enabled
        const conversation = get().conversations.find(c => c.id === message.conversationId)
        if (conversation?.metadata.autoSave && message.type !== 'system_message') {
          // Note: Implement auto-save logic here
          console.log('Auto-saving conversation to IPFS...')
        }
      },

      updateMessage: (messageId, updates) => {
        set(state => ({
          conversations: state.conversations.map(conv => ({
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            )
          }))
        }))
      },

      deleteMessage: (messageId) => {
        set(state => ({
          conversations: state.conversations.map(conv => ({
            ...conv,
            messages: conv.messages.filter(msg => msg.id !== messageId),
            metadata: {
              ...conv.metadata,
              totalMessages: conv.metadata.totalMessages - 1
            }
          }))
        }))
      },

      // Tool Calling - This will integrate with the tools from all-tools.md
      executeToolCall: async (toolCall) => {
        const startTime = Date.now()
        
        try {
          // Use the comprehensive tools library
          const context: ToolExecutionContext = {
            toolId: toolCall.id,
            parameters: toolCall.parameters,
            agentId: toolCall.requestedBy,
            conversationId: '' // Will be set by calling component
          }

          const toolResult = await executeTools(context)
          
          const result: ToolResult = {
            id: `result_${Date.now()}`,
            toolCallId: toolCall.id,
            result: toolResult,
            success: toolResult.success || true,
            timestamp: new Date(),
            executionTime: Date.now() - startTime,
            cid: toolResult.result?.cid,
            hash: toolResult.result?.hash
          }

          return result
        } catch (error) {
          const result: ToolResult = {
            id: `result_${Date.now()}`,
            toolCallId: toolCall.id,
            result: null,
            success: false,
            timestamp: new Date(),
            executionTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          }

          return result
        }
      },

      addToolResult: (result) => {
        // Tool result will be added by the component that initiated the call
        console.log('Tool result added:', result)
      },

      // Participants & Groups
      addParticipant: (participant) => {
        set(state => ({
          participants: [...state.participants.filter(p => p.id !== participant.id), participant]
        }))
      },

      updateParticipantStatus: (participantId, status) => {
        set(state => ({
          participants: state.participants.map(p =>
            p.id === participantId ? { ...p, status, lastSeen: new Date() } : p
          )
        }))
      },

      createGroup: (groupData) => {
        const group: AgentGroup = {
          ...groupData,
          id: `group_${Date.now()}`,
          createdAt: new Date()
        }

        set(state => ({
          groups: [...state.groups, group]
        }))
      },

      updateGroup: (groupId, updates) => {
        set(state => ({
          groups: state.groups.map(group =>
            group.id === groupId ? { ...group, ...updates } : group
          )
        }))
      },

      deleteGroup: (groupId) => {
        set(state => ({
          groups: state.groups.filter(group => group.id !== groupId)
        }))
      },

      // Typing Indicators
      setTyping: (conversationId, participantId, isTyping) => {
        set(state => {
          const currentTyping = state.typingIndicators[conversationId] || []
          const newTyping = isTyping
            ? [...currentTyping.filter(id => id !== participantId), participantId]
            : currentTyping.filter(id => id !== participantId)

          return {
            typingIndicators: {
              ...state.typingIndicators,
              [conversationId]: newTyping
            }
          }
        })
      },

      // IPFS & Blockchain Integration
      saveConversationToIPFS: async (conversationId, messageRange) => {
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (!conversation) throw new Error('Conversation not found')

        const exportData = get().exportConversation(conversationId, 'markdown')
        
        // Simulate IPFS upload
        const cid = `Qm${Math.random().toString(36).substr(2, 44)}`
        const hash = `0x${Math.random().toString(16).substr(2, 64)}`

        const savedInteraction: SavedInteraction = {
          id: `save_${Date.now()}`,
          conversationId,
          cid,
          hash,
          timestamp: new Date(),
          messageRange: messageRange || {
            startMessageId: conversation.messages[0]?.id || '',
            endMessageId: conversation.messages[conversation.messages.length - 1]?.id || ''
          },
          metadata: {
            participantCount: conversation.participants.length,
            toolCallCount: conversation.metadata.totalToolCalls,
            exportFormat: 'markdown',
            fileSize: exportData.length
          }
        }

        // Update conversation with new CID
        get().updateConversation(conversationId, {
          metadata: {
            ...conversation.metadata,
            savedCIDs: [...conversation.metadata.savedCIDs, cid]
          }
        })

        return savedInteraction
      },

      getSavedInteractions: (conversationId) => {
        // This would typically fetch from a database or IPFS
        // For now, return empty array - will be implemented with actual storage
        return []
      },

      exportConversation: (conversationId, format) => {
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (!conversation) return ''

        if (format === 'markdown') {
          let markdown = `# ${conversation.name}\n\n`
          markdown += `**Type:** ${conversation.type}\n`
          markdown += `**Participants:** ${conversation.participants.join(', ')}\n`
          markdown += `**Created:** ${conversation.createdAt.toISOString()}\n`
          markdown += `**Messages:** ${conversation.metadata.totalMessages}\n`
          markdown += `**Tool Calls:** ${conversation.metadata.totalToolCalls}\n\n`
          markdown += `---\n\n`

          conversation.messages.forEach(msg => {
            markdown += `## ${msg.senderName} (${msg.timestamp.toISOString()})\n\n`
            markdown += `${msg.content}\n\n`
            
            if (msg.toolCall) {
              markdown += `**Tool Call:** ${msg.toolCall.name}\n`
              markdown += `**Parameters:** \`\`\`json\n${JSON.stringify(msg.toolCall.parameters, null, 2)}\n\`\`\`\n\n`
            }
            
            if (msg.toolResult) {
              markdown += `**Tool Result:** ${msg.toolResult.success ? 'Success' : 'Failed'}\n`
              markdown += `**Execution Time:** ${msg.toolResult.executionTime}ms\n`
              if (msg.toolResult.result) {
                markdown += `**Result:** \`\`\`json\n${JSON.stringify(msg.toolResult.result, null, 2)}\n\`\`\`\n\n`
              }
            }
            
            markdown += `---\n\n`
          })

          return markdown
        }

        if (format === 'json') {
          return JSON.stringify(conversation, null, 2)
        }

        return ''
      },

      // Real-time
      setConnectionStatus: (isConnected) => {
        set({ isConnected })
      },

      // Utilities
      getActiveConversation: () => {
        const state = get()
        return state.conversations.find(c => c.id === state.activeConversationId) || null
      },

      getConversationParticipants: (conversationId) => {
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (!conversation) return []

        return get().participants.filter(p => 
          conversation.participants.includes(p.id) || conversation.type === 'all_agents'
        )
      },

      searchMessages: (query, conversationId) => {
        const conversations = conversationId 
          ? get().conversations.filter(c => c.id === conversationId)
          : get().conversations

        return conversations
          .flatMap(c => c.messages)
          .filter(msg => 
            msg.content.toLowerCase().includes(query.toLowerCase()) ||
            msg.senderName.toLowerCase().includes(query.toLowerCase())
          )
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
        groups: state.groups,
        participants: state.participants
      })
    }
  )
) 