# ARCHITECTURE — LaunchForge AI

## Boundary
LaunchForge owns deployment semantics, evidence, evals, economics, and learning. Voice providers are adapters.

## Components

```text
app/dashboard.tsx
  ├─ Vapi Web SDK (optional live channel)
  ├─ local evidence ledger (browser demo persistence)
  ├─ reliability UI
  └─ ROI projection

app/api/tools/vapi/route.ts
  ├─ lookup_account
  ├─ perform_action
  └─ escalate_to_human

app/api/vapi/call/[id]/route.ts
  └─ server-only fetch of finished Vapi call evidence

app/api/vapi/webhook/route.ts
  └─ event receiver; persistence intentionally omitted in public demo

lib/case.ts
  └─ flagship workflow blueprint and deterministic policy context

lib/evals.ts
  └─ scenario coverage and launch decision

lib/roi.ts
  └─ per-run economics and monthly projection

lib/voice/vapi-assistant.ts
  └─ transient voice assistant configuration
```

## Security boundary
- Vapi public key may exist in client configuration only when restricted by allowed origin/assistant permissions.
- Vapi private key is server-only.
- High-impact actions are rejected in server-side tool code.
- The model is not the authorization layer.
- Fictional data only in the public proof.

## Evidence boundary
- `synthetic`: modelled data.
- `estimated`: execution with transparent assumptions.
- `provider_verified`: provider call record fetched server-side.

## Production evolution
1. Durable event store (Postgres / event log).
2. Authenticated webhook ingestion.
3. Intent-version IDs and stale-result rejection.
4. Versioned deployment blueprints.
5. Eval worker with replayable traces.
6. Additional providers behind `VoiceProvider` adapters.
7. Customer-specific integration credentials in a secrets manager.
8. Multi-tenant RBAC, audit trail, and retention controls.
