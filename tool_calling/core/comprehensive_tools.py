# ----------------------------------------------------------------------------
#  File:        comprehensive_tools.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Complete implementation of all tools from all-tools.md
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

from all_tools_implementation import AllToolsImplementation
from extended_tools_part2 import ExtendedToolsPart2
from tool_shop_integration import tool_shop_manager, ToolDefinition, ToolExecutionResult
import json
import hashlib
import time
import asyncio
import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from pathlib import Path

class ComprehensiveTools(AllToolsImplementation, ExtendedToolsPart2):
    """
    Complete implementation of all tools from all-tools.md
    
    Combines:
    - All Core Tools (from CoreTools)
    - All Extended Tools from AllToolsImplementation 
    - All Additional Tools from ExtendedToolsPart2
    - Dynamic Tool Shop integration
    
    Plus additional tool categories:
    - Sensor & Event Hook Tools
    - Task Management Tools  
    - Personality/Style Tools
    - User-Facing/Transparency Tools
    - Memory & Self-Evolution Tools
    - Simulation & Prediction Tools
    - Governance & Reputation Tools
    - Dynamic Tool Shop Tools
    """
    
    def __init__(self, agent_id: str, config: Dict[str, Any]):
        super().__init__(agent_id, config)
        
        # Additional state for comprehensive tools
        self.sensor_watches = {}
        self.task_dependencies = {}
        self.style_mutations = []
        self.transparency_logs = []
        
        # Tool Shop integration
        self.tool_shop_enabled = config.get('tool_shop_enabled', True)
        self.available_shop_tools = {}
        
        # Load available Tool Shop tools
        if self.tool_shop_enabled:
            self._load_tool_shop_tools()

    def _load_tool_shop_tools(self):
        """Load available tools from Tool Shop"""
        try:
            shop_tools = tool_shop_manager.get_all_tools()
            for tool in shop_tools:
                if tool.status == 'published':
                    self.available_shop_tools[f"shop_{tool.function_name}"] = tool
            
            print(f"🔧 Loaded {len(self.available_shop_tools)} Tool Shop tools for {self.agent_id}")
        except Exception as e:
            print(f"⚠️ Failed to load Tool Shop tools: {e}")

    async def __aenter__(self):
        """Async context manager entry"""
        await self.recall_log_insight(
            "Comprehensive Tools session started",
            {'type': 'comprehensive_session_start', 'agent_id': self.agent_id}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.recall_log_insight(
            "Comprehensive Tools session ended",
            {'type': 'comprehensive_session_end', 'agent_id': self.agent_id}
        )
        await self._ensure_state_saved()

    # =============================================================================
    # SENSOR & EVENT HOOK TOOLS
    # =============================================================================

    async def watch_listen(self, topic: str, trigger_phrase: str = None) -> Dict[str, Any]:
        """Passive listener for a topic, phrase, or condition"""
        try:
            watch_id = str(uuid.uuid4())
            
            watch_condition = {
                'watch_id': watch_id,
                'topic': topic,
                'trigger_phrase': trigger_phrase,
                'created_at': datetime.utcnow().isoformat(),
                'active': True,
                'triggers_count': 0,
                'last_triggered': None
            }
            
            self.sensor_watches[watch_id] = watch_condition
            
            await self.recall_log_insight(
                f"Watch listener activated for: {topic}",
                {'type': 'watch_listen', 'watch_id': watch_id, 'topic': topic}
            )
            
            return {
                'success': True,
                'watch_id': watch_id,
                'topic': topic,
                'status': 'listening'
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'watch_listen'}

    async def watch_trigger_on(self, condition: str, action: str) -> Dict[str, Any]:
        """Reacts to custom condition"""
        try:
            trigger_id = str(uuid.uuid4())
            
            trigger_condition = {
                'trigger_id': trigger_id,
                'condition': condition,
                'action': action,
                'created_at': datetime.utcnow().isoformat(),
                'active': True,
                'executions': 0
            }
            
            self.watch_conditions[trigger_id] = trigger_condition
            
            await self.recall_log_insight(
                f"Trigger condition set: {condition} → {action}",
                {'type': 'watch_trigger', 'trigger_id': trigger_id, 'condition': condition}
            )
            
            return {
                'success': True,
                'trigger_id': trigger_id,
                'condition': condition,
                'action': action,
                'status': 'active'
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'watch_trigger_on'}

    async def watch_set_guardrail(self, condition: str, action: str = "halt") -> Dict[str, Any]:
        """Defines a fail-safe condition or hard stop"""
        try:
            guardrail_id = str(uuid.uuid4())
            
            guardrail = {
                'guardrail_id': guardrail_id,
                'condition': condition,
                'action': action,
                'priority': 'critical',
                'created_at': datetime.utcnow().isoformat(),
                'active': True
            }
            
            # Guardrails get special treatment in watch conditions
            self.watch_conditions[guardrail_id] = guardrail
            
            await self.recall_log_insight(
                f"Guardrail set: {condition} → {action}",
                {'type': 'guardrail_set', 'guardrail_id': guardrail_id, 'condition': condition}
            )
            
            return {
                'success': True,
                'guardrail_id': guardrail_id,
                'condition': condition,
                'action': action,
                'priority': 'critical'
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'watch_set_guardrail'}

    async def watch_cancel_watch(self, watch_id: str) -> Dict[str, Any]:
        """Stops watching a prior condition"""
        try:
            if watch_id in self.watch_conditions:
                self.watch_conditions[watch_id]['active'] = False
                watch_type = "condition"
            elif watch_id in self.sensor_watches:
                self.sensor_watches[watch_id]['active'] = False
                watch_type = "listener"
            else:
                return {'error': 'Watch not found', 'watch_id': watch_id}
            
            await self.recall_log_insight(
                f"Watch {watch_type} cancelled: {watch_id}",
                {'type': 'watch_cancel', 'watch_id': watch_id, 'watch_type': watch_type}
            )
            
            return {
                'success': True,
                'watch_id': watch_id,
                'status': 'cancelled',
                'watch_type': watch_type
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'watch_cancel_watch'}

    # =============================================================================
    # TASK MANAGEMENT & BACKLOG
    # =============================================================================

    async def task_create(self, description: str, priority: int = 5, dependencies: List[str] = None) -> Dict[str, Any]:
        """Create a new persistent task for future execution"""
        try:
            task_id = str(uuid.uuid4())
            
            task = {
                'task_id': task_id,
                'description': description,
                'priority': priority,
                'dependencies': dependencies or [],
                'status': 'pending',
                'created_at': datetime.utcnow().isoformat(),
                'created_by': self.agent_id,
                'estimated_duration': None,
                'assigned_to': None
            }
            
            self.task_queue[task_id] = task
            
            # Track dependencies
            if dependencies:
                self.task_dependencies[task_id] = dependencies
            
            await self.recall_log_insight(
                f"Task created: {description}",
                {'type': 'task_create', 'task_id': task_id, 'priority': priority}
            )
            
            return {
                'success': True,
                'task_id': task_id,
                'description': description,
                'priority': priority,
                'status': 'pending'
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'task_create'}

    async def task_link_dependency(self, task_id: str, dependency_task_id: str) -> Dict[str, Any]:
        """Attach prerequisite tasks or agents"""
        try:
            if task_id not in self.task_queue:
                return {'error': 'Task not found', 'task_id': task_id}
            
            # Add dependency
            if task_id not in self.task_dependencies:
                self.task_dependencies[task_id] = []
            
            if dependency_task_id not in self.task_dependencies[task_id]:
                self.task_dependencies[task_id].append(dependency_task_id)
                self.task_queue[task_id]['dependencies'] = self.task_dependencies[task_id]
            
            await self.recall_log_insight(
                f"Task dependency linked: {task_id} depends on {dependency_task_id}",
                {'type': 'task_dependency', 'task_id': task_id, 'dependency': dependency_task_id}
            )
            
            return {
                'success': True,
                'task_id': task_id,
                'dependency_task_id': dependency_task_id,
                'total_dependencies': len(self.task_dependencies[task_id])
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'task_link_dependency'}

    async def task_repeat(self, task_id: str, interval_minutes: int) -> Dict[str, Any]:
        """Set a task to auto-run on interval or trigger"""
        try:
            if task_id not in self.task_queue:
                return {'error': 'Task not found', 'task_id': task_id}
            
            self.task_queue[task_id]['repeat_interval'] = interval_minutes
            self.task_queue[task_id]['next_execution'] = (datetime.utcnow() + timedelta(minutes=interval_minutes)).isoformat()
            
            await self.recall_log_insight(
                f"Task set to repeat every {interval_minutes} minutes: {task_id}",
                {'type': 'task_repeat', 'task_id': task_id, 'interval': interval_minutes}
            )
            
            return {
                'success': True,
                'task_id': task_id,
                'repeat_interval': interval_minutes,
                'next_execution': self.task_queue[task_id]['next_execution']
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'task_repeat'}

    async def task_chain(self, task_ids: List[str]) -> Dict[str, Any]:
        """Chain tasks in sequence"""
        try:
            chain_id = str(uuid.uuid4())
            
            # Link tasks in sequence
            for i in range(1, len(task_ids)):
                await self.task_link_dependency(task_ids[i], task_ids[i-1])
            
            chain_info = {
                'chain_id': chain_id,
                'task_sequence': task_ids,
                'created_at': datetime.utcnow().isoformat(),
                'total_tasks': len(task_ids)
            }
            
            await self.recall_log_insight(
                f"Task chain created: {len(task_ids)} tasks",
                {'type': 'task_chain', 'chain_id': chain_id, 'task_count': len(task_ids)}
            )
            
            return {
                'success': True,
                'chain_id': chain_id,
                'task_sequence': task_ids,
                'total_tasks': len(task_ids)
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'task_chain'}

    async def task_cancel(self, task_id: str, reason: str = "Manual cancellation") -> Dict[str, Any]:
        """Cancel a pending or queued task"""
        try:
            if task_id not in self.task_queue:
                return {'error': 'Task not found', 'task_id': task_id}
            
            self.task_queue[task_id]['status'] = 'cancelled'
            self.task_queue[task_id]['cancelled_at'] = datetime.utcnow().isoformat()
            self.task_queue[task_id]['cancellation_reason'] = reason
            
            await self.recall_log_insight(
                f"Task cancelled: {task_id} - {reason}",
                {'type': 'task_cancel', 'task_id': task_id, 'reason': reason}
            )
            
            return {
                'success': True,
                'task_id': task_id,
                'status': 'cancelled',
                'reason': reason
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'task_cancel'}

    # =============================================================================
    # AGENT STYLE / PERSONALITY TOOLS
    # =============================================================================

    async def persona_describe_self(self) -> Dict[str, Any]:
        """Returns agent's tone, beliefs, role, and language style"""
        try:
            if not self.persona_profile:
                self._init_default_persona()
            
            description = {
                'agent_id': self.agent_id,
                'persona': asdict(self.persona_profile),
                'current_style': self.persona_profile.style,
                'beliefs': self.persona_profile.beliefs,
                'language_patterns': self.persona_profile.language_patterns,
                'tone': self.persona_profile.tone,
                'version': self.persona_profile.version,
                'described_at': datetime.utcnow().isoformat()
            }
            
            await self.recall_log_insight(
                f"Persona described: {self.persona_profile.tone} style",
                {'type': 'persona_describe', 'tone': self.persona_profile.tone}
            )
            
            return description
            
        except Exception as e:
            return {'error': str(e), 'tool': 'persona_describe_self'}

    async def persona_shift_style(self, new_tone: str, new_style: Dict[str, Any] = None) -> Dict[str, Any]:
        """Apply a new tone or directive"""
        try:
            shift_id = str(uuid.uuid4())
            old_tone = self.persona_profile.tone
            
            # Update persona
            self.persona_profile.tone = new_tone
            if new_style:
                self.persona_profile.style.update(new_style)
            self.persona_profile.version += 1
            
            # Log the style shift
            style_mutation = {
                'shift_id': shift_id,
                'old_tone': old_tone,
                'new_tone': new_tone,
                'style_changes': new_style,
                'shifted_at': datetime.utcnow().isoformat(),
                'version': self.persona_profile.version
            }
            
            self.style_mutations.append(style_mutation)
            
            await self.recall_log_insight(
                f"Style shifted from {old_tone} to {new_tone}",
                {'type': 'style_shift', 'shift_id': shift_id, 'old_tone': old_tone, 'new_tone': new_tone}
            )
            
            return {
                'success': True,
                'shift_id': shift_id,
                'old_tone': old_tone,
                'new_tone': new_tone,
                'version': self.persona_profile.version
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'persona_shift_style'}

    async def persona_log_conflict(self, conflict_description: str) -> Dict[str, Any]:
        """Logs when agent violates or contradicts its own style"""
        try:
            conflict_id = str(uuid.uuid4())
            
            conflict_log = {
                'conflict_id': conflict_id,
                'description': conflict_description,
                'current_persona': asdict(self.persona_profile),
                'logged_at': datetime.utcnow().isoformat(),
                'severity': 'medium'
            }
            
            await self.recall_log_insight(
                f"Persona conflict logged: {conflict_description}",
                {'type': 'persona_conflict', 'conflict_id': conflict_id}
            )
            
            return {
                'success': True,
                'conflict_id': conflict_id,
                'description': conflict_description,
                'severity': 'medium'
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'persona_log_conflict'}

    async def persona_revert(self, target_version: int = 1) -> Dict[str, Any]:
        """Reset style to original founding prompt"""
        try:
            revert_id = str(uuid.uuid4())
            old_version = self.persona_profile.version
            
            # Reset to default persona
            self._init_default_persona()
            self.persona_profile.version = target_version
            
            await self.recall_log_insight(
                f"Persona reverted from version {old_version} to {target_version}",
                {'type': 'persona_revert', 'revert_id': revert_id, 'old_version': old_version}
            )
            
            return {
                'success': True,
                'revert_id': revert_id,
                'old_version': old_version,
                'new_version': target_version,
                'reverted_to': 'default_persona'
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'persona_revert'}

    # =============================================================================
    # USER-FACING / TRANSPARENCY TOOLS (Enhanced)
    # =============================================================================

    async def ui_tag_entry(self, content: str, tags: List[str]) -> Dict[str, Any]:
        """Tags a task or log for visibility"""
        try:
            entry_id = str(uuid.uuid4())
            
            tagged_entry = {
                'entry_id': entry_id,
                'content': content,
                'tags': tags,
                'tagged_at': datetime.utcnow().isoformat(),
                'tagged_by': self.agent_id
            }
            
            self.transparency_logs.append(tagged_entry)
            
            await self.recall_log_insight(
                f"Entry tagged: {content[:50]}... with tags: {', '.join(tags)}",
                {'type': 'ui_tag_entry', 'entry_id': entry_id, 'tags': tags}
            )
            
            return {
                'success': True,
                'entry_id': entry_id,
                'tags': tags,
                'content_preview': content[:100]
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'ui_tag_entry'}

    async def ui_link_task(self, task_id: str, related_agent: str, relationship: str) -> Dict[str, Any]:
        """Links this task to another agent's record"""
        try:
            link_id = str(uuid.uuid4())
            
            task_link = {
                'link_id': link_id,
                'task_id': task_id,
                'related_agent': related_agent,
                'relationship': relationship,
                'linked_by': self.agent_id,
                'linked_at': datetime.utcnow().isoformat()
            }
            
            await self.recall_log_insight(
                f"Task linked: {task_id} → {related_agent} ({relationship})",
                {'type': 'ui_link_task', 'link_id': link_id, 'related_agent': related_agent}
            )
            
            return {
                'success': True,
                'link_id': link_id,
                'task_id': task_id,
                'related_agent': related_agent,
                'relationship': relationship
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'ui_link_task'}

    async def ui_show_last_5(self) -> List[Dict[str, Any]]:
        """Displays last 5 logs to the user"""
        try:
            # Get last 5 recall logs
            recall_files = sorted(self.recall_path.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:5]
            
            last_logs = []
            for file_path in recall_files:
                with open(file_path, 'r') as f:
                    log_data = json.load(f)
                    last_logs.append({
                        'timestamp': log_data['recall_entry']['timestamp'],
                        'content': log_data['recall_entry']['content'],
                        'cid': log_data['recall_entry']['cid'],
                        'metadata': log_data.get('metadata', {})
                    })
            
            return last_logs
            
        except Exception as e:
            return [{'error': str(e), 'tool': 'ui_show_last_5'}]

    async def ui_explain_memory_link(self, response_id: str) -> Dict[str, Any]:
        """Shows what memories were used to generate this reply"""
        try:
            # This would typically trace back through the memory usage for a response
            explanation = {
                'response_id': response_id,
                'memory_sources': [
                    {
                        'memory_key': 'recent_context',
                        'usage': 'Primary context for response generation',
                        'relevance_score': 0.9
                    },
                    {
                        'memory_key': 'domain_knowledge', 
                        'usage': 'Background knowledge application',
                        'relevance_score': 0.7
                    }
                ],
                'explanation_generated_at': datetime.utcnow().isoformat()
            }
            
            await self.recall_log_insight(
                f"Memory link explanation provided for response: {response_id}",
                {'type': 'memory_link_explanation', 'response_id': response_id}
            )
            
            return explanation
            
        except Exception as e:
            return {'error': str(e), 'tool': 'ui_explain_memory_link'}

    # =============================================================================
    # ENHANCED TOOL DISCOVERY AND EXECUTION
    # =============================================================================

    async def tools_search(self, search_term: str) -> List[Dict[str, Any]]:
        """Search for tools by name, description, or category, including Tool Shop tools"""
        try:
            # Get standard search results
            standard_results = await super().tools_search(search_term)
            
            # Search Tool Shop tools
            if self.tool_shop_enabled:
                shop_search_results = await self.toolshop_search_tools(search_term)
                
                for shop_tool in shop_search_results:
                    if 'error' not in shop_tool:
                        standard_results.append({
                            'name': shop_tool['function_name'],
                            'description': shop_tool['description'],
                            'category': 'Tool Shop - ' + shop_tool['category'].title(),
                            'source': 'Tool Shop',
                            'creator': shop_tool['creator'],
                            'version': shop_tool['version'],
                            'rating': shop_tool['rating']
                        })
            
            await self.recall_log_insight(
                f"Tool search for '{search_term}': {len(standard_results)} total matches",
                {'type': 'tool_search', 'search_term': search_term, 'matches': len(standard_results)}
            )
            
            return standard_results
            
        except Exception as e:
            return [{'error': str(e), 'tool': 'tools_search'}]

    def _categorize_tool(self, tool_name: str) -> str:
        """Categorize a tool based on its name prefix"""
        if tool_name.startswith('recall_'):
            return 'Core Blockchain'
        elif tool_name.startswith('memory_'):
            return 'Memory Management'
        elif tool_name.startswith('dev_'):
            return 'Debug & Development'
        elif tool_name.startswith('security_'):
            return 'Security & Alignment'
        elif tool_name.startswith('council_'):
            return 'Inter-Agent Operations'
        elif tool_name.startswith('id_'):
            return 'Identity & Wallet'
        elif tool_name.startswith('system_'):
            return 'System Control'
        elif tool_name.startswith('cognition_'):
            return 'Cognitive & Thought'
        elif tool_name.startswith('ui_'):
            return 'User Interface & Transparency'
        elif tool_name.startswith('watch_'):
            return 'Sensor & Event Hooks'
        elif tool_name.startswith('task_'):
            return 'Task Management'
        elif tool_name.startswith('persona_'):
            return 'Personality & Style'
        elif tool_name.startswith('tools_'):
            return 'Core Tools'
        else:
            return 'Miscellaneous'

    async def get_comprehensive_tool_list(self) -> Dict[str, List[str]]:
        """Get all tools organized by category, including Tool Shop tools"""
        try:
            # Get standard categorized tools
            categorized = await super().get_comprehensive_tool_list()
            
            # Add Tool Shop category
            toolshop_tools = []
            
            # Tool Shop management tools
            toolshop_management = [
                'toolshop_generate_tool',
                'toolshop_execute_tool',
                'toolshop_list_tools', 
                'toolshop_search_tools',
                'toolshop_get_analytics',
                'toolshop_install_tool'
            ]
            toolshop_tools.extend(toolshop_management)
            
            # Available shop tools
            toolshop_tools.extend(list(self.available_shop_tools.keys()))
            
            if toolshop_tools:
                categorized['Tool Shop & Dynamic Tools'] = toolshop_tools
            
            return categorized
            
        except Exception as e:
            return {'error': [str(e)]}

    # Override execute_tool to handle Tool Shop tools
    async def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """Execute any tool with enhanced error handling and logging, including Tool Shop tools"""
        try:
            # Check if it's a Tool Shop tool
            if tool_name.startswith('shop_') and tool_name in self.available_shop_tools:
                tool_def = self.available_shop_tools[tool_name]
                return await self.toolshop_execute_tool(tool_def.id, **kwargs)
            
            # Check if it's a toolshop_ prefixed tool (Tool Shop management tools)
            if tool_name.startswith('toolshop_'):
                method = getattr(self, tool_name, None)
                if method and callable(method):
                    return await method(**kwargs)
            
            # Otherwise, use the standard execution
            return await super().execute_tool(tool_name, **kwargs)
            
        except Exception as e:
            await self.security_log_risk(f"Tool execution failed: {tool_name} - {e}", "medium")
            return {'error': str(e), 'tool': tool_name}

    # Override dev_list_tools to include Tool Shop tools
    async def dev_list_tools(self) -> List[str]:
        """Lists all tools available to the agent, including Tool Shop tools"""
        try:
            # Get standard tools
            standard_tools = await super().dev_list_tools()
            
            # Add Tool Shop management tools
            toolshop_management_tools = [
                'toolshop_generate_tool',
                'toolshop_execute_tool', 
                'toolshop_list_tools',
                'toolshop_search_tools',
                'toolshop_get_analytics',
                'toolshop_install_tool'
            ]
            
            # Add available Tool Shop tools
            shop_tools = list(self.available_shop_tools.keys())
            
            all_tools = standard_tools + toolshop_management_tools + shop_tools
            
            await self.recall_log_insight(
                f"Listed {len(all_tools)} tools including {len(shop_tools)} Tool Shop tools",
                {'type': 'tools_list', 'total_tools': len(all_tools), 'shop_tools': len(shop_tools)}
            )
            
            return all_tools
            
        except Exception as e:
            return [f"Error listing tools: {e}"]

    # =============================================================================
    # TOOL SHOP INTEGRATION TOOLS
    # =============================================================================

    async def toolshop_generate_tool(self, 
                                   name: str, 
                                   description: str, 
                                   category: str,
                                   prompt: str,
                                   parameters: List[Dict[str, Any]] = None,
                                   tags: List[str] = None) -> Dict[str, Any]:
        """Generate a new tool using the Tool Shop AI"""
        try:
            if not self.tool_shop_enabled:
                return {'error': 'Tool Shop not enabled for this agent'}
            
            # Generate the tool
            tool_def = await tool_shop_manager.generate_tool(
                name=name,
                description=description,
                category=category,
                prompt=prompt,
                parameters=parameters or [],
                tags=tags or [],
                creator=self.agent_id
            )
            
            # Add to available tools
            tool_name = f"shop_{tool_def.function_name}"
            self.available_shop_tools[tool_name] = tool_def
            
            # Log the tool creation
            await self.recall_log_insight(
                f"Generated new tool: {tool_def.name}",
                {
                    'type': 'tool_generation',
                    'tool_id': tool_def.id,
                    'tool_name': tool_def.name,
                    'category': tool_def.category
                }
            )
            
            return {
                'success': True,
                'tool_id': tool_def.id,
                'tool_name': tool_def.name,
                'function_name': tool_name,
                'category': tool_def.category,
                'status': tool_def.status
            }
            
        except Exception as e:
            await self.security_log_risk(f"Tool generation failed: {e}")
            return {'error': str(e), 'tool': 'toolshop_generate_tool'}

    async def toolshop_execute_tool(self, tool_id: str, **kwargs) -> Dict[str, Any]:
        """Execute a Tool Shop generated tool"""
        try:
            if not self.tool_shop_enabled:
                return {'error': 'Tool Shop not enabled for this agent'}
            
            # Execute the tool
            execution_result = await tool_shop_manager.execute_tool(tool_id, **kwargs)
            
            # Log the execution
            await self.recall_log_insight(
                f"Executed Tool Shop tool: {tool_id}",
                {
                    'type': 'tool_execution',
                    'tool_id': tool_id,
                    'execution_id': execution_result.execution_id,
                    'success': execution_result.success,
                    'execution_time': execution_result.execution_time
                }
            )
            
            return {
                'success': execution_result.success,
                'execution_id': execution_result.execution_id,
                'execution_time': execution_result.execution_time,
                'result': execution_result.result,
                'error': execution_result.error,
                'timestamp': execution_result.timestamp
            }
            
        except Exception as e:
            await self.security_log_risk(f"Tool execution failed: {e}")
            return {'error': str(e), 'tool': 'toolshop_execute_tool'}

    async def toolshop_list_tools(self, category: str = None) -> List[Dict[str, Any]]:
        """List available Tool Shop tools"""
        try:
            if not self.tool_shop_enabled:
                return [{'error': 'Tool Shop not enabled for this agent'}]
            
            # Refresh tool list
            self._load_tool_shop_tools()
            
            tools_list = []
            for tool_name, tool_def in self.available_shop_tools.items():
                if category is None or tool_def.category == category:
                    tools_list.append({
                        'id': tool_def.id,
                        'name': tool_def.name,
                        'function_name': tool_name,
                        'description': tool_def.description,
                        'category': tool_def.category,
                        'version': tool_def.version,
                        'creator': tool_def.creator,
                        'tags': tool_def.tags,
                        'downloads': tool_def.downloads,
                        'rating': tool_def.rating,
                        'status': tool_def.status,
                        'created_at': tool_def.created_at
                    })
            
            return tools_list
            
        except Exception as e:
            return [{'error': str(e), 'tool': 'toolshop_list_tools'}]

    async def toolshop_search_tools(self, query: str, category: str = None) -> List[Dict[str, Any]]:
        """Search Tool Shop tools"""
        try:
            if not self.tool_shop_enabled:
                return [{'error': 'Tool Shop not enabled for this agent'}]
            
            # Search tools
            search_results = tool_shop_manager.search_tools(query, category)
            
            tools_list = []
            for tool_def in search_results:
                if tool_def.status == 'published':
                    tools_list.append({
                        'id': tool_def.id,
                        'name': tool_def.name,
                        'function_name': f"shop_{tool_def.function_name}",
                        'description': tool_def.description,
                        'category': tool_def.category,
                        'version': tool_def.version,
                        'creator': tool_def.creator,
                        'tags': tool_def.tags,
                        'downloads': tool_def.downloads,
                        'rating': tool_def.rating,
                        'status': tool_def.status
                    })
            
            return tools_list
            
        except Exception as e:
            return [{'error': str(e), 'tool': 'toolshop_search_tools'}]

    async def toolshop_get_analytics(self, tool_id: str) -> Dict[str, Any]:
        """Get analytics for a Tool Shop tool"""
        try:
            if not self.tool_shop_enabled:
                return {'error': 'Tool Shop not enabled for this agent'}
            
            analytics = tool_shop_manager.get_tool_analytics(tool_id)
            
            if analytics:
                return {
                    'success': True,
                    'tool_id': tool_id,
                    'analytics': analytics
                }
            else:
                return {'error': 'Analytics not found for tool', 'tool_id': tool_id}
                
        except Exception as e:
            return {'error': str(e), 'tool': 'toolshop_get_analytics'}

    async def toolshop_install_tool(self, tool_id: str) -> Dict[str, Any]:
        """Install a Tool Shop tool for this agent"""
        try:
            if not self.tool_shop_enabled:
                return {'error': 'Tool Shop not enabled for this agent'}
            
            # Get tool definition
            if tool_id not in tool_shop_manager.tools_registry:
                return {'error': 'Tool not found', 'tool_id': tool_id}
            
            tool_def = tool_shop_manager.tools_registry[tool_id]
            
            # Add to agent's available tools
            tool_name = f"shop_{tool_def.function_name}"
            self.available_shop_tools[tool_name] = tool_def
            
            # Log installation
            await self.recall_log_insight(
                f"Installed Tool Shop tool: {tool_def.name}",
                {
                    'type': 'tool_installation',
                    'tool_id': tool_id,
                    'tool_name': tool_def.name,
                    'agent_id': self.agent_id
                }
            )
            
            return {
                'success': True,
                'tool_id': tool_id,
                'tool_name': tool_def.name,
                'function_name': tool_name,
                'status': 'installed'
            }
            
        except Exception as e:
            return {'error': str(e), 'tool': 'toolshop_install_tool'} 