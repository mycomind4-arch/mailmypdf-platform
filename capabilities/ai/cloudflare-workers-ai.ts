export interface CloudflareAIConfig {
  endpoint: string;
  headers: Record<string, string>;
  model: string;
}

const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export function getCloudflareAIConfig(env: Record<string, string | undefined>): CloudflareAIConfig {
  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;
  const model = env.CF_AI_MODEL || DEFAULT_MODEL;
  if (!accountId || !apiToken) throw new Error('Cloudflare AI not configured.');
  return {
    endpoint: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
    model,
  };
}

export async function callCloudflareAI<T = Record<string, unknown>>(
  config: CloudflareAIConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({ messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], temperature: 0.7, max_tokens: 4096 }),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limit exceeded.');
    if (response.status === 402) throw new Error('Cloudflare AI credits exhausted.');
    throw new Error(`Cloudflare AI error: ${response.status}`);
  }
  const data = await response.json() as { result?: { response?: string } };
  const text = data.result?.response?.trim();
  if (!text) throw new Error('Empty response from Cloudflare AI.');
  return JSON.parse(extractJSON(text)) as T;
}

function extractJSON(text: string): string {
  try { JSON.parse(text); return text; } catch {}
  const code = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (code) return code[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  throw new Error('Could not extract JSON from AI response.');
}
