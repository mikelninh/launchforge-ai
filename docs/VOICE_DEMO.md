# Voice Demo Strategy

## Goal
Use a reliable production voice platform as the realtime channel while LaunchForge owns deployment logic, evals, traces, ROI, readiness, and learning.

## Provider strategy

LaunchForge must not become a thin wrapper around one voice vendor.

### First demo provider
Use **Retell or Vapi** for the quickest live phone demo.

Why:
- real inbound/outbound telephony
- interruption handling and natural turn taking
- function/tool calling
- call monitoring and post-call data
- fast setup for an actual pilot

### Higher-control path
Add **LiveKit Agents** as a second adapter for teams that want more infrastructure ownership, custom realtime orchestration, or their own SIP/provider stack.

## Architecture

```text
Caller
  ↓
Voice Provider (Retell / Vapi / LiveKit)
  ↓
LaunchForge Voice Adapter
  ↓
Deployment Blueprint
  ├─ agent instructions
  ├─ tool contracts
  ├─ escalation rules
  └─ eval criteria
  ↓
Customer systems / tools
  ↓
Execution Trace
  ↓
Quality + Outcome + Cost
  ↓
ROI Ledger
  ↓
Learning Loop
```

## Demo workflow

The live demo should be horizontal rather than tied to one industry.

A visitor selects one blueprint:

1. **Support Resolution**
   - caller asks for help
   - agent identifies intent
   - retrieves approved information
   - completes an action or escalates

2. **Lead Qualification**
   - agent discovers need, urgency, budget and fit
   - calls enrichment / CRM tools
   - books or routes the next step

3. **Operations Intake**
   - caller reports a request or operational issue
   - agent gathers structured fields
   - validates required information
   - creates the task or routes an exception

All three use the same LaunchForge infrastructure.

## What LaunchForge measures per call

- call duration
- human handoff duration
- completion / conversion / escalation / failure
- baseline human handling time
- actual human handling time
- voice + model + tool cost
- quality score
- revenue impact where attributable
- net value
- ROI

## ROI

```text
avoided human minutes = baseline human time - actual human time
labour value = avoided minutes / 60 × loaded hourly cost
gross value = labour value + attributable revenue impact
net value = gross value - AI/provider/tool cost
ROI = net value / AI/provider/tool cost
```

Assumptions must be visible and editable.

## Reliability gates before public launch

- interruption / barge-in test
- silence and timeout test
- noisy audio test
- ambiguous intent test
- tool failure test
- slow tool test
- caller changes their mind
- caller asks for a human
- unsupported request
- policy / safety boundary
- malformed customer data
- dropped call / reconnect behavior

A voice agent is not considered production-ready because it sounds human. It is production-ready when it completes the intended task reliably, fails safely, and produces evidence.
