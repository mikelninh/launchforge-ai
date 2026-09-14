# AUTONOMY — LaunchForge AI

## Agent may do automatically
- classify low-risk workflow intent,
- ask clarifying questions,
- look up fictional/read-only records,
- execute explicitly allow-listed low-risk demo actions after required verification,
- create structured human handoffs,
- calculate execution economics,
- emit traces and evidence labels.

## Human approval required
- account cancellation,
- plan or contract changes,
- payments/refunds,
- legal commitments,
- destructive writes,
- policy exceptions,
- any action outside the explicit allow-list.

## Hard stop conditions
- identity cannot be verified,
- required tool returns an unsafe/unknown state,
- retry budget is exhausted,
- caller explicitly requests a person,
- agent is uncertain about policy or authorization.

## Design rule
The language model may propose an action. Deterministic policy/tool code decides whether that action can execute.
