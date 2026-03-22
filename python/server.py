"""
Omega AI-First IDE — Persistent Agent Server
Phase 2: The "Brain" (Python-Node Middleware)
Enhanced with Ai-first.md features: sub-agents, hooks, memory, API caller

This FastAPI server launches on IDE startup and provides:
- JSON-RPC / WebSocket bridge between VS Code (TypeScript) and LangGraph agents (Python)
- Hot-reload support for agents defined in the workspace `.agents/` directory
- Agent registry for managing and routing to custom LangGraph agents
- Memory search across USER.md, AGENTS.md, and trajectories (Ai-first.md Phase 3)
- Sub-agent invocation and hook execution (Ai-first.md Phase 2)
- API endpoint call & verify (Ai-first.md Phase 4)
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import logging

from agents.registry import AgentRegistry
from memory.memory_store import MemoryStore
from observability.trace_interceptor import TraceCallbackHandler
from skills.skill_extractor import SkillExtractor

logger = logging.getLogger("omega.server")

# Global instances
agent_registry = AgentRegistry()
memory_store = MemoryStore()
trace_handler = TraceCallbackHandler(agent_name="server")
skill_extractor = SkillExtractor()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load agents + memory. Shutdown: cleanup."""
    logger.info("Omega Agent Server starting — loading agents and memory")
    await agent_registry.load_agents()
    await memory_store.load()
    yield
    logger.info("Omega Agent Server shutting down")
    await agent_registry.shutdown()


app = FastAPI(
    title="Omega Agent Server",
    description="Persistent middleware for the Omega AI-First IDE (Ai-first + Ai-second)",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint for the IDE to verify server status."""
    return {
        "status": "ok",
        "agents_loaded": agent_registry.agent_count,
        "memory_entries": memory_store.entry_count,
        "skills_loaded": skill_extractor.skill_count,
    }


@app.get("/agents")
async def list_agents():
    """List all registered agents with their metadata."""
    return {"agents": agent_registry.list_agents()}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for JSON-RPC communication with VS Code.

    Supports bidirectional messaging:
    - IDE → Server: agent invocations, file context, configuration changes
    - Server → IDE: agent responses, trace events, status updates

    New methods from Ai-first.md integration:
    - memory/search   — search USER.md + AGENTS.md + trajectories (Phase 3)
    - memory/context   — get full chat context with hermes memory (Phase 3)
    - memory/trajectory — record a new trajectory entry (Phase 3)
    - skills/list      — list all learned skills (Phase 2)
    - skills/search    — find relevant skills for context (Phase 2)
    - api/call         — call & verify an external endpoint (Phase 4)
    """
    await websocket.accept()
    logger.info("VS Code client connected via WebSocket")

    try:
        while True:
            raw = await websocket.receive_text()
            message = json.loads(raw)

            method = message.get("method", "")
            params = message.get("params", {})
            msg_id = message.get("id")

            result = await _handle_method(method, params)

            if "error" in result:
                await websocket.send_json({
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": result["error"],
                })
            else:
                await websocket.send_json({
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": result,
                })

    except WebSocketDisconnect:
        logger.info("VS Code client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")


async def _handle_method(method: str, params: dict) -> dict:
    """Route a JSON-RPC method to the appropriate handler."""

    # ── Original Ai-second.md methods ────────────────────────────────────
    if method == "agent/invoke":
        return await agent_registry.invoke_agent(
            agent_name=params.get("agent"),
            context=params.get("context", {}),
        )

    if method == "agent/reload":
        await agent_registry.load_agents()
        return {"reloaded": True, "count": agent_registry.agent_count}

    if method == "context/file":
        return await agent_registry.process_file_context(params)

    # ── Ai-first.md Phase 3 — Memory methods ────────────────────────────
    if method == "memory/search":
        return {
            "results": await memory_store.search(
                query=params.get("query", ""),
                top_k=params.get("topK", 10),
            )
        }

    if method == "memory/context":
        return await memory_store.get_chat_context()

    if method == "memory/trajectory":
        await memory_store.add_trajectory(
            trace_summary=params.get("summary", ""),
            tags=params.get("tags"),
        )
        return {"recorded": True}

    # ── Ai-first.md Phase 2 — Skills methods ────────────────────────────
    if method == "skills/list":
        return {"skills": skill_extractor.list_skills()}

    if method == "skills/search":
        skills = skill_extractor.find_relevant_skills(
            context=params.get("context", ""),
            top_k=params.get("topK", 3),
        )
        return {"skills": [{"id": s.id, "name": s.name, "confidence": s.confidence} for s in skills]}

    # ── Ai-first.md Phase 4 — API Caller method ─────────────────────────
    if method == "api/call":
        # Placeholder: in production, would make the actual HTTP call,
        # run verify checks, and record the trace
        return {
            "endpoint": params.get("url", ""),
            "method": params.get("method", "GET"),
            "status": "call_pending — HTTP client integration needed",
            "traceId": "",
        }

    # ── Unknown method ───────────────────────────────────────────────────
    return {"error": {"code": -32601, "message": f"Method not found: {method}"}}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8765)
