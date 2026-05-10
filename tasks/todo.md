- [x] Review PR findings and identify affected files
- [x] Align OAuth link environment variables and fallbacks
- [x] Fix renamed social-account fields and profile hydration
- [x] Harden server-side social account update semantics
- [x] Restore robust HTML sanitization
- [x] Verify with typecheck/lint or focused checks

## Review

Implemented the PR review fixes around OAuth account linking, social account
field ownership, server-side profile validation, and HTML sanitization.

Verification completed:
- `yarn tsc --noEmit`
- `npx prisma validate`
- `git diff --check`
- Focused `rg` checks for stale env names, stale profile field names, and the
  removed regex sanitizer
