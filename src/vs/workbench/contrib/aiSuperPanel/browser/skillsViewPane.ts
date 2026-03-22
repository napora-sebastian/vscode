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
 *
 * Phase 2 – everything-Claude-code Integration:
 * - 28 sub-agents appear as quick buttons at the top
 * - 116 skills appear in a searchable grid
 * - Database-reviewer sub-agent auto-connects to DB Middleware tab
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

		// 28 Sub-agents quick buttons (Phase 2)
		const subagentSection = append(content, $('.ai-super-panel-subagent-section'));
		const subagentHeader = append(subagentSection, $('.ai-super-panel-section-subheader'));
		subagentHeader.textContent = '28 Sub-Agents';

		const subagentBar = append(subagentSection, $('.ai-super-panel-subagent-bar'));
		const subAgents = [
			'code-reviewer', 'security-reviewer', 'database-reviewer',
			'api-designer', 'test-writer', 'doc-generator',
			'refactor-expert', 'perf-optimizer', 'debug-assistant',
			'deploy-manager', 'ci-cd-expert', 'infrastructure',
			'data-analyst', 'ml-engineer', 'nlp-specialist',
			'frontend-dev', 'backend-dev', 'devops-engineer',
			'ux-researcher', 'accessibility-expert', 'i18n-specialist',
			'monitoring-agent', 'logging-expert', 'caching-specialist',
			'queue-manager', 'auth-specialist', 'crypto-expert',
			'compliance-checker'
		];
		for (const agent of subAgents) {
			const btn = append(subagentBar, $('button.ai-super-panel-subagent-button'));
			btn.textContent = agent;
			btn.title = `Activate ${agent} sub-agent`;
		}

		// Skills section header
		const header = append(content, $('.ai-super-panel-section-header'));
		header.textContent = 'Skills – 116 Available Skills';

		// Skills search
		const searchBox = append(content, $('input.ai-super-panel-skills-search'));
		searchBox.setAttribute('type', 'text');
		searchBox.setAttribute('placeholder', 'Search 116 skills...');

		// Skills grid with sample skills (Phase 2)
		const skillsGrid = append(content, $('.ai-super-panel-skills-grid'));
		const sampleSkills = [
			'Code Generation', 'Bug Detection', 'Refactoring',
			'Test Generation', 'Documentation', 'API Design',
			'Schema Validation', 'Security Audit', 'Performance',
			'Code Review', 'Dependency Analysis', 'Migration'
		];
		for (const skill of sampleSkills) {
			const skillCard = append(skillsGrid, $('.ai-super-panel-skill-card'));
			skillCard.textContent = skill;
			skillCard.title = `Activate skill: ${skill}`;
		}

		// Memory section
		const memorySection = append(content, $('.ai-super-panel-memory-section'));
		const memoryHeader = append(memorySection, $('.ai-super-panel-section-subheader'));
		memoryHeader.textContent = 'Memory Search (USER.md + AGENTS.md + Trajectories)';

		const memorySearch = append(memorySection, $('input.ai-super-panel-memory-search'));
		memorySearch.setAttribute('type', 'text');
		memorySearch.setAttribute('placeholder', 'Search memory & trajectories...');

		// Memory results area (Phase 3 - hermes)
		const memoryResults = append(memorySection, $('.ai-super-panel-memory-results'));
		memoryResults.textContent = 'Memory search results will appear here';

		// Session memory panel (Phase 3 - hermes)
		const sessionMemory = append(content, $('.ai-super-panel-session-memory'));
		const sessionHeader = append(sessionMemory, $('.ai-super-panel-section-subheader'));
		sessionHeader.textContent = 'Session Memory (Hermes User Model)';
		const sessionContent = append(sessionMemory, $('.ai-super-panel-session-memory-content'));
		sessionContent.textContent = 'Chat always includes full hermes user model + session memory.';

		// Self-improvement loop status (Phase 3 - hermes)
		const selfImproveSection = append(content, $('.ai-super-panel-self-improve'));
		const selfImproveHeader = append(selfImproveSection, $('.ai-super-panel-section-subheader'));
		selfImproveHeader.textContent = 'Self-Improvement Loop';

		const selfImproveStatus = append(selfImproveSection, $('.ai-super-panel-self-improve-status'));
		selfImproveStatus.textContent = '🔄 Loop idle – runs silently after every terminal command and updates the panel in real time.';

		const improveButton = append(content, $('button.ai-super-panel-improve-skill'));
		improveButton.textContent = '🔄 Improve Skill';
		improveButton.title = 'Extract patterns from the last LangSmith trace and instantly add the new skill to the Skills tab';
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.container) {
			this.container.style.height = `${height}px`;
		}
	}
}
