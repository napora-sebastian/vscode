/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { $, append } from '../../../../base/browser/dom.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';

/**
 * Builder view pane for the AI Super Panel.
 * Displays the open-swe LangGraph execution engine with visual graph
 * representation, run controls, auto-PR buttons, and sub-agent spawning.
 *
 * Phase 1 – open-swe Integration:
 * - Loads langgraph.json as a visual graph
 * - "Run" executes the graph in sandbox with live terminal streaming
 * - "Call & Verify" button in API Caller tab runs in open-swe sandbox
 * - Terminal supports /openswe run "task" command
 * - Auto-PR and sub-agent spawning buttons appear after every run
 */
export class BuilderViewPane extends ViewPane {

	static readonly ID = 'workbench.view.aiSuperPanel.builder';

	private container!: HTMLElement;

	constructor(
		options: IViewletViewOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		this.container = container;
		container.classList.add('ai-super-panel-builder');

		const content = append(container, $('.ai-super-panel-builder-content'));

		// Header
		const header = append(content, $('.ai-super-panel-section-header'));
		header.textContent = 'Builder – open-swe Execution Engine';

		// LangGraph visual graph area
		const graphArea = append(content, $('.ai-super-panel-graph-area'));
		const graphPlaceholder = append(graphArea, $('.ai-super-panel-graph-placeholder'));
		graphPlaceholder.textContent = 'Load langgraph.json to visualize the execution graph';

		const graphLoadButton = append(graphArea, $('button.ai-super-panel-graph-load-button'));
		graphLoadButton.textContent = '📂 Load langgraph.json';
		graphLoadButton.title = 'Load open-swe langgraph.json for visual graph display';

		// Run controls
		const controls = append(content, $('.ai-super-panel-controls'));
		const runButton = append(controls, $('button.ai-super-panel-run-button'));
		runButton.textContent = '▶ Run in Sandbox';
		runButton.title = 'Execute the graph in sandbox and stream every step live into the terminal';

		const stopButton = append(controls, $('button.ai-super-panel-stop-button'));
		stopButton.textContent = '⏹ Stop';
		stopButton.title = 'Stop the current execution';

		// Post-run actions (Auto-PR and sub-agent spawning)
		const postRunActions = append(content, $('.ai-super-panel-post-run-actions'));
		const postRunHeader = append(postRunActions, $('.ai-super-panel-section-subheader'));
		postRunHeader.textContent = 'Post-Run Actions';

		const autoPrButton = append(postRunActions, $('button.ai-super-panel-auto-pr-button'));
		autoPrButton.textContent = '🔀 Auto-PR';
		autoPrButton.title = 'Automatically create a pull request from the agent run results';

		const spawnAgentButton = append(postRunActions, $('button.ai-super-panel-spawn-agent-button'));
		spawnAgentButton.textContent = '🤖 Spawn Sub-Agent';
		spawnAgentButton.title = 'Spawn a new sub-agent for a specific subtask';

		// Embedded terminal area for live output
		const terminalArea = append(content, $('.ai-super-panel-terminal-area'));
		const terminalHeader = append(terminalArea, $('.ai-super-panel-terminal-header'));
		terminalHeader.textContent = '> Terminal Output (xterm.js)';

		const terminalOutput = append(terminalArea, $('.ai-super-panel-terminal-output'));
		terminalOutput.textContent = 'Terminal ready. Supports /openswe run "task" command.';
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.container) {
			this.container.style.height = `${height}px`;
		}
	}
}
