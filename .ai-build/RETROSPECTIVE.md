# RETROSPECTIVE — v0.2 Flagship Proof

## What worked
- Horizontal deployment-control-plane framing is stronger than a vertical tenant-service product.
- Voice makes last-mile deployment concerns visible: interruptions, tools, handoff, latency, evidence and cost.
- Deterministic tool authorization creates a clean boundary between probabilistic conversation and business action.
- Per-execution economics prevents ROI from becoming a slide-deck number.
- Evidence provenance (`synthetic`, `estimated`, `provider_verified`) keeps the case honest.
- Executable policy + ROI tests turn important claims into CI gates.

## What we learned
A voice agent can recover conversationally after the caller changes intent, while the underlying execution trace can still be unsafe if an earlier tool result arrives late. The missing primitive is not another prompt. It is **intent-versioned execution state**.

## What should compound into the platform
- versioned intent / execution IDs,
- stale-result rejection,
- standardized human-handoff envelopes,
- provider-normalized call evidence,
- baseline + ROI contracts,
- evidence provenance as a first-class field.

## What not to generalize yet
- Northstar-specific demo account details,
- Vapi-specific event shapes,
- fixed €0.12/min estimates,
- support-specific intent names.

## Next proof milestone
Run a small provider-verified call set and compare predicted outcomes/costs against actual provider records. The first goal is not maximum containment; it is trustworthy measurement and failure discovery.
