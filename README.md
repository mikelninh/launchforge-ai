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

## Live architecture

```text
Caller / browser mic
      ↓
Voice provider (Vapi first; adapter boundary stays replaceable)
      ↓
LaunchForge agent blueprint
      ↓
Deterministic tools + escalation policy
      ↓
Execution trace + transcript
      ↓
Provider call evidence (when private key is configured)
      ↓
Quality + outcome + cost
      ↓
ROI ledger + monthly projection
      ↓
Reliability gates + platform learning
```

## Evidence model

LaunchForge labels every run as one of:

- `synthetic` — modelled evaluation evidence,
- `estimated` — real/demo execution with transparent cost assumptions,
- `provider_verified` — call duration/cost/evidence fetched from the voice provider.

Synthetic evidence is never presented as a production customer result.

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

The demo ships with 12 scenarios covering routine resolution, identity failure, tool failure, high-impact actions, explicit human requests, ambiguity, interruption, silence, unsupported policy questions, and more.

One edge case is intentionally marked `partial`: double intent + interruption can recover conversationally, but intent-version IDs are still needed to prevent stale tool results from mutating a replacement intent. This is recorded as a platform learning rather than hidden.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The simulator works with no external credentials.

For a live browser voice call, add a restricted Vapi public key:

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
```

The public key must allow the production origin and transient assistants, unless `NEXT_PUBLIC_VAPI_ASSISTANT_ID` points to a saved assistant.

For provider-verified post-call cost and call evidence:

```bash
VAPI_PRIVATE_API_KEY=...
```

Never expose the private key to the browser.

## Demo script

Use fictional account `NS-2048` and postcode `10115`.

Try a safe request such as “I need my latest invoice.” Then try “Cancel my account.” The first should complete through a deterministic tool; the second must be rejected by policy code and routed to a human.

## Build OS

`01 SHAPE → 02 SPECIFY → 03 DELEGATE → 04 PROVE → 05 SHIP → 06 WATCH`

The `.ai-build/` directory captures the durable product and deployment decisions.

## Product thesis

Customer-specific field work only compounds when corrections become reusable platform capabilities. LaunchForge therefore treats every deployment as both:

- a business outcome to deliver now, and
- a source of verified workflow knowledge for every future deployment.

That is the difference between selling hours and building an asset.

## Current status

**v0.2 — Flagship proof**

- horizontal voice resolution case
- live Vapi browser-call path
- deterministic demo tool server
- post-call provider evidence endpoint
- trace + transcript UI
- editable ROI ledger + monthly projection
- 12-case reliability suite
- explicit pilot/production gaps

Next production steps: durable event storage, webhook authentication, intent-versioning, real customer baseline import, and multi-provider voice adapters.
