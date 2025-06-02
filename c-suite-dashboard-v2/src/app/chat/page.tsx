// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Multi-agent chat interface with tool calling and IPFS integration
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Database,
  Download,
  Wrench,
  Home,
  CheckCircle,
  AlertCircle,
  Bot,
  User,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore, useAgentStore, useSystemStore } from '@/lib/stores'
import { toolCategories, getMinimumRequiredTools, allTools } from '@/lib/tools'
import type { ChatMessage, ToolCall, AvailableTool } from '@/types'

export default function ChatPage() {
  const [messageInput, setMessageInput] = useState('')
  const [selectedTool, setSelectedTool] = useState<AvailableTool | null>(null)
  const [toolParameters, setToolParameters] = useState<Record<string, unknown>>({})
  const [selectedToolCategory, setSelectedToolCategory] = useState<string>('core')
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [showToolModal, setShowToolModal] = useState(false)
  const [newConversationName, setNewConversationName] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  const {
    conversations,
    activeConversationId,
    participants,
    typingIndicators,
    isConnected,
    createConversation,
    setActiveConversation,
    addMessage,
    executeToolCall,
    saveConversationToIPFS,
    exportConversation,
    getActiveConversation,
    getConversationParticipants,
    addParticipant
  } = useChatStore()

  const { agents } = useAgentStore()
  const { addNotification } = useSystemStore()

  const activeConversation = getActiveConversation()
  const conversationParticipants = activeConversationId ? getConversationParticipants(activeConversationId) : []

  // Initialize with agents as participants
  useEffect(() => {
    agents.forEach(agent => {
      addParticipant({
        id: agent.id,
        name: agent.name,
        type: 'agent',
        status: agent.status === 'active' ? 'online' : 'offline',
        capabilities: agent.capabilities,
        lastSeen: agent.lastSeen
      })
    })

    // Add user participant
    addParticipant({
      id: 'user',
      name: 'Mr. Chris',
      type: 'user',
      status: 'online'
    })

    addNotification({
      type: 'info',
      title: 'Chat Module Loaded',
      message: 'Multi-agent chat interface with tool calling is now available'
    })
  }, [agents, addParticipant, addNotification])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId) return

    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      conversationId: activeConversationId,
      senderId: 'user',
      senderName: 'Mr. Chris',
      senderType: 'user',
      content: messageInput,
      type: 'text'
    }

    addMessage(message)
    setMessageInput('')

    // Simulate agent responses
    setTimeout(() => {
      const activeParticipants = conversationParticipants.filter(p => p.type === 'agent' && p.status === 'online')
      if (activeParticipants.length > 0) {
        const randomAgent = activeParticipants[Math.floor(Math.random() * activeParticipants.length)]
        
        const agentResponse: Omit<ChatMessage, 'id' | 'timestamp'> = {
          conversationId: activeConversationId,
          senderId: randomAgent.id,
          senderName: randomAgent.name,
          senderType: 'agent',
          content: `I received your message: "${messageInput}". How can I assist you further?`,
          type: 'text'
        }

        addMessage(agentResponse)
      }
    }, 1000)
  }

  const handleToolCall = async (tool: AvailableTool, parameters: Record<string, unknown> = {}) => {
    if (!activeConversationId) return

    const toolCall: ToolCall = {
      id: tool.id,
      name: tool.name,
      category: tool.category,
      parameters,
      requestedBy: 'user',
      timestamp: new Date()
    }

    // Add tool call message
    const toolCallMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      conversationId: activeConversationId,
      senderId: 'user',
      senderName: 'Mr. Chris',
      senderType: 'user',
      content: `Executing tool: ${tool.name}`,
      type: 'tool_call',
      toolCall
    }

    addMessage(toolCallMessage)

    // Execute the tool
    try {
      const result = await executeToolCall(toolCall)
      
      // Add tool result message
      const resultMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        conversationId: activeConversationId,
        senderId: 'system',
        senderName: 'System',
        senderType: 'system',
        content: result.success ? `Tool executed successfully: ${tool.name}` : `Tool execution failed: ${result.error}`,
        type: 'tool_result',
        toolResult: result
      }

      addMessage(resultMessage)

      // Show CID if available
      if (result.cid) {
        addNotification({
          type: 'success',
          title: 'Tool Result Saved',
          message: `CID: ${result.cid.substring(0, 20)}...`
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Tool Execution Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  const handleQuickToolCall = (toolName: string) => {
    const tool = allTools.find(t => t.name === toolName)
    if (tool) {
      if (tool.requiredParams.length > 0) {
        setSelectedTool(tool)
        setToolParameters({})
        setShowToolModal(true)
      } else {
        handleToolCall(tool, {})
      }
    }
  }

  const handleToolModalSubmit = () => {
    if (selectedTool) {
      handleToolCall(selectedTool, toolParameters)
      setShowToolModal(false)
      setSelectedTool(null)
      setToolParameters({})
    }
  }

  const handleCreateConversation = () => {
    if (!newConversationName.trim()) return

    const type = selectedParticipants.includes('all') ? 'all_agents' : 
                 selectedParticipants.length > 1 ? 'group' : 'individual'

    createConversation(newConversationName, type, selectedParticipants)
    setNewConversationName('')
    setSelectedParticipants([])
    setShowNewConversationModal(false)

    addNotification({
      type: 'success',
      title: 'Conversation Created',
      message: `New ${type} conversation "${newConversationName}" has been created`
    })
  }

  const handleSaveToIPFS = async () => {
    if (!activeConversationId) return

    try {
      const savedInteraction = await saveConversationToIPFS(activeConversationId)
      
      addNotification({
        type: 'success',
        title: 'Conversation Saved to IPFS',
        message: `CID: ${savedInteraction.cid.substring(0, 20)}...`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'IPFS Save Failed',
        message: error instanceof Error ? error.message : 'Failed to save to IPFS'
      })
    }
  }

  const handleExportConversation = (format: 'markdown' | 'json') => {
    if (!activeConversationId) return

    const exportData = exportConversation(activeConversationId, format)
    const blob = new Blob([exportData], { type: format === 'markdown' ? 'text/markdown' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeConversation?.name || 'conversation'}.${format === 'markdown' ? 'md' : 'json'}`
    a.click()
    URL.revokeObjectURL(url)

    addNotification({
      type: 'success',
      title: 'Conversation Exported',
      message: `Exported as ${format.toUpperCase()}`
    })
  }

  const breadcrumbs = [
    { label: "Dashboard", icon: <Home className="w-4 h-4" />, href: "/" },
    { label: "Chat", icon: <MessageSquare className="w-4 h-4" /> }
  ]

  // Get tools for current category
  const currentCategoryTools = toolCategories.find(cat => cat.id === selectedToolCategory)?.tools || []
  const minimumTools = getMinimumRequiredTools()

  return (
    <Layout title="Chat" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Multi-Agent Chat</h1>
            <p className="text-white/70 text-lg">
              Interact with agents individually, in groups, or all at once with tool calling support
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant="outline" 
              className={`${isConnected ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            
            <Button 
              onClick={() => setShowNewConversationModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <Card className="xl:col-span-1 glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Create your first conversation</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      activeConversationId === conv.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium truncate">{conv.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {conv.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-white/60">
                      <span>{conv.metadata.totalMessages} messages</span>
                      <span>{new Date(conv.lastActivity).toLocaleDateString()}</span>
                    </div>
                    {conv.metadata.totalToolCalls > 0 && (
                      <div className="flex items-center mt-1 text-xs text-purple-400">
                        <Wrench className="w-3 h-3 mr-1" />
                        {conv.metadata.totalToolCalls} tool calls
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="xl:col-span-2 glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">
                    {activeConversation?.name || 'Select a conversation'}
                  </CardTitle>
                  {activeConversation && (
                    <CardDescription>
                      {conversationParticipants.length} participants • {activeConversation.metadata.totalMessages} messages
                    </CardDescription>
                  )}
                </div>
                
                {activeConversation && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveToIPFS}
                      className="glass"
                    >
                      <Database className="w-4 h-4 mr-1" />
                      Save CID
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportConversation('markdown')}
                      className="glass"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex flex-col h-96">
              {activeConversation ? (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    <AnimatePresence>
                      {activeConversation.messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.senderType === 'user'
                                ? 'bg-blue-500/20 border border-blue-500/30'
                                : message.senderType === 'agent'
                                ? 'bg-purple-500/20 border border-purple-500/30'
                                : 'bg-gray-500/20 border border-gray-500/30'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {message.senderType === 'user' ? (
                                <User className="w-4 h-4" />
                              ) : message.senderType === 'agent' ? (
                                <Bot className="w-4 h-4" />
                              ) : (
                                <Zap className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium text-white">
                                {message.senderName}
                              </span>
                              <span className="text-xs text-white/50">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <p className="text-white/90">{message.content}</p>
                            
                            {message.toolCall && (
                              <div className="mt-2 p-2 bg-white/10 rounded border border-white/20">
                                <div className="flex items-center space-x-2 text-xs text-white/70">
                                  <Wrench className="w-3 h-3" />
                                  <span>Tool: {message.toolCall.name}</span>
                                </div>
                              </div>
                            )}
                            
                            {message.toolResult && (
                              <div className="mt-2 p-2 bg-white/10 rounded border border-white/20">
                                <div className="flex items-center space-x-2 text-xs">
                                  {message.toolResult.success ? (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 text-red-400" />
                                  )}
                                  <span className={message.toolResult.success ? 'text-green-400' : 'text-red-400'}>
                                    {message.toolResult.executionTime}ms
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Typing Indicators */}
                    {activeConversationId && typingIndicators[activeConversationId]?.length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                          <div className="flex items-center space-x-2 text-white/70 text-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <span>
                              {typingIndicators[activeConversationId].map(id => 
                                participants.find(p => p.id === id)?.name
                              ).join(', ')} typing...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex space-x-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="glass flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a conversation to start chatting</p>
                    <p className="text-sm mt-2">Or create a new conversation to get started</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tools & Controls Panel */}
          <Card className="xl:col-span-1 glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Tools & Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tools" className="space-y-4">
                <TabsList className="glass w-full">
                  <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
                  <TabsTrigger value="participants" className="flex-1">Participants</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tools" className="space-y-4">
                  {/* Tool Category Selector */}
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Tool Category</label>
                    <select
                      value={selectedToolCategory}
                      onChange={(e) => setSelectedToolCategory(e.target.value)}
                      className="w-full glass rounded-md border border-white/20 bg-black/50 text-white p-2"
                    >
                      {toolCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Actions - MVP Tools */}
                  {selectedToolCategory === 'core' && (
                    <div className="space-y-2">
                      <div className="text-sm text-white/70 mb-2">Quick Actions (MVP Tools)</div>
                      <div className="grid grid-cols-2 gap-2">
                        {minimumTools.slice(0, 4).map((tool) => (
                          <Button
                            key={tool.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickToolCall(tool.name)}
                            className="glass text-xs"
                            disabled={!activeConversationId}
                          >
                            {tool.name.split('.')[1]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Tools */}
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    <div className="text-sm text-white/70 mb-2">
                      Available Tools ({currentCategoryTools.length})
                    </div>
                    {currentCategoryTools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (tool.requiredParams.length > 0) {
                            setSelectedTool(tool)
                            setToolParameters({})
                            setShowToolModal(true)
                          } else {
                            handleToolCall(tool, {})
                          }
                        }}
                        className="w-full glass text-left justify-start p-2"
                        disabled={!activeConversationId}
                      >
                        <div className="flex items-start space-x-2 w-full">
                          <Wrench className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-medium text-xs text-white truncate">{tool.name}</div>
                            <div className="text-xs text-white/60 truncate">{tool.description}</div>
                            {tool.requiredParams.length > 0 && (
                              <div className="text-xs text-yellow-400 mt-1">
                                Requires parameters
                              </div>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="participants" className="space-y-3">
                  {conversationParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                      <div className={`w-3 h-3 rounded-full ${
                        participant.status === 'online' ? 'bg-green-400' :
                        participant.status === 'typing' ? 'bg-yellow-400 animate-pulse' :
                        participant.status === 'processing' ? 'bg-blue-400 animate-pulse' :
                        'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{participant.name}</div>
                        <div className="text-xs text-white/60 capitalize">{participant.type} • {participant.status}</div>
                        {participant.capabilities && participant.capabilities.length > 0 && (
                          <div className="text-xs text-blue-400 mt-1">
                            {participant.capabilities.slice(0, 2).join(', ')}
                            {participant.capabilities.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Tool Parameter Modal */}
        <AnimatePresence>
          {showToolModal && selectedTool && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowToolModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-white mb-4">Configure Tool: {selectedTool.name}</h3>
                <p className="text-white/70 text-sm mb-4">{selectedTool.description}</p>
                
                <div className="space-y-4">
                  {selectedTool.parameters.map((param) => (
                    <div key={param.name}>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        {param.name} {param.required && <span className="text-red-400">*</span>}
                      </label>
                      <p className="text-xs text-white/50 mb-2">{param.description}</p>
                      
                      {param.type === 'string' && param.options ? (
                        <select
                          value={(toolParameters[param.name] as string) || ''}
                          onChange={(e) => setToolParameters(prev => ({ ...prev, [param.name]: e.target.value }))}
                          className="w-full glass rounded-md border border-white/20 bg-black/50 text-white p-2"
                        >
                          <option value="">Select {param.name}</option>
                          {param.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : param.type === 'boolean' ? (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(toolParameters[param.name] as boolean) || false}
                            onChange={(e) => setToolParameters(prev => ({ ...prev, [param.name]: e.target.checked }))}
                            className="rounded border-white/20"
                          />
                          <span className="text-white">Enable {param.name}</span>
                        </label>
                      ) : param.type === 'number' ? (
                        <Input
                          type="number"
                          value={toolParameters[param.name] || param.default || ''}
                          onChange={(e) => setToolParameters(prev => ({ ...prev, [param.name]: parseFloat(e.target.value) || 0 }))}
                          className="glass"
                          placeholder={`Enter ${param.name}`}
                        />
                      ) : (
                        <Input
                          value={toolParameters[param.name] || param.default || ''}
                          onChange={(e) => setToolParameters(prev => ({ ...prev, [param.name]: e.target.value }))}
                          className="glass"
                          placeholder={`Enter ${param.name}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={handleToolModalSubmit}
                    disabled={selectedTool.requiredParams.some(param => !toolParameters[param])}
                    className="bg-blue-500 hover:bg-blue-600 flex-1"
                  >
                    Execute Tool
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowToolModal(false)}
                    className="glass"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Conversation Modal */}
        <AnimatePresence>
          {showNewConversationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowNewConversationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-white mb-4">Create New Conversation</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Conversation Name
                    </label>
                    <Input
                      value={newConversationName}
                      onChange={(e) => setNewConversationName(e.target.value)}
                      placeholder="Enter conversation name..."
                      className="glass"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Participants
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes('all')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants(['all'])
                            } else {
                              setSelectedParticipants([])
                            }
                          }}
                          className="rounded border-white/20"
                        />
                        <span className="text-white">All Agents</span>
                      </label>
                      
                      {participants.filter(p => p.type === 'agent').map((participant) => (
                        <label key={participant.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(participant.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants(prev => [...prev.filter(id => id !== 'all'), participant.id])
                              } else {
                                setSelectedParticipants(prev => prev.filter(id => id !== participant.id))
                              }
                            }}
                            disabled={selectedParticipants.includes('all')}
                            className="rounded border-white/20"
                          />
                          <span className="text-white">{participant.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {participant.status}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={handleCreateConversation}
                    disabled={!newConversationName.trim() || selectedParticipants.length === 0}
                    className="bg-blue-500 hover:bg-blue-600 flex-1"
                  >
                    Create Conversation
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowNewConversationModal(false)}
                    className="glass"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
} 