---
name: agent-team-init
description: Set up Flutter Agent Team in the current Flutter project - detect the stack profile, write .agent-team.yaml and docs/agent-context.md, install the rules for this tool, and check secrets hygiene.
argument-hint: "[tracker: local|github|jira|linear|trello]"
---

# Initialise Flutter Agent Team in this project

Run once per project, and again when the stack changes. Show every file you will write as a preview and write only after the user approves.

## 1. Detect the profile

Read `pubspec.yaml`, `analysis_options.yaml`, `mason.yaml` and list `lib/`.

| Signal | Profile value |
| --- | --- |
| `flutter_bloc` / `bloc` dependency | `state: bloc` |
| `flutter_riverpod` / `hooks_riverpod` | `state: riverpod` (supported from v0.2) |
| `get` dependency, `lib/app/modules/` | `state: getx`, `architecture: getx` (supported from v0.2) |
| features with `domain/` folders (entities, usecases) | `architecture: clean` |
| features with `data/` and `presentation/` but no `domain/` | `architecture: mvvm` |
| `go_router` | `routing: go_router` |
| `hive_ce` / `hive` / `sqflite` / `drift` / `isar` / `objectbox` | `local_db` list, using the package actually in `pubspec.yaml` (`hive` stays `hive`; suggest migrating to `hive_ce` as a separate ticket) |
| `firebase_*`, `supabase_flutter`, otherwise Dio/http | `backend` |
| `firebase_crashlytics`, `sentry_flutter`, `firebase_analytics` | `monitoring` list |

If signals conflict (for example both `flutter_bloc` and `get`), show them and ask which one is the project's way. If the detected architecture or state is not supported yet, say so and continue with what is supported.

## 2. Choose the tracker

Use the argument if given, otherwise ask: `local` (Markdown tickets in `docs/tickets/`, no account needed), `github`, `jira`, `linear` or `trello`. Ask for the project key or board and the status names it uses.

## 3. Write `.agent-team.yaml`

Start from [templates/agent-team.yaml](templates/agent-team.yaml) and fill in the detected values.

## 4. Write `docs/agent-context.md`

Start from [templates/agent-context.md](templates/agent-context.md):

- **Reference feature:** propose the most complete feature (data and presentation layers, wired in DI and routes, with tests). Ask the user to confirm.
- **Known deviations:** list features that contain `UnimplementedError`, `TODO` stubs, direct construction of state classes, or other patterns that should not be copied. Ask the user to confirm each.
- **Commands:** run, test, analyze, code generation, flavors, as found in the README, `.vscode/launch.json` or `main_*.dart` files.

## 5. Install the rules

The rules ship with this skill. Copy every file; for the architecture rule copy only the variant matching `profile.architecture`, renamed without the variant suffix. Install for the tool you are running in; do not ask which:

- **Claude Code:** copy [rules/claude/](rules/claude/) into `.claude/rules/`. Example: `03-architecture.mvvm.md` becomes `.claude/rules/03-architecture.md`.
- **Cursor:** copy [rules/cursor/](rules/cursor/) into `.cursor/rules/`. Example: `03-architecture.mvvm.mdc` becomes `.cursor/rules/03-architecture.mdc`.

If the project already has rules with the same purpose, show both and ask before replacing.

Reading this skill's `templates/` and `rules/` folders may trigger a permission prompt, because they live in the plugin's install folder. Ask the user to allow it; never rewrite these files from memory.

## 6. Secrets hygiene check (report only)

- `.env*`, keystores (`*.jks`, `*.keystore`, `key.properties`), `google-services.json`, `GoogleService-Info.plist`: tracked by git? listed in `.gitignore`?
- Any of them committed: report it with the fix (add to `.gitignore`, add an example file, rotate the leaked values). Do not rewrite git history.

## 7. Finish

Print the profile, the tracker, the files written, and the next step: `/ticket-new <idea>` or `/ticket-start <ID>`.
