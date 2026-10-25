---
name: feature-planning
description: Turn a Ready ticket into an implementation plan that names real files per layer, the data and state flow, tests, risks and approval-gated decisions. Use before writing code for any ticket that touches more than one file.
---

# Feature planning

## Workflow

1. Read `.agent-team.yaml`, `docs/agent-context.md` and the profile's `architecture-*` skill.
2. Open the reference feature and the closest existing feature. List reusable pieces with paths.
3. Map each acceptance criterion to the profile's layers.
4. Decide per screen: loading, empty, error and offline behaviour; caching; pagination; navigation entry points.
5. Name the API contract. No real sample response means the plan is blocked; say so.
6. List files to create and change, DI registrations, routes, translation keys, and tests per layer.
7. List approval-gated decisions and risks.
8. Write `docs/plans/<TICKET-ID>.md` from the template below.

## Plan template

```markdown
# Plan: <TICKET-ID> <title>

## Summary
<two sentences>

## Reference
- Closest feature: <path>
- Reused as-is: <paths>

## Flow
<View> -> <ViewModel/Cubit> -> <UseCase if the profile has one> -> <Repository> -> <DataSource> -> <API/DB>

## Criteria to layers
| Criterion | Layer | File |
| --- | --- | --- |

## Files
- Create: ...
- Change: ...

## Wiring
- DI: ...
- Routes: ...
- Translations: ...

## Screen states
| Screen | Loading | Empty | Error | Offline |
| --- | --- | --- | --- | --- |

## Tests
- Unit: ...
- Widget: ...
- Integration: ...

## Approval needed
- ...

## Risks and open questions
- ...
```

## Common mistakes

- Planning against files that were never opened.
- Forgetting translation keys, DI registration or the route.
- Hiding a missing API contract instead of marking the plan blocked.
