export type BrowserRiskLevel = "read" | "interactive" | "consequential";

export interface BrowserPolicy {
  allowedDomains: string[];
  maxActions: number;
  timeoutMs: number;
  maxDownloads: number;
  allowPrivateNetwork: false;
  requireApprovalFor: BrowserRiskLevel[];
}

export interface BrowserSessionInput {
  policy: BrowserPolicy;
  tenantId?: string;
  caseId?: string;
}

export interface BrowserObservation {
  url: string;
  title?: string;
  text?: string;
  actionId: string;
  timestamp: string;
}

export interface BrowserEvidence {
  evidenceId: string;
  sessionId: string;
  url: string;
  timestamp: string;
  adapter: string;
  contentHash?: string;
  screenshotRef?: string;
}

export interface BrowserSession {
  readonly id: string;
  navigate(url: string): Promise<BrowserObservation>;
  inspect(): Promise<BrowserObservation>;
  click(target: string): Promise<BrowserObservation>;
  type(target: string, value: string): Promise<BrowserObservation>;
  screenshot(): Promise<BrowserEvidence>;
  close(): Promise<void>;
}

export interface BrowserIntelligence {
  createSession(input: BrowserSessionInput): Promise<BrowserSession>;
}

export function assertBrowserUrlAllowed(url: string, policy: BrowserPolicy): void {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("BROWSER_POLICY: only HTTPS URLs are allowed");
  }
  if (parsed.hostname === "localhost" || parsed.hostname.endsWith(".local")) {
    throw new Error("BROWSER_POLICY: local hosts are blocked");
  }
  if (parsed.hostname.endsWith(".internal") || parsed.hostname.endsWith(".lan")) {
    throw new Error("BROWSER_POLICY: private network hosts are blocked");
  }
  const allowed = policy.allowedDomains.some(
    (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`),
  );
  if (!allowed) {
    throw new Error("BROWSER_POLICY: domain is not allowlisted");
  }
}

export function assertBrowserBudget(actions: number, policy: BrowserPolicy): void {
  if (actions < 0 || actions >= policy.maxActions) {
    throw new Error("BROWSER_POLICY: action budget exceeded");
  }
}

export function requiresApproval(risk: BrowserRiskLevel, policy: BrowserPolicy): boolean {
  return policy.requireApprovalFor.includes(risk);
}

export function validateBrowserPolicy(policy: BrowserPolicy): void {
  if (policy.allowedDomains.length === 0) {
    throw new Error("BROWSER_POLICY: at least one allowed domain is required");
  }
  if (!Number.isInteger(policy.maxActions) || policy.maxActions < 1) {
    throw new Error("BROWSER_POLICY: maxActions must be a positive integer");
  }
  if (!Number.isInteger(policy.timeoutMs) || policy.timeoutMs < 1) {
    throw new Error("BROWSER_POLICY: timeoutMs must be a positive integer");
  }
  if (!Number.isInteger(policy.maxDownloads) || policy.maxDownloads < 0) {
    throw new Error("BROWSER_POLICY: maxDownloads must be a non-negative integer");
  }
  if (policy.allowPrivateNetwork !== false) {
    throw new Error("BROWSER_POLICY: private network access is permanently disabled");
  }
  for (const domain of policy.allowedDomains) {
    if (!domain || domain.includes("/") || domain.includes(":") || domain.startsWith(".")) {
      throw new Error("BROWSER_POLICY: invalid allowlisted domain");
    }
  }
}

export type { BrowserAdapter, BrowserAdapterMetadata } from "./adapter.js";
