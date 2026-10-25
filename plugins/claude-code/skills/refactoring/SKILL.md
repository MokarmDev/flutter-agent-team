---
name: refactoring
description: Restructure Flutter code without changing behaviour, in small verified steps that keep the profile's boundaries. Use for renames, extractions, removing duplication, or aligning old code with the reference feature.
---

# Refactoring

## Preconditions

- The behaviour to preserve is written down: inputs, outputs, states emitted, routes.
- Tests cover it, or characterization tests are added first.
- The refactor has its own ticket; it is never mixed into a feature diff.

## Workflow

1. Search every usage across `lib/`, `test/` and `bricks/` before renaming or moving.
2. Change in small steps: move, fix imports, analyze, test; then the next step.
3. Keep contracts: repository signatures, DI names and lifetimes, route paths used by deep links.
4. If the canonical shape of a feature changes, update the Mason brick in the same change.
5. Verify: `dart format`, `flutter analyze`, `flutter test`.

## Never

- Mix behaviour changes with structural changes.
- Edit generated files instead of their sources.
- Introduce a new architecture, state-management or codegen package as part of a refactor.
