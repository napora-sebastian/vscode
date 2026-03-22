/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { Codicon } from '../../../../base/common/codicons.js';

export const aiSuperPanelViewIcon = registerIcon('ai-super-panel-view-icon', Codicon.sparkle, localize('aiSuperPanelViewIcon', 'View icon of the AI Super Panel view.'));
export const builderTabIcon = registerIcon('ai-super-panel-builder-icon', Codicon.tools, localize('builderTabIcon', 'Icon for the Builder tab in AI Super Panel.'));
export const chatTabIcon = registerIcon('ai-super-panel-chat-icon', Codicon.comment, localize('chatTabIcon', 'Icon for the Chat tab in AI Super Panel.'));
export const apiCallerTabIcon = registerIcon('ai-super-panel-api-icon', Codicon.globe, localize('apiCallerTabIcon', 'Icon for the API Caller tab in AI Super Panel.'));
export const tracesTabIcon = registerIcon('ai-super-panel-traces-icon', Codicon.pulse, localize('tracesTabIcon', 'Icon for the Traces tab in AI Super Panel.'));
export const dbMiddlewareTabIcon = registerIcon('ai-super-panel-db-icon', Codicon.database, localize('dbMiddlewareTabIcon', 'Icon for the DB Middleware tab in AI Super Panel.'));
export const skillsTabIcon = registerIcon('ai-super-panel-skills-icon', Codicon.lightbulb, localize('skillsTabIcon', 'Icon for the Skills tab in AI Super Panel.'));
