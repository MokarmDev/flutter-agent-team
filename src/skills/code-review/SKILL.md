---
name: code-review
description: Review a Flutter diff against its ticket, the project profile, security and tests, and report findings ranked by user impact with file, line and a minimal fix. Use before merging or when the user asks for a review.
---

# Code review

## Severity

| Severity | Meaning |
| --- | --- |
| Blocker | Crash, data loss, security or privacy issue, wrong behaviour, or a broken acceptance criterion |
| Major | Architecture violation, missing state (error, empty, offline), missing test for new logic, unrelated changes |
| Minor | Maintainability issue that will cost time later |

Style already enforced by `dart format` and the analyzer is not reported.

## Checklist

**Scope**
- Does the diff deliver every acceptance criterion? Anything outside the ticket?

**Architecture (per profile)**
- Imports respect the layer table in the `architecture-*` skill.
- State classes depend on repositories (or use cases), never on data sources, Dio or databases.
- DI lifetimes match the reference feature (factories for screen state, singletons for repositories and services).

**Correctness**
- Null safety and async: no emit or notify after dispose; awaited futures; cancellation on close.
- Errors: every failure path maps to a typed failure and a visible state; 401 and 422 handled.
- Lists and pagination: no duplicates after a failed page, end-of-list decided by the server.

**Security and privacy**
- No secrets in code or committed config; no tokens or personal data in logs.
- Sensitive data in secure storage only.

**UI**
- Localized strings; RTL-safe paddings; text scale; accessibility labels; 48 dp targets.

**Tests**
- New logic has tests; the test report's commands were actually run.

## Report format

```
### Review: <TICKET-ID>
Verdict: approve | approve with changes | block

1. [Blocker] lib/features/orders/data/orders_repository_impl.dart:42
   Impact: ...
   Fix: ...
```

If nothing is found, state what was reviewed and what was not verified.
