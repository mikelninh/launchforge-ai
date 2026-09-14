# Evidence Ledger

LaunchForge separates evidence by provenance so a polished demo cannot silently become a production claim.

## CI evidence

The GitHub Actions `CI` workflow runs:

1. dependency installation,
2. executable action-policy and ROI contract tests,
3. the full Next.js production build.

At v0.2 the suite contains **11 executable contract tests**:

- 6 deterministic action-policy tests,
- 5 ROI/economic-model tests.

The broader voice reliability matrix contains 12 scenarios: 11 pass, 1 partial, 0 fail. Those scenario results are modelled/pre-production evidence; they are not represented as real customer traffic.

## Runtime evidence states

- `synthetic`: modelled pre-production evidence.
- `estimated`: demo/live execution with explicit assumptions for unavailable provider metrics.
- `provider_verified`: finished provider call record fetched server-side and used for duration/cost evidence.

## Flagship modelled business case

Default assumptions:

- 10,000 calls/month
- 8.4 baseline human minutes/call
- €38 loaded human cost/hour
- €0 revenue uplift attributed

The bundled 12-run synthetic sample currently models approximately:

- 66.7% containment,
- ~1,111 human hours returned/month,
- ~€42.2k gross operational value/month,
- ~€3.36k automation spend/month,
- ~€38.9k net operational value/month,
- ~11.6x ROI on automation spend.

These are **model outputs, not customer results**. The dashboard lets a reviewer change the assumptions and see every row recalculate.

## What would upgrade the evidence

A Vapi public key enables real browser voice calls. A server-only Vapi private key lets LaunchForge fetch provider-reported post-call cost/duration and mark those runs `provider_verified`.

The next evidence milestone is a recorded set of provider-verified calls across safe-resolution, explicit-human, failed-verification, high-impact-action, and interruption scenarios.
