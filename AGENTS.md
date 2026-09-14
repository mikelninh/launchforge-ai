# AGENTS.md — LaunchForge AI

## Mission
Build LaunchForge into the operating system for taking AI agents from messy enterprise workflow to reliable, measurable production deployment — while making every deployment improve the platform.

## Non-negotiables
1. Outcome over demo.
2. Field truth over assumed truth.
3. Generalize deliberately.
4. Observable by default.
5. Evals before launch.
6. Human escalation is a feature.
7. No silent failures.
8. Deterministic policy belongs in tools, not prompt text alone.
9. Synthetic evidence must never be presented as production evidence.
10. Security and privacy are architecture concerns, not launch-week tasks.

## Build OS
`01 SHAPE → 02 SPECIFY → 03 DELEGATE → 04 PROVE → 05 SHIP → 06 WATCH`

## Product loop
Every deployment should produce:
- customer value,
- verified workflow knowledge,
- failure evidence,
- reusable components,
- and one explicit decision about what should or should not move into the platform.

## Flagship proof
**Horizontal Voice Support Resolution.**

The first golden path uses a fictional B2B service company and a real voice-provider integration to demonstrate:
- business baseline capture,
- browser voice calls,
- deterministic tool use,
- hard human-handoff policy,
- transcript and execution trace,
- provider-verified call cost where credentials exist,
- reliability evals,
- per-run ROI,
- monthly economic projection,
- and explicit learning that feeds back into the platform.

The use case is intentionally horizontal. Do not hard-wire LaunchForge to property management, customer support, or Vapi. Those are showcase adapters, not the product boundary.

## Evidence states
Every execution must be labelled `synthetic`, `estimated`, or `provider_verified`.

## Current known gap
Intent changes during an in-flight tool call need explicit intent-version IDs. A stale result must never mutate a newer caller intent.
