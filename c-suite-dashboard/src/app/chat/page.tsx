// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Advanced Control Station with Chat & Tool Calling Interface
//  Version:     2.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi, AgentInfo } from '@/lib/useApi';
import { ollamaService, AGENT_MODELS } from '@/lib/ollama';
import { AgentOrb } from '@/components/orbs/agent-orb';

// Enhanced interfaces for control station
interface ChatMessage {
  id: string;
  timestamp: Date;
  sender: 'user' | 'agent' | 'system';
  agentId?: string;
  agentName?: string;
  content: string;
  messageType: 'text' | 'command' | 'response' | 'broadcast' | 'tool_call' | 'tool_result';
  recipients?: string[];
  isAI?: boolean;
  toolCall?: ToolCall;
  metadata?: Record<string, any>;
}

interface ToolCall {
  toolName: string;
  parameters: Record<string, any>;
  agentId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: 'analysis' | 'generation' | 'reasoning' | 'tools' | 'custom';
  agentTypes?: string[];
  parameters?: { name: string; type: string; description: string; default?: any }[];
}

interface AgentTool {
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean }[];
  category: string;
  agentId: string;
}

// Predefined prompt templates for easy access
const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'analyze_data',
    name: 'Data Analysis',
    description: 'Analyze data and provide insights',
    template: 'Please analyze the following data: {data}\n\nProvide:\n1. Key findings\n2. Patterns or trends\n3. Recommendations',
    category: 'analysis',
    agentTypes: ['core', 'echo', 'theory'],
    parameters: [
      { name: 'data', type: 'text', description: 'Data to analyze' }
    ]
  },
  {
    id: 'visual_analysis',
    name: 'Visual Analysis',
    description: 'Analyze images or visual content',
    template: 'Please analyze this image for:\n1. Objects and content\n2. Quality assessment\n3. Any text or patterns\n4. Recommendations',
    category: 'analysis',
    agentTypes: ['lens'],
    parameters: []
  },
  {
    id: 'tool_sequence',
    name: 'Tool Sequence',
    description: 'Execute a sequence of tool calls',
    template: 'Execute the following tools in sequence:\n{tools}\n\nParameters: {parameters}\n\nReturn consolidated results.',
    category: 'tools',
    parameters: [
      { name: 'tools', type: 'text', description: 'Comma-separated tool names' },
      { name: 'parameters', type: 'text', description: 'JSON parameters for tools' }
    ]
  },
  {
    id: 'consensus_check',
    name: 'Consensus Check',
    description: 'Get consensus from multiple agents',
    template: 'I need consensus on: {topic}\n\nEach agent should provide:\n1. Their analysis\n2. Recommendation (Approve/Reject/Modify)\n3. Reasoning\n4. Confidence level',
    category: 'reasoning',
    agentTypes: ['all'],
    parameters: [
      { name: 'topic', type: 'text', description: 'Topic for consensus' }
    ]
  },
  {
    id: 'custom_prompt',
    name: 'Custom Prompt',
    description: 'Create your own prompt',
    template: '{prompt}',
    category: 'custom',
    parameters: [
      { name: 'prompt', type: 'text', description: 'Your custom prompt' }
    ]
  }
];

// Mock agent tools (in real implementation, these would come from agent APIs)
const AGENT_TOOLS: Record<string, AgentTool[]> = {
  lens: [
    {
      name: 'lens_analyze_image',
      description: 'Analyze image content, objects, and quality',
      parameters: [
        { name: 'image_data', type: 'bytes', description: 'Image data to analyze', required: true },
        { name: 'analysis_types', type: 'array', description: 'Types of analysis', required: true }
      ],
      category: 'Visual Analysis',
      agentId: 'lens'
    },
    {
      name: 'lens_extract_text',
      description: 'Extract text from images using OCR',
      parameters: [
        { name: 'image_data', type: 'bytes', description: 'Image containing text', required: true },
        { name: 'language', type: 'string', description: 'OCR language', required: false }
      ],
      category: 'Text Recognition',
      agentId: 'lens'
    }
  ],
  core: [
    {
      name: 'core_process_task',
      description: 'Process complex multi-step tasks',
      parameters: [
        { name: 'task_description', type: 'string', description: 'Task to process', required: true },
        { name: 'priority', type: 'string', description: 'Task priority', required: false }
      ],
      category: 'Task Processing',
      agentId: 'core'
    }
  ],
  echo: [
    {
      name: 'echo_audit_insight',
      description: 'Audit and verify insights for compliance',
      parameters: [
        { name: 'insight_data', type: 'object', description: 'Insight to audit', required: true },
        { name: 'compliance_rules', type: 'array', description: 'Rules to check', required: false }
      ],
      category: 'Audit & Compliance',
      agentId: 'echo'
    }
  ]
};

