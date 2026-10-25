---
name: quick
description: Fast path for a small, low-risk change (copy fix, small UI tweak, one-function bug fix) that skips the product-manager and architect but keeps verification.
argument-hint: "<small change>"
---

# Quick change

Request: $ARGUMENTS

1. Decide if this is really small: at most a few files, no new package, no API or database change, no auth, payments, platform config or migration. If it is not small, stop and suggest `/ticket-new`.
2. Read `.agent-team.yaml` and `docs/agent-context.md`; follow the profile's skills.
3. Make the change with the owning agent (`flutter-developer` for UI and state, `data-integrator` for data).
4. Run `dart format` on changed files, `flutter analyze`, and the related tests. Report exact results.
5. If the diff touches more than about 100 lines or any risk area, run `/review` before finishing.
