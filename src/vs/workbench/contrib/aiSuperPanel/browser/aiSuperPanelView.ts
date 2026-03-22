/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { addDisposableListener, getActiveElement } from '../../../../base/browser/dom.js';
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
import { AI_SUPER_PANEL_PHASE0_TABS, AI_SUPER_PANEL_VIEW_ID, AISuperPanelCommand, AISuperPanelTab } from '../common/aiSuperPanel.js';
import { aiSuperPanelMessageBridge } from './aiSuperPanelMessageBridge.js';

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

		let activeTab: AISuperPanelTab = AI_SUPER_PANEL_PHASE0_TABS[0];
		const tabButtons = new Map<AISuperPanelTab, HTMLButtonElement>();

		const contentLabel = document.createElement('div');
		contentLabel.tabIndex = 0;
		contentLabel.setAttribute('role', 'note');
		contentLabel.style.padding = '4px 0';

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

		const setActiveTab = (tab: AISuperPanelTab) => {
			activeTab = tab;
			for (const [name, button] of tabButtons) {
				const selected = name === tab;
				button.setAttribute('aria-selected', selected ? 'true' : 'false');
				button.tabIndex = selected ? 0 : -1;
			}
			contentLabel.textContent = localize('aiSuperPanelTabContentPlaceholder', "Active tab: {0}. Panel content placeholder (70%).", tab);
		};

		const setBuilderGraph = () => {
			const lines = aiSuperPanelMessageBridge.loadBuilderGraph();
			builderGraphRegion.textContent = localize('aiSuperPanelBuilderGraphLoaded', "Builder graph loaded: {0}", lines.join(' → '));
		};

		const appendTerminalLines = (lines: readonly string[]) => {
			const existing = terminalLog.textContent ? `${terminalLog.textContent}\n` : '';
			terminalLog.textContent = `${existing}${lines.join('\n')}`;
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
				let messagePayload = apiInput.value.trim();
				if (!messagePayload && command === 'runAgent') {
					messagePayload = 'phase1-task';
				}
				const result = aiSuperPanelMessageBridge.sendMessage({
					command,
					tab: activeTab,
					source: 'aiSuperPanel',
					payload: { endpointOrTask: messagePayload },
				});

				if (command === 'runAgent') {
					appendTerminalLines(aiSuperPanelMessageBridge.runBuilderTask(messagePayload));
				}
				if (command === 'callApi') {
					const verification = aiSuperPanelMessageBridge.callAndVerify(messagePayload);
					appendTerminalLines([
						`api:call:${messagePayload || 'default-endpoint'}`,
						...verification.checks,
					]);
					setActiveTab('Traces');
					commandStatus.textContent = localize('aiSuperPanelTraceOpened', "Call verified. Opened trace: {0}", verification.traceId);
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
			this._register(addDisposableListener(tabButton, 'click', () => setActiveTab(tabName)));
			tabList.appendChild(tabButton);
			tabButtons.set(tabName, tabButton);
		}

		actionBar.appendChild(createActionButton('runAgent', localize('aiSuperPanelRunAgent', "Run Agent")));
		actionBar.appendChild(createActionButton('callApi', localize('aiSuperPanelCallApi', "Call & Verify")));
		actionBar.appendChild(createActionButton('improveSkill', localize('aiSuperPanelImproveSkill', "Improve Skill")));

		const layout = document.createElement('div');
		layout.style.display = 'flex';
		layout.style.flexDirection = 'column';
		layout.style.gap = '8px';
		layout.style.height = '100%';
		layout.appendChild(topPane);
		layout.appendChild(bottomPane);

		root.appendChild(tabList);
		root.appendChild(layout);
		container.appendChild(root);
		setBuilderGraph();
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
		const helpText = [
			localize('aiSuperPanel.a11y.help.header', "Accessibility Help: AI Super Panel"),
			localize('aiSuperPanel.a11y.help.description', "The AI Super Panel is a placeholder scaffold view with tabs and a 70/30 content layout."),
			localize('aiSuperPanel.a11y.help.tabNavigation', "Use Tab and Shift+Tab to move focus between tabs, panel content, terminal placeholder, and view actions."),
			localize('aiSuperPanel.a11y.help.actions', "Use Run Agent, Call & Verify, or Improve Skill buttons to queue placeholder messages for backend handling."),
			localize('aiSuperPanel.a11y.help.apiInput', "Use the endpoint or task input to define the API Caller payload before running Call & Verify."),
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
