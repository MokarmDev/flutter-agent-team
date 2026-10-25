---
name: ticket-build
description: Implement an approved plan - data layer, then UI and state, then tests - with the data-integrator, flutter-developer and qa-engineer agents, looping on failures.
argument-hint: "<ticket ID>"
---

# Build ticket $ARGUMENTS

Precondition: `docs/plans/$ARGUMENTS.md` exists and the user approved it.

1. Delegate the data-layer part of the plan to `data-integrator`.
2. Delegate the UI and state part to `flutter-developer`.
3. Delegate verification to `qa-engineer`; it writes `docs/test-reports/$ARGUMENTS.md`.
4. If tests or analysis fail, send each failure to the owning agent and re-run `qa-engineer`. Stop after three rounds and report what still fails.
5. Each agent ends with its handoff block. Summarise them for the user.
6. Next step: `/review`, then `/ticket-ship $ARGUMENTS`.
