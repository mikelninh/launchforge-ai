# SPEC — LaunchForge AI v0.2

## Product statement
LaunchForge is a deployment control plane for AI agents. It standardizes the path from business workflow to integrated, evaluated, observable, economically measurable deployment.

## Flagship proof
Horizontal Voice Support Resolution for fictional company Northstar Cloud.

## Primary user
A deployment strategist, forward-deployed engineer, solutions engineer, or AI operator responsible for moving an agent from demo to pilot/production.

## Jobs to be done
- capture the human baseline and economic assumptions,
- define the agent's allowed and forbidden actions,
- connect tools with deterministic policy,
- run reliability scenarios,
- observe live execution traces,
- distinguish synthetic/estimated/provider-verified evidence,
- calculate per-run ROI,
- project economics at customer volume,
- capture the field correction that should become platform capability.

## Functional requirements
1. Browser voice call through Vapi when configured.
2. Simulator works without credentials.
3. Deterministic demo tools: account lookup, low-risk action, human escalation.
4. High-impact actions cannot be executed by the model.
5. Transcript and trace are visible during/after a call.
6. Finished Vapi call evidence can be fetched server-side by call ID.
7. ROI assumptions are visible/editable.
8. Execution ledger labels evidence provenance.
9. Reliability suite exposes pass/partial/fail states.
10. Production gaps are visible rather than hidden.

## Non-goals for v0.2
- production customer data,
- durable multi-tenant persistence,
- payments or real account changes,
- a bespoke telephony stack,
- pretending synthetic data is a customer result.

## Success criteria
A technical or business reviewer can understand the workflow, run the demo, inspect the safety boundary, challenge the ROI assumptions, see the open reliability gap, and explain how the platform generalizes beyond the flagship use case.
