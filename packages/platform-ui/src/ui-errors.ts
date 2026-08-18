export type UiState<T> = { kind: 'loading' } | { kind: 'ready'; data: T } | { kind: 'unavailable'; message: string } | { kind: 'not-configured'; message: string } | { kind: 'error'; message: string };
export function fromUiResult<T>(result: { ok: true; data: T } | { ok: false; code: 'UNAVAILABLE'|'NOT_CONFIGURED'|'ERROR'; message: string }): UiState<T> {
  return result.ok ? { kind: 'ready', data: result.data } : { kind: result.code === 'NOT_CONFIGURED' ? 'not-configured' : result.code === 'UNAVAILABLE' ? 'unavailable' : 'error', message: result.message };
}
