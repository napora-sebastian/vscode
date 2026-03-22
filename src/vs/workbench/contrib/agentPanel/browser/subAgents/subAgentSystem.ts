/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Sub-Agent System — Quick-Access Buttons & Automated Hooks
 *
 * From Ai-first.md Phase 2 (everything-Claude-code integration):
 *   §1 — "Load all 28 sub-agents as quick buttons at the top of Chat and Builder tabs."
 *   §3 — "Hooks (session-start, pre-tool-use, security-scan) run automatically
 *          on every panel action and show status banner at the top."
 *   §4 — "one-click 'Call with Security Scan' uses the security-reviewer
 *          sub-agent before any call."
 *   §5 — "Database-reviewer sub-agent auto-connects to the DB Middleware tab."
 */

// ── Hook types ──────────────────────────────────────────────────────────────

/**
 * Hook trigger points that fire automatically on panel actions.
 * Ai-first.md Phase 2 §3.
 */
export const enum HookTrigger {
	/** Fires when the AI Super Panel session starts */
	SessionStart = 'session-start',
	/** Fires before any tool/agent invocation */
	PreToolUse = 'pre-tool-use',
	/** Fires after tool/agent invocation completes */
	PostToolUse = 'post-tool-use',
	/** Fires before API calls to run security review */
	SecurityScan = 'security-scan',
	/** Fires after a skill is extracted (Ai-first.md Phase 3 §2) */
	PostSkillExtraction = 'post-skill-extraction',
}

export interface IHookDefinition {
	/** Unique identifier for this hook */
	readonly id: string;
	/** Human-readable name */
	readonly name: string;
	/** When this hook fires */
	readonly trigger: HookTrigger;
	/** The sub-agent that handles this hook */
	readonly handlerAgent: string;
	/** Whether this hook is enabled by default */
	readonly enabledByDefault: boolean;
	/** Description shown in the status banner */
	readonly description: string;
}

/**
 * Built-in hooks from Ai-first.md Phase 2 §3.
 */
export const BUILT_IN_HOOKS: readonly IHookDefinition[] = [
	{
		id: 'hook.sessionStart',
		name: 'Session Initialization',
		trigger: HookTrigger.SessionStart,
		handlerAgent: 'session-manager',
		enabledByDefault: true,
		description: 'Initialize agent context and load user memory on session start',
	},
	{
		id: 'hook.preToolUse',
		name: 'Pre-Tool Safety Check',
		trigger: HookTrigger.PreToolUse,
		handlerAgent: 'safety-reviewer',
		enabledByDefault: true,
		description: 'Validate tool inputs and check permissions before execution',
	},
	{
		id: 'hook.securityScan',
		name: 'Security Scan',
		trigger: HookTrigger.SecurityScan,
		handlerAgent: 'security-reviewer',
		enabledByDefault: true,
		description: 'Run security analysis on code changes and API calls',
	},
	{
		id: 'hook.postSkillExtraction',
		name: 'Skill Quality Check',
		trigger: HookTrigger.PostSkillExtraction,
		handlerAgent: 'skill-reviewer',
		enabledByDefault: false,
		description: 'Validate extracted skills for correctness and relevance',
	},
];

// ── Sub-agent definitions ───────────────────────────────────────────────────

/**
 * Categories for organizing the 28 sub-agents into the quick-button bar.
 */
export const enum SubAgentCategory {
	/** Code editing and generation */
	CodeGen = 'codegen',
	/** Code review and quality */
	Review = 'review',
	/** Security and safety */
	Security = 'security',
	/** Database and data */
	Data = 'data',
	/** Testing and verification */
	Testing = 'testing',
	/** DevOps and deployment */
	DevOps = 'devops',
	/** Documentation and knowledge */
	Docs = 'docs',
}

