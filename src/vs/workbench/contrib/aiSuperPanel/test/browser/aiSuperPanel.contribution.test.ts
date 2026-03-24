/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { Extensions as ViewExtensions, IViewContainersRegistry, IViewsRegistry, ViewContainerLocation } from '../../../../common/views.js';
import {
	AI_SUPER_PANEL_PHASE0_TABS,
	AI_SUPER_PANEL_PHASE2_HOOKS,
	AI_SUPER_PANEL_PHASE2_SKILLS,
	AI_SUPER_PANEL_PHASE2_SUB_AGENTS,
	AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES,
	AI_SUPER_PANEL_PHASE3_MEMORY_SOURCES,
	AI_SUPER_PANEL_PHASE4_DB_PROVIDERS,
	AI_SUPER_PANEL_SECURITY_REVIEWER_FAIL,
	AI_SUPER_PANEL_SECURITY_REVIEWER_PASS,
	AI_SUPER_PANEL_VIEW_CONTAINER_ID,
	AI_SUPER_PANEL_VIEW_ID,
	filterPhase2Skills,
	filterPhase3MemoryEntries,
	shouldAutoShowImproveSkillAction,
	shouldAutoOpenDbMiddlewareForSubAgent,
	shouldShowPhase2SkillsGrid,
	shouldShowPhase2SubAgentBar
} from '../../common/aiSuperPanel.js';
import '../../browser/aiSuperPanel.contribution.js';
import { aiSuperPanelMessageBridge } from '../../browser/aiSuperPanelMessageBridge.js';

