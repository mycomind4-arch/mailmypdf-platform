import type { BrowserAdapterMetadata } from "./adapter.js";

export interface BrowserBenchmarkCase {
  id: string;
  url: string;
  task: string;
  expected: string;
  risk: "read" | "interactive" | "consequential";
}

export interface BrowserBenchmarkResult {
  adapter: BrowserAdapterMetadata;
  caseId: string;
  success: boolean;
  durationMs: number;
  actionCount: number;
  evidenceCount: number;
  errorCode?: string;
}

export interface BrowserBenchmarkSummary {
  adapter: BrowserAdapterMetadata;
  cases: BrowserBenchmarkResult[];
  successRate: number;
  averageDurationMs: number;
  averageActions: number;
}

export function summarizeBenchmark(results: BrowserBenchmarkResult[]): BrowserBenchmarkSummary {
  if (results.length === 0) throw new Error("BROWSER_BENCHMARK: no results");
  const adapter = results[0].adapter;
  const successRate = results.filter((result) => result.success).length / results.length;
  return {
    adapter,
    cases: results,
    successRate,
    averageDurationMs: results.reduce((sum, result) => sum + result.durationMs, 0) / results.length,
    averageActions: results.reduce((sum, result) => sum + result.actionCount, 0) / results.length,
  };
}
