export const UI_CAPABILITIES = [
  'runtime-adapter','cases','documents','agent-runs','actions','proof','integration-health',
  'case-workspace','agent-inspector','evidence-viewer','timeline','error-states','e2e','production-audit','command-bar'
] as const;
export type UiCapability = typeof UI_CAPABILITIES[number];
export type CapabilityState = 'ready' | 'unavailable' | 'not-configured' | 'error';
export interface CapabilityHealth { capability: UiCapability; state: CapabilityState; message?: string; checkedAt: string; }
export function capabilityIsReady(h: CapabilityHealth): boolean { return h.state === 'ready'; }
export function allCapabilitiesReady(h: readonly CapabilityHealth[]): boolean {
  return UI_CAPABILITIES.every((name) => h.some((x) => x.capability === name && capabilityIsReady(x)));
}
