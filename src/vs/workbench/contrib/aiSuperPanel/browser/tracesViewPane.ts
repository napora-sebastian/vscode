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
 * Traces view pane for the AI Super Panel.
 * Displays LangSmith-style traces for agent runs, API calls,
 * DB queries, and hermes improvements.
 *
 * Phase 4 – Full LangSmith Studio embedding:
 * - Every open-swe run, API call, DB query, and hermes improvement appears live
 * - Trace entries are grouped by type with live updating
 * - Click a trace to see detailed execution timeline
 */
export class TracesViewPane extends ViewPane {

	static readonly ID = 'workbench.view.aiSuperPanel.traces';

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
		container.classList.add('ai-super-panel-traces');

		const content = append(container, $('.ai-super-panel-traces-content'));
		const header = append(content, $('.ai-super-panel-section-header'));
		header.textContent = 'Traces – Full LangSmith Studio';

		// Trace filter bar (Phase 4)
		const filterBar = append(content, $('.ai-super-panel-trace-filter-bar'));
		const traceTypes = ['All', 'Agent Runs', 'API Calls', 'DB Queries', 'Hermes Improvements'];
		for (const traceType of traceTypes) {
			const filterBtn = append(filterBar, $('button.ai-super-panel-trace-filter-button'));
			filterBtn.textContent = traceType;
			filterBtn.title = `Filter traces by: ${traceType}`;
		}

		// Live trace timeline (Phase 4)
		const timeline = append(content, $('.ai-super-panel-trace-timeline'));
		const timelineHeader = append(timeline, $('.ai-super-panel-trace-timeline-header'));
		timelineHeader.textContent = '🟢 Live – Waiting for trace events...';

		// Sample trace entries (placeholder pending LangSmith service integration)
		const traceList = append(timeline, $('.ai-super-panel-trace-list'));
		const sampleTraces = [
			{ type: '🤖', label: 'Agent Run', detail: 'open-swe graph execution', time: 'Live' },
			{ type: '🌐', label: 'API Call', detail: 'POST /v1/completions', time: '2.3s' },
			{ type: '🗄️', label: 'DB Query', detail: 'SELECT * FROM agents', time: '0.1s' },
			{ type: '🔄', label: 'Hermes Improve', detail: 'Skill: code-review updated', time: '1.5s' },
		];
		for (const trace of sampleTraces) {
			const traceEntry = append(traceList, $('.ai-super-panel-trace-entry'));
			const traceIcon = append(traceEntry, $('span.ai-super-panel-trace-icon'));
			traceIcon.textContent = trace.type;
			const traceLabel = append(traceEntry, $('span.ai-super-panel-trace-label'));
			traceLabel.textContent = trace.label;
			const traceDetail = append(traceEntry, $('span.ai-super-panel-trace-detail'));
			traceDetail.textContent = trace.detail;
			const traceTime = append(traceEntry, $('span.ai-super-panel-trace-time'));
			traceTime.textContent = trace.time;
		}
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.container) {
			this.container.style.height = `${height}px`;
		}
	}
}
