export type AgentCapability='classify'|'extract'|'search'|'analyze'|'draft'|'review'|'organize';
export type AgentTool={name:string;description:string;capabilities:AgentCapability[];requiresApproval?:boolean};
export type AgentTask={id:string;goal:string;allowedCapabilities:AgentCapability[];tools:AgentTool[]};
export interface AgentRuntime{run(task:AgentTask):Promise<{status:'completed'|'blocked'|'failed';output:unknown;toolCalls:string[]}>;}
