/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Permanent Agent Panel View Pane
 *
 * Renders the main agent panel content including:
 * - LangGraph agent workflow visualizer
 * - Real-time LangSmith-style trace display
 * - Agent configuration and hot-reload controls
 */
export interface IAgentPanelState {
	/** Whether the panel is currently visible */
	readonly isVisible: boolean;
	/** Currently active tab within the panel */
	readonly activeTab: AgentPanelTab;
	/** Connected agent server endpoint */
	readonly serverEndpoint: string | undefined;
}

export const enum AgentPanelTab {
	/** LangGraph workflow visualizer */
	Visualizer = 'visualizer',
	/** LangSmith-style trace timeline */
	Traces = 'traces',
	/** Agent configuration and hot-reload */
	AgentConfig = 'agentConfig',
}

/**
 * Default state for the Agent Panel.
 */
export function createDefaultAgentPanelState(): IAgentPanelState {
	return {
		isVisible: false,
		activeTab: AgentPanelTab.Visualizer,
		serverEndpoint: undefined,
	};
}
