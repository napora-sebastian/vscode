/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * AI Super Panel — Keyboard Shortcuts & Context Menu Commands
 *
 * From Ai-first.md Phase 5 (Final Polish & Copilot Parity):
 *   §1 — "Ctrl+Shift+A opens the AI Super Panel instantly."
 *   §2 — "Ctrl+Shift+T focuses the embedded terminal."
 *   §3 — "/ command palette inside chat gives access to every feature."
 *   §4 — "Highlight code anywhere → right-click → 'Ask AI Super Panel'
 *          opens the panel with full context."
 *   §5 — "Drag divider to resize terminal; copy-paste works between
 *          chat and terminal."
 */

import { AI_SUPER_PANEL_VIEW_CONTAINER_ID } from './agentPanel.contribution.js';

// ── Command IDs ─────────────────────────────────────────────────────────────

/** Ctrl+Shift+A — toggle the AI Super Panel (Ai-first.md Phase 5 §1) */
export const TOGGLE_AI_SUPER_PANEL_COMMAND_ID = 'omega.toggleAISuperPanel';

/** Ctrl+Shift+T — focus the embedded terminal (Ai-first.md Phase 5 §2) */
export const FOCUS_EMBEDDED_TERMINAL_COMMAND_ID = 'omega.focusEmbeddedTerminal';

/** Right-click → "Ask AI Super Panel" (Ai-first.md Phase 5 §4) */
export const ASK_AI_SUPER_PANEL_COMMAND_ID = 'omega.askAISuperPanel';

/** / command palette inside chat (Ai-first.md Phase 5 §3) */
export const OPEN_CHAT_COMMAND_PALETTE_ID = 'omega.openChatCommandPalette';

// ── Keybinding descriptors ──────────────────────────────────────────────────

/**
 * Keybinding definitions for the AI Super Panel commands.
 *
 * These mirror the shortcuts defined in Ai-first.md Phase 5.
 * In a full VS Code contribution they would be registered via
 * `KeybindingsRegistry.registerCommandAndKeybindingRule`.
 */
export const AI_SUPER_PANEL_KEYBINDINGS = [
	{
		commandId: TOGGLE_AI_SUPER_PANEL_COMMAND_ID,
		key: 'ctrl+shift+a',
		mac: 'cmd+shift+a',
		description: 'Toggle AI Super Panel',
	},
	{
		commandId: FOCUS_EMBEDDED_TERMINAL_COMMAND_ID,
		key: 'ctrl+shift+t',
		mac: 'cmd+shift+t',
		description: 'Focus embedded terminal in AI Super Panel',
	},
] as const;

// ── Context menu contribution ───────────────────────────────────────────────

/**
 * Context menu item for "Ask AI Super Panel" (Ai-first.md Phase 5 §4).
 *
 * When the user highlights code anywhere in the editor and right-clicks,
 * this command opens the AI Super Panel with the full code context
 * (file path, language, selection range, surrounding code).
 */
export interface IAskAISuperPanelContext {
	/** The file path of the active editor */
	readonly filePath: string;
	/** Language ID of the file */
	readonly languageId: string;
	/** The highlighted/selected text */
	readonly selectedText: string;
	/** Full content of the file */
	readonly fileContent: string;
	/** Start line of the selection */
	readonly selectionStartLine: number;
	/** End line of the selection */
	readonly selectionEndLine: number;
}

/**
 * The context menu entry descriptor.
 *
 * In a full VS Code contribution this would be registered via
 * `MenuRegistry.appendMenuItem(MenuId.EditorContext, ...)`.
 */
export const ASK_AI_SUPER_PANEL_MENU_ENTRY = {
	commandId: ASK_AI_SUPER_PANEL_COMMAND_ID,
	group: 'navigation',
	title: 'Ask AI Super Panel',
	icon: 'robot',
	/** Only show when there is a text selection */
	when: 'editorHasSelection',
	/** View to reveal */
	viewId: AI_SUPER_PANEL_VIEW_CONTAINER_ID,
} as const;

// ── Chat command palette ────────────────────────────────────────────────────

/**
 * Slash commands available inside the Chat tab's command palette.
 *
 * Ai-first.md Phase 5 §3: "/ command palette inside chat gives access
 * to every feature."
 */
export const CHAT_PALETTE_COMMANDS = [
	{ command: '/fix', description: 'Fix current issue with open-swe' },
	{ command: '/ask', description: 'Ask hermes about the codebase' },
	{ command: '/review', description: 'Run code review on current file' },
	{ command: '/test', description: 'Generate tests for current file' },
	{ command: '/deploy', description: 'Deploy current changes' },
	{ command: '/scan', description: 'Run security scan' },
	{ command: '/db', description: 'Query connected database' },
	{ command: '/trace', description: 'Show last agent trace' },
	{ command: '/skill', description: 'Search learned skills' },
	{ command: '/memory', description: 'Search agent memory' },
	{ command: '/api', description: 'Call a saved endpoint' },
	{ command: '/improve', description: 'Run self-improvement loop' },
] as const;
