/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { addDisposableListener, getActiveElement } from '../../../../base/browser/dom.js';
import { status } from '../../../../base/browser/ui/aria/aria.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { localize, localize2 } from '../../../../nls.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { AccessibleContentProvider, AccessibleViewProviderId, AccessibleViewType } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { FocusedViewContext } from '../../../common/contextkeys.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { AI_SUPER_PANEL_PHASE0_TABS, AI_SUPER_PANEL_PHASE2_HOOKS, AI_SUPER_PANEL_PHASE2_SKILLS, AI_SUPER_PANEL_PHASE2_SUB_AGENTS, AI_SUPER_PANEL_PHASE3_MEMORY_SOURCES, AI_SUPER_PANEL_SECURITY_REVIEWER_PASS, AI_SUPER_PANEL_VIEW_ID, AISuperPanelCommand, AISuperPanelHookAction, AISuperPanelHookResult, AISuperPanelTab, shouldAutoOpenDbMiddlewareForSubAgent, shouldAutoShowImproveSkillAction, shouldShowPhase2SkillsGrid, shouldShowPhase2SubAgentBar } from '../common/aiSuperPanel.js';
import { aiSuperPanelMessageBridge } from './aiSuperPanelMessageBridge.js';

const SEARCH_DEBOUNCE_MS = 200;
const phase2HooksDisplayLabel = AI_SUPER_PANEL_PHASE2_HOOKS.join(', ');

const formatHookLogLine = (hook: AISuperPanelHookResult): string => {
	return `hook|${hook.hook}|${hook.status}|${hook.action}`;
};

export class AISuperPanelView extends ViewPane {

	static readonly ID = AI_SUPER_PANEL_VIEW_ID;
	static readonly NAME = localize2('aiSuperPanel', "AI Super Panel");

