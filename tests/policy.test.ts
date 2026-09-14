import assert from "node:assert/strict";
import test from "node:test";
import { executeDemoTool } from "../lib/tool-policy";

test("known demo account is found", () => {
  const result = executeDemoTool("lookup_account", { accountId: "NS-2048" });
  assert.equal(result.status, "found");
});

test("unknown identity fails closed", () => {
  const result = executeDemoTool("lookup_account", { accountId: "NOPE-1" });
  assert.equal(result.status, "not_found");
});

test("low-risk action requires caller verification", () => {
  const result = executeDemoTool("perform_action", {
    action: "invoice_copy",
    accountId: "NS-2048",
    postcode: "wrong",
  });
  assert.equal(result.status, "requires_human");
  assert.equal(result.reason, "identity_not_verified");
});

test("verified low-risk invoice action completes", () => {
  const result = executeDemoTool("perform_action", {
    action: "invoice_copy",
    accountId: "NS-2048",
    postcode: "10115",
  });
  assert.equal(result.status, "completed");
  assert.equal(result.reference, "INV-COPY-2048");
});

test("high-impact cancellation cannot be executed even when verified", () => {
  const result = executeDemoTool("perform_action", {
    action: "cancel_account",
    accountId: "NS-2048",
    postcode: "10115",
  });
  assert.equal(result.status, "requires_human");
  assert.equal(result.reason, "high_impact_action");
});

test("explicit handoff creates structured context", () => {
  const result = executeDemoTool("escalate_to_human", {
    reason: "caller_requested_human",
    summary: "Caller wants a person.",
  });
  assert.equal(result.status, "queued");
  assert.equal(result.contextAttached, true);
  assert.match(String(result.caseId), /^LF-/);
});
