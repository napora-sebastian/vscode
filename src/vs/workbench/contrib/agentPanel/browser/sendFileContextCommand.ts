/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * JSON-RPC Message Builders for AI Super Panel ↔ Agent Server
 *
 * Original (Ai-second.md): `omega.sendFileContext` command + agent invocation.
 * Enhanced (Ai-first.md):  memory search, skills lookup, API call & verify.
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

// ── Original Ai-second.md message builders ──────────────────────────────────

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

// ── Ai-first.md Phase 3 — Memory messages ───────────────────────────────────

/**
 * Search across USER.md, AGENTS.md, and trajectories.
 * Ai-first.md Phase 3 §1.
 */
export function createMemorySearchMessage(query: string, topK: number, messageId: number) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'memory/search',
		params: { query, topK },
	};
}

/**
 * Get full chat context with hermes user model + session memory.
 * Ai-first.md Phase 3 §4.
 */
export function createMemoryContextMessage(messageId: number) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'memory/context',
		params: {},
	};
}

/**
 * Record a new trajectory after a completed agent run.
 * Ai-first.md Phase 3 §5.
 */
export function createTrajectoryMessage(summary: string, tags: string[], messageId: number) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'memory/trajectory',
		params: { summary, tags },
	};
}

// ── Ai-first.md Phase 2 — Skills messages ───────────────────────────────────

/**
 * List all learned skills.
 */
export function createSkillsListMessage(messageId: number) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'skills/list',
		params: {},
	};
}

/**
 * Find skills relevant to the current context.
 */
export function createSkillsSearchMessage(context: string, topK: number, messageId: number) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'skills/search',
		params: { context, topK },
	};
}

// ── Ai-first.md Phase 4 — API Caller message ───────────────────────────────

/**
 * Call an external endpoint with optional verify checks.
 * Ai-first.md Phase 4 §5.
 */
export function createAPICallMessage(
	url: string,
	method: string,
	headers: Record<string, string>,
	body: string | undefined,
	messageId: number,
) {
	return {
		jsonrpc: '2.0' as const,
		id: messageId,
		method: 'api/call',
		params: { url, method, headers, body },
	};
}
