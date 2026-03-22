/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Phase 4: Terminal-First Interface (Claude Code Style)
 *
 * Extends the VS Code Integrated Terminal to support command interception.
 * When a user types a slash command like `/fix`, the terminal bypasses the
 * shell and routes the command to the appropriate agent orchestrator.
 *
 * Also implements "Approval Cards" — UI confirmation prompts inside the
 * terminal for dangerous operations before an agent executes them.
 */

/**
 * Slash commands that the terminal intercepts and routes to agents.
 */
export interface ITerminalSlashCommand {
	/** The command name without the leading slash (e.g., 'fix') */
	readonly name: string;
	/** Description shown in command completion */
	readonly description: string;
	/** The agent to route this command to */
	readonly targetAgent: string;
	/** Whether this command requires approval before execution */
	readonly requiresApproval: boolean;
}

/**
 * Built-in terminal slash commands for agent interaction.
 */
export const TERMINAL_SLASH_COMMANDS: ITerminalSlashCommand[] = [
	{
		name: 'fix',
		description: 'Route to open-swe orchestrator to fix the current issue',
		targetAgent: 'open-swe',
		requiresApproval: false,
	},
	{
		name: 'ask',
		description: 'Ask the hermes agent a question about the codebase',
		targetAgent: 'hermes',
		requiresApproval: false,
	},
	{
		name: 'deploy',
		description: 'Deploy current changes (requires approval)',
		targetAgent: 'deploy-agent',
		requiresApproval: true,
	},
	{
		name: 'refactor',
		description: 'AI-powered refactoring of selected code',
		targetAgent: 'open-swe',
		requiresApproval: false,
	},
	{
		name: 'test',
		description: 'Generate and run tests for the current file',
		targetAgent: 'open-swe',
		requiresApproval: false,
	},
];

/**
 * Approval card actions for dangerous operations.
 */
export const enum ApprovalAction {
	Approve = 'approve',
	Reject = 'reject',
	ModifyAndApprove = 'modifyAndApprove',
}

/**
 * Represents an approval request for a dangerous operation.
 */
export interface IApprovalCard {
	/** Unique ID for this approval request */
	readonly id: string;
	/** The command the agent wants to execute */
	readonly command: string;
	/** Risk level of the operation */
	readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
	/** Human-readable explanation of what the command does */
	readonly explanation: string;
	/** The agent requesting approval */
	readonly agentName: string;
	/** Files that will be affected */
	readonly affectedFiles?: string[];
}

/**
 * Patterns that trigger automatic approval card display.
 * These are commands that should never be executed without user consent.
 */
export const DANGEROUS_COMMAND_PATTERNS: readonly { pattern: RegExp; riskLevel: IApprovalCard['riskLevel'] }[] = [
	{ pattern: /rm\s+-rf/, riskLevel: 'critical' },
	{ pattern: /git\s+push\s+--force/, riskLevel: 'critical' },
	{ pattern: /git\s+push/, riskLevel: 'high' },
	{ pattern: /git\s+reset\s+--hard/, riskLevel: 'critical' },
	{ pattern: /drop\s+table/i, riskLevel: 'critical' },
	{ pattern: /delete\s+from/i, riskLevel: 'high' },
	{ pattern: /npm\s+publish/, riskLevel: 'high' },
	{ pattern: /docker\s+rm/, riskLevel: 'medium' },
];

/**
 * Check if a command matches any dangerous patterns.
 */
export function detectDangerousCommand(command: string): IApprovalCard['riskLevel'] | undefined {
	for (const { pattern, riskLevel } of DANGEROUS_COMMAND_PATTERNS) {
		if (pattern.test(command)) {
			return riskLevel;
		}
	}
	return undefined;
}

/**
 * Check if input is a terminal slash command.
 */
export function parseSlashCommand(input: string): ITerminalSlashCommand | undefined {
	const trimmed = input.trim();
	if (!trimmed.startsWith('/')) {
		return undefined;
	}
	const commandName = trimmed.slice(1).split(/\s+/)[0];
	return TERMINAL_SLASH_COMMANDS.find(cmd => cmd.name === commandName);
}
