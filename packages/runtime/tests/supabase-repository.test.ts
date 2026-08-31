import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createSupabaseRepository, type SupabaseLike } from "../src/supabase-repository.js";

/** Minimal mock Supabase client for testing */
function createMockSupabase(): SupabaseLike {
  const tables: Record<string, Record<string, unknown>[]> = { cases: [], audit_events: [] };

  const builder = (table: string) => ({
    select: () => {
      let filters: Array<[string, unknown]> = [];
      let single = false;
      let orderCol: string | undefined;
      let orderAsc = true;
      let rangeFrom = 0;
      let rangeTo = Infinity;

      const chain: any = {
        eq(col: string, val: unknown) { filters.push([col, val]); return chain; },
        order(col: string, opts?: { ascending?: boolean }) { orderCol = col; orderAsc = opts?.ascending ?? true; return chain; },
        range(from: number, to: number) { rangeFrom = from; rangeTo = to; return chain; },
        single() { single = true; return chain; },
        then(resolve: (v: any) => any, _reject?: (e: unknown) => any) {
          let rows: Record<string, unknown>[] = [...(tables[table] ?? [])];
          for (const [col, val] of filters) rows = rows.filter((r) => r[col] === val);
          if (orderCol) rows.sort((a, b) => {
            const av = String(a[orderCol!]); const bv = String(b[orderCol!]);
            return orderAsc ? av.localeCompare(bv) : bv.localeCompare(av);
          });
          if (single) { return Promise.resolve(resolve({ data: rows[0] ?? null, error: rows[0] ? null : { message: "not found" } })); }
          return Promise.resolve(resolve({ data: rows.slice(rangeFrom, rangeTo + 1), error: null }));
        },
      };
      return chain;
    },
    insert: (row: Record<string, unknown> | Record<string, unknown>[]) => {
      const rows = Array.isArray(row) ? row : [row];
      (tables[table] ?? []).push(...rows);
      const chain: any = {
        eq: () => chain,
        then(resolve: (v: any) => any) { return Promise.resolve(resolve({ data: null, error: null })); },
      };
      return chain;
    },
    update: (row: Record<string, unknown>) => {
      let filters: Array<[string, unknown]> = [];
      const chain: any = {
        eq(col: string, val: unknown) { filters.push([col, val]); return chain; },
        then(resolve: (v: any) => any) {
          for (const r of (tables[table] ?? [])) {
            if (filters.every(([col, val]) => r[col] === val)) {
              Object.assign(r, row);
              return Promise.resolve(resolve({ data: r, error: null }));
            }
          }
          return Promise.resolve(resolve({ data: null, error: { message: "not found" } }));
        },
      };
      return chain;
    },
  });
  return { from: (t: string) => builder(t) } as SupabaseLike;
}

describe("supabase repository", () => {
  test("creates and retrieves a case", async () => {
    const client = createMockSupabase();
    const repo = createSupabaseRepository(client);
    const { id } = await repo.create({ workflowId: "cp2000-response", verticalId: "notice-respond", ownerId: "user-1" as any, title: "Test Case" });
    const record = await repo.getById(id, "user-1" as any);
    assert.notEqual(record, null);
    assert.equal(record!.workflowId, "cp2000-response");
    assert.equal(record!.status, "draft");
    assert.equal(record!.version, 1);
  });

  test("returns null for wrong owner", async () => {
    const client = createMockSupabase();
    const repo = createSupabaseRepository(client);
    const { id } = await repo.create({ workflowId: "test", verticalId: "test", ownerId: "user-1" as any, title: "Test" });
    const record = await repo.getById(id, "user-2" as any);
    assert.equal(record, null);
  });

  test("updates status", async () => {
    const client = createMockSupabase();
    const repo = createSupabaseRepository(client);
    const { id } = await repo.create({ workflowId: "test", verticalId: "test", ownerId: "user-1" as any, title: "Test" });
    const updated = await repo.updateStatus(id, "user-1" as any, "draft", "validated");
    assert.equal(updated.status, "validated");
  });

  test("records and retrieves audit events", async () => {
    const client = createMockSupabase();
    const repo = createSupabaseRepository(client);
    const { id } = await repo.create({ workflowId: "test", verticalId: "test", ownerId: "user-1" as any, title: "Test" });
    await repo.recordAuditEvent({ caseId: id, eventType: "case_created", actor: "user", actorId: "user-1", payload: { title: "Test" } });
    const trail = await repo.getAuditTrail(id, "user-1" as any);
    assert.equal(trail.length, 1);
    assert.equal(trail[0]!.eventType, "case_created");
    assert.equal(trail[0]!.eventHash.length, 64);
  });
});
