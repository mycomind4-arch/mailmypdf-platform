import type { BrowserPolicy } from "./index.js";
import { assertBrowserUrlAllowed, validateBrowserPolicy } from "./index.js";

export function validateNavigation(url: string, policy: BrowserPolicy): void {
  validateBrowserPolicy(policy);
  assertBrowserUrlAllowed(url, policy);
}

export function createDefaultResearchPolicy(domains: string[]): BrowserPolicy {
  return {
    allowedDomains: domains,
    maxActions: 40,
    timeoutMs: 60_000,
    maxDownloads: 0,
    allowPrivateNetwork: false,
    requireApprovalFor: ["consequential"],
  };
}