export default function ControlStationPage() {
  // Core state
  const { api, isConnected } = useApi();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeAgents, setActiveAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [typingAgents, setTypingAgents] = useState<string[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, 'idle' | 'speaking' | 'alert' | 'analysis' | 'insight'>>({});
  
  // Control station specific state
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'prompts' | 'console'>('chat');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [promptParameters, setPromptParameters] = useState<Record<string, any>>({});
  const [selectedTool, setSelectedTool] = useState<AgentTool | null>(null);
  const [toolParameters, setToolParameters] = useState<Record<string, any>>({});
  const [newMessage, setNewMessage] = useState('');
  const [promptMode, setPromptMode] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize system
  useEffect(() => {
    checkOllamaStatus();
    fetchActiveAgents();
    addSystemMessage('🚀 Control Station initialized. Ready for agent interaction and tool execution.');
  }, []);

  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      timestamp: new Date(),
      sender: 'system',
      content,
      messageType: 'text',
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const checkOllamaStatus = async () => {
    try {
      const isAvailable = await ollamaService.isAvailable();
      setOllamaAvailable(isAvailable);
      
      if (isAvailable) {
        const models = await ollamaService.getAvailableModels();
        console.log('🤖 Ollama available with models:', models);
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setOllamaAvailable(false);
    }
  };

  const fetchActiveAgents = async () => {
    try {
      const agentModels = ollamaService.getAllAgentModels();
      const availableAgentModels = ollamaAvailable 
        ? await ollamaService.getAvailableAgentModels()
        : [];

      const agentsWithStatus = agentModels.map((agent) => {
        const isModelAvailable = availableAgentModels.some(a => a.id === agent.id);
        return {
          id: agent.id,
          owner: `5${Math.random().toString(36).substring(2, 50)}`,
          trustScore: 85 + Math.floor(Math.random() * 15),
          metadata: {
            name: agent.name,
            description: agent.systemPrompt.substring(0, 100) + '...',
            role: agent.role,
            status: isModelAvailable ? 'online' : 'offline',
            model: agent.model,
            icon: agent.icon,
            isAI: isModelAvailable && ollamaAvailable,
            lastSeen: new Date().toISOString(),
          },
          isActive: isModelAvailable && ollamaAvailable,
        };
      });

      setActiveAgents(agentsWithStatus);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const executeToolCall = async (toolCall: ToolCall) => {
    // Update tool call status
    setMessages(prev => prev.map(msg => 
      msg.toolCall?.toolName === toolCall.toolName 
        ? { ...msg, toolCall: { ...msg.toolCall, status: 'executing' as const } }
        : msg
    ));

    // Simulate tool execution (in real implementation, this would call the actual agent API)
    setTimeout(() => {
      const result = {
        success: true,
        data: `Tool ${toolCall.toolName} executed successfully with parameters: ${JSON.stringify(toolCall.parameters)}`,
        timestamp: new Date().toISOString(),
        executionTime: '1.2s'
      };

      const resultMessage: ChatMessage = {
        id: `tool-result-${Date.now()}`,
        timestamp: new Date(),
        sender: 'system',
        content: `🔧 Tool Result: ${toolCall.toolName}\n\n${JSON.stringify(result, null, 2)}`,
        messageType: 'tool_result',
        toolCall: { ...toolCall, status: 'completed' as const, result }
      };

      setMessages(prev => [
        ...prev.map(msg => 
          msg.toolCall?.toolName === toolCall.toolName 
            ? { ...msg, toolCall: { ...msg.toolCall, status: 'completed' as const, result } }
            : msg
        ),
        resultMessage
      ]);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      timestamp: new Date(),
      sender: 'user',
      content: newMessage,
      messageType: selectedAgent === 'all' ? 'broadcast' : 'text',
      recipients: selectedAgent === 'all' ? ['all'] : [selectedAgent],
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Generate AI response if available
    if (ollamaAvailable) {
      generateAIResponse(newMessage, selectedAgent);
    } else {
      simulateAgentResponse(newMessage, selectedAgent);
    }
    
    setNewMessage('');
  };

  const sendToolCall = (tool: AgentTool, parameters: Record<string, any>) => {
    const toolCall: ToolCall = {
      toolName: tool.name,
      parameters,
      agentId: tool.agentId,
      status: 'pending'
    };

    const toolMessage: ChatMessage = {
      id: `tool-${Date.now()}`,
      timestamp: new Date(),
      sender: 'user',
      content: `🔧 Executing tool: ${tool.name}\nAgent: ${tool.agentId}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
      messageType: 'tool_call',
      toolCall
    };

    setMessages(prev => [...prev, toolMessage]);
    executeToolCall(toolCall);
  };

  const sendPrompt = (template: PromptTemplate, parameters: Record<string, any>) => {
    let prompt = template.template;
    
    // Replace parameters in template
    Object.entries(parameters).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    const promptMessage: ChatMessage = {
      id: `prompt-${Date.now()}`,
      timestamp: new Date(),
      sender: 'user',
      content: prompt,
      messageType: template.agentTypes?.includes('all') ? 'broadcast' : 'text',
      recipients: template.agentTypes || ['all'],
      metadata: { template: template.id, parameters }
    };

    setMessages(prev => [...prev, promptMessage]);

    // Send to appropriate agents
    if (ollamaAvailable) {
      if (template.agentTypes?.includes('all')) {
        generateAIResponse(prompt, 'all');
      } else if (template.agentTypes?.length === 1) {
        generateAIResponse(prompt, template.agentTypes[0]);
      }
    }
  };

  const generateAIResponse = async (userMessage: string, targetAgent?: string) => {
    setLoading(true);
    
    try {
      if (targetAgent && targetAgent !== 'all') {
        const agent = activeAgents.find(a => a.id === targetAgent);
        if (!agent || !agent.isActive) {
          setLoading(false);
          return;
        }
        
        setTypingAgents([targetAgent]);
        setAgentStates(prev => ({ ...prev, [targetAgent]: 'analysis' }));
        
        const response = await ollamaService.generateResponse(targetAgent, userMessage);
        
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-${targetAgent}`,
          timestamp: new Date(),
          sender: 'agent',
          agentId: targetAgent,
          agentName: agent.metadata.name as string,
          content: response,
          messageType: 'response',
          isAI: true,
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setTypingAgents([]);
        setAgentStates(prev => ({ ...prev, [targetAgent]: 'idle' }));
        
      } else {
        // Broadcast to multiple agents
        const activeAIAgents = activeAgents.filter(agent => agent.isActive);
        const selectedAgents = activeAIAgents.slice(0, 3); // Limit to 3 agents
        
        if (selectedAgents.length === 0) {
          setLoading(false);
          return;
        }
        
        const agentIds = selectedAgents.map(a => a.id);
        setTypingAgents(agentIds);
        
        const responses = await ollamaService.generateMultipleResponses(agentIds, userMessage);
        
        responses.forEach(({ agentId, response }, index) => {
          setTimeout(() => {
            const agent = activeAgents.find(a => a.id === agentId);
            if (agent) {
              const aiMessage: ChatMessage = {
                id: `msg-${Date.now()}-${agentId}`,
                timestamp: new Date(),
                sender: 'agent',
                agentId,
                agentName: agent.metadata.name as string,
                content: response,
                messageType: 'response',
                isAI: true,
              };
              
              setMessages(prev => [...prev, aiMessage]);
              setTypingAgents(prev => prev.filter(id => id !== agentId));
              setAgentStates(prev => ({ ...prev, [agentId]: 'idle' }));
            }
          }, index * 1000);
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateAgentResponse = (userMessage: string, targetAgent?: string) => {
    // Simplified simulation for when Ollama is not available
    setTimeout(() => {
      const simulatedResponse: ChatMessage = {
        id: `sim-${Date.now()}`,
        timestamp: new Date(),
        sender: 'agent',
        agentId: targetAgent || 'core',
        agentName: 'Simulated Agent',
        content: `Simulated response to: "${userMessage}". This is a placeholder response.`,
        messageType: 'response',
        isAI: false,
      };
      
      setMessages(prev => [...prev, simulatedResponse]);
    }, 1000);
  };

  const getAvailableTools = () => {
    if (selectedAgent === 'all') {
      return Object.values(AGENT_TOOLS).flat();
    }
    return AGENT_TOOLS[selectedAgent] || [];
  };

  const getAgentsByCategory = () => {
    return activeAgents.reduce((acc, agent) => {
      const role = agent.metadata.role as string;
      if (!acc[role]) acc[role] = [];
      acc[role].push(agent);
      return acc;
    }, {} as Record<string, AgentInfo[]>);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Control Station Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Control Station
            </h1>
            <p className="text-slate-600 mt-2">
              Advanced chat interface with tool calling and prompt engineering
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              ollamaAvailable 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${ollamaAvailable ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              {ollamaAvailable ? 'AI Active' : 'Simulated'}
            </div>
            
            <Badge variant="outline" className="border-green-200 text-green-700">
              {activeAgents.filter(a => a.isActive).length} Agents Online
            </Badge>
            
            <Button onClick={fetchActiveAgents} variant="outline" size="sm">
              🔄 Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Agent Control Panel */}
          <div className="col-span-3 space-y-4">
            {/* Agent Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">🎯 Target Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedAgent === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedAgent('all')}
                  className="w-full justify-start"
                  size="sm"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                  Broadcast (All Agents)
                </Button>
                
                {Object.entries(getAgentsByCategory()).map(([role, agents]) => (
                  <div key={role} className="space-y-1">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide px-2 py-1">
                      {role}
                    </div>
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <AgentOrb
                            agentId={agent.id}
                            agentName={String(agent.metadata.name)}
                            icon={String(agent.metadata.icon)}
                            isActive={agent.isActive}
                            state={agentStates[agent.id] || 'idle'}
                            size={0.6}
                          />
                        </div>
                        <Button
                          variant={selectedAgent === agent.id ? 'default' : 'outline'}
                          onClick={() => setSelectedAgent(agent.id)}
                          className="flex-1 justify-start h-8 text-xs"
                          disabled={!agent.isActive && ollamaAvailable}
                        >
                          {String(agent.metadata.name)}
                        </Button>
                        <Badge 
                          variant={agent.isActive ? 'default' : 'secondary'}
                          className="text-xs px-1 py-0"
                        >
                          {agent.metadata.isAI ? 'AI' : 'SIM'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">⚡ Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('prompts')}
                >
                  📝 Prompt Templates
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('tools')}
                >
                  🔧 Tool Calling
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('console')}
                >
                  💻 System Console
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat">💬 Chat</TabsTrigger>
                <TabsTrigger value="prompts">📝 Prompts</TabsTrigger>
                <TabsTrigger value="tools">🔧 Tools</TabsTrigger>
                <TabsTrigger value="console">💻 Console</TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {selectedAgent === 'all' 
                          ? '📡 Broadcasting to All Agents' 
                          : `💬 Chat with ${activeAgents.find(a => a.id === selectedAgent)?.metadata.name || 'Agent'}`
                        }
                      </CardTitle>
                      <Badge variant="outline">{messages.length} messages</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg p-3 border ${
                            message.sender === 'user' 
                              ? 'bg-blue-500 text-white border-blue-600'
                              : message.sender === 'system'
                              ? 'bg-slate-100 text-slate-800 border-slate-200'
                              : message.messageType === 'tool_call'
                              ? 'bg-orange-50 text-orange-900 border-orange-200'
                              : message.messageType === 'tool_result'
                              ? 'bg-green-50 text-green-900 border-green-200'
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}>
                            {message.sender === 'agent' && (
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-medium opacity-75">{message.agentName}</div>
                                <div className="flex items-center gap-1">
                                  {message.isAI ? (
                                    <Badge variant="secondary" className="text-xs px-1 py-0">AI</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs px-1 py-0">SIM</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                            
                            {message.toolCall && (
                              <div className="mt-2 pt-2 border-t border-current/20">
                                <div className="text-xs opacity-75">
                                  Status: <span className="font-medium">{message.toolCall.status}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs opacity-60 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing indicators */}
                      {typingAgents.length > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                            <div className="text-xs font-medium mb-1">
                              {typingAgents.map(agentId => {
                                const agent = activeAgents.find(a => a.id === agentId);
                                return agent ? String(agent.metadata.name) : '';
                              }).filter(name => name).join(', ')} typing...
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75" />
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder={
                            selectedAgent === 'all'
                              ? 'Broadcast message to all agents...'
                              : `Message ${activeAgents.find(a => a.id === selectedAgent)?.metadata.name || 'agent'}...`
                          }
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 min-h-[60px] resize-none"
                          disabled={loading}
                        />
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim() || loading}
                            className="px-6"
                          >
                            {loading ? 'Sending...' : 'Send'}
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setPromptMode(!promptMode)}
                            className="px-4"
                          >
                            📝
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>Press Enter to send • Shift+Enter for new line</span>
                        <span>Target: {selectedAgent === 'all' ? 'All Agents' : 
                          String(activeAgents.find(a => a.id === selectedAgent)?.metadata.name || 'Unknown')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prompts Tab */}
              <TabsContent value="prompts" className="h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>📝 Prompt Engineering Templates</CardTitle>
                    <p className="text-sm text-slate-600">Pre-built prompts for common tasks and workflows</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {PROMPT_TEMPLATES.map((template) => (
                        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setSelectedPrompt(template)}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">{template.category}</Badge>
                            </div>
                            <p className="text-xs text-slate-600">{template.description}</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-xs font-mono bg-slate-50 p-2 rounded border">
                              {template.template.substring(0, 100)}...
                            </div>
                            {template.agentTypes && (
                              <div className="mt-2">
                                <div className="text-xs text-slate-500">Compatible agents:</div>
                                <div className="flex gap-1 mt-1">
                                  {template.agentTypes.map(type => (
                                    <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Prompt Configuration */}
                    {selectedPrompt && (
                      <Card className="border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Configure Prompt: {selectedPrompt.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedPrompt.parameters?.map((param) => (
                            <div key={param.name}>
                              <label className="text-sm font-medium">{param.name}</label>
                              <p className="text-xs text-slate-600 mb-2">{param.description}</p>
                              {param.type === 'text' ? (
                                <Textarea
                                  placeholder={param.description}
                                  value={promptParameters[param.name] || param.default || ''}
                                  onChange={(e) => setPromptParameters(prev => ({
                                    ...prev,
                                    [param.name]: e.target.value
                                  }))}
                                  className="min-h-[60px]"
                                />
                              ) : (
                                <Input
                                  placeholder={param.description}
                                  value={promptParameters[param.name] || param.default || ''}
                                  onChange={(e) => setPromptParameters(prev => ({
                                    ...prev,
                                    [param.name]: e.target.value
                                  }))}
                                />
                              )}
                            </div>
                          ))}
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => sendPrompt(selectedPrompt, promptParameters)}
                              disabled={loading}
                            >
                              🚀 Execute Prompt
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedPrompt(null)}>
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>🔧 Agent Tool Calling Interface</CardTitle>
                    <p className="text-sm text-slate-600">Execute specific agent tools with custom parameters</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {getAvailableTools().map((tool) => (
                        <Card key={`${tool.agentId}-${tool.name}`} className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setSelectedTool(tool)}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{tool.name}</CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                                <Badge variant="secondary" className="text-xs">{tool.agentId}</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600">{tool.description}</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-1">
                              <div className="text-xs text-slate-500">Parameters:</div>
                              {tool.parameters.map(param => (
                                <div key={param.name} className="text-xs">
                                  <span className="font-medium">{param.name}</span>
                                  <span className="text-slate-500"> ({param.type})</span>
                                  {param.required && <span className="text-red-500">*</span>}
                                  : {param.description}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Tool Configuration */}
                    {selectedTool && (
                      <Card className="border-orange-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Execute Tool: {selectedTool.name}</CardTitle>
                          <p className="text-sm text-slate-600">Agent: {selectedTool.agentId}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedTool.parameters.map((param) => (
                            <div key={param.name}>
                              <label className="text-sm font-medium">
                                {param.name} {param.required && <span className="text-red-500">*</span>}
                              </label>
                              <p className="text-xs text-slate-600 mb-2">{param.description}</p>
                              <Input
                                placeholder={`Enter ${param.type} value`}
                                value={toolParameters[param.name] || ''}
                                onChange={(e) => setToolParameters(prev => ({
                                  ...prev,
                                  [param.name]: e.target.value
                                }))}
                              />
                            </div>
                          ))}
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => sendToolCall(selectedTool, toolParameters)}
                              disabled={loading}
                            >
                              🔧 Execute Tool
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedTool(null)}>
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Console Tab */}
              <TabsContent value="console" className="h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>💻 System Console</CardTitle>
                    <p className="text-sm text-slate-600">System logs, debug information, and advanced controls</p>
                  </CardHeader>
                  <CardContent>
                    <div ref={consoleRef} className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                      <div>🚀 Control Station Console v2.0.0</div>
                      <div>📡 Connected to C-Suite Blockchain: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                      <div>🤖 Ollama Service: {ollamaAvailable ? '✅ Active' : '❌ Inactive'}</div>
                      <div>👥 Active Agents: {activeAgents.filter(a => a.isActive).length}</div>
                      <div>💬 Total Messages: {messages.length}</div>
                      <div className="mt-2">--- System Ready ---</div>
                      <div className="mt-4">
                        Available Commands:
                        <div className="ml-2">
                          • /agents - List all agents<br/>
                          • /tools - List available tools<br/>
                          • /status - System status<br/>
                          • /clear - Clear console<br/>
                          • /help - Show help
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">Clear Console</Button>
                      <Button variant="outline" size="sm">Export Logs</Button>
                      <Button variant="outline" size="sm">System Status</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 