# Case Study — Voice Support Resolution

## Executive summary

LaunchForge demonstrates a repeatable method for deploying a voice agent against a real business workflow without confusing a polished conversation with production readiness.

The fictional pilot customer, **Northstar Cloud**, handles high-volume inbound service requests. The deployment automates low-risk requests, forces human escalation for high-impact actions, records execution evidence, and calculates value at the level of each call.

This is a proof of the deployment system, not a claim that Northstar Cloud is a real customer.

## 1. Business problem

Routine service calls consume human capacity even when the request is structured and low risk. Traditional automation often fails because it optimizes only the conversation layer while leaving the last mile — identity, tools, authorization, escalation, observability, and economics — underspecified.

### Baseline used in the model

- 10,000 inbound calls / month
- 8.4 baseline human minutes / call
- €38 loaded human cost / hour
- revenue impact deliberately set to €0
- target containment ≥70%
- maximum failure rate ≤5%
- target quality ≥90%

All assumptions are visible in the UI and editable.

## 2. Deployment goal

The agent should:

1. understand the caller's intent,
2. identify the fictional demo account,
3. execute only approved low-risk actions,
4. escalate exceptions with complete context,
5. make no unsupported promises,
6. emit a reconstructable trace,
7. and produce a defensible economic result.

## 3. Demo workflow

### Safe path

Caller: “I need my latest invoice. My account is NS-2048.”

Expected path:

`intent → lookup_account → caller verification → perform_action(invoice_copy) → reference → resolved`

### High-impact path

Caller: “Cancel my account.”

Expected path:

`intent → lookup_account → policy boundary → deterministic tool returns requires_human → escalate_to_human`

The model cannot override the policy boundary. The server-side tool owns authorization.

## 4. Architecture

```text
Browser / phone
      ↓
Vapi voice runtime
      ↓
LaunchForge assistant blueprint
      ↓
Function tools
  ├─ lookup_account
  ├─ perform_action
  └─ escalate_to_human
      ↓
Execution trace
      ↓
Provider call record
      ↓
Outcome + quality + cost
      ↓
ROI ledger
      ↓
Reliability gate + platform learning
```

The voice vendor is behind an adapter boundary. LaunchForge owns the deployment semantics and economics.

## 5. Evidence model

A strong deployment case must state what kind of evidence is being shown.

### `synthetic`
Scenario/model evidence used before live traffic. Useful for failure coverage and economic sensitivity, but not presented as customer production data.

### `estimated`
A real or simulated execution where some economics are derived from transparent assumptions, such as estimated provider cost per minute.

### `provider_verified`
A finished call fetched from Vapi by call ID. Provider-reported duration and cost are used in the ROI ledger.

## 6. ROI method

```text
avoided human minutes = baseline human minutes - actual human minutes
labour value = avoided minutes / 60 × loaded hourly cost
net value = labour value - automation cost
ROI = net value / automation cost
```

The case deliberately excludes speculative revenue uplift. If the operational case is not positive on its own, the deployment has not earned the right to hide behind hypothetical sales impact.

## 7. Reliability proof

The current suite contains 12 scenarios:

- routine invoice request,
- password reset,
- explicit human request,
- cancellation / high-impact request,
- unverified account,
- ambiguous intent,
- tool failure,
- caller changes intent,
- noisy / partial transcript,
- unsupported policy question,
- long silence,
- double intent + interruption during tool result.

Current state: **11 pass, 1 partial, 0 fail.**

The partial scenario is intentionally visible. The current trace can recover conversationally after a changed intent, but it does not yet attach an explicit intent-version ID to in-flight tool work. The production fix is to version intent state and reject stale tool results.

This is the important part of forward-deployed learning: the field correction becomes a reusable platform capability.

## 8. Why this scales

Nothing core to LaunchForge depends on the fictional support company.

The reusable primitives are:

- business baseline,
- input/output contract,
- tool contract,
- authorization policy,
- escalation policy,
- eval suite,
- execution trace,
- provider evidence adapter,
- ROI ledger,
- readiness gate,
- learning record.

Swap the blueprint and integrations and the same control plane can support lead qualification, appointment scheduling, collections, operations intake, finance workflows, healthcare administration, legal intake, and other agent deployments.

## 9. What is deliberately not production-complete yet

The public proof keeps the gaps visible:

- webhook payloads are not persisted to a durable database,
- webhook authentication is not enabled in the fictional demo,
- intent-version IDs are not implemented yet,
- no real customer baseline has been imported,
- only the Vapi adapter has a live path,
- synthetic evaluations are encoded rather than run by a dedicated eval worker.

These are production-hardening tasks, not hidden caveats.

## 10. Definition of a successful proof

A reviewer should be able to answer, from the repo and running application:

- What problem is the agent solving?
- What can it do and what is it forbidden to do?
- What happens when tools fail?
- How does a human take over?
- How do we know what happened during a call?
- How much did the call cost?
- How much human work did it avoid?
- Which evidence is synthetic and which is provider verified?
- Which eval currently prevents a stronger production claim?
- What reusable platform capability came out of the deployment?

If those questions are answered, the proof demonstrates deployment strategy rather than prompt engineering.