	constructor(
		options: IViewletViewOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		const root = document.createElement('div');
		root.style.display = 'flex';
		root.style.flexDirection = 'column';
		root.style.height = '100%';
		root.style.gap = '8px';

		const tabList = document.createElement('div');
		tabList.setAttribute('role', 'tablist');
		tabList.setAttribute('aria-label', localize('aiSuperPanelTabListLabel', "AI Super Panel Tabs"));
		tabList.style.display = 'flex';
		tabList.style.flexWrap = 'wrap';
		tabList.style.gap = '6px';
		tabList.style.padding = '2px 0';

		const subAgentBar = document.createElement('div');
		subAgentBar.setAttribute('role', 'toolbar');
		subAgentBar.setAttribute('aria-label', localize('aiSuperPanelSubAgentBarLabel', "AI Super Panel Sub-agent Quick Actions"));
		subAgentBar.style.display = 'none';
		subAgentBar.style.flexWrap = 'wrap';
		subAgentBar.style.gap = '6px';
		subAgentBar.style.padding = '2px 0';

		const hookStatusBanner = document.createElement('div');
		hookStatusBanner.setAttribute('role', 'status');
		hookStatusBanner.style.padding = '6px 8px';
		hookStatusBanner.style.border = '1px solid var(--vscode-panel-border)';
		hookStatusBanner.style.borderRadius = '4px';
		hookStatusBanner.style.background = 'var(--vscode-textCodeBlock-background)';
		hookStatusBanner.textContent = localize('aiSuperPanelHookStatusIdle', "Hooks ready: {0}", phase2HooksDisplayLabel);

		let activeTab: AISuperPanelTab = AI_SUPER_PANEL_PHASE0_TABS[0];
		const tabButtons = new Map<AISuperPanelTab, HTMLButtonElement>();

		const contentLabel = document.createElement('div');
		contentLabel.tabIndex = 0;
		contentLabel.setAttribute('role', 'note');
		contentLabel.style.padding = '4px 0';

		const skillsSection = document.createElement('div');
		skillsSection.setAttribute('role', 'region');
		skillsSection.setAttribute('aria-label', localize('aiSuperPanelSkillsSectionLabel', "AI Super Panel Skills"));
		skillsSection.style.display = 'none';
		skillsSection.style.marginTop = '8px';
		skillsSection.style.padding = '8px';
		skillsSection.style.border = '1px solid var(--vscode-panel-border)';
		skillsSection.style.borderRadius = '4px';

		const skillsSearch = document.createElement('input');
		skillsSearch.type = 'text';
		skillsSearch.placeholder = localize('aiSuperPanelSkillsSearchPlaceholder', "Search skills");
		skillsSearch.setAttribute('aria-label', localize('aiSuperPanelSkillsSearchAria', "Search AI Super Panel skills"));
		skillsSearch.style.width = '100%';
		skillsSearch.style.boxSizing = 'border-box';
		skillsSection.appendChild(skillsSearch);

		const skillsCount = document.createElement('div');
		skillsCount.style.marginTop = '8px';
		skillsCount.setAttribute('role', 'status');
		skillsSection.appendChild(skillsCount);

		const skillsGrid = document.createElement('div');
		skillsGrid.style.display = 'grid';
		skillsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
		skillsGrid.style.gap = '6px';
		skillsGrid.style.marginTop = '8px';
		skillsSection.appendChild(skillsGrid);
		let latestSkillsQuery = '';

		const topPane = document.createElement('div');
		topPane.style.flex = '7';
		topPane.style.minHeight = '0';
		topPane.style.padding = '8px';
		topPane.style.border = '1px solid var(--vscode-panel-border)';
		topPane.style.borderRadius = '4px';
		topPane.style.overflow = 'auto';
		topPane.appendChild(contentLabel);
		const actionBar = document.createElement('div');
		actionBar.style.display = 'flex';
		actionBar.style.gap = '8px';
		actionBar.style.marginTop = '8px';
		topPane.appendChild(actionBar);
		topPane.appendChild(skillsSection);

		const postRunActionBar = document.createElement('div');
		postRunActionBar.style.display = 'none';
		postRunActionBar.style.gap = '8px';
		postRunActionBar.style.marginTop = '8px';
		topPane.appendChild(postRunActionBar);

		const builderGraphRegion = document.createElement('div');
		builderGraphRegion.setAttribute('role', 'region');
		builderGraphRegion.setAttribute('aria-label', localize('aiSuperPanelBuilderGraphRegion', "AI Super Panel Builder Graph"));
		builderGraphRegion.style.marginTop = '8px';
		builderGraphRegion.style.padding = '8px';
		builderGraphRegion.style.border = '1px solid var(--vscode-panel-border)';
		builderGraphRegion.style.borderRadius = '4px';
		topPane.appendChild(builderGraphRegion);

		const apiCallRow = document.createElement('div');
		apiCallRow.style.display = 'flex';
		apiCallRow.style.gap = '8px';
		apiCallRow.style.marginTop = '8px';
		topPane.appendChild(apiCallRow);

		const apiInput = document.createElement('input');
		apiInput.type = 'text';
		apiInput.placeholder = localize('aiSuperPanelApiInputPlaceholder', "Endpoint or task");
		apiInput.style.flex = '1';
		apiInput.setAttribute('aria-label', localize('aiSuperPanelApiInputLabel', "Endpoint or task to call and verify"));
		apiCallRow.appendChild(apiInput);

		const commandStatus = document.createElement('div');
		commandStatus.tabIndex = 0;
		commandStatus.setAttribute('role', 'status');
		commandStatus.style.marginTop = '8px';
		commandStatus.textContent = localize('aiSuperPanelCommandStatusIdle', "No command queued.");
		topPane.appendChild(commandStatus);

		const memorySection = document.createElement('div');
		memorySection.setAttribute('role', 'region');
		memorySection.setAttribute('aria-label', localize('aiSuperPanelMemorySectionAria', "AI Super Panel Memory Search"));
		memorySection.style.marginTop = '8px';
		memorySection.style.border = '1px solid var(--vscode-panel-border)';
		memorySection.style.borderRadius = '4px';
		memorySection.style.padding = '8px';
		topPane.appendChild(memorySection);

		const memoryToggle = document.createElement('button');
		memoryToggle.type = 'button';
		memoryToggle.textContent = localize('aiSuperPanelMemoryToggleCollapsed', "Show Memory Search");
		memoryToggle.setAttribute('aria-expanded', 'false');
		memoryToggle.setAttribute('aria-label', localize('aiSuperPanelMemoryToggleAria', "Toggle memory search section"));
		memoryToggle.style.padding = '4px 8px';
		memoryToggle.style.border = '1px solid var(--vscode-panel-border)';
		memoryToggle.style.borderRadius = '4px';
		memoryToggle.style.background = 'var(--vscode-editor-background)';
		memoryToggle.style.color = 'var(--vscode-foreground)';
		memorySection.appendChild(memoryToggle);

		const memoryBody = document.createElement('div');
		memoryBody.style.display = 'none';
		memoryBody.style.marginTop = '8px';
		memorySection.appendChild(memoryBody);

		const memorySources = document.createElement('div');
		memorySources.style.marginBottom = '6px';
		memorySources.textContent = localize('aiSuperPanelMemorySources', "Sources: {0}", AI_SUPER_PANEL_PHASE3_MEMORY_SOURCES.join(', '));
		memoryBody.appendChild(memorySources);

		const memorySearch = document.createElement('input');
		memorySearch.type = 'text';
		memorySearch.placeholder = localize('aiSuperPanelMemorySearchPlaceholder', "Search memory");
		memorySearch.setAttribute('aria-label', localize('aiSuperPanelMemorySearchAria', "Search AI Super Panel memory"));
		memorySearch.style.width = '100%';
		memorySearch.style.boxSizing = 'border-box';
		memoryBody.appendChild(memorySearch);

		const memoryCount = document.createElement('div');
		memoryCount.style.marginTop = '6px';
		memoryCount.setAttribute('role', 'status');
		memoryBody.appendChild(memoryCount);

		const memoryResults = document.createElement('div');
		memoryResults.style.display = 'grid';
		memoryResults.style.gap = '6px';
		memoryResults.style.marginTop = '8px';
		memoryBody.appendChild(memoryResults);
		let latestMemoryQuery = '';

		const bottomPane = document.createElement('div');
		bottomPane.style.flex = '3';
		bottomPane.style.minHeight = '0';
		bottomPane.style.padding = '8px';
		bottomPane.style.border = '1px solid var(--vscode-panel-border)';
		bottomPane.style.borderRadius = '4px';
		bottomPane.style.overflow = 'auto';
		bottomPane.setAttribute('role', 'region');
		bottomPane.setAttribute('aria-label', localize('aiSuperPanelTerminalRegion', "AI Super Panel Terminal"));
		const terminalHeader = document.createElement('div');
		terminalHeader.textContent = localize('aiSuperPanelTerminalPlaceholder', "Embedded terminal placeholder (30%).");
		bottomPane.appendChild(terminalHeader);

		const terminalLog = document.createElement('pre');
		terminalLog.style.whiteSpace = 'pre-wrap';
		terminalLog.style.margin = '8px 0 0';
		terminalLog.textContent = '';
		bottomPane.appendChild(terminalLog);

		const terminalInputRow = document.createElement('div');
		terminalInputRow.style.display = 'flex';
		terminalInputRow.style.gap = '8px';
		terminalInputRow.style.marginTop = '8px';
		bottomPane.appendChild(terminalInputRow);

		const terminalInput = document.createElement('input');
		terminalInput.type = 'text';
		terminalInput.placeholder = localize('aiSuperPanelTerminalInputPlaceholder', "/openswe run \"task\"");
		terminalInput.style.flex = '1';
		terminalInput.setAttribute('aria-label', localize('aiSuperPanelTerminalInputLabel', "AI Super Panel terminal command input"));
		terminalInputRow.appendChild(terminalInput);

		const terminalRunButton = document.createElement('button');
		terminalRunButton.type = 'button';
		terminalRunButton.textContent = localize('aiSuperPanelTerminalRunButton', "Run in Terminal");
		terminalRunButton.style.padding = '4px 8px';
		terminalRunButton.style.border = '1px solid var(--vscode-panel-border)';
		terminalRunButton.style.borderRadius = '4px';
		terminalRunButton.style.background = 'var(--vscode-button-background)';
		terminalRunButton.style.color = 'var(--vscode-button-foreground)';
		terminalRunButton.setAttribute('aria-label', localize('aiSuperPanelTerminalRunButtonAria', "Run terminal command"));
		terminalInputRow.appendChild(terminalRunButton);
		const phase3HermesChatContext = aiSuperPanelMessageBridge.getPhase3HermesChatContext();

		const setActiveTab = (tab: AISuperPanelTab, focusSelectedTab = false) => {
			activeTab = tab;
			for (const [name, button] of tabButtons) {
				const selected = name === tab;
				button.setAttribute('aria-selected', selected ? 'true' : 'false');
				button.tabIndex = selected ? 0 : -1;
				if (selected && focusSelectedTab) {
					button.focus();
				}
			}
			if (tab !== 'Builder') {
				postRunActionBar.style.display = 'none';
			}
			subAgentBar.style.display = shouldShowPhase2SubAgentBar(tab) ? 'flex' : 'none';
			skillsSection.style.display = shouldShowPhase2SkillsGrid(tab) ? 'block' : 'none';
			contentLabel.textContent = localize('aiSuperPanelTabContentPlaceholder', "Active tab: {0}. Panel content placeholder (70%).", tab);
			if (tab === 'Chat') {
				contentLabel.textContent = localize(
					'aiSuperPanelChatContextPlaceholder',
					"Active tab: Chat. Hermes context loaded with user model profile \"{0}\" and {1} session memory entries.",
					phase3HermesChatContext.userModel.profile,
					phase3HermesChatContext.sessionMemory.length
				);
			}
			if (focusSelectedTab) {
				status(localize('aiSuperPanelTabChangedAria', "Switched to {0} tab.", tab));
			}
		};

		const setBuilderGraph = () => {
			const lines = aiSuperPanelMessageBridge.loadBuilderGraph();
			builderGraphRegion.textContent = localize('aiSuperPanelBuilderGraphLoaded', "Builder graph loaded: {0}", lines.join(' → '));
		};

		const appendTerminalLines = (lines: readonly string[]) => {
			const existing = terminalLog.textContent ? `${terminalLog.textContent}\n` : '';
			terminalLog.textContent = `${existing}${lines.join('\n')}`;
		};

		let improveSkillButton: HTMLButtonElement | undefined;

		const runHooksForAction = (action: AISuperPanelHookAction) => {
			const hooks = aiSuperPanelMessageBridge.runPhase2Hooks(action);
			appendTerminalLines(hooks.map(hook => formatHookLogLine(hook)));
			if (improveSkillButton && shouldAutoShowImproveSkillAction(action)) {
				improveSkillButton.style.display = '';
			}
			hookStatusBanner.textContent = localize('aiSuperPanelHookStatusUpdated', "Hooks ran for {0}: {1}", action, hooks.map(hook => hook.hook).join(', '));
			status(hookStatusBanner.textContent);
		};

		const renderSkillsGrid = (query = '') => {
			const skills = aiSuperPanelMessageBridge.getPhase2Skills(query);
			const totalSkills = aiSuperPanelMessageBridge.getPhase2Skills('').length;
			skillsCount.textContent = localize('aiSuperPanelSkillsCount', "{0} of {1} skills shown.", skills.length, totalSkills);
			const skillItemsFragment = document.createDocumentFragment();
			for (const skill of skills) {
				const skillItem = document.createElement('button');
				skillItem.type = 'button';
				skillItem.textContent = skill;
				skillItem.dataset.skillName = skill;
				skillItem.style.padding = '4px 8px';
				skillItem.style.border = '1px solid var(--vscode-panel-border)';
				skillItem.style.borderRadius = '4px';
				skillItem.style.background = 'var(--vscode-editor-background)';
				skillItem.style.color = 'var(--vscode-foreground)';
				skillItem.setAttribute('aria-label', localize('aiSuperPanelSkillItemAria', "Skill {0}", skill));
				skillItemsFragment.appendChild(skillItem);
			}
			skillsGrid.replaceChildren(skillItemsFragment);
		};
		const skillsSearchScheduler = this._register(new RunOnceScheduler(() => renderSkillsGrid(latestSkillsQuery), SEARCH_DEBOUNCE_MS));
		const phase3MemoryEntriesTotal = aiSuperPanelMessageBridge.getPhase3MemoryEntries().length;
		const renderMemoryEntries = (query = '') => {
			const entries = aiSuperPanelMessageBridge.getPhase3MemoryEntries(query);
			memoryCount.textContent = localize('aiSuperPanelMemoryCount', "{0} of {1} memory entries shown.", entries.length, phase3MemoryEntriesTotal);
			const memoryItemsFragment = document.createDocumentFragment();
			for (const entry of entries) {
				const memoryItem = document.createElement('button');
				memoryItem.type = 'button';
				memoryItem.style.padding = '4px 8px';
				memoryItem.style.border = '1px solid var(--vscode-panel-border)';
				memoryItem.style.borderRadius = '4px';
				memoryItem.style.background = 'var(--vscode-editor-background)';
				memoryItem.style.color = 'var(--vscode-foreground)';
				memoryItem.style.textAlign = 'left';
				memoryItem.dataset.memorySource = entry.source;
				memoryItem.dataset.memoryTitle = entry.title;
				memoryItem.setAttribute('aria-label', localize('aiSuperPanelMemoryItemAria', "Memory from {0}: {1}", entry.source, entry.title));
				memoryItem.textContent = localize('aiSuperPanelMemoryItemLabel', "{0} — {1}", entry.source, entry.title);
				memoryItemsFragment.appendChild(memoryItem);
			}
			memoryResults.replaceChildren(memoryItemsFragment);
		};
		const memorySearchScheduler = this._register(new RunOnceScheduler(() => renderMemoryEntries(latestMemoryQuery), SEARCH_DEBOUNCE_MS));

		const executeTerminalCommand = () => {
			const terminalResult = aiSuperPanelMessageBridge.runTerminalCommand(terminalInput.value);
			runHooksForAction('terminalCommand');
			let silentLoopLine: string | undefined;
			if (terminalResult.accepted) {
				const selfImprovementResult = aiSuperPanelMessageBridge.runSilentSelfImprovementLoopFromLatestTrace();
				renderSkillsGrid(latestSkillsQuery);
				silentLoopLine = selfImprovementResult.updated
					? localize('aiSuperPanelSilentLoopUpdated', "hermes:silent-self-improvement:updated:{0}", selfImprovementResult.skill ?? '')
					: localize('aiSuperPanelSilentLoopNoUpdate', "hermes:silent-self-improvement:no-change");
			}
			appendTerminalLines([
				`terminal:input:${terminalInput.value}`,
				...terminalResult.output,
				...(silentLoopLine ? [silentLoopLine] : []),
			]);
			commandStatus.textContent = terminalResult.accepted
				? localize('aiSuperPanelTerminalCommandAccepted', "Terminal command accepted. Silent self-improvement loop ran.")
				: localize('aiSuperPanelTerminalCommandRejected', "Terminal command rejected.");
		};

		const createActionButton = (command: AISuperPanelCommand, label: string) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = label;
			button.style.padding = '4px 8px';
			button.style.border = '1px solid var(--vscode-panel-border)';
			button.style.borderRadius = '4px';
			button.style.background = 'var(--vscode-button-background)';
			button.style.color = 'var(--vscode-button-foreground)';
			this._register(addDisposableListener(button, 'click', () => {
				const result = aiSuperPanelMessageBridge.sendMessage({
					command,
					tab: activeTab,
					source: 'aiSuperPanel',
				});
				runHooksForAction(command);

				if (command === 'runAgent') {
					const endpointOrTask = apiInput.value.trim();
					appendTerminalLines(aiSuperPanelMessageBridge.runBuilderTask(endpointOrTask));
					postRunActionBar.style.display = 'flex';
					commandStatus.textContent = result.message;
					return;
				}
				if (command === 'callApi') {
					const endpointOrTask = apiInput.value.trim();
					const securityScanResult = aiSuperPanelMessageBridge.runSecurityReviewerScan(endpointOrTask);
					const securityScanPassed = securityScanResult.includes(AI_SUPER_PANEL_SECURITY_REVIEWER_PASS);
					appendTerminalLines([
						'api:call-with-security-scan',
						...securityScanResult,
					]);

					if (!securityScanPassed) {
						commandStatus.textContent = localize('aiSuperPanelSecurityScanBlockedCall', "Call blocked: Security Reviewer scan did not pass.");
						status(commandStatus.textContent);
						return;
					}

					const verification = aiSuperPanelMessageBridge.callAndVerify(endpointOrTask);
					appendTerminalLines([
						`api:call:${endpointOrTask}`,
						...verification.checks,
					]);
					setActiveTab('Traces', true);
					commandStatus.textContent = localize('aiSuperPanelTraceOpenedWithSecurity', "Call verified after Security Reviewer scan. Opened trace: {0}", verification.traceId);
					status(commandStatus.textContent);
					return;
				}
				if (command === 'improveSkill') {
					const improvement = aiSuperPanelMessageBridge.improveSkillFromLatestTrace();
					if (!improvement) {
						commandStatus.textContent = localize('aiSuperPanelImproveSkillNoTrace', "No trace available yet. Run an agent or API call first.");
						status(commandStatus.textContent);
						return;
					}
					renderSkillsGrid(latestSkillsQuery);
					commandStatus.textContent = improvement.added
						? localize('aiSuperPanelImproveSkillAdded', "Added trace-derived skill: {0}", improvement.skill)
						: localize('aiSuperPanelImproveSkillExists', "Trace-derived skill already exists: {0}", improvement.skill);
					status(commandStatus.textContent);
					return;
				}
				commandStatus.textContent = result.message;
			}));
			return button;
		};

