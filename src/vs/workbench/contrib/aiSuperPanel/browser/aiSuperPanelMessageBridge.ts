/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { AISuperPanelApiVerificationResult, AISuperPanelCommand, AISuperPanelCommandMessage, AISuperPanelCommandResult, AISuperPanelDbConnectionResult, AISuperPanelDbProvider, AISuperPanelHermesUserModel, AISuperPanelHookAction, AISuperPanelHookResult, AISuperPanelMemoryEntry, AISuperPanelSubAgent, AISuperPanelTerminalCommandResult, AI_SUPER_PANEL_PHASE2_HOOKS, AI_SUPER_PANEL_PHASE2_SKILLS, AI_SUPER_PANEL_PHASE2_SUB_AGENTS, AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES, AI_SUPER_PANEL_SECURITY_REVIEWER_FAIL, AI_SUPER_PANEL_SECURITY_REVIEWER_PASS, filterPhase2Skills, filterPhase3MemoryEntries } from '../common/aiSuperPanel.js';

const DEFAULT_TASK = 'defaultTask';
const DEFAULT_ENDPOINT = 'defaultEndpoint';
/**
 * Deterministic scaffold trigger for failure-path UI wiring and tests.
 * Real security scans should report actual validation outcomes instead.
 */
const SECURITY_SCAN_FAILURE_PATTERN = /\bfail\b/i;

class AISuperPanelMessageBridge extends Disposable {

	private readonly _onDidSendMessage = this._register(new Emitter<AISuperPanelCommandMessage>());
	readonly onDidSendMessage = this._onDidSendMessage.event;
	private _latestTraceId: string | undefined;
	private readonly _phase3DerivedSkills = new Set<string>();
	private readonly _phase3HermesUserModel: AISuperPanelHermesUserModel = {
		profile: 'AI-first IDE builder',
		workflow: 'Prefer focused, validated, minimal-change iterations',
		improvementLoop: 'Learn from traces and convert successful patterns into reusable skills',
	};

	constructor() {
		super();
	}

	sendMessage(message: AISuperPanelCommandMessage): AISuperPanelCommandResult {
		this._onDidSendMessage.fire(message);
		return {
			accepted: true,
			message: `Queued ${message.command} for backend handling.`,
			command: message.command,
		};
	}

	/**
	 * Phase 1 scaffold for Builder tab graph loading.
	 * This currently returns deterministic placeholder stages that emulate parsing langgraph.json.
	 * A later phase should replace this with real graph file loading and model mapping.
	 */
	loadBuilderGraph(): string[] {
		// Phase 1 scaffold: local graph steps as lightweight stand-in for langgraph.json integration
		return [
			'load:langgraph.json',
			'resolve:nodes',
			'resolve:edges',
			'ready:builder-graph',
		];
	}

	runBuilderTask(task: string): string[] {
		const normalizedTask = task.trim() || DEFAULT_TASK;
		this._latestTraceId = `trace:run:${normalizedTask.replace(/\s+/g, '-').toLowerCase()}`;
		return [
			`openswe:start:${normalizedTask}`,
			'openswe:plan',
			'openswe:execute',
			'openswe:verify',
			'openswe:done',
		];
	}

	getPostRunActions(): readonly AISuperPanelCommand[] {
		return [
			'createAutoPr',
			'spawnSubAgents',
		];
	}

	getPhase2SubAgents(): readonly AISuperPanelSubAgent[] {
		return AI_SUPER_PANEL_PHASE2_SUB_AGENTS;
	}

	getPhase2Skills(query = ''): readonly string[] {
		const allSkills = [...AI_SUPER_PANEL_PHASE2_SKILLS, ...this._phase3DerivedSkills];
		return filterPhase2Skills(query, allSkills);
	}

	getPhase3MemoryEntries(query = ''): readonly AISuperPanelMemoryEntry[] {
		return filterPhase3MemoryEntries(query, AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES);
	}

	getPhase3HermesChatContext(): {
		readonly userModel: AISuperPanelHermesUserModel;
		readonly sessionMemory: readonly AISuperPanelMemoryEntry[];
		readonly serializedContext: string;
	} {
		const sessionMemory = this.getPhase3MemoryEntries('');
		return {
			userModel: this._phase3HermesUserModel,
			sessionMemory,
			serializedContext: JSON.stringify({
				userModel: this._phase3HermesUserModel,
				sessionMemory,
			}),
		};
	}

