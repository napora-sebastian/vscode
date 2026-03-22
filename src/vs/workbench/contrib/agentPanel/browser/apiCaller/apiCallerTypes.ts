/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Omega AI-First IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * API Caller Tab — Endpoint Call & Verify
 *
 * From Ai-first.md:
 *   Phase 1 §3 — "In API Caller tab: paste any endpoint/agent name →
 *                  'Call & Verify' runs it in open-swe sandbox, checks
 *                  schema/status, and auto-opens the trace in Traces tab."
 *   Phase 2 §4 — "one-click 'Call with Security Scan' uses the
 *                  security-reviewer sub-agent before any call."
 *   Phase 4 §4 — "API Caller tab: tree of saved endpoints + form +
 *                  'Verify' checklist (schema, security, DB impact)."
 *   Phase 4 §5 — "'Run in Terminal' button executes the call in the
 *                  bottom terminal and instantly shows the trace."
 *
 * From Ai-second.md:
 *   Phase 6 §3 — "Create a 'Playground' tab where you can call your own
 *                  external agent endpoints, track latency, and verify
 *                  JSON output against the IDE's internal state."
 */

// ── HTTP method type ────────────────────────────────────────────────────────
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// ── Saved endpoint ──────────────────────────────────────────────────────────

/**
 * A saved endpoint in the API Caller tree (Ai-first.md Phase 4 §4).
 */
export interface ISavedEndpoint {
	/** Unique identifier */
	readonly id: string;
	/** Display name in the tree */
	readonly name: string;
	/** Full URL of the endpoint */
	readonly url: string;
	/** HTTP method */
	readonly method: HttpMethod;
	/** Default request headers */
	readonly headers: Record<string, string>;
	/** Default request body (JSON) */
	readonly body?: string;
	/** Optional folder for organizing endpoints */
	readonly folder?: string;
	/** Tags for filtering */
	readonly tags?: readonly string[];
}

// ── Verify checklist ────────────────────────────────────────────────────────

/**
 * Verification checks applied to every API call (Ai-first.md Phase 4 §4).
 *
 * "Verify" checklist: schema, security, DB impact.
 */
export const enum VerifyCheckType {
	/** Validate response matches expected JSON schema */
	Schema = 'schema',
	/** Run security-reviewer sub-agent on request/response */
	Security = 'security',
	/** Assess database impact of the API call */
	DBImpact = 'dbImpact',
	/** Check HTTP status code matches expectation */
	StatusCode = 'statusCode',
	/** Measure and record latency (from Ai-second.md Phase 6 §3) */
	Latency = 'latency',
}

export interface IVerifyCheckResult {
	readonly check: VerifyCheckType;
	readonly passed: boolean;
	readonly message: string;
	readonly details?: Record<string, unknown>;
}

// ── API call request & response ─────────────────────────────────────────────

export interface IAPICallRequest {
	/** The endpoint to call */
	readonly endpoint: ISavedEndpoint;
	/** Whether to run security scan before calling (Ai-first.md Phase 2 §4) */
	readonly withSecurityScan: boolean;
	/** Whether to auto-open the trace in the Traces tab (Ai-first.md Phase 1 §3) */
	readonly autoOpenTrace: boolean;
	/** Whether to execute in the embedded terminal (Ai-first.md Phase 4 §5) */
	readonly runInTerminal: boolean;
	/** Which verify checks to run */
	readonly verifyChecks: readonly VerifyCheckType[];
}

export interface IAPICallResponse {
	/** HTTP status code */
	readonly statusCode: number;
	/** Response headers */
	readonly headers: Record<string, string>;
	/** Response body */
	readonly body: string;
	/** Latency in milliseconds */
	readonly latencyMs: number;
	/** Trace ID for linking to the Traces tab */
	readonly traceId: string;
	/** Verification results */
	readonly verifyResults: readonly IVerifyCheckResult[];
}

/**
 * Default verify checks to apply on every call.
 */
export const DEFAULT_VERIFY_CHECKS: readonly VerifyCheckType[] = [
	VerifyCheckType.StatusCode,
	VerifyCheckType.Schema,
	VerifyCheckType.Latency,
];

/**
 * Create a default API call request for a given endpoint.
 */
export function createDefaultAPICallRequest(endpoint: ISavedEndpoint): IAPICallRequest {
	return {
		endpoint,
		withSecurityScan: false,
		autoOpenTrace: true,
		runInTerminal: false,
		verifyChecks: DEFAULT_VERIFY_CHECKS,
	};
}
