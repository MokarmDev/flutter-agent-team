---
name: architecture-mvvm
description: Feature-first MVVM as in Flutter's official app-architecture guide (View and ViewModel in the UI layer, Repository and services in the data layer, use cases only when needed). Use when the project profile has architecture "mvvm".
---

# MVVM (feature-first)

Reference implementation: `references/mvvm-cubit/` in this repository, and the reference feature named in `docs/agent-context.md`. Background: Flutter's [app architecture guide](https://docs.flutter.dev/app-architecture/guide).

## Layers

```
UI layer:    View (pages, widgets)  ->  ViewModel
Data layer:  Repository (abstract + impl)  ->  DataSource / Service  ->  API, DB, platform
```

| Part | Responsibility | May depend on | Must not depend on |
| --- | --- | --- | --- |
| View | Layout, animation, simple navigation; renders the ViewModel's state | its ViewModel, shared widgets | repositories, data sources, Dio, databases |
| ViewModel | UI state and user actions; exposes immutable state | repositories (abstract), models | widgets' `BuildContext`, data sources, Dio |
| Repository | Single source of truth: combines sources, caches, retries, maps errors | data sources, models | UI, state-management packages |
| DataSource / Service | Thin wrapper over one external thing (HTTP, DB, prefs, platform plugin) | network client, DB | repositories, UI |

**ViewModel by state profile:**
- `state: bloc` -> a `Cubit` and its state classes are the ViewModel (as in the reference app).
- `state: riverpod` -> a `Notifier`/`AsyncNotifier` is the ViewModel.
- Plain Flutter -> a `ChangeNotifier`, as in the official guide.

## Feature layout (reference app)

```
lib/features/<feature>/
  data/
    datasources/   remote and local
    models/        <entity>_entity.dart + <entity>_model.dart
    repositories/  <feature>_repository.dart (abstract), <feature>_repository_impl.dart
  presentation/
    manager/       ViewModel (Cubit + state)
    pages/         View
    widgets/
  <feature>_injection.dart
```

## Data flow

`View -> ViewModel -> Repository -> DataSource -> Result -> new state`

## Use cases: only when earned

Add a domain/use-case class only when logic is reused by several ViewModels or a ViewModel grows complex business rules. Otherwise the ViewModel calls the repository directly. This is the main difference from `architecture-clean`; do not add a domain layer to an MVVM project without approval.

## Rules and why

- **ViewModels never touch I/O directly.** Testing a ViewModel should need only a fake repository.
- **Repositories own caching and fallbacks**; data sources stay thin, so swapping a backend changes one class.
- **Views stay dumb**: no business decisions in `build()`.

## Common mistakes

- ViewModel importing a data source "just this once".
- Business rules inside widgets.
- Introducing use cases everywhere, turning MVVM into Clean without a decision.
