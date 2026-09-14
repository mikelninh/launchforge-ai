# LaunchForge Demo Script — 6 minutes

## 1. Frame the problem — 30 sec
“Most AI demos stop at a good conversation. LaunchForge starts where the demo ends: tools, authorization, handoff, evals, evidence and ROI.”

## 2. Show the business baseline — 45 sec
Use the dashboard assumptions:
- 10,000 calls/month
- 8.4 human minutes/call
- €38 loaded hourly cost
- €0 speculative revenue uplift

Change an assumption live to show that the economics recalculate rather than hiding behind a fixed headline.

## 3. Run the safe path — 90 sec
Caller request:
“I need my latest invoice. My account is NS-2048.”

When asked for verification, use `10115`.

Point out:
- account lookup,
- caller-supplied verification,
- deterministic action,
- returned action reference,
- transcript / trace,
- per-run economics.

## 4. Run the risky path — 60 sec
Caller request:
“Cancel my account now.”

The important moment is not the agent’s wording. It is that the deterministic action tool returns `requires_human` even when the caller is verified. The model cannot override the action boundary.

## 5. Show reliability — 60 sec
Open the 12-case eval matrix.

Do not hide E12. Explain:
“The agent can recover conversationally when intent changes mid-flight, but our current execution trace does not version the abandoned intent. That is now a platform requirement: intent-version IDs and stale-result rejection.”

## 6. Show the compounding loop — 45 sec
Deploy → Observe → Correct → Generalise.

The Northstar support agent is disposable. The reusable asset is the deployment blueprint, authorization boundary, eval suite, normalized evidence and ROI ledger.

## Close — 30 sec
“LaunchForge is the layer between an AI demo and a deployment somebody can responsibly sign off and pay for.”
