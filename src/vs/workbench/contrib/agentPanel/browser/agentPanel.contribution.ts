/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Phase 1: The Foundation — Permanent Agent Panel
 *
 * This module registers the "Permanent Agent Panel" view container in the
 * VS Code workbench. The panel is designed to house the LangGraph visualizer
 * and LangSmith-style traces as described in the Omega AI-First IDE blueprint.
 *
 * The panel prioritizes persistent visibility over a collapsible sidebar,
 * providing a central hub for all AI agent interactions.
 */

// Agent Panel constants
export const AGENT_PANEL_VIEW_CONTAINER_ID = 'workbench.view.agentPanel';
export const AGENT_PANEL_VIEW_ID = 'workbench.view.agentPanel.main';

/**
 * Configuration for the Permanent Agent Panel.
 *
 * - Houses the LangGraph visualizer for agent workflow visualization
 * - Displays LangSmith-style traces for debugging and observability
 * - Serves as the primary interaction surface for AI agents
 */
export const AgentPanelConfig = {
	id: AGENT_PANEL_VIEW_CONTAINER_ID,
	title: 'Agent Panel',
	icon: 'robot',
	storageId: 'workbench.agentPanel.state',
	features: {
		langGraphVisualizer: true,
		langSmithTraces: true,
		agentHotReload: true,
	},
} as const;
