---
name: feature-implementation
description: Implement a planned feature end to end in the project's profile, using its scaffolder (Mason brick) when available, then wire DI, routes and translations and verify. Use when building a feature from a plan.
---

# Feature implementation

## Preconditions

- `docs/plans/<TICKET-ID>.md` exists, or the change is small enough for `/quick`.
- The profile's `architecture-*` and `state-*` skills are loaded.

## Workflow

1. **Scaffold (approval required).** If the project has a Mason brick (`mason.yaml`, `bricks/feature`), ask, then run `mason get` and `mason make feature --feature_name <snake_name> --entity_name <PascalName>`. Diff the output against the reference feature and fix every difference before going on.
2. **Build inside out**, in the order the profile's architecture skill gives.
3. **Wire it:**
   - endpoint constant in the project's endpoints file
   - DI registration following the reference feature's injection file
   - route name and route
   - translation keys in every locale file, then regenerate keys if the project uses code generation
4. **States:** loading, empty, error (with retry), offline, success, using shared widgets.
5. **Tests** for the state class and repository, following the testing skill.
6. **Verify:** `dart format <changed files>`, `flutter analyze`, `flutter test <related tests>`. Report exact results.

## Definition of done

- Every acceptance criterion maps to code and a test.
- No hard-coded user-facing strings or colours.
- Analyzer clean for changed files; related tests pass.
- Handoff block written.
