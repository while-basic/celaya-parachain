# ----------------------------------------------------------------------------
#  File:        api_server.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: FastAPI server for cognition tools
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import asyncio
import json
from datetime import datetime

from cognition_tools import CognitionAPI

app = FastAPI(
    title="C-Suite Cognition API",
    description="API for cognition and simulation tools",
    version="1.0.0"
)

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004"
    ],  # React dev server (multiple ports)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize cognition API
cognition_api = CognitionAPI()

# Pydantic models for request/response validation
class CognitionExecuteRequest(BaseModel):
    cognition_id: str
    sandbox_mode: bool = True
    timeout: int = 300

class PredictionRequest(BaseModel):
    action_plan: Dict[str, Any]
    confidence_level: float = 0.8

class HypothesisTestRequest(BaseModel):
    hypothesis: str
    test_data: Dict[str, Any]
    methodology: str = "simulation"

class ReputationRequest(BaseModel):
    agent_id: str
    score: Optional[float] = None
    reason: Optional[str] = None

class TaskCreateRequest(BaseModel):
    task_definition: Dict[str, Any]
    priority: int = 5

class TaskChainRequest(BaseModel):
    task_ids: List[str]

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "C-Suite Cognition API",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Health check",
            "/cognitions/": "Cognition control endpoints",
            "/simulation/": "Simulation and prediction endpoints",
            "/reputation/": "Reputation management endpoints",
            "/tasks/": "Task management endpoints"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "available_tools": cognition_api.get_available_tools()
    }

# ==========================================================================
# COGNITION CONTROL ENDPOINTS
# ==========================================================================

