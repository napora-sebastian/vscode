/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Immediate Next Steps: First Custom VS Code Command
 *
 * Registers the `omega.sendFileContext` command that sends the current
 * active editor's file context (path, content, language, selection) to
 * the Python agent server via WebSocket.
 *
 * This is the entry point for all agent interactions initiated from the editor.
 */

/**
 * Command ID for sending file context to the agent server.
 */
export const SEND_FILE_CONTEXT_COMMAND_ID = 'omega.sendFileContext';

/**
 * The file context payload sent to the Python agent server.
 */
export interface IFileContextPayload {
	/** Absolute path of the file */
	readonly filePath: string;
	/** Language identifier (e.g., 'typescript', 'python') */
	readonly languageId: string;
	/** Full file content */
	readonly content: string;
	/** Currently selected text, if any */
	readonly selection?: string;
	/** Line number of the cursor */
	readonly cursorLine?: number;
	/** Column number of the cursor */
	readonly cursorColumn?: number;
}

/**
 * Configuration for the agent server connection.
 */
export const AGENT_SERVER_CONFIG = {
	/** Default WebSocket endpoint for the Python agent server */
	defaultEndpoint: 'ws://127.0.0.1:8765/ws',
	/** Connection timeout in milliseconds */
	connectionTimeout: 5000,
	/** Whether to auto-connect on IDE startup */
	autoConnect: true,
} as const;

/**
 * JSON-RPC message format for sending file context.
 */
export function createFileContextMessage(payload: IFileContextPayload, messageId: number) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'context/file',
		params: payload,
	};
}

/**
 * JSON-RPC message format for invoking an agent.
 */
export function createAgentInvokeMessage(agentName: string, context: Record<string, unknown>, messageId: number) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'agent/invoke',
		params: {
			agent: agentName,
			context,
		},
	};
}
