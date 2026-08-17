import type { BrowserAdapter } from "./adapter.js";

const adapters = new Map<string, BrowserAdapter>();

export function registerBrowserAdapter(adapter: BrowserAdapter): void {
  const name = adapter.metadata.name.trim();
  if (!name) throw new Error("BROWSER_ADAPTER: adapter name is required");
  if (adapters.has(name)) throw new Error(`BROWSER_ADAPTER: ${name} is already registered`);
  adapters.set(name, adapter);
}

export function getBrowserAdapter(name: string): BrowserAdapter {
  const adapter = adapters.get(name);
  if (!adapter) throw new Error(`BROWSER_ADAPTER: unknown adapter ${name}`);
  return adapter;
}

export function listBrowserAdapters(): BrowserAdapter[] {
  return [...adapters.values()];
}

export function clearBrowserAdaptersForTests(): void {
  adapters.clear();
}