export interface ISubAgentDefinition {
	/** Unique identifier */
	readonly id: string;
	/** Display name for the quick button */
	readonly name: string;
	/** Category for grouping */
	readonly category: SubAgentCategory;
	/** Short description */
	readonly description: string;
	/** Icon codicon name */
	readonly icon: string;
	/** Which tabs show this sub-agent's quick button */
	readonly visibleInTabs: readonly string[];
}

/**
 * The 28 sub-agents from Ai-first.md Phase 2 §1.
 *
 * "Load all 28 sub-agents as quick buttons at the top of the Chat and Builder tabs."
 *
 * These are a representative set covering the categories described.
 * Extensions can register additional sub-agents at runtime.
 */
export const BUILT_IN_SUB_AGENTS: readonly ISubAgentDefinition[] = [
	// ── CodeGen ─────────────────────────────────────────────
	{ id: 'sub.codeWriter', name: 'Code Writer', category: SubAgentCategory.CodeGen, description: 'Generate new code from natural language', icon: 'code', visibleInTabs: ['builder', 'chat'] },
	{ id: 'sub.refactorer', name: 'Refactorer', category: SubAgentCategory.CodeGen, description: 'Refactor existing code for clarity and performance', icon: 'references', visibleInTabs: ['builder', 'chat'] },
	{ id: 'sub.bugFixer', name: 'Bug Fixer', category: SubAgentCategory.CodeGen, description: 'Diagnose and fix bugs in code', icon: 'bug', visibleInTabs: ['builder', 'chat'] },
	{ id: 'sub.completionProvider', name: 'Completion Provider', category: SubAgentCategory.CodeGen, description: 'Provide inline code completions', icon: 'sparkle', visibleInTabs: ['chat'] },

	// ── Review ──────────────────────────────────────────────
	{ id: 'sub.codeReviewer', name: 'Code Reviewer', category: SubAgentCategory.Review, description: 'Review code changes for quality and correctness', icon: 'checklist', visibleInTabs: ['builder', 'chat'] },
	{ id: 'sub.prReviewer', name: 'PR Reviewer', category: SubAgentCategory.Review, description: 'Review pull requests and suggest improvements', icon: 'git-pull-request', visibleInTabs: ['builder'] },
	{ id: 'sub.lintAdvisor', name: 'Lint Advisor', category: SubAgentCategory.Review, description: 'Suggest linting and style improvements', icon: 'warning', visibleInTabs: ['chat'] },
	{ id: 'sub.architectReviewer', name: 'Architecture Reviewer', category: SubAgentCategory.Review, description: 'Review code architecture and design patterns', icon: 'organization', visibleInTabs: ['builder', 'chat'] },

	// ── Security ────────────────────────────────────────────
	{ id: 'sub.securityReviewer', name: 'Security Reviewer', category: SubAgentCategory.Security, description: 'Scan for vulnerabilities and security issues', icon: 'shield', visibleInTabs: ['builder', 'chat', 'apiCaller'] },
	{ id: 'sub.dependencyAuditor', name: 'Dependency Auditor', category: SubAgentCategory.Security, description: 'Audit dependencies for known vulnerabilities', icon: 'lock', visibleInTabs: ['builder'] },
	{ id: 'sub.secretsScanner', name: 'Secrets Scanner', category: SubAgentCategory.Security, description: 'Detect accidentally committed secrets', icon: 'key', visibleInTabs: ['builder', 'chat'] },
	{ id: 'sub.accessController', name: 'Access Controller', category: SubAgentCategory.Security, description: 'Manage and validate access permissions', icon: 'verified', visibleInTabs: ['chat'] },

	// ── Data ────────────────────────────────────────────────
	{ id: 'sub.dbReviewer', name: 'Database Reviewer', category: SubAgentCategory.Data, description: 'Review database schemas and queries', icon: 'database', visibleInTabs: ['dbMiddleware', 'chat'] },
	{ id: 'sub.dataModeler', name: 'Data Modeler', category: SubAgentCategory.Data, description: 'Design and validate data models', icon: 'symbol-structure', visibleInTabs: ['dbMiddleware', 'builder'] },
	{ id: 'sub.queryOptimizer', name: 'Query Optimizer', category: SubAgentCategory.Data, description: 'Optimize SQL/Cypher/vector queries', icon: 'graph', visibleInTabs: ['dbMiddleware'] },
	{ id: 'sub.migrationPlanner', name: 'Migration Planner', category: SubAgentCategory.Data, description: 'Plan database migrations safely', icon: 'arrow-swap', visibleInTabs: ['dbMiddleware'] },

	// ── Testing ─────────────────────────────────────────────
	{ id: 'sub.testWriter', name: 'Test Writer', category: SubAgentCategory.Testing, description: 'Generate unit and integration tests', icon: 'beaker', visibleInTabs: ['builder', 'chat'] },
	{ id: 'sub.testRunner', name: 'Test Runner', category: SubAgentCategory.Testing, description: 'Run tests and report results', icon: 'play', visibleInTabs: ['builder'] },
	{ id: 'sub.coverageAnalyzer', name: 'Coverage Analyzer', category: SubAgentCategory.Testing, description: 'Analyze and improve test coverage', icon: 'pie-chart', visibleInTabs: ['builder'] },
	{ id: 'sub.e2eTester', name: 'E2E Tester', category: SubAgentCategory.Testing, description: 'Generate and run end-to-end tests', icon: 'globe', visibleInTabs: ['builder'] },

	// ── DevOps ──────────────────────────────────────────────
	{ id: 'sub.deployer', name: 'Deployer', category: SubAgentCategory.DevOps, description: 'Manage deployments and CI/CD pipelines', icon: 'rocket', visibleInTabs: ['builder'] },
	{ id: 'sub.infraPlanner', name: 'Infra Planner', category: SubAgentCategory.DevOps, description: 'Plan infrastructure changes', icon: 'server', visibleInTabs: ['builder'] },
	{ id: 'sub.monitorAgent', name: 'Monitor Agent', category: SubAgentCategory.DevOps, description: 'Set up monitoring and alerting', icon: 'pulse', visibleInTabs: ['builder', 'traces'] },
	{ id: 'sub.cicdOptimizer', name: 'CI/CD Optimizer', category: SubAgentCategory.DevOps, description: 'Optimize build and deploy pipelines', icon: 'gear', visibleInTabs: ['builder'] },

	// ── Docs ────────────────────────────────────────────────
	{ id: 'sub.docWriter', name: 'Doc Writer', category: SubAgentCategory.Docs, description: 'Generate documentation from code', icon: 'book', visibleInTabs: ['chat', 'builder'] },
	{ id: 'sub.apiDocGenerator', name: 'API Doc Generator', category: SubAgentCategory.Docs, description: 'Generate API documentation', icon: 'notebook', visibleInTabs: ['apiCaller', 'builder'] },
	{ id: 'sub.changelogWriter', name: 'Changelog Writer', category: SubAgentCategory.Docs, description: 'Generate changelogs from git history', icon: 'history', visibleInTabs: ['builder'] },
	{ id: 'sub.readmeUpdater', name: 'README Updater', category: SubAgentCategory.Docs, description: 'Keep README files in sync with code', icon: 'markdown', visibleInTabs: ['builder', 'chat'] },
];

/**
 * Get sub-agents visible in a specific tab.
 */
export function getSubAgentsForTab(tabId: string): readonly ISubAgentDefinition[] {
	return BUILT_IN_SUB_AGENTS.filter(a => a.visibleInTabs.includes(tabId));
}

/**
 * Get hooks for a specific trigger point.
 */
export function getHooksForTrigger(trigger: HookTrigger): readonly IHookDefinition[] {
	return BUILT_IN_HOOKS.filter(h => h.trigger === trigger);
}
