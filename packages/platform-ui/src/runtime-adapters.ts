export type UiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'UNAVAILABLE' | 'NOT_CONFIGURED' | 'ERROR'; message: string };

export interface PlatformUiRuntime {
  cases: { list(): Promise<UiResult<unknown[]>> };
  documents: { list(): Promise<UiResult<unknown[]>> };
  agents: { listRuns(): Promise<UiResult<unknown[]>> };
  actions: { listPending(): Promise<UiResult<unknown[]>> };
  proof: { list(): Promise<UiResult<unknown[]>> };
  integrations: { health(): Promise<UiResult<unknown>> };
  command: { execute(input: string): Promise<UiResult<unknown>> };
}

export const unavailableRuntime: PlatformUiRuntime = {
  cases: { list: async () => ({ ok: false, code: 'UNAVAILABLE', message: 'Case runtime is not connected.' }) },
  documents: { list: async () => ({ ok: false, code: 'UNAVAILABLE', message: 'Document runtime is not connected.' }) },
  agents: { listRuns: async () => ({ ok: false, code: 'UNAVAILABLE', message: 'Agent runtime is not connected.' }) },
  actions: { listPending: async () => ({ ok: false, code: 'UNAVAILABLE', message: 'Action runtime is not connected.' }) },
  proof: { list: async () => ({ ok: false, code: 'UNAVAILABLE', message: 'Proof runtime is not connected.' }) },
  integrations: { health: async () => ({ ok: false, code: 'NOT_CONFIGURED', message: 'Live integration health is not configured.' }) },
  command: { execute: async () => ({ ok: false, code: 'UNAVAILABLE', message: 'Command execution is not connected.' }) },
};

export function uiErrorMessage<T>(result: UiResult<T>): string | undefined {
  return result.ok ? undefined : result.message;
}
