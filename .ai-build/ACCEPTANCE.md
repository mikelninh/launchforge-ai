# ACCEPTANCE — LaunchForge AI v0.2

## P0 — must pass
- [x] Simulator runs with zero external credentials.
- [x] Live voice path exists through Vapi Web SDK.
- [x] Vapi private key never appears in client code.
- [x] Account cancellation cannot be executed by the model/tool path.
- [x] Explicit human request maps to a handoff capability.
- [x] Unknown identity fails closed.
- [x] Every ledger row labels evidence source.
- [x] ROI assumptions are visible and editable.
- [x] Synthetic evidence is visibly labelled as synthetic.
- [x] Critical reliability evals pass.

## P1 — strong proof
- [x] Live transcript surface.
- [x] Tool / status execution trace.
- [x] Provider call evidence endpoint.
- [x] Per-run ROI ledger.
- [x] Monthly projection.
- [x] Transparent provider USD→EUR assumption.
- [x] One non-green eval remains visible with a concrete platform fix.
- [x] Case study explains generalization beyond support/voice.

## P2 — production hardening (not required for public proof)
- [ ] Durable webhook/event storage.
- [ ] Authenticated webhook ingestion.
- [ ] Intent-version IDs / stale-result rejection.
- [ ] Automated replay eval worker.
- [ ] Real customer baseline import.
- [ ] Multi-tenant auth / RBAC.
- [ ] Live second voice-provider adapter.

## Definition of Done for v0.2
The application builds and deploys, the simulator is usable publicly, the live Vapi path is credential-ready, the safety boundary is deterministic, ROI can be challenged by editing assumptions, and the documentation makes the remaining production gaps explicit.
