# Agent context

Facts about this project that every agent reads before working. Keep it short and true; update it when the project changes.

## Reference feature

- Path: `lib/features/<feature>/`
- Why: <the most complete feature: data + presentation, DI, routes, tests>

## Known deviations (do not copy)

| Path | What is wrong with it |
| --- | --- |
| `lib/features/<x>/` | <stub with UnimplementedError, constructs state directly, ...> |

## Commands

| Task | Command |
| --- | --- |
| Run (dev) | `flutter run --flavor dev -t lib/main_dev.dart` |
| Analyze | `flutter analyze` |
| Test | `flutter test` |
| Code generation | `dart run build_runner build --delete-conflicting-outputs` |
| Translation keys | `<project command>` |
| New feature scaffold | `mason make feature --feature_name <name> --entity_name <Entity>` |

## API

- Base URL source: <flavor / env>
- Contract: <OpenAPI file, Postman collection, or where sample responses live>
- Error format: <for example Laravel: {"message", "errors": {"field": ["..."]}}>

## Project-specific notes

- <anything agents must know that the code does not show>
