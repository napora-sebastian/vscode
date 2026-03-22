/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const AI_SUPER_PANEL_VIEW_CONTAINER_ID = 'workbench.view.aiSuperPanel';
export const AI_SUPER_PANEL_VIEW_ID = 'workbench.view.aiSuperPanel.view';

export const AI_SUPER_PANEL_PHASE0_TABS = [
	'Builder',
	'Chat',
	'API Caller',
	'Traces',
	'DB Middleware',
	'Skills',
] as const;

export type AISuperPanelTab = typeof AI_SUPER_PANEL_PHASE0_TABS[number];

export type AISuperPanelCommand = 'runAgent' | 'callApi' | 'improveSkill';

export interface AISuperPanelCommandMessage {
	readonly command: AISuperPanelCommand;
	readonly tab: AISuperPanelTab;
	readonly source: 'aiSuperPanel';
}

export interface AISuperPanelCommandResult {
	readonly accepted: boolean;
	readonly message: string;
	readonly command: AISuperPanelCommand;
}
