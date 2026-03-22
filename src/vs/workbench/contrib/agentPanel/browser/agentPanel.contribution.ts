/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * AI Super Panel — Unified Activity Bar View
 *
 * Merges the Ai-first.md "AI Super Panel" concept with the Ai-second.md
 * "Permanent Agent Panel" foundation. The result is a single Copilot-style
 * side panel registered in the activity bar with:
 *
 *   ┌──────────────────────────────────────┐
 *   │  [Builder] [Chat] [API] [Traces] [DB] [Skills]   ← 70 % height tabs
 *   │  ─────────────────────────────────────           │
 *   │  Embedded terminal (xterm.js)         ← 30 % height
 *   └──────────────────────────────────────┘
 *
 * Sources:
 * - Ai-first.md  Phase 0 — AI Super Panel skeleton (tabs + terminal layout)
 * - Ai-second.md Phase 1 — Permanent Agent Panel (LangGraph + LangSmith)
 */

// ── View identifiers ────────────────────────────────────────────────────────
export const AI_SUPER_PANEL_VIEW_CONTAINER_ID = 'workbench.view.aiSuperPanel';
export const AI_SUPER_PANEL_VIEW_ID = 'workbench.view.aiSuperPanel.main';

/** @deprecated Use AI_SUPER_PANEL_VIEW_CONTAINER_ID */
export const AGENT_PANEL_VIEW_CONTAINER_ID = AI_SUPER_PANEL_VIEW_CONTAINER_ID;
/** @deprecated Use AI_SUPER_PANEL_VIEW_ID */
export const AGENT_PANEL_VIEW_ID = AI_SUPER_PANEL_VIEW_ID;

// ── Tab definitions (Ai-first.md Phase 0 §3) ───────────────────────────────
/**
 * The six tabs that live inside the AI Super Panel.
 *
 * From Ai-first.md:
 *   "Tabs inside the panel: Builder (open-swe), Chat (Copilot),
 *    API Caller, Traces (LangSmith), DB Middleware, Skills (hermes)."
 */
export const enum AISuperPanelTab {
	/** open-swe LangGraph builder / visualizer */
	Builder = 'builder',
	/** Copilot-style chat with sub-agents */
	Chat = 'chat',
	/** Endpoint caller + verify form */
	APICaller = 'apiCaller',
	/** LangSmith-style trace timeline */
	Traces = 'traces',
	/** Postgres / Neo4j / Vector DB middleware */
	DBMiddleware = 'dbMiddleware',
	/** Hermes skills grid + self-improvement */
	Skills = 'skills',
}

/**
 * Configuration for the AI Super Panel.
 *
 * Combines features from both blueprints:
 * - Ai-second.md: LangGraph visualizer, LangSmith traces, agent hot-reload
 * - Ai-first.md:  Copilot chat, API caller + verify, skills grid, embedded terminal
 */
export const AISuperPanelConfig = {
	id: AI_SUPER_PANEL_VIEW_CONTAINER_ID,
	title: 'AI Super Panel',
	icon: 'robot',
	storageId: 'workbench.aiSuperPanel.state',

	/** Layout ratio: tabs area vs embedded terminal */
	layout: {
		tabsHeightPercent: 70,
		terminalHeightPercent: 30,
	},

	/** Features carried forward from Ai-second.md */
	features: {
		langGraphVisualizer: true,
		langSmithTraces: true,
		agentHotReload: true,
	},

	/** New features from Ai-first.md */
	superPanelFeatures: {
		/** Phase 0 §4 — bottom terminal streams live output from any agent run */
		embeddedTerminal: true,
		/** Phase 1 §3 — API Caller with "Call & Verify" */
		apiCallerVerify: true,
		/** Phase 2 §1 — 28 sub-agent quick buttons */
		subAgentButtons: true,
		/** Phase 2 §2 — 116 skills searchable grid */
		skillsGrid: true,
		/** Phase 2 §3 — session-start, pre-tool-use, security-scan hooks */
		automatedHooks: true,
		/** Phase 3 §1 — memory search in every tab */
		memorySearch: true,
		/** Phase 3 §5 — silent self-improvement loop */
		selfImprovementLoop: true,
	},
} as const;

/** @deprecated Use AISuperPanelConfig */
export const AgentPanelConfig = AISuperPanelConfig;
