import type { BrowserRiskLevel } from "./index.js";

export interface BrowserApprovalRequest {
  sessionId: string;
  actionId: string;
  risk: BrowserRiskLevel;
  description: string;
  url: string;
}

export interface BrowserApprovalDecision {
  approved: boolean;
  decidedAt: string;
  decidedBy: string;
  reason?: string;
}

export interface BrowserApprovalProvider {
  requestApproval(request: BrowserApprovalRequest): Promise<BrowserApprovalDecision>;
}

export function requireApprovedDecision(decision: BrowserApprovalDecision): void {
  if (!decision.approved) throw new Error("BROWSER_APPROVAL: action was not approved");
}
