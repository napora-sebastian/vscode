/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { AccessibleViewRegistry } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IViewContainersRegistry, IViewsRegistry, ViewContainer, ViewContainerLocation, Extensions as ViewExtensions } from '../../../common/views.js';
import { ChatContextKeys } from '../../chat/common/actions/chatContextKeys.js';
import { AI_SUPER_PANEL_VIEW_CONTAINER_ID, AI_SUPER_PANEL_VIEW_ID } from '../common/aiSuperPanel.js';
import { aiSuperPanelViewIcon } from './aiSuperPanelIcons.js';
import { AISuperPanelAccessibleView, AISuperPanelAccessibilityHelp, AISuperPanelView } from './aiSuperPanelView.js';

const aiSuperPanelViewContainer: ViewContainer = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
	id: AI_SUPER_PANEL_VIEW_CONTAINER_ID,
	title: localize2('aiSuperPanel', "AI Super Panel"),
	icon: aiSuperPanelViewIcon,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [AI_SUPER_PANEL_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
	storageId: AI_SUPER_PANEL_VIEW_CONTAINER_ID,
	hideIfEmpty: true,
	order: 7,
	openCommandActionDescriptor: {
		id: AI_SUPER_PANEL_VIEW_CONTAINER_ID,
		mnemonicTitle: localize({ key: 'miViewAISuperPanel', comment: ['&& denotes a mnemonic'] }, "AI Super &&Panel"),
		order: 7,
	},
}, ViewContainerLocation.Sidebar);

Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([{
	id: AI_SUPER_PANEL_VIEW_ID,
	containerIcon: aiSuperPanelViewIcon,
	containerTitle: aiSuperPanelViewContainer.title.value,
	singleViewPaneContainerTitle: aiSuperPanelViewContainer.title.value,
	name: localize2('aiSuperPanel', "AI Super Panel"),
	canToggleVisibility: false,
	canMoveView: true,
	ctorDescriptor: new SyncDescriptor(AISuperPanelView),
	when: ContextKeyExpr.and(ChatContextKeys.enabled),
}], aiSuperPanelViewContainer);

AccessibleViewRegistry.register(new AISuperPanelAccessibilityHelp());
AccessibleViewRegistry.register(new AISuperPanelAccessibleView());
