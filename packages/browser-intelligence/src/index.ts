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
  const allowed = policy.allowedDomains.some(
    (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`),
  );
  if (!allowed) {
    throw new Error("BROWSER_POLICY: domain is not allowlisted");
  }
}

export function assertBrowserBudget(actions: number, policy: BrowserPolicy): void {
  if (actions >= policy.maxActions) {
    throw new Error("BROWSER_POLICY: action budget exceeded");
  }
}
