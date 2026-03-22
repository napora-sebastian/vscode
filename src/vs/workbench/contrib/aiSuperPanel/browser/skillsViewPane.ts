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
 * Skills view pane for the AI Super Panel.
 * Displays a searchable grid of 116+ skills from everything-Claude-code
 * with hermes self-improvement integration.
 */
export class SkillsViewPane extends ViewPane {

	static readonly ID = 'workbench.view.aiSuperPanel.skills';

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
		container.classList.add('ai-super-panel-skills');

		const content = append(container, $('.ai-super-panel-skills-content'));
		const header = append(content, $('.ai-super-panel-section-header'));
		header.textContent = 'Skills – Hermes Self-Improvement';

		const searchBox = append(content, $('input.ai-super-panel-skills-search'));
		searchBox.setAttribute('type', 'text');
		searchBox.setAttribute('placeholder', 'Search skills...');

		const skillsGrid = append(content, $('.ai-super-panel-skills-grid'));
		skillsGrid.textContent = 'Skills grid will appear here';

		const memorySection = append(content, $('.ai-super-panel-memory-section'));
		const memoryHeader = append(memorySection, $('.ai-super-panel-section-subheader'));
		memoryHeader.textContent = 'Memory Search (USER.md + AGENTS.md)';

		const memorySearch = append(memorySection, $('input.ai-super-panel-memory-search'));
		memorySearch.setAttribute('type', 'text');
		memorySearch.setAttribute('placeholder', 'Search memory & trajectories...');

		const improveButton = append(content, $('button.ai-super-panel-improve-skill'));
		improveButton.textContent = '🔄 Improve Skill';
		improveButton.title = 'Extract patterns from the last trace and add as a new skill';
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.container) {
			this.container.style.height = `${height}px`;
		}
	}
}
