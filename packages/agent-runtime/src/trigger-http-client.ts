export interface TriggerHttpClientConfig {
  readonly baseUrl?: string;
  readonly secretKey: string;
  readonly timeoutMs?: number;
}

export interface TriggerRunHandle {
  readonly id: string;
}

interface TriggerTaskResponse {
  readonly id?: unknown;
  readonly runId?: unknown;
}

/**
 * Dependency-free Trigger.dev Tasks API client.
 *
 * This intentionally uses fetch rather than @trigger.dev/sdk so the platform
 * runtime remains portable across Node, Workers-compatible runtimes, and
 * application packages. The Trigger API endpoint is the stable integration
 * boundary; the SDK can still be used by a deployment package when richer
 * Trigger-specific features are needed.
 */
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.config.secretKey}`,
        "Content-Type": "application/json",
      };
      if (options?.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

      const response = await fetch(
        `${this.baseUrl}/api/v1/tasks/${encodeURIComponent(taskIdentifier)}/trigger`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ payload }),
          signal: controller.signal,
        },
      );

      const body = await response.json().catch(() => ({})) as TriggerTaskResponse;
      if (!response.ok) {
        throw new Error(`Trigger.dev task trigger failed with HTTP ${response.status}`);
      }

      const id = typeof body.id === "string" ? body.id : typeof body.runId === "string" ? body.runId : undefined;
      if (!id) throw new Error("Trigger.dev response did not contain a run id");
      return { id };
    } finally {
      clearTimeout(timeout);
    }
  }
}
