---
name: debugging
description: Diagnose a Flutter bug from reproducible evidence by tracing it layer by layer, and propose the smallest safe fix plus a regression test. Use for crashes, wrong UI state, failed loads, or anything that "does not work".
---

# Debugging

## Workflow

1. **Reproduce** with the narrowest test, command or flow. Record flavor (`flutter run --flavor dev -t lib/main_dev.dart` when the project uses flavors), platform, OS version, network and cache state.
2. **Locate the layer** by tracing the flow for the profile: view -> ViewModel/Cubit state -> (use case) -> repository -> data source -> network or storage.
3. **Collect evidence:** current state emissions, logs (never secrets), stack trace, DI registration, route.
4. **Classify the root cause:** network failure, parsing, state lifecycle, DI, routing, platform config, or UI only.
5. **Smallest fix** in the failing layer only. Write it as a plan for the owning agent.
6. **Regression test** that fails before the fix and passes after.

## Common Flutter root causes

- Emit or `notifyListeners` after dispose; missing cancellation of in-flight work.
- `setState` or `BuildContext` used across an async gap without a `mounted` check.
- Missing DI registration (GetIt "not registered") or wrong lifetime.
- JSON field missing or of a different type than the model expects.
- Cache returned for a later page, duplicating list items.
- Unbounded constraints: `ListView` inside `Column` without `Expanded`.
- Platform config: missing permission entry, minSdk or Info.plist key.

## Never

- Swallow exceptions, disable lints, or weaken tests to hide the symptom.
- Change state-management libraries to fix a bug.
