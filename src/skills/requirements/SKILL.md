---
name: requirements
description: Write user stories with Given/When/Then acceptance criteria, slice features vertically, and check a Definition of Ready. Use when turning an idea, bug report or design into tickets.
---

# Requirements

## Workflow

1. **Goal and user.** One sentence each. If either is unclear, ask.
2. **Slice vertically.** Each slice is demoable alone and touches every layer it needs. Split by user outcome, not by layer ("show orders" and "filter orders", not "orders API" and "orders UI").
3. **Write criteria** in Given/When/Then. Every story covers the happy path plus these cases, or states why one does not apply:
   - empty data
   - request failure (with retry)
   - offline
   - permission denied (camera, location, notifications...)
   - server validation errors on forms (HTTP 422), shown next to the field
   - an older installed app version, if the API contract changes
4. **Non-functional criteria** for payments, auth and personal data: security, privacy, and store policy.
5. **INVEST check:** independent, negotiable, valuable, estimable, small, testable. Fix any story that fails.
6. **Definition of Ready** (default; the project may override it in `.agent-team.yaml`):
   - acceptance criteria present and testable
   - design link, or explicitly "no design needed"
   - API contract or sample response available, or the ticket marked as blocked
   - open questions answered or explicitly deferred

## Common mistakes

- Criteria that describe implementation ("use a Cubit") instead of behaviour.
- One huge story for a whole screen with five behaviours.
- Silent assumptions: every assumption is written under "Open questions".
