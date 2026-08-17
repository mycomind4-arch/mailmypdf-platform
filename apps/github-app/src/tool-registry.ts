import type { GitHubAction, GitHubInstallationContext } from "./contracts.js";

export interface GitHubPlatformToolContext {
  installation: GitHubInstallationContext;
  actor: string;
}

export interface GitHubPlatformTool {
  readonly name: GitHubAction;
  readonly consequential: boolean;
  execute(context: GitHubPlatformToolContext): Promise<unknown>;
}

const consequentialActions = new Set<GitHubAction>(["prepare_patch"]);

export function requiresApproval(action: GitHubAction): boolean {
  return consequentialActions.has(action);
}

export function createToolRegistry(tools: readonly GitHubPlatformTool[]) {
  const registry = new Map(tools.map((tool) => [tool.name, tool]));
  return {
    get(action: GitHubAction) {
      return registry.get(action);
    },
    list() {
      return [...registry.values()];
    },
  };
}
