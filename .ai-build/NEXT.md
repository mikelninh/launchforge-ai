# NEXT — v0.3

## Gate 1 — Provider-verified live evidence
Add restricted Vapi credentials in the production environment and run the live evidence set in `evidence/LIVE_RUN_PLAN.md`.

Definition of done:
- browser call works on production origin,
- safe tool action completes,
- high-impact action escalates,
- finished call record is fetched server-side,
- provider cost appears in ROI ledger,
- evidence source reads `provider_verified`.

## Gate 2 — Intent-versioned execution
Close E12 by attaching an intent/version identifier to planned tool work and rejecting results from stale intent versions.

Definition of done:
- caller can change intent while work is in flight,
- stale tool result cannot change active workflow state,
- trace shows abandoned intent and replacement intent,
- automated regression test covers the race.

## Gate 3 — Durable evidence store
Replace browser-only/local demo history and log-only webhook handling with an authenticated event store before using real customer data.