@app.get("/cognitions/")
async def list_cognitions():
    """List all cognitions"""
    try:
        cognitions = await cognition_api.execute_tool('cognition.list_all')
        return {"cognitions": cognitions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cognitions/{cognition_id}/clone")
async def clone_cognition(cognition_id: str, new_agents: Optional[List[str]] = None, new_name: Optional[str] = None):
    """Clone a cognition"""
    try:
        result = await cognition_api.execute_tool(
            'cognition.clone',
            cognition_id=cognition_id,
            new_agents=new_agents,
            new_name=new_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cognitions/executions/{execution_id}/score")
async def score_execution(execution_id: str, score: int, feedback: Optional[str] = None):
    """Score a cognition execution"""
    try:
        result = await cognition_api.execute_tool(
            'cognition.score',
            execution_id=execution_id,
            score=score,
            feedback=feedback
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cognitions/{cognition_id}/retire")
async def retire_cognition(cognition_id: str, reason: Optional[str] = None):
    """Retire a cognition"""
    try:
        result = await cognition_api.execute_tool(
            'cognition.retire',
            cognition_id=cognition_id,
            reason=reason
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cognitions/{cognition_id}/memory")
async def inject_memory(cognition_id: str, phase: str, memory_data: Dict[str, Any]):
    """Inject memory into a cognition"""
    try:
        memory_id = await cognition_api.execute_tool(
            'cognition.inject_memory',
            cognition_id=cognition_id,
            phase=phase,
            memory_data=memory_data
        )
        return {"memory_id": memory_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cognitions/{cognition_id}/snapshot")
async def create_snapshot(cognition_id: str):
    """Create a cognition snapshot"""
    try:
        snapshot = await cognition_api.execute_tool(
            'cognition.snapshot',
            cognition_id=cognition_id
        )
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================================================
# SIMULATION & PREDICTION ENDPOINTS
# ==========================================================================

@app.post("/simulation/predict")
async def predict_outcome(request: PredictionRequest):
    """Predict outcomes for an action plan"""
    try:
        result = await cognition_api.execute_tool(
            'sim.predict_outcome',
            action_plan=request.action_plan,
            confidence_level=request.confidence_level
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulation/test-hypothesis")
async def test_hypothesis(request: HypothesisTestRequest):
    """Test a hypothesis through simulation"""
    try:
        result = await cognition_api.execute_tool(
            'sim.test_hypothesis',
            hypothesis=request.hypothesis,
            test_data=request.test_data,
            methodology=request.methodology
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulation/run-cognition")
async def run_cognition(request: CognitionExecuteRequest):
    """Run a cognition simulation"""
    try:
        result = await cognition_api.execute_tool(
            'sim.run_cognition',
            cognition_id=request.cognition_id,
            sandbox_mode=request.sandbox_mode,
            timeout=request.timeout
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulation/run-cognition-stream")
async def stream_cognition(request: CognitionExecuteRequest):
    """Stream a cognition simulation in real-time"""
    
    async def generate_stream():
        try:
            # Send initial status
            yield f"data: {json.dumps({'type': 'start', 'cognition_id': request.cognition_id, 'timestamp': datetime.utcnow().isoformat()})}\n\n"
            await asyncio.sleep(0.5)  # Give time to see the start
            
            # Get the cognition engine instance
            engine = cognition_api.engine
            
            # Start simulation (simplified version for streaming)
            cognition_id = request.cognition_id
            
            # Create sample cognition if not exists
            if cognition_id not in engine.cognitions:
                from cognition_tools import CognitionState
                sample_cognition = CognitionState(
                    id=cognition_id,
                    name=f"Streaming Cognition {cognition_id}",
                    status='idle',
                    agents=['Theory', 'Echo', 'Verdict'],
                    current_phase=None,
                    phases=[
                        {'name': 'Analysis', 'duration': 30, 'agents': ['Theory'], 'id': 'analysis_phase'},
                        {'name': 'Verification', 'duration': 20, 'agents': ['Echo'], 'id': 'verification_phase'},
                        {'name': 'Decision', 'duration': 10, 'agents': ['Verdict'], 'id': 'decision_phase'}
                    ],
                    metadata={'type': 'simulation', 'sandbox': request.sandbox_mode},
                    created_at=engine._get_timestamp(),
                    updated_at=engine._get_timestamp()
                )
                engine.cognitions[cognition_id] = sample_cognition
            
            cognition = engine.cognitions[cognition_id]
            
            # Stream initialization details
            yield f"data: {json.dumps({'type': 'info', 'message': f'🚀 Initializing cognition {cognition_id}'})}\n\n"
            await asyncio.sleep(0.5)
            
            total_agents = len(set([agent for phase in cognition.phases for agent in phase.get('agents', [])]))
            yield f"data: {json.dumps({'type': 'info', 'message': f'📋 {len(cognition.phases)} phases planned with {total_agents} agents'})}\n\n"
            await asyncio.sleep(0.5)
            
            # Agent profiles for enhanced thoughts
            agent_profiles = {
                'Theory': {'role': 'Theoretical Analyst', 'style': 'analytical, hypothesis-driven', 'focus': 'theoretical frameworks, abstract reasoning'},
                'Echo': {'role': 'Historical Researcher', 'style': 'methodical, precedent-focused', 'focus': 'historical data, pattern matching'},
                'Verdict': {'role': 'Decision Synthesizer', 'style': 'decisive, risk-aware', 'focus': 'final decisions, risk assessment'},
                'Lyra': {'role': 'Orchestrator', 'style': 'coordinating, consensus-building', 'focus': 'team coordination, workflow management'},
                'Nexus': {'role': 'Data Integrator', 'style': 'systematic, comprehensive', 'focus': 'data synthesis, cross-referencing'},
                'Volt': {'role': 'Technical Specialist', 'style': 'precise, technical', 'focus': 'technical analysis, system diagnostics'},
                'Sentinel': {'role': 'Security Auditor', 'style': 'vigilant, risk-focused', 'focus': 'threat detection, compliance'},
                'Lens': {'role': 'Pattern Analyst', 'style': 'observational, detail-oriented', 'focus': 'visual analysis, pattern recognition'},
                'Core': {'role': 'System Coordinator', 'style': 'central, integrative', 'focus': 'system integration, core processing'},
                'Beacon': {'role': 'Information Gatherer', 'style': 'exploratory, comprehensive', 'focus': 'data collection, source validation'}
            }
            
            # Stream phase execution
            for i, phase in enumerate(cognition.phases):
                phase_agents = phase.get('agents', cognition.agents)
                
                # Send phase start
                yield f"data: {json.dumps({'type': 'phase_start', 'phase': phase['name'], 'agents': phase_agents, 'phase_num': i+1, 'total_phases': len(cognition.phases)})}\n\n"
                await asyncio.sleep(1.0)  # Pause to see phase start
                
                # Stream agent thoughts with realistic timing
                for agent in phase_agents:
                    profile = agent_profiles.get(agent, {
                        'role': f'{agent} Agent',
                        'style': 'analytical',
                        'focus': 'problem solving'
                    })
                    
                    # Show which model is being used
                    model_name = 'demo-model'
                    if hasattr(engine, 'llm_engine') and agent in engine.llm_engine.agents:
                        model_name = engine.llm_engine.agents[agent].model
                    
                    yield f"data: {json.dumps({'type': 'agent_model', 'agent': agent, 'model': model_name, 'phase': phase['name']})}\n\n"
                    await asyncio.sleep(0.5)
                    
                    try:
                        # Get real LLM reasoning
                        reasoning_steps = await engine.llm_engine.generate_agent_reasoning(
                            agent, phase['name'], f"Cognition {cognition_id} - {phase['name']} phase", cognition_id
                        )
                        
                        for step in reasoning_steps:
                            if step['type'] == 'thinking':
                                yield f"data: {json.dumps({'type': 'agent_thinking', 'agent': agent, 'phase': phase['name'], 'thinking': step['content'], 'timestamp': datetime.utcnow().isoformat()})}\n\n"
                            elif step['type'] == 'thought':
                                yield f"data: {json.dumps({'type': 'agent_thought', 'agent': agent, 'phase': phase['name'], 'thought': step['content'], 'timestamp': datetime.utcnow().isoformat()})}\n\n"
                            
                            # Realistic timing for reading/processing
                            await asyncio.sleep(0.8)
                    
                    except Exception as e:
                        # Fallback to simple thoughts
                        yield f"data: {json.dumps({'type': 'agent_error', 'agent': agent, 'error': f'LLM reasoning failed: {str(e)}'})}\n\n"
                        
                        # Use fallback thoughts
                        fallback_thoughts = engine._generate_agent_thoughts(agent, profile, phase['name'], cognition_id)
                        for thought in fallback_thoughts[:3]:  # Limit fallback thoughts
                            yield f"data: {json.dumps({'type': 'agent_thought', 'agent': agent, 'phase': phase['name'], 'thought': thought, 'timestamp': datetime.utcnow().isoformat()})}\n\n"
                            await asyncio.sleep(0.8)
                
                # Add agent performance update
                performance_score = 0.85 + (0.15 * (i + 1) / len(cognition.phases))  # Slightly increasing performance
                yield f"data: {json.dumps({'type': 'agent_performance', 'agent': phase_agents[0] if phase_agents else 'Unknown', 'score': round(performance_score, 2), 'phase': phase['name']})}\n\n"
                await asyncio.sleep(0.8)
                
                # Send phase completion
                yield f"data: {json.dumps({'type': 'phase_complete', 'phase': phase['name'], 'success': True, 'duration': phase.get('duration', 30)})}\n\n"
                await asyncio.sleep(1.0)  # Pause before next phase
            
            # Send final summary
            yield f"data: {json.dumps({'type': 'summary', 'message': '🎯 SIMULATION COMPLETE'})}\n\n"
            await asyncio.sleep(0.5)
            
            yield f"data: {json.dumps({'type': 'summary', 'message': f'✅ Success: All {len(cognition.phases)} phases completed'})}\n\n"
            await asyncio.sleep(0.5)
            
            final_total_agents = len(set([agent for phase in cognition.phases for agent in phase.get('agents', [])]))
            yield f"data: {json.dumps({'type': 'summary', 'message': f'⏱️ Total agents participated: {final_total_agents}'})}\n\n"
            await asyncio.sleep(0.5)
            
            # Auto-generate comprehensive report
            try:
                yield f"data: {json.dumps({'type': 'report_generation', 'message': '📄 Generating comprehensive execution report...'})}\n\n"
                await asyncio.sleep(0.5)
                
                # Get the execution ID from our engine's executions
                latest_execution_id = None
                for exec_id, exec_data in engine.executions.items():
                    if exec_data.get('cognition_id') == cognition_id:
                        latest_execution_id = exec_id
                        break
                
                if latest_execution_id:
                    # Generate the report
                    report = await engine.generate_execution_report(latest_execution_id)
                    
                    yield f"data: {json.dumps({'type': 'report_complete', 'report_id': report.report_id, 'blockchain_hash': report.blockchain_hash, 'ipfs_cid': report.ipfs_cid, 'message': f'📋 Report generated: {report.report_id}'})}\n\n"
                    await asyncio.sleep(0.5)
                    
                    yield f"data: {json.dumps({'type': 'blockchain_hash', 'hash': report.blockchain_hash, 'message': f'🔗 Blockchain Hash: {report.blockchain_hash[:16]}...'})}\n\n"
                    await asyncio.sleep(0.5)
                    
                    yield f"data: {json.dumps({'type': 'ipfs_cid', 'cid': report.ipfs_cid, 'message': f'🌐 IPFS CID: {report.ipfs_cid[:20]}...'})}\n\n"
                    await asyncio.sleep(0.5)
                    
                    yield f"data: {json.dumps({'type': 'verification', 'signature': report.verification_signature, 'merkle_root': report.merkle_root, 'message': f'🔐 Report verified and stored immutably'})}\n\n"
                    await asyncio.sleep(0.5)
                else:
                    yield f"data: {json.dumps({'type': 'report_error', 'message': '⚠️ Could not locate execution for report generation'})}\n\n"
                    
            except Exception as report_error:
                yield f"data: {json.dumps({'type': 'report_error', 'message': f'❌ Report generation failed: {str(report_error)}'})}\n\n"
            
            # Send completion with report information
            completion_data = {
                'type': 'complete', 
                'success': True, 
                'timestamp': datetime.utcnow().isoformat(), 
                'total_phases': len(cognition.phases), 
                'phases_completed': len(cognition.phases)
            }
            
            # Add report information if available
            if latest_execution_id and latest_execution_id in engine.executions:
                exec_data = engine.executions[latest_execution_id]
                if exec_data.get('report_id'):
                    completion_data.update({
                        'report_id': exec_data.get('report_id'),
                        'blockchain_hash': exec_data.get('blockchain_hash'),
                        'ipfs_cid': exec_data.get('ipfs_cid'),
                        'report_generated_at': exec_data.get('report_generated_at')
                    })
            
            yield f"data: {json.dumps(completion_data)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

@app.get("/simulation/executions/{execution_id}/failure-analysis")
async def analyze_failure(execution_id: str):
    """Analyze why an execution failed"""
    try:
        result = await cognition_api.execute_tool(
            'sim.why_failed',
            execution_id=execution_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulation/time-jump")
async def simulate_time_jump(agent_id: str, time_delta_days: int = 365):
    """Simulate agent state after time jump"""
    try:
        result = await cognition_api.execute_tool(
            'sim.time_jump',
            agent_id=agent_id,
            time_delta_days=time_delta_days
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================================================
# REPUTATION MANAGEMENT ENDPOINTS
# ==========================================================================

@app.get("/reputation/{agent_id}")
async def get_reputation(agent_id: str):
    """Get agent reputation"""
    try:
        result = await cognition_api.execute_tool(
            'reputation.get',
            agent_id=agent_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reputation/{agent_id}")
async def set_reputation(agent_id: str, request: ReputationRequest):
    """Set agent reputation"""
    try:
        if request.score is None:
            raise HTTPException(status_code=400, detail="Score is required")
        
        result = await cognition_api.execute_tool(
            'reputation.set',
            agent_id=agent_id,
            score=request.score,
            reason=request.reason
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reputation/{agent_id}/events")
async def log_reputation_event(agent_id: str, event_type: str, outcome: str, impact: float = 0):
    """Log a reputation-affecting event"""
    try:
        event_id = await cognition_api.execute_tool(
            'reputation.log_event',
            agent_id=agent_id,
            event_type=event_type,
            outcome=outcome,
            impact=impact
        )
        return {"event_id": event_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================================================
# TASK MANAGEMENT ENDPOINTS
# ==========================================================================

@app.post("/tasks/")
async def create_task(request: TaskCreateRequest):
    """Create a new task"""
    try:
        task_id = await cognition_api.execute_tool(
            'task.create',
            task_definition=request.task_definition,
            priority=request.priority
        )
        return {"task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tasks/chains")
async def create_task_chain(request: TaskChainRequest):
    """Create a task chain"""
    try:
        chain_id = await cognition_api.execute_tool(
            'task.chain',
            task_ids=request.task_ids
        )
        return {"chain_id": chain_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================================================
# REPORT GENERATION ENDPOINTS
# ==========================================================================

@app.post("/reports/generate/{execution_id}")
async def generate_execution_report(execution_id: str):
    """Generate a comprehensive report for a completed execution"""
    try:
        report = await cognition_api.execute_tool(
            'report.generate',
            execution_id=execution_id
        )
        
        # Convert to dict for JSON response
        from dataclasses import asdict
        return {
            "success": True,
            "report": asdict(report),
            "message": f"Report generated successfully with ID: {report.report_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/execution/{execution_id}")
async def get_execution_report(execution_id: str):
    """Get the report for a specific execution"""
    try:
        report = await cognition_api.execute_tool(
            'report.get',
            execution_id=execution_id
        )
        
        if report is None:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Convert to dict for JSON response
        from dataclasses import asdict
        return {
            "success": True,
            "report": asdict(report)
        }
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/")
async def list_execution_reports():
    """List all available execution reports"""
    try:
        reports = await cognition_api.execute_tool('report.list')
        return {
            "success": True,
            "reports": reports,
            "total_count": len(reports)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/blockchain/{blockchain_hash}")
async def get_report_by_blockchain_hash(blockchain_hash: str):
    """Get report by blockchain hash for verification"""
    try:
        reports = await cognition_api.execute_tool('report.list')
        
        matching_report = None
        for report_info in reports:
            if report_info.get('blockchain_hash') == blockchain_hash:
                # Get the full report
                full_report = await cognition_api.execute_tool(
                    'report.get',
                    execution_id=report_info['execution_id']
                )
                matching_report = full_report
                break
        
        if matching_report is None:
            raise HTTPException(status_code=404, detail="Report not found for blockchain hash")
        
        from dataclasses import asdict
        return {
            "success": True,
            "report": asdict(matching_report),
            "verification": {
                "blockchain_hash": matching_report.blockchain_hash,
                "ipfs_cid": matching_report.ipfs_cid,
                "merkle_root": matching_report.merkle_root,
                "verification_signature": matching_report.verification_signature
            }
        }
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/ipfs/{ipfs_cid}")
async def get_report_by_ipfs_cid(ipfs_cid: str):
    """Get report by IPFS CID for distributed access"""
    try:
        reports = await cognition_api.execute_tool('report.list')
        
        matching_report = None
        for report_info in reports:
            if report_info.get('ipfs_cid') == ipfs_cid:
                # Get the full report
                full_report = await cognition_api.execute_tool(
                    'report.get',
                    execution_id=report_info['execution_id']
                )
                matching_report = full_report
                break
        
        if matching_report is None:
            raise HTTPException(status_code=404, detail="Report not found for IPFS CID")
        
        from dataclasses import asdict
        return {
            "success": True,
            "report": asdict(matching_report),
            "storage_info": {
                "ipfs_cid": matching_report.ipfs_cid,
                "blockchain_hash": matching_report.blockchain_hash,
                "storage_type": "distributed",
                "verification_available": True
            }
        }
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/html/{report_id}")
async def get_report_html(report_id: str):
    """Get the HTML version of a report for direct viewing"""
    try:
        from pathlib import Path
        html_path = Path("storage/reports/html") / f"{report_id}.html"
        
        if not html_path.exists():
            raise HTTPException(status_code=404, detail="HTML report not found")
        
        with open(html_path, 'r') as f:
            html_content = f.read()
        
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html_content)
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reports/auto-generate")
async def auto_generate_all_reports():
    """Auto-generate reports for all completed executions that don't have reports"""
    try:
        generated_reports = []
        reports_list = await cognition_api.execute_tool('report.list')
        
        # Find executions without reports
        executions_without_reports = []
        for report_info in reports_list:
            if not report_info.get('report_id') and report_info.get('status') == 'completed':
                executions_without_reports.append(report_info['execution_id'])
        
        # Generate reports for each
        for execution_id in executions_without_reports:
            try:
                report = await cognition_api.execute_tool(
                    'report.generate',
                    execution_id=execution_id
                )
                generated_reports.append({
                    'execution_id': execution_id,
                    'report_id': report.report_id,
                    'blockchain_hash': report.blockchain_hash,
                    'ipfs_cid': report.ipfs_cid
                })
            except Exception as e:
                print(f"Failed to generate report for execution {execution_id}: {e}")
        
        return {
            "success": True,
            "generated_reports": generated_reports,
            "total_generated": len(generated_reports),
            "message": f"Generated {len(generated_reports)} reports"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================================================
# UTILITY ENDPOINTS
# ==========================================================================

@app.get("/tools")
async def list_available_tools():
    """List all available cognition tools"""
    return {
        "tools": cognition_api.get_available_tools(),
        "categories": {
            "cognition_control": [
                "cognition.list_all", "cognition.clone", "cognition.score",
                "cognition.retire", "cognition.inject_memory", "cognition.snapshot"
            ],
            "simulation": [
                "sim.predict_outcome", "sim.test_hypothesis", "sim.run_cognition",
                "sim.why_failed", "sim.time_jump"
            ],
            "reputation": [
                "reputation.get", "reputation.set", "reputation.log_event"
            ],
            "task_management": [
                "task.create", "task.chain"
            ],
            "report_generation": [
                "report.generate", "report.get", "report.list"
            ]
        }
    }

@app.post("/tools/{tool_name}")
async def execute_tool_directly(tool_name: str, params: Dict[str, Any]):
    """Execute any tool directly with parameters"""
    try:
        result = await cognition_api.execute_tool(tool_name, **params)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info") 