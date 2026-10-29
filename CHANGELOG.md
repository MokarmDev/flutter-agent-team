# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added
- Claude Code hook: after an edit to a Dart file, `dart analyze` runs on that file and its errors are returned to the agent (`hooks.analyze_dart_on_edit`, on by default). Cursor keeps formatting only, since its after-edit hook output does not reach the agent.

### Changed
- The reference apps are required by the build, and `npm test` runs on Windows.

## [0.1.0] - 2026-10-25

### Added
- Seven agents: product-manager, architect, flutter-developer, data-integrator, qa-engineer, code-reviewer, bug-investigator.
- Eighteen skills: task-management (local, GitHub Issues, Jira, Linear, Trello), requirements, feature-planning, feature-implementation, code-review, debugging, git-workflow, refactoring, architecture-clean, architecture-mvvm, state-bloc, error-handling, networking-rest, navigation, ui-and-theming, localization-rtl, testing, local-database.
- Nine commands: /agent-team-init, /ticket-new, /ticket-start, /ticket-build, /review, /ticket-ship, /ticket-status, /quick, /bug.
- Eleven rules installed per project, with the architecture rule matching the project's profile.
- Guard hooks for Claude Code and Cursor: generated-file edits, secret-file reads, destructive shell commands, Dart formatting after edits, optional ticket-branch check.
- Reference apps: MVVM + Cubit and Clean Architecture + BLoC, sharing one core.
- Build tool that generates both plugins from `src/` and lints them; CI for plugins and reference apps.

### Fixed (reference apps, compared with the original templates)
- Pagination no longer duplicates items when a later page fails offline; the cache is used for the first page only.
- HTTP 422 and 400 field errors become `ValidationFailure.fieldErrors`; connection problems become `NetworkFailure`; 403, 404, 429 and cancellation have their own failures.
- `safeCall` no longer shows exception text to users.
- Network logging is debug-only and redacts `Authorization`, cookies and API keys, and auth request bodies.
- Dio timeouts are set.
- `.env` and the generated `env.g.dart` are no longer committed; `.env.example` is provided.
- MVVM app: package renamed to `flutter_mvvm_template`, tests added for repository, Cubit, errors and logging.
