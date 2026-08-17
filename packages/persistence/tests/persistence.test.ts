import test from "node:test";
import assert from "node:assert/strict";
import {
  RepositoryError,
  requireOwnerId,
  assertOwner,
  mergeAppendOnlyVersions,
  executeSave,
} from "../src/index.js";

test("missing owner identity fails closed", () => {
  assert.throws(() => requireOwnerId(""), (error: unknown) =>
    error instanceof RepositoryError && error.code === "VALIDATION_ERROR",
  );
});

test("cross-owner access is rejected", () => {
  assert.throws(() => assertOwner("owner-a", "owner-b"), (error: unknown) =>
    error instanceof RepositoryError && error.code === "UNAUTHORIZED",
  );
});

test("version merge preserves history from newer writers", () => {
  const merged = mergeAppendOnlyVersions(
    [{ id: "v1", version: 1 }, { id: "v3", version: 3 }],
    [{ id: "v1", version: 1 }, { id: "v2", version: 2 }],
  );
  assert.deepEqual(merged.map((v) => v.id), ["v1", "v2", "v3"]);
});

test("save failures surface as failed state and increment retry count", async () => {
  const state = await executeSave(async () => { throw new Error("database unavailable"); }, 2);
  assert.equal(state.status, "failed");
  assert.equal(state.retryCount, 3);
  assert.ok(state.error instanceof Error);
});

test("successful retry resets retry count", async () => {
  const state = await executeSave(async () => "ok", 4);
  assert.deepEqual(state, { status: "saved", value: "ok", retryCount: 0 });
});
