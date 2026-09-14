import assert from "node:assert/strict";
import test from "node:test";
import { IntentExecutionGuard, classifyDemoIntent } from "../lib/intent-execution";

test("stale tool result is rejected after caller changes intent", () => {
  const guard = new IntentExecutionGuard("invoice_copy");
  const invoiceWork = guard.plan({ action: "invoice_copy" });

  const replacement = guard.beginIntent("cancel_account");
  assert.equal(replacement.key, "cancel_account");
  assert.equal(replacement.version, 2);

  const staleResult = guard.resolve(invoiceWork, { status: "completed" });
  assert.equal(staleResult.accepted, false);
  assert.equal(staleResult.stale, true);
  assert.equal(staleResult.reason, "stale_intent");
  assert.equal(staleResult.activeIntent.key, "cancel_account");
});

test("result from the active intent is accepted", () => {
  const guard = new IntentExecutionGuard("invoice_copy");
  const work = guard.plan({ action: "invoice_copy" });
  const result = guard.resolve(work, { status: "completed" });

  assert.equal(result.accepted, true);
  assert.equal(result.stale, false);
});

test("repeating the same intent does not invalidate in-flight work", () => {
  const guard = new IntentExecutionGuard("invoice_copy");
  const work = guard.plan({ action: "invoice_copy" });
  const before = guard.activeIntent;
  const after = guard.beginIntent("invoice_copy");

  assert.equal(after.version, before.version);
  assert.equal(guard.resolve(work, { status: "completed" }).accepted, true);
});

test("demo intent classifier detects high-impact intent changes", () => {
  assert.equal(classifyDemoIntent("Actually, cancel the account instead"), "cancel_account");
  assert.equal(classifyDemoIntent("Please send my latest invoice"), "invoice_copy");
  assert.equal(classifyDemoIntent("I want a human agent"), "human_handoff");
});
