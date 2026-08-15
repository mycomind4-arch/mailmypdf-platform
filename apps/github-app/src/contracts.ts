export type GitHubAction =
  | "audit_repository"
  | "audit_platform_compatibility"
  | "review_pull_request"
  | "plan_migration"
  | "prepare_patch"
  | "diagnose_ci"
  | "detect_platform_drift";

export interface GitHubInstallationContext {
  installationId: number;
  repositoryId: number;
  repositoryFullName: string;
  owner: string;
  repo: string;
}

export interface GitHubAppJob {
  id: string;
  action: GitHubAction;
  context: GitHubInstallationContext;
  requestedBy: string;
  createdAt: string;
  requiresApproval: boolean;
}

export interface RepositoryAuditResult {
  repository: string;
  action: GitHubAction;
  status: "queued" | "running" | "completed" | "failed";
  findings: readonly AuditFinding[];
}

export interface AuditFinding {
  severity: "info" | "low" | "medium" | "high" | "critical";
  category: "security" | "architecture" | "platform" | "ci" | "deployment" | "data";
  title: string;
  description: string;
  evidence: readonly string[];
  remediation?: string;
}

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  webhookSecret: string;
  apiBaseUrl?: string;
}
