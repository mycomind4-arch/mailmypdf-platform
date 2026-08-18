import type { PlatformUiRuntime, UiResult } from './runtime-adapters.js';

async function get<T>(baseUrl: string, path: string): Promise<UiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { headers: { accept: 'application/json' } });
    const body = await response.json().catch(() => undefined);
    if (!response.ok) {
      return { ok: false, code: body?.code ?? 'ERROR', message: body?.message ?? `Runtime request failed (${response.status}).` } as UiResult<T>;
    }
    return { ok: true, data: body?.data as T };
  } catch (error) {
    return { ok: false, code: 'UNAVAILABLE', message: error instanceof Error ? error.message : 'Runtime is unavailable.' };
  }
}

async function post<T>(baseUrl: string, path: string, payload: unknown): Promise<UiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => undefined);
    if (!response.ok) {
      return { ok: false, code: body?.code ?? 'ERROR', message: body?.message ?? `Runtime request failed (${response.status}).` } as UiResult<T>;
    }
    return { ok: true, data: body?.data as T };
  } catch (error) {
    return { ok: false, code: 'UNAVAILABLE', message: error instanceof Error ? error.message : 'Runtime is unavailable.' };
  }
}

export function createHttpRuntime(baseUrl = ''): PlatformUiRuntime {
  return {
    cases: { list: () => get<unknown[]>(baseUrl, '/api/cases') },
    documents: { list: () => get<unknown[]>(baseUrl, '/api/documents') },
    agents: { listRuns: () => get<unknown[]>(baseUrl, '/api/agents/runs') },
    actions: { listPending: () => get<unknown[]>(baseUrl, '/api/actions/pending') },
    proof: { list: () => get<unknown[]>(baseUrl, '/api/proof') },
    integrations: { health: () => get<unknown>(baseUrl, '/api/integrations/health') },
    command: { execute: (input) => post<unknown>(baseUrl, '/api/command', { input }) },
  };
}
