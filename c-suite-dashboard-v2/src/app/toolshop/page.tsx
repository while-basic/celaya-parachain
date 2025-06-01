// ----------------------------------------------------------------------------
//  File:        page.tsx
//  Project:     Celaya Solutions (C-Suite Console)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Tool Shop page for generating and managing ultimate tools
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: (June 2025)
// ----------------------------------------------------------------------------

'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wrench, 
  Plus, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Zap, 
  Brain, 
  Shield, 
  Settings,
  Edit3,
  Share2,
  Star,
  TrendingUp,
  Home,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSystemStore } from '@/lib/stores'

interface GeneratedTool {
  id: string
  name: string
  description: string
  category: string
  code: string
  parameters: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  created_at: string
  creator: string
  version: string
  downloads: number
  rating: number
  tags: string[]
  status: 'draft' | 'published' | 'deprecated'
}

const toolCategories = [
  { value: 'cognitive', label: 'Cognitive Enhancement', icon: <Brain className="w-4 h-4" /> },
  { value: 'security', label: 'Security & Validation', icon: <Shield className="w-4 h-4" /> },
  { value: 'automation', label: 'Automation & Workflows', icon: <Zap className="w-4 h-4" /> },
  { value: 'integration', label: 'System Integration', icon: <Settings className="w-4 h-4" /> },
  { value: 'analysis', label: 'Data Analysis', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'utility', label: 'General Utilities', icon: <Wrench className="w-4 h-4" /> }
]

const mockTools: GeneratedTool[] = [
  {
    id: '1',
    name: 'Advanced Sentiment Analyzer',
    description: 'Ultra-precise sentiment analysis with emotional context detection',
    category: 'cognitive',
    code: 'async def advanced_sentiment_analysis(text, context="general"):\n    # Advanced implementation here\n    pass',
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'Text to analyze' },
      { name: 'context', type: 'string', required: false, description: 'Context for analysis' }
    ],
    created_at: '2025-06-15T10:30:00Z',
    creator: 'Mr. Chris',
    version: '1.2.0',
    downloads: 45,
    rating: 4.8,
    tags: ['sentiment', 'nlp', 'analysis', 'emotions'],
    status: 'published'
  },
  {
    id: '2',
    name: 'Quantum Consensus Protocol',
    description: 'Revolutionary consensus mechanism using quantum-inspired algorithms',
    category: 'security',
    code: 'async def quantum_consensus(agents, proposal):\n    # Quantum consensus implementation\n    pass',
    parameters: [
      { name: 'agents', type: 'array', required: true, description: 'List of participating agents' },
      { name: 'proposal', type: 'object', required: true, description: 'Proposal to vote on' }
    ],
    created_at: '2025-06-14T15:45:00Z',
    creator: 'AI Genesis',
    version: '2.0.1',
    downloads: 89,
    rating: 4.9,
    tags: ['consensus', 'quantum', 'security', 'voting'],
    status: 'published'
  }
]

