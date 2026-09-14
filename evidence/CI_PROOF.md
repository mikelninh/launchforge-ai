# CI Proof

Latest validated workflow at the end of the v0.2 build:

- install dependencies — pass
- 11 executable contract tests — pass
- Next.js production build — pass

Canonical workflow: `.github/workflows/ci.yml`.

The GitHub Actions run for HEAD should be treated as the source of truth for current build/test status; this file records the proof shape, not a permanent badge claim.
