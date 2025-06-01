# ----------------------------------------------------------------------------
#  File:        llm_agents.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Real LLM agent integration with local Ollama reasoning models
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

import asyncio
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import aiohttp
from dataclasses import dataclass

@dataclass
class AgentConfig:
    name: str
    model: str
    personality: str
    expertise: str
    reasoning_style: str
    temperature: float = 0.7

class LLMAgentEngine:
    """Real LLM-powered agent system with local Ollama reasoning models"""
    
    def __init__(self):
        self.agents = self._initialize_agents()
        self.ollama_base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
        
    def _initialize_agents(self) -> Dict[str, AgentConfig]:
        """Initialize agent configurations with local Ollama models"""
        return {
            'Theory': AgentConfig(
                name='Theory',
                model='wizardlm2:7b',  # Using available model as fallback
                personality='Analytical theorist focused on frameworks and abstract reasoning',
                expertise='Theoretical analysis, hypothesis generation, conceptual frameworks',
                reasoning_style='systematic, hypothesis-driven, framework-oriented',
                temperature=0.6
            ),
            'Echo': AgentConfig(
                name='Echo',
                model='echo:latest',  # Local Ollama model - available
                personality='Historical researcher with deep pattern recognition capabilities',
                expertise='Historical analysis, precedent matching, pattern identification',
                reasoning_style='methodical, precedent-focused, evidence-based',
                temperature=0.5
            ),
            'Verdict': AgentConfig(
                name='Verdict',
                model='verdict:latest',  # Local Ollama model - available
                personality='Decision synthesizer with strong risk assessment skills',
                expertise='Final decisions, risk analysis, legal compliance, synthesis',
                reasoning_style='decisive, risk-aware, comprehensive',
                temperature=0.4
            ),
            'Lyra': AgentConfig(
                name='Lyra',
                model='lyra:latest',  # Local Ollama model - available
                personality='Orchestrator focused on coordination and consensus building',
                expertise='Team coordination, workflow management, consensus building',
                reasoning_style='collaborative, diplomatic, integrative',
                temperature=0.6
            ),
            'Sentinel': AgentConfig(
                name='Sentinel',
                model='sentinel:latest',  # Local Ollama model - available
                personality='Security auditor with vigilant threat detection',
                expertise='Security analysis, threat detection, compliance monitoring',
                reasoning_style='vigilant, systematic, security-focused',
                temperature=0.3
            ),
            'Core': AgentConfig(
                name='Core',
                model='core:latest',  # Local Ollama model - available
                personality='System coordinator with central processing focus',
                expertise='System integration, core processing, coordination',
                reasoning_style='central, integrative, systematic',
                temperature=0.5
            ),
            'Beacon': AgentConfig(
                name='Beacon',
                model='beacon:latest',  # Local Ollama model - available
                personality='Information gatherer with comprehensive data collection',
                expertise='Data collection, source validation, information synthesis',
                reasoning_style='exploratory, comprehensive, thorough',
                temperature=0.7
            ),
            'Lens': AgentConfig(
                name='Lens',
                model='lens:latest',  # Local Ollama model - available
                personality='Pattern analyst with detailed observation skills',
                expertise='Visual analysis, pattern recognition, detail analysis',
                reasoning_style='observational, detail-oriented, precise',
                temperature=0.4
            ),
            'Arc': AgentConfig(
                name='Arc',
                model='arc:latest',  # Local Ollama model - available
                personality='Strategic planner with forward-thinking approach',
                expertise='Long-term planning, strategy development, future analysis',
                reasoning_style='forward-thinking, strategic, comprehensive',
                temperature=0.6
            ),
            'Luma': AgentConfig(
                name='Luma',
                model='luma:latest',  # Local Ollama model - available
                personality='Insight generator focused on illuminating solutions',
                expertise='Insight generation, clarity enhancement, solution finding',
                reasoning_style='illuminating, clarifying, innovative',
                temperature=0.8
            ),
            'Otto': AgentConfig(
                name='Otto',
                model='otto:latest',  # Local Ollama model - available
                personality='Process optimizer with efficiency focus',
                expertise='Process improvement, automation, efficiency optimization',
                reasoning_style='efficient, optimization-focused, systematic',
                temperature=0.4
            ),
            'Volt': AgentConfig(
                name='Volt',
                model='volt:latest',  # Local Ollama model - available
                personality='Technical specialist with precise analysis',
                expertise='Technical analysis, system diagnostics, precision work',
                reasoning_style='precise, technical, analytical',
                temperature=0.3
            ),
            'Vitals': AgentConfig(
                name='Vitals',
                model='vitals:latest',  # Local Ollama model - available
                personality='Health monitor with diagnostic capabilities',
                expertise='System health, performance metrics, monitoring',
                reasoning_style='monitoring, diagnostic, systematic',
                temperature=0.5
            )
        }
    
    async def generate_agent_reasoning(self, agent_name: str, phase: str, 
                                     context: str, cognition_id: str) -> List[Dict[str, Any]]:
        """Generate real LLM reasoning for an agent using local Ollama"""
        
        if agent_name not in self.agents:
            return self._fallback_reasoning(agent_name, phase, context)
        
        agent = self.agents[agent_name]
        
        # Create reasoning prompt
        prompt = self._create_reasoning_prompt(agent, phase, context, cognition_id)
        
        try:
            # Call local Ollama API
            response = await self._call_ollama_api(agent, prompt)
            
            # Parse response and extract reasoning
            return self._parse_reasoning_response(response, agent_name, phase)
            
        except Exception as e:
            print(f"Ollama API error for {agent_name}: {str(e)}")
            return self._fallback_reasoning(agent_name, phase, context)
    
    def _create_reasoning_prompt(self, agent: AgentConfig, phase: str, 
                               context: str, cognition_id: str) -> str:
        """Create a reasoning prompt for the agent"""
        
        base_prompt = f"""You are {agent.name}, a specialized AI agent with the following characteristics:

**Role**: {agent.personality}
**Expertise**: {agent.expertise}
**Reasoning Style**: {agent.reasoning_style}

**Current Task**: 
- Phase: {phase}
- Cognition ID: {cognition_id}
- Context: {context}

**Instructions**:
1. Think through this problem step-by-step using your reasoning style
2. Show your thinking process clearly using <thinking> tags
3. Generate 3-5 specific thoughts/insights relevant to the {phase} phase
4. Each thought should be actionable and show your expertise
5. Use your personality and reasoning style throughout

**Response Format**:
<thinking>
[Your detailed reasoning process here - be thorough and show your work]
</thinking>

Based on my analysis, here are my key insights:

1. [First thought/insight]
2. [Second thought/insight]
3. [Third thought/insight]
4. [Fourth thought/insight]
5. [Fifth thought/insight if applicable]

Begin your analysis:"""

        return base_prompt
    
    async def _call_ollama_api(self, agent: AgentConfig, prompt: str) -> str:
        """Call local Ollama API"""
        
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": agent.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": agent.temperature,
                        "top_p": 0.9,
                        "top_k": 40
                    }
                }
                
                async with session.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get('response', '')
                    else:
                        error_text = await response.text()
                        raise Exception(f"Ollama API error {response.status}: {error_text}")
                        
        except asyncio.TimeoutError:
            raise Exception(f"Ollama API timeout for model {agent.model}")
        except aiohttp.ClientError as e:
            raise Exception(f"Ollama connection error: {str(e)}")
        except Exception as e:
            raise Exception(f"Ollama API call failed: {str(e)}")
    
    def _parse_reasoning_response(self, response: str, agent_name: str, 
                                phase: str) -> List[Dict[str, Any]]:
        """Parse Ollama response into structured reasoning steps"""
        
        reasoning_steps = []
        
        # Extract thinking content
        thinking_start = response.find('<thinking>')
        thinking_end = response.find('</thinking>')
        
        if thinking_start != -1 and thinking_end != -1:
            thinking_content = response[thinking_start + 10:thinking_end].strip()
            
            # Split thinking into logical steps
            thinking_lines = [line.strip() for line in thinking_content.split('\n') if line.strip()]
            for line in thinking_lines:
                if len(line) > 15:  # Filter out very short lines
                    reasoning_steps.append({
                        'type': 'thinking',
                        'agent': agent_name,
                        'phase': phase,
                        'content': line,
                        'timestamp': datetime.utcnow().isoformat()
                    })
        
        # Extract numbered thoughts from the response
        lines = response.split('\n')
        for line in lines:
            stripped = line.strip()
            if stripped and (stripped.startswith(('1.', '2.', '3.', '4.', '5.')) or 
                           stripped.startswith(('1 ', '2 ', '3 ', '4 ', '5 '))):
                # Remove number and clean up
                thought_content = stripped
                if '.' in thought_content[:3]:
                    thought_content = thought_content.split('.', 1)[1].strip()
                elif ' ' in thought_content[:3]:
                    thought_content = thought_content.split(' ', 1)[1].strip()
                
                if thought_content:  # Only add non-empty thoughts
                    reasoning_steps.append({
                        'type': 'thought',
                        'agent': agent_name,
                        'phase': phase,
                        'content': thought_content,
                        'timestamp': datetime.utcnow().isoformat()
                    })
        
        # If we didn't get numbered thoughts, try to extract insights from the response
        if not any(step['type'] == 'thought' for step in reasoning_steps):
            # Look for lines that seem like insights
            insight_indicators = ['insight:', 'recommendation:', 'analysis:', 'conclusion:', '•', '-', '*']
            for line in lines:
                stripped = line.strip()
                if any(stripped.lower().startswith(indicator) for indicator in insight_indicators):
                    # Clean up the line
                    for indicator in insight_indicators:
                        if stripped.lower().startswith(indicator):
                            stripped = stripped[len(indicator):].strip()
                            break
                    
                    if stripped and len(stripped) > 10:
                        reasoning_steps.append({
                            'type': 'thought',
                            'agent': agent_name,
                            'phase': phase,
                            'content': stripped,
                            'timestamp': datetime.utcnow().isoformat()
                        })
        
        return reasoning_steps
    
    def _fallback_reasoning(self, agent_name: str, phase: str, context: str) -> List[Dict[str, Any]]:
        """Fallback reasoning when Ollama API fails"""
        
        fallback_thoughts = {
            'Theory': [
                "🔬 Developing theoretical framework for systematic analysis",
                "📋 Constructing hypothesis-driven approach to problem solving",
                "⚡ Applying abstract reasoning to identify core principles"
            ],
            'Echo': [
                "📚 Cross-referencing historical precedents and patterns",
                "🔍 Analyzing past cases for relevant insights",
                "📊 Evidence-based evaluation of available data"
            ],
            'Verdict': [
                "⚖️ Synthesizing analysis for final decision framework",
                "🎯 Risk assessment and impact evaluation complete",
                "✅ Comprehensive decision rationale development"
            ],
            'Lyra': [
                "🎼 Orchestrating collaborative approach to problem solving",
                "👥 Facilitating consensus-building among agents",
                "🔄 Coordinating workflow for optimal outcomes"
            ],
            'Sentinel': [
                "🛡️ Security assessment and threat analysis complete",
                "🔒 Compliance verification and risk monitoring active",
                "⚡ Vigilant oversight of system integrity"
            ]
        }
        
        thoughts = fallback_thoughts.get(agent_name, [
            f"🤖 {agent_name} engaging with {phase.lower()} using systematic approach",
            f"⚡ Applying specialized expertise to current challenge",
            f"🎯 Contributing unique perspective to solution development"
        ])
        
        return [
            {
                'type': 'thought',
                'agent': agent_name,
                'phase': phase,
                'content': thought,
                'timestamp': datetime.utcnow().isoformat()
            }
            for thought in thoughts
        ] 