export default function ToolShopPage() {
  const [tools, setTools] = useState<GeneratedTool[]>(mockTools)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showGenerator, setShowGenerator] = useState(false)
  const [generatingTool, setGeneratingTool] = useState(false)
  const { addNotification } = useSystemStore()

  // Tool generation form state
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category: '',
    prompt: '',
    parameters: '',
    tags: ''
  })

  // Add state for installation status
  const [installingTools, setInstallingTools] = useState<Set<string>>(new Set())
  const [installedTools, setInstalledTools] = useState<Set<string>>(new Set())

  const breadcrumbs = [
    { label: "Dashboard", icon: <Home className="w-4 h-4" />, href: "/" },
    { label: "Tool Shop", icon: <Wrench className="w-4 h-4" /> }
  ]

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleGenerateTool = async () => {
    setGeneratingTool(true)
    
    try {
      // Parse parameters safely
      let parsedParameters = []
      if (newTool.parameters && newTool.parameters.trim()) {
        try {
          // Try to parse as JSON first
          if (newTool.parameters.startsWith('[') && newTool.parameters.endsWith(']')) {
            parsedParameters = JSON.parse(newTool.parameters)
          } else if (newTool.parameters.startsWith('{') && newTool.parameters.endsWith('}')) {
            parsedParameters = [JSON.parse(newTool.parameters)]
          } else {
            // Parse as simple comma-separated format: "name: type, other: type"
            const paramPairs = newTool.parameters.split(',').map(p => p.trim()).filter(p => p.length > 0)
            parsedParameters = paramPairs.map(pair => {
              const [name, type] = pair.split(':').map(s => s.trim().replace(/['"]/g, ''))
              return {
                name: name || 'param',
                type: type || 'Any',
                required: true,
                description: `${name || 'param'} parameter`
              }
            })
          }
        } catch (parseError) {
          console.warn('Failed to parse parameters, using defaults:', parseError)
          parsedParameters = []
        }
      }
      
      // Simulate AI tool generation
      setTimeout(() => {
        const generatedTool: GeneratedTool = {
          id: Date.now().toString(),
          name: newTool.name,
          description: newTool.description,
          category: newTool.category,
          code: `async def ${newTool.name.toLowerCase().replace(/\s+/g, '_')}(${newTool.parameters || ''}):\n    """\n    ${newTool.description}\n    Generated by Ultimate Tool AI\n    """\n    # Implementation generated based on prompt:\n    # ${newTool.prompt}\n    \n    try:\n        # Your generated logic here\n        result = await process_with_ai_enhancement()\n        return {\n            'success': True,\n            'result': result,\n            'tool': '${newTool.name}',\n            'generated_at': datetime.utcnow().isoformat()\n        }\n    except Exception as e:\n        return {'error': str(e), 'tool': '${newTool.name}'}`,
          parameters: parsedParameters,
          created_at: new Date().toISOString(),
          creator: 'Mr. Chris',
          version: '1.0.0',
          downloads: 0,
          rating: 0,
          tags: newTool.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          status: 'draft'
        }

        setTools(prev => [generatedTool, ...prev])
        setGeneratingTool(false)
        setShowGenerator(false)
        
        // Reset form
        setNewTool({
          name: '',
          description: '',
          category: '',
          prompt: '',
          parameters: '',
          tags: ''
        })

        addNotification({
          type: 'success',
          title: 'Tool Generated Successfully',
          message: `"${generatedTool.name}" has been created and added to your tool library`
        })
      }, 3000)
      
    } catch (error) {
      setGeneratingTool(false)
      addNotification({
        type: 'error',
        title: 'Tool Generation Failed',
        message: `Failed to generate tool: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  const handleToolAction = async (action: string, tool: GeneratedTool) => {
    switch (action) {
      case 'download':
        // Update download count
        setTools(prev => prev.map(t => 
          t.id === tool.id 
            ? { ...t, downloads: t.downloads + 1 }
            : t
        ))
        
        addNotification({
          type: 'info',
          title: 'Tool Downloaded',
          message: `${tool.name} has been added to your agents&apos; toolkit`
        })
        break
        
      case 'install':
        // Set installing state
        setInstallingTools(prev => new Set(prev).add(tool.id))
        
        // Simulate installation process
        try {
          // Call the API to install the tool
          const response = await fetch('/api/toolshop', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              toolId: tool.id, 
              action: 'install' 
            })
          })
          
          if (response.ok) {
            const result = await response.json()
            
            // Update tool status and counts
            setTools(prev => prev.map(t => 
              t.id === tool.id 
                ? { 
                    ...t, 
                    downloads: t.downloads + 1,
                    status: 'published' as const
                  }
                : t
            ))
            
            // Mark as installed
            setInstalledTools(prev => new Set(prev).add(tool.id))
            
            addNotification({
              type: 'success',
              title: 'Tool Installed Successfully',
              message: `${tool.name} is now available to all agents`
            })
          } else {
            throw new Error('Installation failed')
          }
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Installation Failed',
            message: `Failed to install ${tool.name}. Please try again.`
          })
        } finally {
          // Remove from installing state
          setInstallingTools(prev => {
            const newSet = new Set(prev)
            newSet.delete(tool.id)
            return newSet
          })
        }
        break
        
      case 'edit':
        setShowGenerator(true)
        setNewTool({
          name: tool.name,
          description: tool.description,
          category: tool.category,
          prompt: 'Edit existing tool...',
          parameters: tool.parameters.map(p => `"${p.name}": "${p.type}"`).join(', '),
          tags: tool.tags.join(', ')
        })
        break
    }
  }

  return (
    <Layout title="Tool Shop" breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Ultimate Tool Shop</h1>
            <p className="text-white/70">Generate, customize, and deploy advanced tools for your AI agents</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowGenerator(!showGenerator)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate New Tool
            </Button>
            <Button variant="outline" className="glass">
              <Upload className="w-4 h-4 mr-2" />
              Import Tools
            </Button>
          </div>
        </div>

        {/* Tool Generator Panel */}
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Tool Generator
                </CardTitle>
                <CardDescription>
                  Describe your desired tool and let our AI generate the ultimate implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tool-name">Tool Name</Label>
                    <Input
                      id="tool-name"
                      placeholder="e.g., Advanced Data Processor"
                      value={newTool.name}
                      onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                      className="glass"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tool-category">Category</Label>
                    <Select 
                      value={newTool.category} 
                      onValueChange={(value) => setNewTool(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {toolCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              {cat.icon}
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tool-description">Description</Label>
                  <Input
                    id="tool-description"
                    placeholder="What does this tool do?"
                    value={newTool.description}
                    onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                    className="glass"
                  />
                </div>

                <div>
                  <Label htmlFor="tool-prompt">AI Generation Prompt</Label>
                  <Textarea
                    id="tool-prompt"
                    placeholder="Describe in detail what you want this tool to do, how it should work, what algorithms to use, etc."
                    value={newTool.prompt}
                    onChange={(e) => setNewTool(prev => ({ ...prev, prompt: e.target.value }))}
                    className="glass min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tool-parameters">Parameters</Label>
                    <Input
                      id="tool-parameters"
                      placeholder='data: Any, threshold: number, enabled: boolean'
                      value={newTool.parameters}
                      onChange={(e) => setNewTool(prev => ({ ...prev, parameters: e.target.value }))}
                      className="glass"
                    />
                    <p className="text-xs text-white/60 mt-1">
                      Format: name: type, name: type (e.g., data: string, count: number)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="tool-tags">Tags (comma-separated)</Label>
                    <Input
                      id="tool-tags"
                      placeholder="analysis, ai, automation"
                      value={newTool.tags}
                      onChange={(e) => setNewTool(prev => ({ ...prev, tags: e.target.value }))}
                      className="glass"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button 
                    onClick={handleGenerateTool}
                    disabled={!newTool.name || !newTool.description || !newTool.prompt || generatingTool}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {generatingTool ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Ultimate Tool
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowGenerator(false)}
                    className="glass"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tools Management Tabs */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Tools
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              My Library
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                      <Input
                        placeholder="Search tools by name, description, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 glass"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[200px] glass">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {toolCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              {cat.icon}
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass glass-hover h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg">{tool.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {tool.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${
                            tool.category === 'cognitive' ? 'border-purple-500 text-purple-400' :
                            tool.category === 'security' ? 'border-red-500 text-red-400' :
                            tool.category === 'automation' ? 'border-blue-500 text-blue-400' :
                            'border-gray-500 text-gray-400'
                          }`}
                        >
                          {toolCategories.find(c => c.value === tool.category)?.label || tool.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>v{tool.version}</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {tool.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {tool.rating}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tool.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tool.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        {installedTools.has(tool.id) ? (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Installed
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleToolAction('install', tool)}
                            disabled={installingTools.has(tool.id)}
                          >
                            {installingTools.has(tool.id) ? (
                              <>
                                <div className="w-3 h-3 mr-1 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Installing...
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3 mr-1" />
                                Install
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="glass"
                          onClick={() => handleToolAction('edit', tool)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="glass"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="library">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white">My Tool Library</CardTitle>
                <CardDescription>
                  Tools you&apos;ve created, downloaded, or customized
                </CardDescription>
              </CardHeader>
              <CardContent>
                {installedTools.size > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {tools.filter(tool => installedTools.has(tool.id)).map((tool) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium">{tool.name}</h4>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Installed
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm mb-3">{tool.description}</p>
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span>v{tool.version}</span>
                          <span>{tool.category}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50">
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your personal tool library will appear here</p>
                    <p className="text-sm mt-2">Generate or install tools to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-white">Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-white/50">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                    <p>Tool usage analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-white/50">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <p>Performance tracking coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
} 