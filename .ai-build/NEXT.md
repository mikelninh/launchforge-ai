# NEXT — v0.4

## Gate 1 — Provider-verified live evidence
Add restricted Vapi credentials in the production environment and run the live evidence set in `evidence/LIVE_RUN_PLAN.md`.

Definition of done:
- browser call works on production origin,
- safe tool action completes,
- high-impact action escalates,
- finished call record is fetched server-side,
- provider cost appears in ROI ledger,
- evidence source reads `provider_verified`.

Status: **external credential gate**. Code path is implemented; no provider result is labelled verified without the private API fetch succeeding.

## Gate 2 — Intent-versioned execution
**Complete in v0.3.**

Implemented:
- `IntentExecutionGuard` assigns intent/version IDs to planned work,
- intent replacement invalidates older in-flight work,
- stale results are rejected before mutating active workflow state,
- `/api/proof/race` exposes the invariant as a runtime proof,
- automated regression tests cover invoice -> cancellation while old work is in flight.

## Gate 3 — Durable evidence store
The application now has a server-side authenticated HTTP evidence adapter used by Vapi webhooks and provider-call evidence.

Implemented:
- normalized evidence contract,
- bearer-authenticated `EVIDENCE_STORE_URL`,
- Vapi webhook persistence path,
- provider-call persistence path,
- `/api/evidence` ingestion/status endpoint,
- contract tests for configured/unconfigured behavior.

Remaining before real customer data:
- provision a **dedicated** backing store,
- configure `EVIDENCE_STORE_URL` + `EVIDENCE_STORE_TOKEN`,
- verify durable write/read behavior and retention policy.

Recommended backing: dedicated Supabase project / Edge Function + Postgres, isolated from unrelated products.
