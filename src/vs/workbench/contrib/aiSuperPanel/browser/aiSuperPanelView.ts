/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getActiveElement } from '../../../../base/browser/dom.js';
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
import { AI_SUPER_PANEL_VIEW_ID } from '../common/aiSuperPanel.js';

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
		const placeholder = document.createElement('div');
		placeholder.textContent = localize('aiSuperPanelPlaceholder', "AI Super Panel is ready. Phase 0 scaffold is active.");
		placeholder.tabIndex = 0;
		placeholder.setAttribute('role', 'note');
		container.appendChild(placeholder);
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
			localize('aiSuperPanel.a11y.help.description', "The AI Super Panel is a placeholder scaffold view. Use Tab and Shift+Tab to move focus between view content and view actions."),
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
			localize('aiSuperPanel.a11y.view.description', "This view is currently a Phase 0 scaffold."),
			localize('aiSuperPanel.a11y.view.placeholder', "AI Super Panel is ready. Phase 0 scaffold is active."),
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