	/**
	 * Phase 2 scaffold for hook execution.
	 * This returns deterministic synchronous "ok" hook results for UI wiring and tests.
	 * A production implementation should execute hooks asynchronously and surface failures.
	 */
	runPhase2Hooks(action: AISuperPanelHookAction): readonly AISuperPanelHookResult[] {
		return AI_SUPER_PANEL_PHASE2_HOOKS.map(hook => ({
			hook,
			status: 'ok',
			action,
		}));
	}

	callAndVerify(endpointOrTask: string): AISuperPanelApiVerificationResult {
		const normalized = endpointOrTask.trim() || DEFAULT_ENDPOINT;
		this._latestTraceId = `trace:${normalized.replace(/\s+/g, '-').toLowerCase()}`;
		return {
			traceId: this._latestTraceId,
			checks: [
				'schema:pass',
				'status:pass',
				'trace:opened',
			],
		};
	}

	improveSkillFromLatestTrace(): { readonly added: boolean; readonly traceId: string; readonly skill: string } | undefined {
		if (!this._latestTraceId) {
			return undefined;
		}

		const skill = `Trace Skill: ${this._latestTraceId}`;
		const hasSkill = this._phase3DerivedSkills.has(skill);
		if (!hasSkill) {
			this._phase3DerivedSkills.add(skill);
		}
		return {
			added: !hasSkill,
			traceId: this._latestTraceId,
			skill,
		};
	}

	runSilentSelfImprovementLoopFromLatestTrace(): { readonly updated: boolean; readonly skill?: string } {
		const improvement = this.improveSkillFromLatestTrace();
		if (!improvement || !improvement.added) {
			return {
				updated: false,
				skill: improvement?.skill,
			};
		}

		return {
			updated: true,
			skill: improvement.skill,
		};
	}

	resetForTesting(): void {
		this._latestTraceId = undefined;
		this._phase3DerivedSkills.clear();
	}

	/**
	 * Phase 2 scaffold for security-reviewer pre-call scanning.
	 * This returns deterministic "pass" results to wire UI flow and tests.
	 * A production implementation should perform real validation and can fail.
	 */
	runSecurityReviewerScan(endpoint: string): readonly string[] {
		const normalized = endpoint.trim() || DEFAULT_ENDPOINT;
		if (SECURITY_SCAN_FAILURE_PATTERN.test(normalized)) {
			return [
				`security-reviewer:start:${normalized}`,
				'security-reviewer:scan',
				AI_SUPER_PANEL_SECURITY_REVIEWER_FAIL,
			];
		}
		return [
			`security-reviewer:start:${normalized}`,
			'security-reviewer:scan',
			AI_SUPER_PANEL_SECURITY_REVIEWER_PASS,
		];
	}

	runTerminalCommand(rawCommand: string): AISuperPanelTerminalCommandResult {
		const normalized = rawCommand.trim();
		const match = normalized.match(/^\/openswe\s+run\s+"(.+)"$/);
		if (!match) {
			return {
				accepted: false,
				output: ['terminal:error: unsupported command'],
			};
		}

		const task = match[1].trim();
		if (!task) {
			return {
				accepted: false,
				output: ['terminal:error: task cannot be empty'],
			};
		}
		return {
			accepted: true,
			output: this.runBuilderTask(task),
		};
	}

	connectDbMiddleware(provider: AISuperPanelDbProvider, connection: string): AISuperPanelDbConnectionResult {
		const normalizedConnection = connection.trim();
		if (!normalizedConnection) {
			return {
				provider,
				accepted: false,
				output: [`db-middleware:error:${provider}: connection string required`],
			};
		}

		return {
			provider,
			accepted: true,
			output: [
				`db-middleware:connect:start:${provider}`,
				`db-middleware:connect:target:${normalizedConnection}`,
				`db-middleware:connect:ready:${provider}`,
			],
		};
	}
}

export const aiSuperPanelMessageBridge = new AISuperPanelMessageBridge();
