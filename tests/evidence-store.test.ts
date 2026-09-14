import assert from "node:assert/strict";
import test from "node:test";
import { writeEvidence } from "../lib/evidence-store";

const sample = {
  id: "evt-1",
  kind: "voice_event" as const,
  occurredAt: "2026-09-14T12:00:00.000Z",
  source: "vapi" as const,
  payload: { type: "call.started" },
};

test("evidence writes fail closed to unconfigured state without network", async () => {
  const oldUrl = process.env.EVIDENCE_STORE_URL;
  const oldToken = process.env.EVIDENCE_STORE_TOKEN;
  delete process.env.EVIDENCE_STORE_URL;
  delete process.env.EVIDENCE_STORE_TOKEN;

  const result = await writeEvidence(sample);
  assert.deepEqual(result, { configured: false, persisted: false });

  if (oldUrl) process.env.EVIDENCE_STORE_URL = oldUrl;
  if (oldToken) process.env.EVIDENCE_STORE_TOKEN = oldToken;
});

test("configured evidence store uses bearer auth and persists on 2xx", async () => {
  const oldUrl = process.env.EVIDENCE_STORE_URL;
  const oldToken = process.env.EVIDENCE_STORE_TOKEN;
  const oldFetch = globalThis.fetch;

  process.env.EVIDENCE_STORE_URL = "https://evidence.example.test/ingest";
  process.env.EVIDENCE_STORE_TOKEN = "test-token";

  let seenAuthorization = "";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    seenAuthorization = headers.get("authorization") ?? "";
    return new Response(JSON.stringify({ ok: true }), { status: 201 });
  }) as typeof fetch;

  const result = await writeEvidence(sample);
  assert.equal(result.configured, true);
  assert.equal(result.persisted, true);
  assert.equal(result.status, 201);
  assert.equal(seenAuthorization, "Bearer test-token");

  globalThis.fetch = oldFetch;
  if (oldUrl) process.env.EVIDENCE_STORE_URL = oldUrl;
  else delete process.env.EVIDENCE_STORE_URL;
  if (oldToken) process.env.EVIDENCE_STORE_TOKEN = oldToken;
  else delete process.env.EVIDENCE_STORE_TOKEN;
});
