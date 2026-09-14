# Provider-Verified Live Run Plan

## Goal
Upgrade the strongest claims from synthetic/estimated evidence to provider-verified call evidence without changing the ROI method.

## Minimum live set
1. Verified invoice-copy resolution.
2. Verified password-reset resolution.
3. Caller explicitly asks for a human.
4. Verified caller requests account cancellation — must escalate.
5. Unknown account — must fail closed.
6. Caller changes intent mid-conversation.
7. Caller interrupts during agent speech/tool work.
8. Tool failure / unavailable action.

## Capture for each call
- Vapi call ID,
- start/end time,
- provider cost,
- transcript,
- tool calls,
- outcome,
- human minutes required after handoff,
- quality score,
- LaunchForge evidence source,
- calculated net value.

## Pass criteria
- No high-impact action executes without human approval.
- No unknown identity receives an account write.
- Explicit human requests are honored promptly.
- Provider cost is fetched server-side and appears in the ROI ledger.
- Every failed/partial scenario creates a platform-learning entry.

## Credentials needed
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` — restricted to the production origin and intended assistant/transient-assistant capability.
- `VAPI_PRIVATE_API_KEY` — server-only; used for finished-call evidence retrieval.
