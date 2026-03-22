/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * AI Super Panel View Pane
 *
 * Renders the unified panel with the Ai-first.md tab layout and the
 * Ai-second.md agent infrastructure.  The pane is split:
 *   • Top 70 % — six switchable tabs (Builder, Chat, API Caller, Traces, DB Middleware, Skills)
 *   • Bottom 30 % — embedded xterm.js terminal streaming live agent output
 *
 * Sources:
 * - Ai-first.md  Phase 0   — tab layout + embedded terminal
 * - Ai-second.md Phase 1   — LangGraph + LangSmith view state
 */

import { AISuperPanelTab } from './agentPanel.contribution.js';

// ── Panel state ─────────────────────────────────────────────────────────────
export interface IAISuperPanelState {
	/** Whether the panel is currently visible */
	readonly isVisible: boolean;

	/** Currently active tab (Ai-first.md Phase 0 §3) */
	readonly activeTab: AISuperPanelTab;

	/** Connected agent server endpoint (Ai-second.md) */
	readonly serverEndpoint: string | undefined;

	/** Whether the embedded terminal is focused (Ai-first.md Phase 5 §2) */
	readonly terminalFocused: boolean;

	/** Memory search query visible across all tabs (Ai-first.md Phase 3 §1) */
	readonly memorySearchQuery: string;
}

/**
 * Default state for the AI Super Panel.
 */
export function createDefaultAISuperPanelState(): IAISuperPanelState {
	return {
		isVisible: false,
		activeTab: AISuperPanelTab.Builder,
		serverEndpoint: undefined,
		terminalFocused: false,
		memorySearchQuery: '',
	};
}

// ── Backward compatibility ──────────────────────────────────────────────────
/** @deprecated Use IAISuperPanelState */
export type IAgentPanelState = IAISuperPanelState;

/** @deprecated Use AISuperPanelTab */
export const AgentPanelTab = AISuperPanelTab;

/** @deprecated Use createDefaultAISuperPanelState */
export const createDefaultAgentPanelState = createDefaultAISuperPanelState;
