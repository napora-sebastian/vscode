/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Phase 3: The "Local LangSmith" (Observability)
 *
 * Trace Timeline Webview Provider for the Agent Panel.
 *
 * Renders trace events as an interactive timeline within the VS Code webview.
 * Supports deep linking: clicking a trace opens the exact source line that
 * triggered the agent call.
 */

/**
 * Represents a single trace event received from the Python middleware.
 */
export interface ITraceEvent {
	readonly eventType: TraceEventType;
	readonly timestamp: number;
	readonly traceId: string;
	readonly parentId?: string;
	readonly agentName: string;
	readonly modelName?: string;
	readonly inputData: Record<string, unknown>;
	readonly outputData: Record<string, unknown>;
	readonly durationMs: number;
	/** Source file that triggered the agent call (for deep linking) */
	readonly sourceFile?: string;
	/** Source line number (for deep linking) */
	readonly sourceLine?: number;
}

export const enum TraceEventType {
	LlmStart = 'llm_start',
	LlmEnd = 'llm_end',
	LlmError = 'llm_error',
	ToolStart = 'tool_start',
	ToolEnd = 'tool_end',
	ChainStart = 'chain_start',
	ChainEnd = 'chain_end',
	AgentAction = 'agent_action',
	AgentFinish = 'agent_finish',
}

/**
 * Messages sent between the webview and the extension host.
 */
export type TraceWebviewMessage =
	| { type: 'traceEvents'; events: ITraceEvent[] }
	| { type: 'deepLink'; sourceFile: string; sourceLine: number }
	| { type: 'clearTraces' }
	| { type: 'filterByAgent'; agentName: string };

/**
 * HTML template for the trace timeline webview.
 * In production, this would render an interactive D3.js or similar timeline.
 */
export function getTraceTimelineHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Agent Trace Timeline</title>
	<style>
		body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); padding: 16px; }
		.trace-event { padding: 8px 12px; margin: 4px 0; border-left: 3px solid var(--vscode-activityBarBadge-background); border-radius: 2px; background: var(--vscode-editor-inactiveSelectionBackground); cursor: pointer; }
		.trace-event:hover { background: var(--vscode-list-hoverBackground); }
		.trace-event .type { font-weight: bold; color: var(--vscode-textLink-foreground); }
		.trace-event .agent { color: var(--vscode-descriptionForeground); }
		.trace-event .duration { float: right; color: var(--vscode-descriptionForeground); }
		.trace-event .source-link { font-size: 0.85em; color: var(--vscode-textLink-foreground); text-decoration: underline; cursor: pointer; }
		.empty { text-align: center; color: var(--vscode-descriptionForeground); padding: 40px; }
		h2 { border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 8px; }
	</style>
</head>
<body>
	<h2>Agent Trace Timeline</h2>
	<div id="timeline">
		<div class="empty">No trace events yet. Run an agent to see traces here.</div>
	</div>
	<script>
		const vscode = acquireVsCodeApi();
		const timeline = document.getElementById('timeline');

		window.addEventListener('message', event => {
			const msg = event.data;
			if (msg.type === 'traceEvents') {
				renderEvents(msg.events);
			} else if (msg.type === 'clearTraces') {
				timeline.innerHTML = '<div class="empty">Traces cleared.</div>';
			}
		});

		function renderEvents(events) {
			if (!events.length) return;
			timeline.innerHTML = '';
			events.forEach(evt => {
				const div = document.createElement('div');
				div.className = 'trace-event';
				div.innerHTML = \`
					<span class="type">\${evt.eventType}</span>
					<span class="agent">[\${evt.agentName}]</span>
					<span class="duration">\${evt.durationMs ? evt.durationMs.toFixed(1) + 'ms' : ''}</span>
					\${evt.sourceFile ? '<br><span class="source-link" data-file="' + evt.sourceFile + '" data-line="' + (evt.sourceLine || 1) + '">' + evt.sourceFile + ':' + (evt.sourceLine || 1) + '</span>' : ''}
				\`;
				div.querySelector('.source-link')?.addEventListener('click', e => {
					vscode.postMessage({
						type: 'deepLink',
						sourceFile: e.target.dataset.file,
						sourceLine: parseInt(e.target.dataset.line, 10)
					});
				});
				timeline.appendChild(div);
			});
		}
	</script>
</body>
</html>`;
}