		for (const tabName of AI_SUPER_PANEL_PHASE0_TABS) {
			const tabButton = document.createElement('button');
			tabButton.type = 'button';
			tabButton.textContent = tabName;
			tabButton.setAttribute('role', 'tab');
			tabButton.style.padding = '4px 8px';
			tabButton.style.border = '1px solid var(--vscode-panel-border)';
			tabButton.style.borderRadius = '4px';
			tabButton.style.background = 'var(--vscode-editor-background)';
			tabButton.style.color = 'var(--vscode-foreground)';
			this._register(addDisposableListener(tabButton, 'click', () => setActiveTab(tabName, true)));
			tabList.appendChild(tabButton);
			tabButtons.set(tabName, tabButton);
		}

		for (const subAgentName of aiSuperPanelMessageBridge.getPhase2SubAgents()) {
			const subAgentButton = document.createElement('button');
			subAgentButton.type = 'button';
			subAgentButton.textContent = subAgentName;
			subAgentButton.style.padding = '2px 6px';
			subAgentButton.style.border = '1px solid var(--vscode-panel-border)';
			subAgentButton.style.borderRadius = '4px';
			subAgentButton.style.background = 'var(--vscode-editor-background)';
			subAgentButton.style.color = 'var(--vscode-foreground)';
			subAgentButton.setAttribute('aria-label', localize('aiSuperPanelSubAgentButtonAria', "Run sub-agent {0}", subAgentName));
			this._register(addDisposableListener(subAgentButton, 'click', () => {
				runHooksForAction('subAgent');
				if (shouldAutoOpenDbMiddlewareForSubAgent(subAgentName)) {
					setActiveTab('DB Middleware', true);
					const dbConnectMessage = localize('aiSuperPanelDbMiddlewareAutoConnect', "Database Reviewer connected to DB Middleware tab.");
					commandStatus.textContent = dbConnectMessage;
					status(dbConnectMessage);
					return;
				}
				commandStatus.textContent = localize('aiSuperPanelSubAgentQueued', "Queued sub-agent: {0}", subAgentName);
				status(commandStatus.textContent);
			}));
			subAgentBar.appendChild(subAgentButton);
		}

