export interface TriggerHttpClientConfig {
  readonly baseUrl?: string;
  readonly secretKey: string;
  readonly timeoutMs?: number;
}

export interface TriggerRunHandle { readonly id: string }
export interface TriggerRunResult<O = unknown> {
  readonly ok: boolean;
  readonly id: string;
  readonly output?: O;
  readonly outputType?: string;
  readonly error?: unknown;
  readonly taskIdentifier?: string;
  readonly usage?: { durationMs?: number };
}

interface TriggerTaskResponse { readonly id?: unknown; readonly runId?: unknown }

/** Dependency-free client for the documented Trigger.dev Tasks/Runs APIs. */
export class TriggerHttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: TriggerHttpClientConfig) {
    this.baseUrl = (config.baseUrl ?? "https://api.trigger.dev").replace(/\/$/, "");
    this.timeoutMs = config.timeoutMs ?? 30_000;
    if (!config.secretKey) throw new Error("Trigger.dev secret key is required");
    if (!/^https:\/\//.test(this.baseUrl)) throw new Error("Trigger.dev API URL must use HTTPS");
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0 || this.timeoutMs > 120_000) {
      throw new Error("Trigger.dev timeout must be between 1ms and 120000ms");
    }
  }

  async trigger(taskIdentifier: string, payload: unknown, options?: { idempotencyKey?: string }): Promise<TriggerRunHandle> {
    if (!taskIdentifier) throw new Error("Trigger task identifier is required");
    const body = await this.request(`/api/v1/tasks/${encodeURIComponent(taskIdentifier)}/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(options?.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}) },
      body: JSON.stringify({ payload }),
    }) as TriggerTaskResponse;
    const id = typeof body.id === "string" ? body.id : typeof body.runId === "string" ? body.runId : undefined;
    if (!id) throw new Error("Trigger.dev response did not contain a run id");
    return { id };
  }

  async getResult<O = unknown>(runId: string): Promise<TriggerRunResult<O>> {
    const body = await this.request(`/api/v1/runs/${encodeURIComponent(runId)}/result`, { method: "GET" }) as TriggerRunResult<string>;
    let output: O | undefined;
    if (body.ok && body.output !== undefined) output = body.outputType === "application/json" ? JSON.parse(body.output) as O : body.output as O;
    return { ...body, output };
  }

  async getTrace(runId: string): Promise<unknown> {
    return this.request(`/api/v1/runs/${encodeURIComponent(runId)}/trace`, { method: "GET" });
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${this.config.secretKey}`, ...init.headers },
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(`Trigger.dev API failed with HTTP ${response.status}`);
      return body;
    } finally { clearTimeout(timeout) }
  }
}
