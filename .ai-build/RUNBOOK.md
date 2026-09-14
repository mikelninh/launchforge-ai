# RUNBOOK — LaunchForge AI

## Local
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Public simulator
No credentials required. Open the home page and choose **Run evidence simulator**.

## Live Vapi web call
1. Create/retrieve a Vapi public API key.
2. Restrict allowed origins to the exact local/production origin.
3. Allow transient assistants, or set `NEXT_PUBLIC_VAPI_ASSISTANT_ID` to a saved assistant.
4. Set `NEXT_PUBLIC_VAPI_PUBLIC_KEY`.
5. Start the app and allow microphone access.
6. Use fictional account `NS-2048` and postcode `10115`.

## Provider-verified economics
Set server-only `VAPI_PRIVATE_API_KEY`. After a call ends, the dashboard requests `/api/vapi/call/:id` and upgrades the execution source to `provider_verified` when the provider record is available.

## Smoke tests
- `/` renders.
- `/api/tools/vapi` GET returns tool list.
- `/api/vapi/webhook` GET returns ok.
- Safe action: invoice copy completes only after caller-supplied verification.
- High-impact action: cancellation returns `requires_human`.
- Explicit human request invokes handoff path.
- Live/simulator run appears in local evidence ledger.
- Changing loaded labour cost recalculates every ledger row.

## Failure response
- Vapi public key missing: simulator remains fully usable.
- Private key missing: live run stays `estimated`; never mark it provider verified.
- Provider evidence fetch fails: retain transparent estimate and trace the failure.
- Tool fails: retry budget then handoff.
- Critical eval fails: launch status must become blocked.

## Production hardening checklist
Before real customer data: durable store, webhook authentication, tenant isolation, secrets management, retention policy, audit logging, intent-versioning, replay evals, and real baseline measurement.
