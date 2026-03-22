"""
Omega AI-First IDE — Trace Interceptor
Phase 3: The "Local LangSmith" (Observability)

Custom BaseCallbackHandler that intercepts every LLM call from any agent
(hermes, open-swe, etc.) and emits structured trace events. These events
are forwarded to the VS Code webview for real-time timeline visualization.
"""

import time
import uuid
import json
import logging
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Any

logger = logging.getLogger("omega.observability.trace")


class TraceEventType(str, Enum):
    """Types of trace events captured during agent execution."""
    LLM_START = "llm_start"
    LLM_END = "llm_end"
    LLM_ERROR = "llm_error"
    TOOL_START = "tool_start"
    TOOL_END = "tool_end"
    CHAIN_START = "chain_start"
    CHAIN_END = "chain_end"
    AGENT_ACTION = "agent_action"
    AGENT_FINISH = "agent_finish"


@dataclass
class TraceEvent:
    """A single trace event captured during agent execution."""
    event_type: TraceEventType
    timestamp: float = field(default_factory=time.time)
    trace_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    parent_id: str | None = None
    agent_name: str = ""
    model_name: str = ""
    input_data: dict[str, Any] = field(default_factory=dict)
    output_data: dict[str, Any] = field(default_factory=dict)
    duration_ms: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)
    # Deep linking: source file and line that triggered this call
    source_file: str | None = None
    source_line: int | None = None

    def to_json(self) -> str:
        return json.dumps(asdict(self), default=str)


class TraceCallbackHandler:
    """
    Intercepts LLM calls and emits structured trace events.

    This handler is designed to be attached to any LangChain/LangGraph agent
    to capture all interactions for observability. Events are collected in
    memory and can be streamed to the VS Code webview via WebSocket.

    Usage:
        handler = TraceCallbackHandler(agent_name="hermes")
        # Attach to LangChain/LangGraph agent callbacks
        # Events are automatically emitted and can be retrieved via get_events()
    """

    def __init__(self, agent_name: str = "unknown"):
        self.agent_name = agent_name
        self._events: list[TraceEvent] = []
        self._active_spans: dict[str, TraceEvent] = {}
        self._listeners: list[Any] = []

    @property
    def event_count(self) -> int:
        return len(self._events)

    def on_llm_start(self, model_name: str, prompts: list[str], **kwargs) -> str:
        """Called when an LLM call starts. Returns the trace_id for correlation."""
        event = TraceEvent(
            event_type=TraceEventType.LLM_START,
            agent_name=self.agent_name,
            model_name=model_name,
            input_data={"prompts": prompts},
            source_file=kwargs.get("source_file"),
            source_line=kwargs.get("source_line"),
        )
        self._active_spans[event.trace_id] = event
        self._emit(event)
        return event.trace_id

    def on_llm_end(self, trace_id: str, response: str, **kwargs) -> None:
        """Called when an LLM call completes."""
        start_event = self._active_spans.pop(trace_id, None)
        event = TraceEvent(
            event_type=TraceEventType.LLM_END,
            trace_id=trace_id,
            agent_name=self.agent_name,
            output_data={"response": response},
            duration_ms=(time.time() - start_event.timestamp) * 1000 if start_event else 0,
        )
        self._emit(event)

    def on_llm_error(self, trace_id: str, error: str, **kwargs) -> None:
        """Called when an LLM call fails."""
        self._active_spans.pop(trace_id, None)
        event = TraceEvent(
            event_type=TraceEventType.LLM_ERROR,
            trace_id=trace_id,
            agent_name=self.agent_name,
            output_data={"error": error},
        )
        self._emit(event)

    def on_tool_start(self, tool_name: str, input_data: dict, **kwargs) -> str:
        """Called when a tool invocation starts."""
        event = TraceEvent(
            event_type=TraceEventType.TOOL_START,
            agent_name=self.agent_name,
            input_data={"tool": tool_name, **input_data},
            source_file=kwargs.get("source_file"),
            source_line=kwargs.get("source_line"),
        )
        self._active_spans[event.trace_id] = event
        self._emit(event)
        return event.trace_id

    def on_tool_end(self, trace_id: str, output: Any, **kwargs) -> None:
        """Called when a tool invocation completes."""
        start_event = self._active_spans.pop(trace_id, None)
        event = TraceEvent(
            event_type=TraceEventType.TOOL_END,
            trace_id=trace_id,
            agent_name=self.agent_name,
            output_data={"output": str(output)},
            duration_ms=(time.time() - start_event.timestamp) * 1000 if start_event else 0,
        )
        self._emit(event)

    def get_events(self) -> list[dict[str, Any]]:
        """Return all captured events as serializable dicts."""
        return [asdict(e) for e in self._events]

    def get_events_json(self) -> str:
        """Return all events as a JSON string for the webview."""
        return json.dumps(self.get_events(), default=str)

    def add_listener(self, callback) -> None:
        """Register a listener for real-time event streaming."""
        self._listeners.append(callback)

    def _emit(self, event: TraceEvent) -> None:
        """Store event and notify all listeners."""
        self._events.append(event)
        logger.debug(f"Trace event: {event.event_type.value} [{event.agent_name}]")
        for listener in self._listeners:
            try:
                listener(event)
            except Exception as e:
                logger.error(f"Trace listener error: {e}")