		actionBar.appendChild(createActionButton('runAgent', localize('aiSuperPanelRunAgent', "Run Agent")));
		actionBar.appendChild(createActionButton('callApi', localize('aiSuperPanelCallWithSecurityScan', "Call with Security Scan")));
		improveSkillButton = createActionButton('improveSkill', localize('aiSuperPanelImproveSkill', "Improve Skill"));
		improveSkillButton.style.display = 'none';
		actionBar.appendChild(improveSkillButton);
		postRunActionBar.appendChild(createActionButton('createAutoPr', localize('aiSuperPanelCreateAutoPr', "Create Auto-PR")));
		postRunActionBar.appendChild(createActionButton('spawnSubAgents', localize('aiSuperPanelSpawnSubAgents', "Spawn Sub-agents")));
		this._register(addDisposableListener(terminalRunButton, 'click', () => executeTerminalCommand()));
		this._register(addDisposableListener(terminalInput, 'keydown', event => {
			if (event.key === 'Enter') {
				executeTerminalCommand();
			}
		}));
		this._register(addDisposableListener(skillsGrid, 'click', event => {
			const target = event.target as HTMLElement | null;
			const skillButton = target?.closest('button');
			const skillName = skillButton?.dataset.skillName;
			if (skillName) {
				const selectedSkillMessage = localize('aiSuperPanelSkillSelected', "Selected skill: {0}", skillName);
				commandStatus.textContent = selectedSkillMessage;
				status(selectedSkillMessage);
			}
		}));
		this._register(addDisposableListener(skillsSearch, 'input', () => {
			latestSkillsQuery = skillsSearch.value;
			skillsSearchScheduler.schedule();
		}));
		this._register(addDisposableListener(memoryToggle, 'click', () => {
			const expanded = memoryBody.style.display !== 'none';
			memoryBody.style.display = expanded ? 'none' : 'block';
			memoryToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
			memoryToggle.textContent = expanded
				? localize('aiSuperPanelMemoryToggleCollapsed', "Show Memory Search")
				: localize('aiSuperPanelMemoryToggleExpanded', "Hide Memory Search");
			status(expanded
				? localize('aiSuperPanelMemoryCollapsedStatus', "Memory search collapsed.")
				: localize('aiSuperPanelMemoryExpandedStatus', "Memory search expanded."));
		}));
		this._register(addDisposableListener(memorySearch, 'input', () => {
			latestMemoryQuery = memorySearch.value;
			memorySearchScheduler.schedule();
		}));
		this._register(addDisposableListener(memoryResults, 'click', event => {
			const target = event.target as HTMLElement | null;
			const memoryButton = target?.closest('button');
			const memoryTitle = memoryButton?.dataset.memoryTitle;
			const memorySource = memoryButton?.dataset.memorySource;
			if (memoryTitle && memorySource) {
				const memorySelected = localize('aiSuperPanelMemorySelected', "Selected memory: {0} from {1}", memoryTitle, memorySource);
				commandStatus.textContent = memorySelected;
				status(memorySelected);
			}
		}));

