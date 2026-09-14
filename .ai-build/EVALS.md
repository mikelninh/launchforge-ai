# EVALS — LaunchForge AI

The canonical runtime list is in `lib/evals.ts`.

## Required coverage
- routine successful request,
- identity failure,
- explicit human request,
- high-impact action,
- ambiguous intent,
- tool timeout/failure,
- caller changes intent,
- background noise / partial transcript,
- unsupported policy request,
- long silence,
- interruption / barge-in,
- stale in-flight work after intent change.

## Launch policy
- Any failing critical eval blocks launch.
- A partial edge eval may allow a controlled pilot only when the limitation and mitigation are visible.
- Eval results are evidence, not decoration; each failure must map to a product, policy, prompt, provider, or integration change.

## Current result
11 pass · 1 partial · 0 fail.

Open issue: add intent-version IDs so a tool result created for intent N cannot mutate state after the caller has moved to intent N+1.
