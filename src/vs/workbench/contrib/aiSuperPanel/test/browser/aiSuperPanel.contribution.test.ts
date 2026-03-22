/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { Extensions as ViewExtensions, IViewContainersRegistry, IViewsRegistry, ViewContainerLocation } from '../../../../common/views.js';
import { AI_SUPER_PANEL_PHASE0_TABS, AI_SUPER_PANEL_VIEW_CONTAINER_ID, AI_SUPER_PANEL_VIEW_ID } from '../../common/aiSuperPanel.js';
import '../../browser/aiSuperPanel.contribution.js';
import { aiSuperPanelMessageBridge } from '../../browser/aiSuperPanelMessageBridge.js';

suite('AI Super Panel Contribution', () => {
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
});