suite('AI Super Panel Contribution', () => {
	suiteSetup(() => {
		aiSuperPanelMessageBridge.resetForTesting();
	});

	setup(() => {
		aiSuperPanelMessageBridge.resetForTesting();
	});

	test('registers view container in sidebar', () => {
		const viewContainersRegistry = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry);
		const container = viewContainersRegistry.get(AI_SUPER_PANEL_VIEW_CONTAINER_ID);

		assert.ok(container);
		assert.strictEqual(viewContainersRegistry.getViewContainerLocation(container!), ViewContainerLocation.Sidebar);
		assert.ok(container?.icon);
	});

	test('registers ai super panel view', () => {
		const viewsRegistry = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry);
		const viewContainer = viewsRegistry.getViewContainer(AI_SUPER_PANEL_VIEW_ID);
		const view = viewsRegistry.getView(AI_SUPER_PANEL_VIEW_ID);

		assert.ok(viewContainer);
		assert.strictEqual(viewContainer!.id, AI_SUPER_PANEL_VIEW_CONTAINER_ID);
		assert.ok(view);
		assert.strictEqual(view!.id, AI_SUPER_PANEL_VIEW_ID);
	});

	test('defines phase 0 tabs', () => {
		assert.deepStrictEqual(AI_SUPER_PANEL_PHASE0_TABS, [
			'Builder',
			'Chat',
			'API Caller',
			'Traces',
			'DB Middleware',
			'Skills',
		]);
	});

	test('defines phase 2 sub-agent quick actions', () => {
		assert.strictEqual(AI_SUPER_PANEL_PHASE2_SUB_AGENTS.length, 28);
		assert.deepStrictEqual(AI_SUPER_PANEL_PHASE2_SUB_AGENTS.slice(0, 3), [
			'Security Reviewer',
			'Database Reviewer',
			'API Reviewer',
		]);
		assert.ok(AI_SUPER_PANEL_PHASE2_SUB_AGENTS.every(name => name.length > 0));
	});

	test('defines phase 2 searchable skills catalog', () => {
		assert.strictEqual(AI_SUPER_PANEL_PHASE2_SKILLS.length, 116);
		assert.deepStrictEqual(AI_SUPER_PANEL_PHASE2_SKILLS.slice(0, 3), [
			'Security Scan',
			'Database Review',
			'API Contract Verification',
		]);
		assert.ok(AI_SUPER_PANEL_PHASE2_SKILLS.every(skill => skill.length > 0));
	});

	test('defines phase 2 hook names', () => {
		assert.deepStrictEqual(AI_SUPER_PANEL_PHASE2_HOOKS, [
			'session-start',
			'pre-tool-use',
			'security-scan',
		]);
	});

	test('shows phase 2 sub-agent bar only for Builder and Chat tabs', () => {
		const visibility = AI_SUPER_PANEL_PHASE0_TABS.map(tab => [tab, shouldShowPhase2SubAgentBar(tab)]);
		assert.deepStrictEqual(visibility, [
			['Builder', true],
			['Chat', true],
			['API Caller', false],
			['Traces', false],
			['DB Middleware', false],
			['Skills', false],
		]);
	});

	test('shows phase 2 skills grid only for Skills tab', () => {
		const visibility = AI_SUPER_PANEL_PHASE0_TABS.map(tab => [tab, shouldShowPhase2SkillsGrid(tab)]);
		assert.deepStrictEqual(visibility, [
			['Builder', false],
			['Chat', false],
			['API Caller', false],
			['Traces', false],
			['DB Middleware', false],
			['Skills', true],
		]);
	});

	test('auto-opens DB Middleware only for Database Reviewer sub-agent', () => {
		const shouldAutoOpen = AI_SUPER_PANEL_PHASE2_SUB_AGENTS.map(name => [name, shouldAutoOpenDbMiddlewareForSubAgent(name)]);
		assert.deepStrictEqual(shouldAutoOpen, [
			['Security Reviewer', false],
			['Database Reviewer', true],
			['API Reviewer', false],
			['Frontend Reviewer', false],
			['Backend Reviewer', false],
			['Test Engineer', false],
			['Refactor Assistant', false],
			['Performance Optimizer', false],
			['Dependency Updater', false],
			['Docs Writer', false],
			['Bug Investigator', false],
			['Release Manager', false],
			['Schema Designer', false],
			['Migration Planner', false],
			['Observability Reviewer', false],
			['Accessibility Reviewer', false],
			['UX Reviewer', false],
			['Prompt Engineer', false],
			['Tooling Builder', false],
			['CI Fixer', false],
			['Incident Responder', false],
			['Lint Specialist', false],
			['Type Safety Reviewer', false],
			['Architecture Critic', false],
			['State Management Reviewer', false],
			['Integration Specialist', false],
			['E2E Tester', false],
			['Cost Optimizer', false],
		]);
	});

	test('auto-shows Improve Skill action only after run/api workflows', () => {
		assert.deepStrictEqual([
			['runAgent', shouldAutoShowImproveSkillAction('runAgent')],
			['callApi', shouldAutoShowImproveSkillAction('callApi')],
			['terminalCommand', shouldAutoShowImproveSkillAction('terminalCommand')],
			['improveSkill', shouldAutoShowImproveSkillAction('improveSkill')],
			['createAutoPr', shouldAutoShowImproveSkillAction('createAutoPr')],
			['spawnSubAgents', shouldAutoShowImproveSkillAction('spawnSubAgents')],
			['subAgent', shouldAutoShowImproveSkillAction('subAgent')],
		], [
			['runAgent', true],
			['callApi', true],
			['terminalCommand', true],
			['improveSkill', false],
			['createAutoPr', false],
			['spawnSubAgents', false],
			['subAgent', false],
		]);
	});

	test('filters phase 2 skills by case-insensitive query', () => {
		assert.deepStrictEqual(filterPhase2Skills(''), AI_SUPER_PANEL_PHASE2_SKILLS);
		assert.deepStrictEqual(filterPhase2Skills('security'), ['Security Scan']);
		assert.deepStrictEqual(filterPhase2Skills('  security  '), ['Security Scan']);
		assert.deepStrictEqual(filterPhase2Skills('review'), [
			'Database Review',
			'Accessibility Review',
		]);
		assert.deepStrictEqual(filterPhase2Skills('skill library item 10'), ['Skill Library Item 10']);
		assert.deepStrictEqual(filterPhase2Skills('not-found-term'), []);
	});

	test('defines phase 3 memory sources and entries', () => {
		assert.deepStrictEqual(AI_SUPER_PANEL_PHASE3_MEMORY_SOURCES, [
			'USER.md',
			'AGENTS.md',
			'trajectories',
		]);
		assert.strictEqual(AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES.length, 4);
		assert.deepStrictEqual(AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES.map(entry => entry.source), [
			'USER.md',
			'AGENTS.md',
			'trajectories',
			'trajectories',
		]);
	});

	test('defines phase 4 db middleware providers', () => {
		assert.deepStrictEqual(AI_SUPER_PANEL_PHASE4_DB_PROVIDERS, [
			'Postgres',
			'Neo4j',
			'Vector DB',
		]);
	});

	test('filters phase 3 memory entries by source, title, and snippet', () => {
		assert.deepStrictEqual(filterPhase3MemoryEntries(''), AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES);
		assert.deepStrictEqual(filterPhase3MemoryEntries('user.md').map(entry => entry.title), [
			'Preferred Validation Commands',
		]);
		assert.deepStrictEqual(filterPhase3MemoryEntries('agent execution').map(entry => entry.title), [
			'Agent Execution Safety',
		]);
		assert.deepStrictEqual(filterPhase3MemoryEntries('security reviewer').map(entry => entry.title), [
			'Recent API Caller Outcome',
		]);
		assert.deepStrictEqual(filterPhase3MemoryEntries('not-found-memory'), []);
	});

	test('message bridge accepts placeholder commands', () => {
		const result = aiSuperPanelMessageBridge.sendMessage({
			command: 'runAgent',
			tab: 'Builder',
			source: 'aiSuperPanel',
		});

		assert.deepStrictEqual(result, {
			accepted: true,
			message: 'Queued runAgent for backend handling.',
			command: 'runAgent',
		});
	});

	test('message bridge emits command message events', () => {
		let emittedCommand: string | undefined;
		const disposable = aiSuperPanelMessageBridge.onDidSendMessage(message => {
			emittedCommand = message.command;
		});

		aiSuperPanelMessageBridge.sendMessage({
			command: 'callApi',
			tab: 'API Caller',
			source: 'aiSuperPanel',
		});

		disposable.dispose();
		assert.strictEqual(emittedCommand, 'callApi');
	});

	test('message bridge provides phase 1 builder graph and run traces', () => {
		const graph = aiSuperPanelMessageBridge.loadBuilderGraph();
		assert.deepStrictEqual(graph, [
			'load:langgraph.json',
			'resolve:nodes',
			'resolve:edges',
			'ready:builder-graph',
		]);

		const runLog = aiSuperPanelMessageBridge.runBuilderTask('demo task');
		assert.deepStrictEqual(runLog, [
			'openswe:start:demo task',
			'openswe:plan',
			'openswe:execute',
			'openswe:verify',
			'openswe:done',
		]);

		const defaultRunLog = aiSuperPanelMessageBridge.runBuilderTask('   ');
		assert.deepStrictEqual(defaultRunLog, [
			'openswe:start:defaultTask',
			'openswe:plan',
			'openswe:execute',
			'openswe:verify',
			'openswe:done',
		]);

		const emptyDefaultRunLog = aiSuperPanelMessageBridge.runBuilderTask('');
		assert.deepStrictEqual(emptyDefaultRunLog, [
			'openswe:start:defaultTask',
			'openswe:plan',
			'openswe:execute',
			'openswe:verify',
			'openswe:done',
		]);
	});

	test('message bridge verifies API calls and returns trace id', () => {
		const result = aiSuperPanelMessageBridge.callAndVerify('POST /v1/agents/run');
		assert.deepStrictEqual(result, {
			traceId: 'trace:post-/v1/agents/run',
			checks: [
				'schema:pass',
				'status:pass',
				'trace:opened',
			],
		});

		const defaultResult = aiSuperPanelMessageBridge.callAndVerify('   ');
		assert.deepStrictEqual(defaultResult, {
			traceId: 'trace:defaultendpoint',
			checks: [
				'schema:pass',
				'status:pass',
				'trace:opened',
			],
		});
	});

	test('message bridge runs security reviewer scan before api calls', () => {
		const scanResult = aiSuperPanelMessageBridge.runSecurityReviewerScan('POST /v1/agents/run');
		assert.deepStrictEqual(scanResult, [
			'security-reviewer:start:POST /v1/agents/run',
			'security-reviewer:scan',
			AI_SUPER_PANEL_SECURITY_REVIEWER_PASS,
		]);
		assert.deepStrictEqual(aiSuperPanelMessageBridge.runSecurityReviewerScan('   '), [
			'security-reviewer:start:defaultEndpoint',
			'security-reviewer:scan',
			AI_SUPER_PANEL_SECURITY_REVIEWER_PASS,
		]);
		assert.deepStrictEqual(aiSuperPanelMessageBridge.runSecurityReviewerScan('POST /v1/fail/security'), [
			'security-reviewer:start:POST /v1/fail/security',
			'security-reviewer:scan',
			AI_SUPER_PANEL_SECURITY_REVIEWER_FAIL,
		]);
	});

	test('message bridge connects db middleware providers', () => {
		assert.deepStrictEqual(aiSuperPanelMessageBridge.connectDbMiddleware('Postgres', 'postgresql://localhost:5432/app'), {
			provider: 'Postgres',
			accepted: true,
			output: [
				'db-middleware:connect:start:Postgres',
				'db-middleware:connect:target:postgresql://localhost:5432/app',
				'db-middleware:connect:ready:Postgres',
			],
		});
		assert.deepStrictEqual(aiSuperPanelMessageBridge.connectDbMiddleware('Neo4j', 'bolt://localhost:7687'), {
			provider: 'Neo4j',
			accepted: true,
			output: [
				'db-middleware:connect:start:Neo4j',
				'db-middleware:connect:target:bolt://localhost:7687',
				'db-middleware:connect:ready:Neo4j',
			],
		});
		assert.deepStrictEqual(aiSuperPanelMessageBridge.connectDbMiddleware('Vector DB', 'https://localhost:6333'), {
			provider: 'Vector DB',
			accepted: true,
			output: [
				'db-middleware:connect:start:Vector DB',
				'db-middleware:connect:target:https://localhost:6333',
				'db-middleware:connect:ready:Vector DB',
			],
		});
		assert.deepStrictEqual(aiSuperPanelMessageBridge.connectDbMiddleware('Vector DB', '   '), {
			provider: 'Vector DB',
			accepted: false,
			output: ['db-middleware:error:Vector DB: connection string required'],
		});
	});

	test('message bridge supports /openswe run terminal command scaffold', () => {
		const success = aiSuperPanelMessageBridge.runTerminalCommand('/openswe run "ship phase 1"');
		assert.deepStrictEqual(success, {
			accepted: true,
			output: [
				'openswe:start:ship phase 1',
				'openswe:plan',
				'openswe:execute',
				'openswe:verify',
				'openswe:done',
			],
		});

		const missingTask = aiSuperPanelMessageBridge.runTerminalCommand('/openswe run ""');
		assert.deepStrictEqual(missingTask, {
			accepted: false,
			output: ['terminal:error: task cannot be empty'],
		});

		const whitespaceTask = aiSuperPanelMessageBridge.runTerminalCommand('/openswe run "   "');
		assert.deepStrictEqual(whitespaceTask, {
			accepted: false,
			output: ['terminal:error: task cannot be empty'],
		});

		const unsupported = aiSuperPanelMessageBridge.runTerminalCommand('/other run "task"');
		assert.deepStrictEqual(unsupported, {
			accepted: false,
			output: ['terminal:error: unsupported command'],
		});
	});

	test('silent terminal self-improvement loop derives skill from latest terminal trace', () => {
		assert.deepStrictEqual(aiSuperPanelMessageBridge.runSilentSelfImprovementLoopFromLatestTrace(), {
			updated: false,
			skill: undefined,
		});

		aiSuperPanelMessageBridge.runTerminalCommand('/openswe run "ship phase 3 step 5"');
		const first = aiSuperPanelMessageBridge.runSilentSelfImprovementLoopFromLatestTrace();
		assert.deepStrictEqual(first, {
			updated: true,
			skill: 'Trace Skill: trace:run:ship-phase-3-step-5',
		});
		assert.deepStrictEqual(aiSuperPanelMessageBridge.getPhase2Skills('trace:run:ship-phase-3-step-5'), [
			'Trace Skill: trace:run:ship-phase-3-step-5',
		]);

		const second = aiSuperPanelMessageBridge.runSilentSelfImprovementLoopFromLatestTrace();
		assert.deepStrictEqual(second, {
			updated: false,
			skill: 'Trace Skill: trace:run:ship-phase-3-step-5',
		});
	});

	test('message bridge exposes post-run actions and accepts related commands', () => {
		assert.deepStrictEqual(aiSuperPanelMessageBridge.getPostRunActions(), [
			'createAutoPr',
			'spawnSubAgents',
		]);

		const autoPrResult = aiSuperPanelMessageBridge.sendMessage({
			command: 'createAutoPr',
			tab: 'Builder',
			source: 'aiSuperPanel',
		});
		assert.deepStrictEqual(autoPrResult, {
			accepted: true,
			message: 'Queued createAutoPr for backend handling.',
			command: 'createAutoPr',
		});

		const subAgentResult = aiSuperPanelMessageBridge.sendMessage({
			command: 'spawnSubAgents',
			tab: 'Builder',
			source: 'aiSuperPanel',
		});
		assert.deepStrictEqual(subAgentResult, {
			accepted: true,
			message: 'Queued spawnSubAgents for backend handling.',
			command: 'spawnSubAgents',
		});
	});

	test('message bridge exposes phase 2 sub-agents', () => {
		const subAgents = aiSuperPanelMessageBridge.getPhase2SubAgents();
		assert.strictEqual(subAgents.length, 28);
		assert.deepStrictEqual(subAgents, AI_SUPER_PANEL_PHASE2_SUB_AGENTS);
	});

	test('message bridge exposes searchable phase 2 skills', () => {
		const allSkills = aiSuperPanelMessageBridge.getPhase2Skills();
		assert.strictEqual(allSkills.length, 116);
		assert.deepStrictEqual(allSkills, AI_SUPER_PANEL_PHASE2_SKILLS);
		assert.deepStrictEqual(aiSuperPanelMessageBridge.getPhase2Skills('security'), ['Security Scan']);
	});

	test('improve skill extracts trace-derived skill from latest trace and adds it to skills', () => {
		assert.strictEqual(aiSuperPanelMessageBridge.improveSkillFromLatestTrace(), undefined);

		const verification = aiSuperPanelMessageBridge.callAndVerify('POST /v1/agents/run');
		assert.deepStrictEqual(aiSuperPanelMessageBridge.improveSkillFromLatestTrace(), {
			added: true,
			traceId: verification.traceId,
			skill: `Trace Skill: ${verification.traceId}`,
		});
		assert.deepStrictEqual(aiSuperPanelMessageBridge.improveSkillFromLatestTrace(), {
			added: false,
			traceId: verification.traceId,
			skill: `Trace Skill: ${verification.traceId}`,
		});
		assert.deepStrictEqual(aiSuperPanelMessageBridge.getPhase2Skills('trace skill'), [
			`Trace Skill: ${verification.traceId}`,
		]);
	});

	test('message bridge returns filtered phase 3 memory entries', () => {
		assert.deepStrictEqual(aiSuperPanelMessageBridge.getPhase3MemoryEntries(), AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES);
		assert.deepStrictEqual(aiSuperPanelMessageBridge.getPhase3MemoryEntries('trajectories').map(entry => entry.title), [
			'Recent API Caller Outcome',
			'Recent DB Middleware Pivot',
		]);
	});

	test('message bridge exposes hermes chat context with full session memory', () => {
		const context = aiSuperPanelMessageBridge.getPhase3HermesChatContext();
		assert.deepStrictEqual(context.userModel, {
			profile: 'AI-first IDE builder',
			workflow: 'Prefer focused, validated, minimal-change iterations',
			improvementLoop: 'Learn from traces and convert successful patterns into reusable skills',
		});
		assert.deepStrictEqual(context.sessionMemory, AI_SUPER_PANEL_PHASE3_MEMORY_ENTRIES);
		assert.deepStrictEqual(JSON.parse(context.serializedContext), {
			userModel: context.userModel,
			sessionMemory: context.sessionMemory,
		});
	});

	test('message bridge runs phase 2 hooks for actions', () => {
		assert.deepStrictEqual(aiSuperPanelMessageBridge.runPhase2Hooks('runAgent'), [
			{ hook: 'session-start', status: 'ok', action: 'runAgent' },
			{ hook: 'pre-tool-use', status: 'ok', action: 'runAgent' },
			{ hook: 'security-scan', status: 'ok', action: 'runAgent' },
		]);
		assert.deepStrictEqual(aiSuperPanelMessageBridge.runPhase2Hooks('subAgent'), [
			{ hook: 'session-start', status: 'ok', action: 'subAgent' },
			{ hook: 'pre-tool-use', status: 'ok', action: 'subAgent' },
			{ hook: 'security-scan', status: 'ok', action: 'subAgent' },
		]);
		assert.deepStrictEqual(aiSuperPanelMessageBridge.runPhase2Hooks('terminalCommand'), [
			{ hook: 'session-start', status: 'ok', action: 'terminalCommand' },
			{ hook: 'pre-tool-use', status: 'ok', action: 'terminalCommand' },
			{ hook: 'security-scan', status: 'ok', action: 'terminalCommand' },
		]);
	});
});
