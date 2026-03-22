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
}

export const aiSuperPanelMessageBridge = new AISuperPanelMessageBridge();
