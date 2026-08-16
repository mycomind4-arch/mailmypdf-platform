export type ConsequentialAction='mail'|'submit'|'publish'|'delete'|'share_sensitive_data';
export type ApprovalRequest={id:string;action:ConsequentialAction;summary:string;createdAt:string};
export type ApprovalDecision={requestId:string;approved:boolean;approvedBy:string;approvedAt:string};
export interface ApprovalPolicy { requiresApproval(action:ConsequentialAction):boolean; }
export const defaultApprovalPolicy:ApprovalPolicy={requiresApproval:()=>true};
