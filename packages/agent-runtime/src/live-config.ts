/**
 * Live integration configuration gate.
 *
 * This intentionally checks configuration only. It never treats the presence
 * of an environment variable as proof that an external service is healthy.
 * A live smoke test must verify each configured service separately.
 */
export interface LiveIntegrationConfig {
  trigger?: { endpoint: string; apiKey: string };
  docling?: { endpoint: string; apiKey?: string };
  model?: { provider: string; apiKey: string };
  mcp?: { endpoint: string };
  fulfillment?: { provider: string; apiKey: string };
  telemetry?: { endpoint: string };
}

export function readLiveIntegrationConfig(env = process.env): LiveIntegrationConfig {
  const get = (name: string): string | undefined => {
    const candidate = env[name];
    return candidate && candidate.trim() ? candidate.trim() : undefined;
  };

  const triggerEndpoint = get('TRIGGER_ENDPOINT');
  const triggerApiKey = get('TRIGGER_API_KEY');
  const doclingEndpoint = get('DOCLING_ENDPOINT');
  const doclingApiKey = get('DOCLING_API_KEY');
  const modelProvider = get('MODEL_PROVIDER');
  const modelApiKey = get('MODEL_API_KEY');
  const mcpEndpoint = get('MCP_ENDPOINT');
  const fulfillmentProvider = get('FULFILLMENT_PROVIDER');
  const fulfillmentApiKey = get('FULFILLMENT_API_KEY');
  const telemetryEndpoint = get('TELEMETRY_ENDPOINT');

  const config: LiveIntegrationConfig = {};
  if (triggerEndpoint && triggerApiKey) config.trigger = { endpoint: triggerEndpoint, apiKey: triggerApiKey };
  if (doclingEndpoint) config.docling = { endpoint: doclingEndpoint, ...(doclingApiKey ? { apiKey: doclingApiKey } : {}) };
  if (modelProvider && modelApiKey) config.model = { provider: modelProvider, apiKey: modelApiKey };
  if (mcpEndpoint) config.mcp = { endpoint: mcpEndpoint };
  if (fulfillmentProvider && fulfillmentApiKey) config.fulfillment = { provider: fulfillmentProvider, apiKey: fulfillmentApiKey };
  if (telemetryEndpoint) config.telemetry = { endpoint: telemetryEndpoint };
  return config;
}

export interface ConfigurationGate {
  name: string;
  configured: boolean;
}

export function configurationGates(config: LiveIntegrationConfig): ConfigurationGate[] {
  return [
    { name: 'trigger', configured: Boolean(config.trigger) },
    { name: 'docling', configured: Boolean(config.docling) },
    { name: 'model', configured: Boolean(config.model) },
    { name: 'mcp', configured: Boolean(config.mcp) },
    { name: 'fulfillment', configured: Boolean(config.fulfillment) },
    { name: 'telemetry', configured: Boolean(config.telemetry) },
  ];
}

export function configuredIntegrationNames(config: LiveIntegrationConfig): string[] {
  return configurationGates(config).filter((gate) => gate.configured).map((gate) => gate.name);
}
