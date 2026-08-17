export interface RepositoryProvider { createBranch(repository: string, branch: string): Promise<{ branch: string; created: boolean }> }
export interface ModelProvider { run(input: { role: string; objective: string; modelClass: string }): Promise<unknown> }
export interface DeploymentProvider { preview(repository: string, branch: string): Promise<{ url: string; status: 'PREVIEW' }> }
export interface RegistryProvider { register(input: { verticalId: string; previewUrl: string }): Promise<{ registered: boolean }> }

export interface ProviderSet { repository: RepositoryProvider; model: ModelProvider; deployment: DeploymentProvider; registry: RegistryProvider }
