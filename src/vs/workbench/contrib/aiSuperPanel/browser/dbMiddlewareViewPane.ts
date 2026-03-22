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
 * DB Middleware view pane for the AI Super Panel.
 * Provides database connection management and query functionality
 * for Postgres, Neo4j, and Vector DB.
 */
export class DBMiddlewareViewPane extends ViewPane {

	static readonly ID = 'workbench.view.aiSuperPanel.dbMiddleware';

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
		container.classList.add('ai-super-panel-db-middleware');

		const content = append(container, $('.ai-super-panel-db-content'));
		const header = append(content, $('.ai-super-panel-section-header'));
		header.textContent = 'DB Middleware';

		const connectionForm = append(content, $('.ai-super-panel-db-connection-form'));
		const dbTypeSelect = append(connectionForm, $('select.ai-super-panel-db-type'));
		for (const dbType of ['PostgreSQL', 'Neo4j', 'Vector DB']) {
			const option = append(dbTypeSelect, $('option'));
			option.textContent = dbType;
		}

		const connectionInput = append(connectionForm, $('input.ai-super-panel-db-connection-input'));
		connectionInput.setAttribute('type', 'text');
		connectionInput.setAttribute('placeholder', 'Connection string...');

		const connectButton = append(connectionForm, $('button.ai-super-panel-db-connect-button'));
		connectButton.textContent = 'Connect';

		const querySection = append(content, $('.ai-super-panel-db-query-section'));
		const queryHeader = append(querySection, $('.ai-super-panel-section-subheader'));
		queryHeader.textContent = 'Quick Query';

		const queryInput = append(querySection, $('textarea.ai-super-panel-db-query-input'));
		queryInput.setAttribute('placeholder', 'Enter your query...');
		queryInput.setAttribute('rows', '3');

		const queryControls = append(querySection, $('.ai-super-panel-db-query-controls'));
		const runQueryButton = append(queryControls, $('button.ai-super-panel-db-run-query'));
		runQueryButton.textContent = 'Run Query';

		const addToolButton = append(queryControls, $('button.ai-super-panel-db-add-tool'));
		addToolButton.textContent = 'Add to Current Agent';
		addToolButton.title = 'Inject this query as a LangGraph tool';
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.container) {
			this.container.style.height = `${height}px`;
		}
	}
}