		const layout = document.createElement('div');
		layout.style.display = 'flex';
		layout.style.flexDirection = 'column';
		layout.style.gap = '8px';
		layout.style.height = '100%';
		layout.appendChild(topPane);
		layout.appendChild(bottomPane);

		root.appendChild(tabList);
		root.appendChild(subAgentBar);
		root.appendChild(hookStatusBanner);
		root.appendChild(layout);
		container.appendChild(root);
		setBuilderGraph();
		renderSkillsGrid();
		renderMemoryEntries();
		setActiveTab(activeTab);
	}
}

export class AISuperPanelAccessibilityHelp implements IAccessibleViewImplementation {
	readonly priority = 105;
	readonly name = 'aiSuperPanel';
	readonly type = AccessibleViewType.Help;
	readonly when = FocusedViewContext.isEqualTo(AI_SUPER_PANEL_VIEW_ID);

	getProvider(_accessor: ServicesAccessor): AccessibleContentProvider {
		const focusedElement = getActiveElement() as HTMLElement | null;
		const phase3HermesChatContext = aiSuperPanelMessageBridge.getPhase3HermesChatContext();
		const helpText = [
			localize('aiSuperPanel.a11y.help.header', "Accessibility Help: AI Super Panel"),
			localize('aiSuperPanel.a11y.help.description', "The AI Super Panel is a placeholder scaffold view with tabs and a 70/30 content layout."),
			localize('aiSuperPanel.a11y.help.tabNavigation', "Use Tab and Shift+Tab to move focus between tabs, panel content, terminal placeholder, and view actions."),
			localize('aiSuperPanel.a11y.help.actions', "Use Run Agent, Call with Security Scan, or Improve Skill buttons to queue placeholder messages for backend handling. Improve Skill extracts a trace-derived skill from the latest run or API call and adds it to the Skills tab. Call with Security Scan runs a Security Reviewer pre-check before API verification and blocks calls when the scan does not pass."),
			localize('aiSuperPanel.a11y.help.subAgents', "Builder and Chat tabs include quick buttons for {0} sub-agents at the top of the panel.", AI_SUPER_PANEL_PHASE2_SUB_AGENTS.length),
			localize('aiSuperPanel.a11y.help.databaseReviewerAutoConnect', "Selecting Database Reviewer automatically switches to the DB Middleware tab and reports connection status."),
			localize('aiSuperPanel.a11y.help.skillsGrid', "The Skills tab includes a searchable skills grid with {0} placeholder skills.", AI_SUPER_PANEL_PHASE2_SKILLS.length),
			localize('aiSuperPanel.a11y.help.memorySearch', "A collapsible memory search section supports USER.md, AGENTS.md, and trajectories sources. Use Show Memory Search to expand, type in Search memory, then Tab to memory results and press Enter to select an item."),
			localize(
				'aiSuperPanel.a11y.help.chatHermesContext',
				"The Chat tab always includes the Hermes user model with profile \"{0}\", workflow \"{1}\", and improvement loop \"{2}\", plus {3} session memory entries.",
				phase3HermesChatContext.userModel.profile,
				phase3HermesChatContext.userModel.workflow,
				phase3HermesChatContext.userModel.improvementLoop,
				phase3HermesChatContext.sessionMemory.length
			),
			localize('aiSuperPanel.a11y.help.hooks', "A hook status banner at the top reports automatic hook runs for panel actions: {0}.", phase2HooksDisplayLabel),
			localize('aiSuperPanel.a11y.help.postRunActions', "After running an agent, Create Auto-PR and Spawn Sub-agents actions become available."),
			localize('aiSuperPanel.a11y.help.apiInput', "Use the endpoint or task input to define the API Caller payload before running Call with Security Scan."),
			localize('aiSuperPanel.a11y.help.terminalInput', "Use the terminal command input to run /openswe run \"task\" scaffold commands. The task must not be empty or contain only whitespace."),
			localize('aiSuperPanel.a11y.help.terminalSelfImprovement', "After each accepted terminal command, a silent Hermes self-improvement loop runs and updates the Skills tab in real time."),
			localize('aiSuperPanel.a11y.help.commandPalette', "Use the Command Palette to run view commands while this view is focused."),
		].join('\n');

		return new AccessibleContentProvider(
			AccessibleViewProviderId.AISuperPanel,
			{ type: AccessibleViewType.Help },
			() => helpText,
			() => focusedElement?.focus(),
			AccessibilityVerbositySettingId.AISuperPanel,
		);
	}
}

