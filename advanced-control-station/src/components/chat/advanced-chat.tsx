// ----------------------------------------------------------------------------
//  File:        advanced-chat.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Advanced chat interface for agent communication
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  agentId?: string
  agentName?: string
  attachments?: Array<{
    type: 'file' | 'image' | 'data'
    name: string
    url: string
    size?: number
  }>
  metadata?: {
    confidence?: number
    processingTime?: number
    status?: 'processing' | 'completed' | 'error'
  }
}

interface AgentInfo {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'busy'
  capabilities: string[]
  avatar?: string
}

const mockAgents: AgentInfo[] = [
  {
    id: 'agent-001',
    name: 'Marcus (CEO)',
    type: 'CEO',
    status: 'online',
    capabilities: ['strategic-planning', 'decision-making', 'stakeholder-management']
  },
  {
    id: 'agent-002',
    name: 'Victoria (CTO)',
    type: 'CTO',
    status: 'busy',
    capabilities: ['technical-architecture', 'system-design', 'security-audit']
  },
  {
    id: 'agent-003',
    name: 'Alexander (CFO)',
    type: 'CFO',
    status: 'online',
    capabilities: ['financial-analysis', 'risk-assessment', 'compliance-monitoring']
  },
  {
    id: 'agent-004',
    name: 'Sophia (CMO)',
    type: 'CMO',
    status: 'offline',
    capabilities: ['market-analysis', 'brand-strategy', 'customer-insights']
  }
]

export function AdvancedChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(mockAgents[0])
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome-1',
        type: 'agent',
        content: 'Welcome to the C-Suite Agent Chat! I\'m Marcus, your CEO agent. How can I assist you with strategic decisions today?',
        timestamp: new Date(),
        agentId: 'agent-001',
        agentName: 'Marcus (CEO)',
        metadata: { status: 'completed' }
      }])
    }
  }, [messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedAgent) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = generateAgentResponse(inputText, selectedAgent)
      const agentMessage: Message = {
        id: `msg-${Date.now()}-agent`,
        type: 'agent',
        content: agentResponse.content,
        timestamp: new Date(),
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        metadata: {
          confidence: agentResponse.confidence,
          processingTime: agentResponse.processingTime,
          status: 'completed'
        }
      }

      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)
    }, Math.random() * 2000 + 1000) // 1-3 second delay
  }

  const generateAgentResponse = (userInput: string, agent: AgentInfo) => {
    const responses = {
      'CEO': {
        'strategy': 'From a strategic perspective, we need to focus on long-term value creation. I recommend we prioritize market expansion and digital transformation initiatives.',
        'financial': 'Looking at our financial position, we have strong fundamentals. However, we should consider diversifying our revenue streams.',
        'team': 'Our team is our greatest asset. We need to invest in talent development and maintain our culture of innovation.',
        'default': 'As CEO, I\'m focused on driving shareholder value while maintaining our company values. What specific area would you like to discuss?'
      },
      'CTO': {
        'technology': 'From a technical standpoint, we should leverage cloud-native architectures and AI/ML capabilities to stay competitive.',
        'security': 'Security is paramount. I recommend implementing zero-trust architecture and regular security audits.',
        'infrastructure': 'Our infrastructure needs to be scalable and resilient. Consider microservices and containerization.',
        'default': 'Let me analyze this from a technical perspective. We need to ensure our technology stack supports our business objectives.'
      },
      'CFO': {
        'budget': 'Based on our financial projections, we have room for strategic investments while maintaining healthy cash flow.',
        'cost': 'We need to optimize our cost structure. I suggest implementing zero-based budgeting and regular variance analysis.',
        'revenue': 'Revenue growth is strong, but we should focus on improving margins and customer lifetime value.',
        'default': 'From a financial standpoint, we need to balance growth investments with profitability. What\'s your specific concern?'
      },
      'CMO': {
        'marketing': 'Our marketing strategy should focus on customer acquisition and brand positioning. Digital channels are showing strong ROI.',
        'brand': 'Brand perception is crucial. We need consistent messaging across all touchpoints and strong customer experience.',
        'customers': 'Customer insights show we need to personalize our approach. I recommend implementing advanced analytics.',
        'default': 'Let me share insights from our customer data. We\'re seeing interesting trends that could impact our strategy.'
      }
    }

    const agentType = agent.type as keyof typeof responses
    const agentResponses = responses[agentType] || responses['CEO']
    
    let response = agentResponses.default
    
    if (userInput.toLowerCase().includes('strategy') || userInput.toLowerCase().includes('strategic')) {
      response = ('strategy' in agentResponses) ? agentResponses.strategy : agentResponses.default
    } else if (userInput.toLowerCase().includes('financial') || userInput.toLowerCase().includes('money') || userInput.toLowerCase().includes('budget')) {
      response = ('financial' in agentResponses) ? agentResponses.financial : 
                 ('budget' in agentResponses) ? agentResponses.budget : agentResponses.default
    } else if (userInput.toLowerCase().includes('team') || userInput.toLowerCase().includes('people')) {
      response = ('team' in agentResponses) ? agentResponses.team : agentResponses.default
    } else if (userInput.toLowerCase().includes('technology') || userInput.toLowerCase().includes('tech')) {
      response = ('technology' in agentResponses) ? agentResponses.technology : agentResponses.default
    }

    return {
      content: response,
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      processingTime: Math.random() * 1.5 + 0.5 // 0.5-2 seconds
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getAgentStatusColor = (status: string) => {
    const colors = {
      'online': 'bg-green-500',
      'offline': 'bg-gray-500',
      'busy': 'bg-yellow-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  return (
    <div className="h-full flex bg-white rounded-lg overflow-hidden">
      {/* Agent Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">C-Suite Agents</h2>
          <p className="text-sm text-gray-600">Select an agent to chat with</p>
        </div>
        
        <div className="p-4 space-y-3">
          {mockAgents.map(agent => (
            <div
              key={agent.id}
              className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-white ${
                selectedAgent?.id === agent.id ? 'bg-white shadow-sm ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {agent.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getAgentStatusColor(agent.status)} border-2 border-white rounded-full`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {agent.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {agent.status} • {agent.type}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 2).map(capability => (
                    <span key={capability} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {capability.replace('-', ' ')}
                    </span>
                  ))}
                  {agent.capabilities.length > 2 && (
                    <span className="text-xs text-gray-500">+{agent.capabilities.length - 2} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedAgent?.name.charAt(0)}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getAgentStatusColor(selectedAgent?.status || 'offline')} border-2 border-white rounded-full`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedAgent?.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{selectedAgent?.status} • {selectedAgent?.type} Agent</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-opacity-20 border-gray-300">
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        {message.metadata.confidence && (
                          <span>Confidence: {(message.metadata.confidence * 100).toFixed(0)}%</span>
                        )}
                        {message.metadata.processingTime && (
                          <span>• {message.metadata.processingTime.toFixed(1)}s</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.agentName && message.type === 'agent' && `${message.agentName} • `}
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedAgent?.name} is typing...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message ${selectedAgent?.name}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                📎
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                😊
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 