"""
Omega AI-First IDE — Memory Integration (Hermes Memory System)

From Ai-first.md Phase 3 (hermes-agent integration):
  §1 — "Memory search (USER.md + AGENTS.md + trajectories) lives in a
        collapsible section inside every tab."
  §4 — "Chat now always includes full hermes user model + session memory."
  §5 — "Self-improvement loop runs silently after every terminal command
        and updates the panel in real time."

Provides a unified memory store that aggregates:
- USER.md     — persistent user preferences and learned behavior
- AGENTS.md   — agent capabilities, configurations, and constraints
- Trajectories — past execution traces for context-aware suggestions
"""

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger("omega.memory")


@dataclass
class MemoryEntry:
    """A single memory entry from any source."""
    source: str          # "USER.md", "AGENTS.md", or "trajectory"
    content: str         # The text content
    tags: list[str] = field(default_factory=list)
    timestamp: float = 0.0
    relevance_score: float = 0.0

    def matches(self, query: str) -> bool:
        """Simple keyword matching for search."""
        query_lower = query.lower()
        return (
            query_lower in self.content.lower()
            or any(query_lower in tag.lower() for tag in self.tags)
        )


class MemoryStore:
    """
    Unified memory store that aggregates USER.md, AGENTS.md, and trajectories.

    Ai-first.md Phase 3 §1: "Memory search lives in a collapsible section
    inside every tab."

    The store is loaded on session start and updated in real time as agents
    complete tasks and extract new patterns.
    """

    def __init__(self, workspace_root: str = "."):
        self._workspace = Path(workspace_root)
        self._entries: list[MemoryEntry] = []

    @property
    def entry_count(self) -> int:
        return len(self._entries)

    async def load(self) -> None:
        """Load all memory sources into the store."""
        self._entries.clear()
        await self._load_user_md()
        await self._load_agents_md()
        await self._load_trajectories()
        logger.info(f"Memory store loaded: {self.entry_count} entries")

    async def search(self, query: str, top_k: int = 10) -> list[dict[str, Any]]:
        """
        Search across all memory sources.

        Ai-first.md Phase 3 §1 — "Memory search (USER.md + AGENTS.md
        + trajectories) lives in a collapsible section inside every tab."
        """
        matches = [e for e in self._entries if e.matches(query)]
        matches.sort(key=lambda e: e.relevance_score, reverse=True)
        return [
            {
                "source": m.source,
                "content": m.content[:500],
                "tags": m.tags,
                "relevance": m.relevance_score,
            }
            for m in matches[:top_k]
        ]

    async def get_chat_context(self) -> dict[str, Any]:
        """
        Build the full memory context for chat interactions.

        Ai-first.md Phase 3 §4 — "Chat now always includes full hermes
        user model + session memory."
        """
        user_entries = [e for e in self._entries if e.source == "USER.md"]
        agent_entries = [e for e in self._entries if e.source == "AGENTS.md"]
        trajectory_entries = [e for e in self._entries if e.source == "trajectory"]

        return {
            "user_model": [e.content for e in user_entries],
            "agent_context": [e.content for e in agent_entries],
            "recent_trajectories": [e.content for e in trajectory_entries[-5:]],
        }

    async def add_trajectory(self, trace_summary: str, tags: list[str] | None = None) -> None:
        """
        Add a new trajectory entry from a completed agent run.

        Ai-first.md Phase 3 §5 — "Self-improvement loop runs silently
        after every terminal command and updates the panel in real time."
        """
        import time
        entry = MemoryEntry(
            source="trajectory",
            content=trace_summary,
            tags=tags or [],
            timestamp=time.time(),
            relevance_score=1.0,
        )
        self._entries.append(entry)
        logger.info(f"Added trajectory: {trace_summary[:80]}...")

    # ── Private loaders ──────────────────────────────────────────────────

    async def _load_user_md(self) -> None:
        """Load USER.md for persistent user preferences."""
        path = self._workspace / "USER.md"
        if path.exists():
            content = path.read_text()
            for section in content.split("\n## "):
                section = section.strip()
                if section:
                    self._entries.append(MemoryEntry(
                        source="USER.md",
                        content=section,
                        tags=["user", "preferences"],
                        relevance_score=0.8,
                    ))
            logger.info(f"Loaded USER.md ({len(content)} chars)")

    async def _load_agents_md(self) -> None:
        """Load AGENTS.md for agent capabilities and constraints."""
        path = self._workspace / "AGENTS.md"
        if path.exists():
            content = path.read_text()
            for section in content.split("\n## "):
                section = section.strip()
                if section:
                    self._entries.append(MemoryEntry(
                        source="AGENTS.md",
                        content=section,
                        tags=["agent", "capabilities"],
                        relevance_score=0.7,
                    ))
            logger.info(f"Loaded AGENTS.md ({len(content)} chars)")

    async def _load_trajectories(self) -> None:
        """Load past execution trajectories from .trajectories/ directory."""
        traj_dir = self._workspace / ".trajectories"
        if not traj_dir.exists():
            return

        for traj_file in sorted(traj_dir.glob("*.json"))[-50:]:  # last 50
            try:
                data = json.loads(traj_file.read_text())
                self._entries.append(MemoryEntry(
                    source="trajectory",
                    content=data.get("summary", ""),
                    tags=data.get("tags", []),
                    timestamp=data.get("timestamp", 0.0),
                    relevance_score=data.get("relevance", 0.5),
                ))
            except Exception as e:
                logger.error(f"Failed to load trajectory {traj_file}: {e}")

        logger.info(f"Loaded trajectories from .trajectories/")