export class AISuperPanelAccessibleView implements IAccessibleViewImplementation {
	readonly priority = 100;
	readonly name = 'aiSuperPanel';
	readonly type = AccessibleViewType.View;
	readonly when = FocusedViewContext.isEqualTo(AI_SUPER_PANEL_VIEW_ID);

	getProvider(_accessor: ServicesAccessor): AccessibleContentProvider {
		const focusedElement = getActiveElement() as HTMLElement | null;
		const contentText = [
			localize('aiSuperPanel.a11y.view.header', "AI Super Panel"),
			localize('aiSuperPanel.a11y.view.description', "This view is currently a Phase 1 scaffold with tabs."),
			localize('aiSuperPanel.a11y.view.tabs', "Available tabs: {0}.", AI_SUPER_PANEL_PHASE0_TABS.join(', ')),
			localize('aiSuperPanel.a11y.view.placeholder', "Top section is a 70 percent builder/API placeholder and bottom section is a 30 percent terminal stream placeholder."),
		].join('\n');

		return new AccessibleContentProvider(
			AccessibleViewProviderId.AISuperPanel,
			{ type: AccessibleViewType.View },
			() => contentText,
			() => focusedElement?.focus(),
			AccessibilityVerbositySettingId.AISuperPanel,
		);
	}
}
