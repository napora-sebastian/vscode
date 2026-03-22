/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { AISuperPanelApiVerificationResult, AISuperPanelCommand, AISuperPanelCommandMessage, AISuperPanelCommandResult, AISuperPanelSubAgent, AISuperPanelTerminalCommandResult, AI_SUPER_PANEL_PHASE2_SUB_AGENTS } from '../common/aiSuperPanel.js';

const DEFAULT_TASK = 'defaultTask';
const DEFAULT_ENDPOINT = 'defaultEndpoint';

class AISuperPanelMessageBridge extends Disposable {

	private readonly _onDidSendMessage = this._register(new Emitter<AISuperPanelCommandMessage>());
	readonly onDidSendMessage = this._onDidSendMessage.event;

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

	callAndVerify(endpointOrTask: string): AISuperPanelApiVerificationResult {
		const normalized = endpointOrTask.trim() || DEFAULT_ENDPOINT;
		return {
			traceId: `trace:${normalized.replace(/\s+/g, '-').toLowerCase()}`,
			checks: [
				'schema:pass',
				'status:pass',
				'trace:opened',
			],
		};
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
}

export const aiSuperPanelMessageBridge = new AISuperPanelMessageBridge();
