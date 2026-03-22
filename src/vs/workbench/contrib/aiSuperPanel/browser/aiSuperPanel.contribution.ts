/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { Extensions as ViewContainerExtensions, IViewContainersRegistry, IViewsRegistry, ViewContainerLocation } from '../../../common/views.js';
import { AI_SUPER_PANEL_VIEWLET_ID, AI_SUPER_PANEL_BUILDER_VIEW_ID, AI_SUPER_PANEL_API_CALLER_VIEW_ID, AI_SUPER_PANEL_TRACES_VIEW_ID, AI_SUPER_PANEL_DB_MIDDLEWARE_VIEW_ID, AI_SUPER_PANEL_SKILLS_VIEW_ID } from './aiSuperPanel.js';
import { aiSuperPanelViewIcon, builderTabIcon, apiCallerTabIcon, tracesTabIcon, dbMiddlewareTabIcon, skillsTabIcon } from './aiSuperPanelIcons.js';
import { BuilderViewPane } from './builderViewPane.js';
import { APICallerViewPane } from './apiCallerViewPane.js';
import { TracesViewPane } from './tracesViewPane.js';
import { DBMiddlewareViewPane } from './dbMiddlewareViewPane.js';
import { SkillsViewPane } from './skillsViewPane.js';
import { KeyMod, KeyCode } from '../../../../base/common/keyCodes.js';
import { registerAction2, Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import './media/aiSuperPanel.css';

// --- View Container Registration ---

const viewContainerRegistry = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry);
const viewsRegistry = Registry.as<IViewsRegistry>(ViewContainerExtensions.ViewsRegistry);

const VIEW_CONTAINER = viewContainerRegistry.registerViewContainer({
	id: AI_SUPER_PANEL_VIEWLET_ID,
	title: localize2('aiSuperPanel', "AI Super Panel"),
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [AI_SUPER_PANEL_VIEWLET_ID, { mergeViewWithContainerWhenSingleView: false }]),
	icon: aiSuperPanelViewIcon,
	order: 10,
	openCommandActionDescriptor: {
		id: AI_SUPER_PANEL_VIEWLET_ID,
		mnemonicTitle: localize({ key: 'miViewAISuperPanel', comment: ['&& denotes a mnemonic'] }, "AI S&&uper Panel"),
		keybindings: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyA },
		order: 5,
	},
}, ViewContainerLocation.Sidebar);

// --- View Registration ---

viewsRegistry.registerViews([
	{
		id: AI_SUPER_PANEL_BUILDER_VIEW_ID,
		name: localize2('aiSuperPanel.builder', "Builder"),
		ctorDescriptor: new SyncDescriptor(BuilderViewPane),
		containerIcon: builderTabIcon,
		canToggleVisibility: true,
		canMoveView: true,
		order: 1,
		weight: 30,
	},
	{
		id: AI_SUPER_PANEL_API_CALLER_VIEW_ID,
		name: localize2('aiSuperPanel.apiCaller', "API Caller"),
		ctorDescriptor: new SyncDescriptor(APICallerViewPane),
		containerIcon: apiCallerTabIcon,
		canToggleVisibility: true,
		canMoveView: true,
		order: 3,
		weight: 20,
	},
	{
		id: AI_SUPER_PANEL_TRACES_VIEW_ID,
		name: localize2('aiSuperPanel.traces', "Traces"),
		ctorDescriptor: new SyncDescriptor(TracesViewPane),
		containerIcon: tracesTabIcon,
		canToggleVisibility: true,
		canMoveView: true,
		order: 4,
		weight: 20,
	},
	{
		id: AI_SUPER_PANEL_DB_MIDDLEWARE_VIEW_ID,
		name: localize2('aiSuperPanel.dbMiddleware', "DB Middleware"),
		ctorDescriptor: new SyncDescriptor(DBMiddlewareViewPane),
		containerIcon: dbMiddlewareTabIcon,
		canToggleVisibility: true,
		canMoveView: true,
		order: 5,
		weight: 15,
	},
	{
		id: AI_SUPER_PANEL_SKILLS_VIEW_ID,
		name: localize2('aiSuperPanel.skills', "Skills"),
		ctorDescriptor: new SyncDescriptor(SkillsViewPane),
		containerIcon: skillsTabIcon,
		canToggleVisibility: true,
		canMoveView: true,
		order: 6,
		weight: 15,
	},
], VIEW_CONTAINER);

// --- Actions ---

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.focusPanel',
			title: localize2('aiSuperPanel.focusPanel', "Focus AI Super Panel"),
			category: Categories.View,
			f1: true,
			keybinding: {
				primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyA,
				weight: 200,
			},
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openViewContainer(AI_SUPER_PANEL_VIEWLET_ID);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.focusBuilder',
			title: localize2('aiSuperPanel.focusBuilder', "Focus AI Super Panel: Builder"),
			category: Categories.View,
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(AI_SUPER_PANEL_BUILDER_VIEW_ID, true);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.focusTraces',
			title: localize2('aiSuperPanel.focusTraces', "Focus AI Super Panel: Traces"),
			category: Categories.View,
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(AI_SUPER_PANEL_TRACES_VIEW_ID, true);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.focusDBMiddleware',
			title: localize2('aiSuperPanel.focusDBMiddleware', "Focus AI Super Panel: DB Middleware"),
			category: Categories.View,
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(AI_SUPER_PANEL_DB_MIDDLEWARE_VIEW_ID, true);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.focusSkills',
			title: localize2('aiSuperPanel.focusSkills', "Focus AI Super Panel: Skills"),
			category: Categories.View,
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(AI_SUPER_PANEL_SKILLS_VIEW_ID, true);
	}
});

// --- Phase 5: Final Polish & Copilot Parity ---

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.focusTerminal',
			title: localize2('aiSuperPanel.focusTerminal', "Focus AI Super Panel: Embedded Terminal"),
			category: Categories.View,
			f1: true,
			keybinding: {
				primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyT,
				weight: 200,
			},
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(AI_SUPER_PANEL_BUILDER_VIEW_ID, true);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.focusAPICaller',
			title: localize2('aiSuperPanel.focusAPICaller', "Focus AI Super Panel: API Caller"),
			category: Categories.View,
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(AI_SUPER_PANEL_API_CALLER_VIEW_ID, true);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'aiSuperPanel.askFromEditor',
			title: localize2('aiSuperPanel.askFromEditor', "Ask AI Super Panel"),
			category: Categories.View,
			f1: true,
			metadata: {
				description: localize2('aiSuperPanel.askFromEditor.description', "Open AI Super Panel with the current editor context"),
			},
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openViewContainer(AI_SUPER_PANEL_VIEWLET_ID);
	}
});
