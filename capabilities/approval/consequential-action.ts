export type ConsequentialAction = 'mail' | 'submit' | 'publish' | 'delete' | 'share_sensitive_data';

export interface ApprovalRequest {
  action: ConsequentialAction;
  actorId: string;
  createdAt: string;
  summary: string;
  expiresAt?: string;
}

export interface ApprovalDecision {
  approved: boolean;
  actorId: string;
  decidedAt: string;
  requestId: string;
}

export function requiresExplicitApproval(action: ConsequentialAction): boolean {
  return ['mail', 'submit', 'publish', 'delete', 'share_sensitive_data'].includes(action);
}
