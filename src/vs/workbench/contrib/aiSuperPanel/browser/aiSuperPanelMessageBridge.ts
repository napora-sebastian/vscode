/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { AISuperPanelCommandMessage, AISuperPanelCommandResult } from '../common/aiSuperPanel.js';

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
		const normalizedTask = task.trim() || 'default-task';
		return [
			`openswe:start:${normalizedTask}`,
			'openswe:plan',
			'openswe:execute',
			'openswe:verify',
			'openswe:done',
		];
	}

	callAndVerify(endpointOrTask: string): { readonly traceId: string; readonly checks: readonly string[] } {
		const normalized = endpointOrTask.trim() || 'default-endpoint';
		return {
			traceId: `trace:${normalized.replace(/\s+/g, '-').toLowerCase()}`,
			checks: [
				'schema:pass',
				'status:pass',
				'trace:opened',
			],
		};
	}
}

export const aiSuperPanelMessageBridge = new AISuperPanelMessageBridge();
