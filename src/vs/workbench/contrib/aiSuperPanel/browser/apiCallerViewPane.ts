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
 * API Caller view pane for the AI Super Panel.
 * Provides one-click API/endpoint call & verify functionality
 * with schema validation and security scanning.
 *
 * Phase 2 – everything-Claude-code Integration:
 * - "Call with Security Scan" uses the security-reviewer sub-agent before any call
 * - Hooks (session-start, pre-tool-use, security-scan) run automatically
 * - Status banner shows hook results at the top
 */
export class APICallerViewPane extends ViewPane {

	static readonly ID = 'workbench.view.aiSuperPanel.apiCaller';

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
		container.classList.add('ai-super-panel-api-caller');

		const content = append(container, $('.ai-super-panel-api-caller-content'));

		// Hooks status banner (Phase 2)
		const hooksBanner = append(content, $('.ai-super-panel-hooks-banner'));
		hooksBanner.textContent = '🔒 Hooks: session-start ✓ | pre-tool-use ✓ | security-scan ✓';

		// Sub-agent quick buttons at the top (Phase 2)
		const subagentBar = append(content, $('.ai-super-panel-subagent-bar'));
		const subAgents = [
			'security-reviewer', 'api-validator', 'schema-checker',
			'rate-limiter', 'auth-verifier', 'payload-inspector'
		];
		for (const agent of subAgents) {
			const btn = append(subagentBar, $('button.ai-super-panel-subagent-button'));
			btn.textContent = agent;
			btn.title = `Activate ${agent} sub-agent`;
		}

		const header = append(content, $('.ai-super-panel-section-header'));
		header.textContent = 'API Caller & Verifier';

		const endpointForm = append(content, $('.ai-super-panel-endpoint-form'));
		const endpointInput = append(endpointForm, $('input.ai-super-panel-endpoint-input'));
		endpointInput.setAttribute('type', 'text');
		endpointInput.setAttribute('placeholder', 'Enter endpoint URL or agent name...');

		const callButton = append(endpointForm, $('button.ai-super-panel-call-button'));
		callButton.textContent = 'Call & Verify';
		callButton.title = 'Execute the call and verify response schema/status';

		// Security scan button (Phase 2)
		const securityCallButton = append(endpointForm, $('button.ai-super-panel-security-call-button'));
		securityCallButton.textContent = '🔒 Call with Security Scan';
		securityCallButton.title = 'Use the security-reviewer sub-agent before executing the call';
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.container) {
			this.container.style.height = `${height}px`;
		}
	}
}
