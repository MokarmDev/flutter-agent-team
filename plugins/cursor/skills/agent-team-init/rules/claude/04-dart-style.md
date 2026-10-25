---
paths:
  - "**/*.dart"
---
<!-- Dart style and generated files -->

# Dart style

- Follow `analysis_options.yaml` and neighbouring files; run `dart format` on changed files.
- No `print`: use the project's logger. No empty `catch`.
- Prefer `final` and `const`; relative imports inside `lib/` when the project does.
- Never hand-edit generated files (`*.g.dart`, `*.freezed.dart`, `locale_keys.g.dart`); change the source and regenerate.
- Do not relax analyzer rules to silence a warning.
