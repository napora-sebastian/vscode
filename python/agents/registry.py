"""
Omega AI-First IDE — Agent Registry
Phase 2: The "Brain" (Python-Node Middleware)

Manages the lifecycle of LangGraph agents:
- Discovery: scans the workspace `.agents/` directory for agent definitions
- Hot-reload: watches for file changes and reloads agents automatically
- Invocation: routes requests from the IDE to the appropriate agent
"""

import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("omega.agents.registry")


class AgentRegistry:
    """
    Registry for managing custom LangGraph agents.

    Agents are defined as configuration files in the workspace `.agents/`
    directory and can be hot-reloaded without restarting the server.
    """

    def __init__(self):
        self._agents: dict[str, dict[str, Any]] = {}
        self._agents_dir: Path | None = None

    @property
    def agent_count(self) -> int:
        return len(self._agents)

    async def load_agents(self, agents_dir: str = ".agents") -> None:
        """
        Scan the .agents/ directory and load all agent configurations.
        Each agent is defined by a JSON or YAML file with its LangGraph definition.
        """
        self._agents_dir = Path(agents_dir)
        if not self._agents_dir.exists():
            logger.info(f"No .agents/ directory found at {agents_dir}, starting with empty registry")
            return

        for agent_file in self._agents_dir.glob("*.json"):
            try:
                import json
                config = json.loads(agent_file.read_text())
                agent_name = config.get("name", agent_file.stem)
                self._agents[agent_name] = {
                    "name": agent_name,
                    "config": config,
                    "source": str(agent_file),
                    "status": "loaded",
                }
                logger.info(f"Loaded agent: {agent_name} from {agent_file}")
            except Exception as e:
                logger.error(f"Failed to load agent from {agent_file}: {e}")

    def list_agents(self) -> list[dict[str, Any]]:
        """Return metadata for all registered agents."""
        return [
            {"name": a["name"], "status": a["status"], "source": a["source"]}
            for a in self._agents.values()
        ]

    async def invoke_agent(self, agent_name: str, context: dict[str, Any]) -> dict[str, Any]:
        """
        Invoke a named agent with the given context.

        Args:
            agent_name: The name of the agent to invoke
            context: The context to pass to the agent (file content, selection, etc.)

        Returns:
            The agent's response
        """
        if agent_name not in self._agents:
            return {"error": f"Agent '{agent_name}' not found in registry"}

        agent = self._agents[agent_name]
        logger.info(f"Invoking agent: {agent_name}")

        # Placeholder: In production, this would invoke the actual LangGraph agent
        return {
            "agent": agent_name,
            "status": "invoked",
            "context_received": bool(context),
        }

    async def process_file_context(self, params: dict[str, Any]) -> dict[str, Any]:
        """
        Process file context sent from the IDE.

        Args:
            params: File context including path, content, language, and selection
        """
        return {
            "received": True,
            "file": params.get("filePath", "unknown"),
            "language": params.get("languageId", "unknown"),
        }

    async def shutdown(self) -> None:
        """Clean up all loaded agents."""
        self._agents.clear()
        logger.info("Agent registry shut down")
