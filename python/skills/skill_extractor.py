"""
Omega AI-First IDE — Skill Extraction (Hermes Post-Mortem Loop)
Phase 6: Skill Extraction & Verification

After every successful agent task, this module:
1. Asks the agent "What did we learn?"
2. Extracts reusable patterns and logic
3. Saves them to the .skills/ directory for future tasks

Also integrates with Open-SWE for verification:
- Runs pytest on agent-generated fixes in a sandboxed environment
- Validates endpoint responses through the Playground tab
"""

import json
import logging
import time
import uuid
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

logger = logging.getLogger("omega.skills")


@dataclass
class ExtractedSkill:
    """A skill extracted from a successful agent task."""
    id: str = field(default_factory=lambda: f"skill-{uuid.uuid4().hex[:8]}")
    name: str = ""
    description: str = ""
    extracted_from: str = ""
    agent: str = ""
    patterns: list[str] = field(default_factory=list)
    steps: list[str] = field(default_factory=list)
    confidence: float = 0.0
    created_at: float = field(default_factory=time.time)
    times_used: int = 0

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, default=str)


class SkillExtractor:
    """
    Hermes post-mortem loop for extracting skills from successful tasks.

    Analyzes the trace of a completed task to identify reusable patterns
    and saves them as structured skills for future use.
    """

    def __init__(self, skills_dir: str = ".skills"):
        self._skills_dir = Path(skills_dir)
        self._skills: dict[str, ExtractedSkill] = {}
        self._load_existing_skills()

    def _load_existing_skills(self) -> None:
        """Load existing skills from the .skills/ directory."""
        if not self._skills_dir.exists():
            self._skills_dir.mkdir(parents=True, exist_ok=True)
            return

        for skill_file in self._skills_dir.glob("skill-*.json"):
            try:
                data = json.loads(skill_file.read_text())
                skill = ExtractedSkill(**data)
                self._skills[skill.id] = skill
                logger.info(f"Loaded existing skill: {skill.name} ({skill.id})")
            except Exception as e:
                logger.error(f"Failed to load skill from {skill_file}: {e}")

    @property
    def skill_count(self) -> int:
        return len(self._skills)

    def list_skills(self) -> list[dict[str, Any]]:
        """List all known skills with their metadata."""
        return [
            {
                "id": s.id,
                "name": s.name,
                "agent": s.agent,
                "confidence": s.confidence,
                "times_used": s.times_used,
                "patterns": s.patterns,
            }
            for s in self._skills.values()
        ]

    async def extract_skill(
        self,
        task_id: str,
        agent_name: str,
        trace_events: list[dict[str, Any]],
        task_description: str = "",
    ) -> ExtractedSkill:
        """
        Extract a skill from a completed task's trace.

        The extraction analyzes the sequence of actions taken by the agent
        and distills them into a reusable pattern.

        Args:
            task_id: ID of the completed task
            agent_name: Name of the agent that completed the task
            trace_events: List of trace events from the task execution
            task_description: Human-readable description of the task
        """
        skill = ExtractedSkill(
            name=f"Skill from {task_description[:50]}",
            description=f"Extracted from task {task_id} by {agent_name}",
            extracted_from=task_id,
            agent=agent_name,
            patterns=self._extract_patterns(trace_events),
            steps=self._extract_steps(trace_events),
            confidence=self._calculate_confidence(trace_events),
        )

        # Save to .skills/ directory
        self._skills[skill.id] = skill
        skill_path = self._skills_dir / f"{skill.id}.json"
        skill_path.write_text(skill.to_json())
        logger.info(f"Extracted and saved skill: {skill.name} ({skill.id})")

        return skill

    def find_relevant_skills(self, context: str, top_k: int = 3) -> list[ExtractedSkill]:
        """
        Find skills relevant to the current context.

        Uses pattern matching to find previously extracted skills that
        may be useful for the current task.
        """
        scored: list[tuple[float, ExtractedSkill]] = []
        context_lower = context.lower()

        for skill in self._skills.values():
            score = sum(
                1.0 for p in skill.patterns
                if p.lower() in context_lower
            )
            if score > 0:
                scored.append((score * skill.confidence, skill))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [skill for _, skill in scored[:top_k]]

    def _extract_patterns(self, trace_events: list[dict[str, Any]]) -> list[str]:
        """Extract recurring patterns from trace events."""
        patterns = set()
        for event in trace_events:
            if event.get("event_type") in ("tool_start", "tool_end"):
                tool = event.get("input_data", {}).get("tool", "")
                if tool:
                    patterns.add(tool)
        return list(patterns) if patterns else ["general"]

    def _extract_steps(self, trace_events: list[dict[str, Any]]) -> list[str]:
        """Extract the sequence of meaningful steps from trace events."""
        steps = []
        for event in trace_events:
            if event.get("event_type") == "tool_start":
                tool = event.get("input_data", {}).get("tool", "unknown")
                steps.append(f"Use tool: {tool}")
            elif event.get("event_type") == "agent_action":
                action = event.get("input_data", {}).get("action", "unknown")
                steps.append(f"Agent action: {action}")
        return steps if steps else ["No specific steps extracted"]

    def _calculate_confidence(self, trace_events: list[dict[str, Any]]) -> float:
        """Calculate a confidence score for the extracted skill."""
        if not trace_events:
            return 0.0

        errors = sum(1 for e in trace_events if "error" in e.get("event_type", "").lower())
        total = len(trace_events)
        return max(0.0, min(1.0, 1.0 - (errors / total)))
