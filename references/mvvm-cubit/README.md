<div align="center">

# Flutter MVVM Template

**Feature-first MVVM for small and medium Flutter apps — aligned with [Flutter’s app architecture guide](https://docs.flutter.dev/app-architecture/guide).**

[![Flutter](https://img.shields.io/badge/Flutter-3.11+-02569B?logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.11+-0175C2?logo=dart&logoColor=white)](https://dart.dev)
[![BLoC](https://img.shields.io/badge/State-Cubit%2FBLoC-2E7D32)](https://bloclibrary.dev)
[![GetIt](https://img.shields.io/badge/DI-GetIt-7B1FA2)](https://pub.dev/packages/get_it)

[Quick start](#quick-start) · [Architecture](#architecture) · [Project structure](#project-structure) · [Commands](#commands) · [Add a feature](#add-a-feature)

</div>


> Part of [Flutter Agent Team](../../README.md): this app is a **reference implementation** the agents copy. Agent rules and skills come from the plugin; run `/agent-team-init` in your own project.

---

## Why this template

| | |
|---|---|
| **Simple MVVM** | View + Cubit (ViewModel) + Repository/DataSource (Model). No domain or use-case layer. |
| **Feature-first** | Each feature owns its UI and data; easy to scale without a god module. |
| **Typed errors** | `Either<Failure, T>` via `dartz` and `safeCall`. |
| **Ready tooling** | Dio, Hive cache, go_router, flavors, i18n, Mason feature brick. |

Reference implementation: **`home`** — pagination, remote + local cache, cancelable Cubit.

---

## Architecture

Follows Flutter’s recommended split: **UI layer** (View + ViewModel) and **data layer** (Repository + DataSource / service).

```
┌─────────────────────────────────────────────────────────────┐
│  UI layer                                                   │
│    View          Pages · Widgets                            │
│    ViewModel     Cubit · State                              │
├─────────────────────────────────────────────────────────────┤
│  Data layer  (Model in MVVM terms)                          │
│    Repository    Source of truth · cache · orchestration    │
│    DataSource    HTTP / Hive / prefs wrappers               │
└─────────────────────────────────────────────────────────────┘
```

```text
UI  →  Cubit  →  Repository  →  DataSource  →  Either<Failure, T>  →  emit State
```

Cubit depends on the repository only. DataSources stay thin; the repository owns caching and fallbacks (see `home`).

### Feature layout

```text
features/<feature>/
├── data/
│   ├── datasources/       # remote / local
│   ├── models/            # entity + JSON/Hive model
│   └── repositories/      # abstract + impl
├── presentation/
│   ├── manager/           # Cubit + State (ViewModel)
│   ├── pages/             # View
│   └── widgets/
└── <feature>_injection.dart
```

---

## Project structure

```text
lib/
├── main_dev.dart / main_prod.dart   # Flavor entry points
├── config/                          # env · routing · theme
├── core/                            # DI · network · errors · storage
├── features/                        # home · cart · profile · theme
└── shared/                          # widgets · navigation · mixins
```

| Area | Role |
|------|------|
| `config/` | App-wide config (env, router, themes) |
| `core/` | Cross-cutting infra (GetIt, Dio, failures, storage) |
| `features/` | Product features (MVVM per feature) |
| `shared/` | Reusable UI and helpers |

---

## Quick start

```bash
# 1. Install dependencies
flutter pub get

# 2. Configure env: copy the example, then edit your local copy (never commit it)
cp lib/config/env/.env.example lib/config/env/.env

# 3. Codegen (Envied, Hive, …); creates lib/config/env/env.g.dart, which is not committed
dart run build_runner build --delete-conflicting-outputs

# 4. Run (dev flavor)
flutter run --flavor dev -t lib/main_dev.dart
```

> **Android:** pass `--flavor` (`dev` / `prod` in `build.gradle.kts`).

---

## Commands

### Run & build

```bash
flutter run --flavor dev -t lib/main_dev.dart
flutter run --flavor prod -t lib/main_prod.dart

flutter build apk --flavor prod -t lib/main_prod.dart
flutter build appbundle --flavor prod -t lib/main_prod.dart
```

### Code generation

```bash
# After editing .env or Hive models
dart run build_runner build --delete-conflicting-outputs

# Translation keys
dart run easy_localization:generate \
  --source-dir ./assets/translations \
  -f keys \
  -o locale_keys.g.dart
```

### Scaffold a feature (Mason)

```bash
dart pub global activate mason_cli
mason get
mason make feature --feature_name order --entity_name Order
```

See [bricks/BRICKS_GUIDE.md](bricks/BRICKS_GUIDE.md) for details.

### Tests

```bash
flutter test
```

---

## Add a feature

After `mason make feature ...`, wire it in three places:

| # | File | Action |
|---|------|--------|
| 1 | [`lib/core/constants/api_endpoints.dart`](lib/core/constants/api_endpoints.dart) | Add the API path |
| 2 | [`lib/core/di/injection_container.dart`](lib/core/di/injection_container.dart) | Call `initYourFeature()` from `initCore()` |
| 3 | [`lib/config/routing/app_router.dart`](lib/config/routing/app_router.dart) | Register a `GoRoute` |

**Checklist** (mirror `home`):

- [ ] Cubit injects the repository and maps `Either` → `Loading` / `Loaded` / `Error`
- [ ] `RepositoryImpl` uses `safeCall` (and cache when needed)
- [ ] Page uses `BlocProvider(create: (_) => sl<YourCubit>())`

---

## Tech stack

| Concern | Packages |
|---------|----------|
| Architecture | `get_it` · `dartz` · `equatable` |
| State | `flutter_bloc` |
| Network | `dio` · `internet_connection_checker_plus` |
| Routing | `go_router` |
| Storage | `hive` · `shared_preferences` · `flutter_secure_storage` |
| Config | `flutter_flavor` · `envied` |
| UI / i18n | `flutter_screenutil` · `shimmer` · `easy_localization` · `cached_network_image` |

---

## Further reading

- [Flutter — Guide to app architecture](https://docs.flutter.dev/app-architecture/guide) (MVVM)
- [Flutter — Data layer](https://docs.flutter.dev/app-architecture/case-study/data-layer) (repositories & services)
- [bricks/BRICKS_GUIDE.md](bricks/BRICKS_GUIDE.md) — Mason feature generator

---

<div align="center">

[Report a bug](https://github.com/MokarmDev/flutter-mvvm-template/issues) · [Request a feature](https://github.com/MokarmDev/flutter-mvvm-template/issues)

</div>
