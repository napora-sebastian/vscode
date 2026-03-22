"""
Omega AI-First IDE — Persistent Agent Server
Phase 2: The "Brain" (Python-Node Middleware)

This FastAPI server launches on IDE startup and provides:
- JSON-RPC / WebSocket bridge between VS Code (TypeScript) and LangGraph agents (Python)
- Hot-reload support for agents defined in the workspace `.agents/` directory
- Agent registry for managing and routing to custom LangGraph agents
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import logging

from agents.registry import AgentRegistry

logger = logging.getLogger("omega.server")

# Global agent registry instance
agent_registry = AgentRegistry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load agents from .agents/ directory. Shutdown: cleanup."""
    logger.info("Omega Agent Server starting — loading agents from .agents/")
    await agent_registry.load_agents()
    yield
    logger.info("Omega Agent Server shutting down")
    await agent_registry.shutdown()


app = FastAPI(
    title="Omega Agent Server",
    description="Persistent middleware for the Omega AI-First IDE",
    version="0.1.0",
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

            if method == "agent/invoke":
                result = await agent_registry.invoke_agent(
                    agent_name=params.get("agent"),
                    context=params.get("context", {}),
                )
                await websocket.send_json({
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": result,
                })

            elif method == "agent/reload":
                await agent_registry.load_agents()
                await websocket.send_json({
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {"reloaded": True, "count": agent_registry.agent_count},
                })

            elif method == "context/file":
                # Receives current file context from the IDE
                result = await agent_registry.process_file_context(params)
                await websocket.send_json({
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": result,
                })

            else:
                await websocket.send_json({
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": {"code": -32601, "message": f"Method not found: {method}"},
                })

    except WebSocketDisconnect:
        logger.info("VS Code client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8765)
