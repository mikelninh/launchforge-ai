# LaunchForge AI

**AI Deployment Control Plane — ship agents that prove their value.**

LaunchForge is a reusable system for taking AI agents from promising prototype to measurable production deployment: business baseline, tool contracts, reliability evals, human handoff, execution traces, provider evidence, ROI, and a learning loop that makes the next deployment faster.

> The voice agent is not the product. The deployment system is.

## Flagship proof: Voice Support Resolution

The current case is deliberately horizontal rather than tied to one industry.

A fictional company, **Northstar Cloud**, receives high-volume inbound service calls. The LaunchForge demo agent can:

- identify a demo account,
- resolve approved low-risk requests,
- use deterministic tools rather than inventing outcomes,
- force human escalation for high-impact actions,
- expose a live transcript + trace,
- fetch provider-verified call cost when Vapi private credentials are available,
- calculate per-run and monthly ROI,
- reject stale tool results after a caller changes intent,
- persist normalized evidence through a pluggable authenticated store,
- and run a 12-scenario reliability suite before launch.

The same deployment pattern can be reused for support, sales qualification, scheduling, collections, operations intake, healthcare administration, finance operations, and other agent workflows.

## Why this is different

Most AI demos optimize for whether the agent sounds impressive. LaunchForge asks harder questions:

1. Did the task actually complete?
2. Was the action authorized?
3. Did the agent fail safely?
4. Can we reconstruct what happened?
5. What did the run cost?
6. What human effort did it avoid?
7. Is the business case still positive under editable assumptions?
8. What did this deployment teach the platform?

## Architecture

```text
Caller / browser mic
      ↓
Voice provider (Vapi first; provider boundary is replaceable)
      ↓
LaunchForge agent blueprint
      ↓
Deterministic tools + escalation policy
      ↓
Intent-version guard
      ↓
Execution trace + transcript
      ↓
Provider call evidence
      ↓
Authenticated evidence adapter
      ↓
Quality + outcome + cost
      ↓
ROI ledger + monthly projection
      ↓
Reliability gates + platform learning
```

## Evidence model

Every execution is explicitly labelled:

- `synthetic` — modelled evaluation evidence,
- `estimated` — real/demo execution with transparent cost assumptions,
- `provider_verified` — duration/cost/evidence fetched from the voice provider.

Synthetic evidence is never presented as a production customer result.

Durable storage is behind a server-only authenticated HTTP contract:

```bash
EVIDENCE_STORE_URL=...
EVIDENCE_STORE_TOKEN=...
```

That allows LaunchForge to use a dedicated Supabase ingest function, internal API, warehouse endpoint, or another isolated evidence system without coupling the application to one database SDK.

## ROI model

```text
avoided human minutes = baseline human minutes - actual human minutes
labour value = avoided minutes / 60 × loaded hourly cost
gross value = labour value + attributable revenue impact
net value = gross value - automation spend
ROI = net value / automation spend
```

The flagship case intentionally sets revenue impact to zero. It must stand on operational value alone.

## Reliability model

The proof includes **12 / 12 passing scenarios** covering routine resolution, identity failure, tool failure, high-impact actions, explicit human requests, ambiguity, interruption, silence, unsupported policy questions, and stale asynchronous results.

### E12 — stale result race

LaunchForge now assigns an intent/version identifier to planned work. If the caller changes intent while a tool is in flight, the old result is rejected rather than mutating the replacement workflow.

The invariant is regression-tested and exposed at:

```text
/api/proof/race
```

Machine-readable proof status is available at:

```text
/api/proof/health
```

## Autonomous action boundary

The live Vapi assistant can autonomously invoke only:

- `invoice_copy`
- `password_reset`
- `service_status`

Cancellation, plan changes, disputes, legal requests, unsupported actions, failed verification, and explicit human requests route to `escalate_to_human`.

The server policy independently enforces the same boundary, so model capability and tool authorization are separate controls.

## Run locally

```bash
npm install
cp .env.example .env.local
npm test
npm run dev
```

The simulator works with no external credentials.

For a live browser voice call:

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
```

For provider-verified post-call cost/evidence:

```bash
VAPI_PRIVATE_API_KEY=...
```

Never expose the private key to browser code.

## Public-proof bundle

`deployment/public-proof/` contains a self-contained deployable proof with:

- the ROI case,
- simulator,
- 12 reliability scenarios,
- runtime stale-result proof,
- serverless deterministic tool endpoint,
- optional Vapi Web live-call path using a restricted public key.

This bundle exists so the proof can be hosted without depending on the full Next.js deployment pipeline.

## Demo script

Use fictional account `NS-2048` and postcode `10115`.

Try “I need my latest invoice.” Then try “Cancel my account.” The first can complete through a deterministic low-risk tool; the second has no autonomous action path and must route to a human.

## Build OS

`01 SHAPE → 02 SPECIFY → 03 DELEGATE → 04 PROVE → 05 SHIP → 06 WATCH`

See `.ai-build/` for SPEC, architecture, decisions, acceptance criteria, eval policy, runbook, autonomy policy, proof dossier, next gates, and retrospective.

## Current status

**v0.4 — End-to-end proof system**

Implemented and CI-verified:

- horizontal voice-resolution case,
- Vapi Web live-call integration path,
- transient assistant configuration,
- deterministic tool policy,
- narrow autonomous action schema,
- human escalation,
- intent-version guard + stale-result regression tests,
- provider-evidence endpoint,
- authenticated durable-evidence adapter,
- Vapi webhook evidence path,
- trace + transcript UI,
- editable ROI ledger + monthly projection,
- 12 / 12 reliability suite,
- policy, ROI, intent and evidence contract tests,
- production Next.js build,
- self-contained public deployment bundle.

### Remaining external go-live gates

1. **Provider-verified live evidence** — configure restricted Vapi credentials and execute the real call set in `evidence/LIVE_RUN_PLAN.md` ([issue #1](https://github.com/mikelninh/launchforge-ai/issues/1)).
2. **Dedicated durable store** — provision an isolated evidence database/ingest endpoint and configure the evidence adapter ([issue #2](https://github.com/mikelninh/launchforge-ai/issues/2)).

Neither gate is silently substituted with synthetic evidence.

## Product thesis

Customer-specific field work compounds only when corrections become reusable platform capabilities. Every deployment should therefore produce both:

- measurable customer value now, and
- verified workflow knowledge that improves every future deployment.

That is the difference between selling hours and building an asset.
