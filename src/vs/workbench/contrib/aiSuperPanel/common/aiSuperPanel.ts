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

export const AI_SUPER_PANEL_PHASE2_SUB_AGENTS = [
	'Security Reviewer',
	'Database Reviewer',
	'API Reviewer',
	'Frontend Reviewer',
	'Backend Reviewer',
	'Test Engineer',
	'Refactor Assistant',
	'Performance Optimizer',
	'Dependency Updater',
	'Docs Writer',
	'Bug Investigator',
	'Release Manager',
	'Schema Designer',
	'Migration Planner',
	'Observability Reviewer',
	'Accessibility Reviewer',
	'UX Reviewer',
	'Prompt Engineer',
	'Tooling Builder',
	'CI Fixer',
	'Incident Responder',
	'Lint Specialist',
	'Type Safety Reviewer',
	'Architecture Critic',
	'State Management Reviewer',
	'Integration Specialist',
	'E2E Tester',
	'Cost Optimizer',
] as const;

const AI_SUPER_PANEL_PHASE2_CORE_SKILLS = [
	'Security Scan',
	'Database Review',
	'API Contract Verification',
	'Schema Diff Analysis',
	'Dependency Audit',
	'Refactoring Plan',
	'Performance Profiling',
	'Prompt Hardening',
	'Accessibility Review',
	'Incident Triage',
	'Integration Test Design',
	'Release Checklist',
	'Telemetry Validation',
	'Regression Detection',
	'Code Ownership Mapping',
	'Observability Checklist',
] as const;

export const AI_SUPER_PANEL_PHASE2_SKILLS_TARGET_COUNT = 116;

const AI_SUPER_PANEL_PHASE2_SKILL_FILLER = Array.from(
	{ length: AI_SUPER_PANEL_PHASE2_SKILLS_TARGET_COUNT - AI_SUPER_PANEL_PHASE2_CORE_SKILLS.length },
	(_, index) => `Skill Library Item ${index + 1}`
);

export const AI_SUPER_PANEL_PHASE2_SKILLS: readonly string[] = [
	...AI_SUPER_PANEL_PHASE2_CORE_SKILLS,
	...AI_SUPER_PANEL_PHASE2_SKILL_FILLER,
];

export type AISuperPanelTab = typeof AI_SUPER_PANEL_PHASE0_TABS[number];
export type AISuperPanelSubAgent = typeof AI_SUPER_PANEL_PHASE2_SUB_AGENTS[number];

export function shouldShowPhase2SubAgentBar(tab: AISuperPanelTab): boolean {
	return tab === 'Builder' || tab === 'Chat';
}

export function shouldShowPhase2SkillsGrid(tab: AISuperPanelTab): boolean {
	return tab === 'Skills';
}

export function filterPhase2Skills(query: string, skills: readonly string[] = AI_SUPER_PANEL_PHASE2_SKILLS): readonly string[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) {
		return skills;
	}

	return skills.filter(skill => skill.toLowerCase().includes(normalized));
}

export type AISuperPanelCommand = 'runAgent' | 'callApi' | 'improveSkill' | 'createAutoPr' | 'spawnSubAgents';

export interface AISuperPanelCommandMessage {
	readonly command: AISuperPanelCommand;
	readonly tab: AISuperPanelTab;
	readonly source: 'aiSuperPanel';
	readonly endpointOrTask?: string;
}

export interface AISuperPanelCommandResult {
	readonly accepted: boolean;
	readonly message: string;
	readonly command: AISuperPanelCommand;
}

export interface AISuperPanelApiVerificationResult {
	readonly traceId: string;
	readonly checks: readonly string[];
}

export interface AISuperPanelTerminalCommandResult {
	readonly accepted: boolean;
	readonly output: readonly string[];
}
