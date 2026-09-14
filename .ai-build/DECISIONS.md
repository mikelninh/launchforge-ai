# DECISIONS — LaunchForge AI

## D001 — Horizontal core, vertical adapters
LaunchForge is not a property-management product and not a voice product. The flagship is horizontal support resolution; providers and customer workflows sit behind adapters/blueprints.

## D002 — Vapi first, not Vapi forever
Use Vapi for the quickest reliable browser/telephony proof. Preserve the existing `VoiceProvider` boundary so Retell, LiveKit, or another provider can replace/add to it.

## D003 — Deterministic authorization
Prompts can guide behaviour but may not authorize high-impact actions. Tool code owns the final policy boundary.

## D004 — Evidence provenance is mandatory
Synthetic, estimated, and provider-verified data are separate evidence states. Never blend them into an unlabeled headline metric.

## D005 — Operational ROI before speculative revenue
The flagship case uses labour value and automation spend. Revenue impact defaults to zero.

## D006 — Visible failure beats fake perfection
Keep E12 partial until intent-versioning is implemented. A trustworthy proof is stronger than a perfect-looking score.

## D007 — Public proof stores fictional data only
Browser localStorage is acceptable for demo evidence. Real deployments require a durable authenticated event store and explicit retention policy.
