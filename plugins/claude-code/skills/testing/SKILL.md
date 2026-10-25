---
name: testing
description: Write and run Flutter tests that prove acceptance criteria (unit, state-class, repository, widget, golden and integration), using fakes, and report exact results. Use when adding tests, fixing bugs, or verifying a ticket.
---

# Testing

Generic how-tos (widget tests, integration tests, mocks) are covered by the official `dart-flutter` plugin; this skill holds the team's strategy.

## What to test, where

| Change | Test | Location |
| --- | --- | --- |
| Use case or mapping | unit test with a fake repository | `test/features/<f>/domain/` |
| Repository | unit test with fake data sources: success, each failure, cache fallback, pagination | `test/features/<f>/data/` |
| Cubit / ViewModel | state sequence for success, failure, empty, refresh, end of list | `test/features/<f>/presentation/` |
| Screen states | widget test: loading, empty, error with retry, RTL | `test/features/<f>/presentation/` |
| Critical flow | integration test on a device or emulator | `integration_test/` |

Mirror `lib/` under `test/`. Name tests by behaviour: `returns cached products when the first page fails offline`.

## Fakes first

- Hand-written fakes implementing the repository or data-source contract are the default.
- Use `mocktail` only if the project already depends on it; adding a test package needs approval.
- No real network, no real secrets, no dependency on the current date (inject a clock).

## Running

```bash
flutter test test/features/<feature>   # narrowest first
flutter test                            # then everything
flutter analyze
```

When the Dart MCP server is connected, prefer its test and analyzer tools; when a device or emulator is available (Dart MCP or mobile-mcp), run the critical flow on it.

## Reporting

Report passed, failed, skipped and not run separately, with the exact commands. A test you did not run is "not run", never "passed".

## Rules

- A new test must fail when the behaviour breaks: break it once, watch it fail, restore it.
- Flaky means broken: fix timing with fakes and `pump`, never with `sleep` or retries.
- Do not change production code to make a test pass; report the bug.
