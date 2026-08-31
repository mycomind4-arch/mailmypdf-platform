/**
 * Canonical workflow registry — the single source of truth for which
 * workflows exist, their vertical, their capabilities, and their
 * production certification status.
 *
 * A workflow may only be registered if it has:
 *   - A unique canonical workflow ID
 *   - A declared vertical
 *   - A declared set of capabilities
 *   - A Gold Standard certification status
 *
 * The registry deduplicates: the same workflow ID exposed through
 * multiple verticals is ONE entry. The vertical is the presentation
 * context, not a separate workflow.
 */

import type { PlatformId } from "@mailmypdf/core";

export type CertificationStatus =
  | "planned"       // documented but not implemented
  | "development"   // implemented but not certified
  | "certified"     // Gold Standard certified end-to-end
  | "production"    // deployed and serving real users
  | "deprecated";   // superseded or retired

export interface WorkflowManifest {
  /** Canonical ID — used across all verticals */
  id: string;
  /** Display name */
  name: string;
  /** Primary vertical */
  verticalId: string;
  /** Additional verticals this workflow is exposed through */
  additionalVerticals?: string[];
  /** Domain capabilities this workflow provides */
  capabilities: readonly string[];
  /** Gold Standard certification status */
  certification: CertificationStatus;
  /** Wave number in the productionization plan (0 = substrate, 1+ = production waves) */
  wave?: number;
  /** Route paths where this workflow is exposed */
  routes: readonly string[];
  /** API endpoint base */
  apiBase: string;
  /** Pricing profile ID (from @mailmypdf/pricing) */
  pricingProfileId?: string;
  /** Minimum readiness score for approval (0-100) */
  minApprovalScore?: number;
}

export interface WorkflowRegistry {
  register(manifest: WorkflowManifest): void;
  get(id: string): WorkflowManifest | null;
  list(options?: { verticalId?: string; certification?: CertificationStatus }): WorkflowManifest[];
  listByWave(wave: number): WorkflowManifest[];
  certify(id: string): void;
  promoteToProduction(id: string): void;
  /** Resolve a canonical workflow ID from a route path */
  resolveByRoute(route: string): WorkflowManifest | null;
}

export function createWorkflowRegistry(): WorkflowRegistry {
  const workflows = new Map<string, WorkflowManifest>();
  const routeIndex = new Map<string, string>();

  return {
    register(manifest) {
      if (workflows.has(manifest.id)) {
        throw new Error(`Workflow ${manifest.id} is already registered. Use update instead.`);
      }
      workflows.set(manifest.id, manifest);
      for (const route of manifest.routes) {
        routeIndex.set(route, manifest.id);
      }
    },

    get(id) {
      return workflows.get(id) ?? null;
    },

    list(options = {}) {
      const all = Array.from(workflows.values());
      return all.filter((w) => {
        if (options.verticalId && w.verticalId !== options.verticalId && !w.additionalVerticals?.includes(options.verticalId)) return false;
        if (options.certification && w.certification !== options.certification) return false;
        return true;
      });
    },

    listByWave(wave) {
      return Array.from(workflows.values()).filter((w) => w.wave === wave);
    },

    certify(id) {
      const w = workflows.get(id);
      if (!w) throw new Error(`Workflow ${id} not found.`);
      if (w.certification !== "development" && w.certification !== "planned") {
        throw new Error(`Workflow ${id} must be in development to certify. Current: ${w.certification}`);
      }
      workflows.set(id, { ...w, certification: "certified" });
    },

    promoteToProduction(id) {
      const w = workflows.get(id);
      if (!w) throw new Error(`Workflow ${id} not found.`);
      if (w.certification !== "certified") {
        throw new Error(`Workflow ${id} must be certified before production. Current: ${w.certification}`);
      }
      workflows.set(id, { ...w, certification: "production" });
    },

    resolveByRoute(route) {
      const id = routeIndex.get(route);
      if (!id) return null;
      return workflows.get(id) ?? null;
    },
  };
}
