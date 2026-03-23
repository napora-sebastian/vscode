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

/**
 * Phase 2 hook identifiers used by the AI Super Panel scaffold.
 * - session-start: runs when an interaction starts from the panel UI.
 * - pre-tool-use: runs before a command/tool call is dispatched.
 * - security-scan: runs as a lightweight security guardrail step.
 */
export const AI_SUPER_PANEL_PHASE2_HOOKS = [
	'session-start',
	'pre-tool-use',
	'security-scan',
] as const;

export const AI_SUPER_PANEL_PHASE2_HOOK_ACTIONS = [
	'runAgent',
	'callApi',
	'improveSkill',
	'createAutoPr',
	'spawnSubAgents',
	'subAgent',
	'terminalCommand',
] as const;

export const AI_SUPER_PANEL_SECURITY_REVIEWER_PASS = 'security-reviewer:pass';
export const AI_SUPER_PANEL_SECURITY_REVIEWER_FAIL = 'security-reviewer:fail';

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

export const AI_SUPER_PANEL_PHASE3_MEMORY_SOURCES = [
	'USER.md',
	'AGENTS.md',
	'trajectories',
] as const;

export interface AISuperPanelMemoryEntry {
	readonly source: typeof AI_SUPER_PANEL_PHASE3_MEMORY_SOURCES[number];
	readonly title: string;
	readonly snippet: string;
}

export const AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES: readonly AISuperPanelMemoryEntry[] = [
	{
		source: 'USER.md',
		title: 'Preferred Validation Commands',
		snippet: 'Run compile-check-ts-native before targeted AI Super Panel tests.',
	},
	{
		source: 'AGENTS.md',
		title: 'Agent Execution Safety',
		snippet: 'Keep changes minimal and validate with focused tests before reporting progress.',
	},
	{
		source: 'trajectories',
		title: 'Recent API Caller Outcome',
		snippet: 'Security Reviewer scan precedes API verify call and blocks on fail.',
	},
	{
		source: 'trajectories',
		title: 'Recent DB Middleware Pivot',
		snippet: 'Database Reviewer click auto-opens DB Middleware tab.',
	},
];

export type AISuperPanelTab = typeof AI_SUPER_PANEL_PHASE0_TABS[number];
export type AISuperPanelSubAgent = typeof AI_SUPER_PANEL_PHASE2_SUB_AGENTS[number];
export type AISuperPanelHookName = typeof AI_SUPER_PANEL_PHASE2_HOOKS[number];
export type AISuperPanelHookAction = typeof AI_SUPER_PANEL_PHASE2_HOOK_ACTIONS[number];

export function shouldShowPhase2SubAgentBar(tab: AISuperPanelTab): boolean {
	return tab === 'Builder' || tab === 'Chat';
}

export function shouldShowPhase2SkillsGrid(tab: AISuperPanelTab): boolean {
	return tab === 'Skills';
}

export function shouldAutoOpenDbMiddlewareForSubAgent(subAgent: AISuperPanelSubAgent): boolean {
	return subAgent === 'Database Reviewer';
}

export function filterPhase2Skills(query: string, skills: readonly string[] = AI_SUPER_PANEL_PHASE2_SKILLS): readonly string[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) {
		return skills;
	}

	return skills.filter(skill => skill.toLowerCase().includes(normalized));
}

export function filterPhase3MemoryEntries(query: string, entries: readonly AISuperPanelMemoryEntry[] = AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES): readonly AISuperPanelMemoryEntry[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) {
		return entries;
	}

	return entries.filter(entry => {
		return entry.source.toLowerCase().includes(normalized)
			|| entry.title.toLowerCase().includes(normalized)
			|| entry.snippet.toLowerCase().includes(normalized);
	});
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

export interface AISuperPanelHookResult {
	readonly hook: AISuperPanelHookName;
	readonly status: 'ok' | 'error' | 'pending';
	readonly action: AISuperPanelHookAction;
}
