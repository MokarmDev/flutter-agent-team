---
name: architecture-clean
description: Feature-first Clean Architecture (data, domain, presentation per feature, with use cases and repository contracts). Use when the project profile has architecture "clean", for planning, implementing or reviewing code in such a project.
---

# Clean Architecture (feature-first)

Reference implementation: `references/clean-bloc/` in this repository, and the reference feature named in the project's `docs/agent-context.md`.

## Layers and dependency direction

```
presentation  ->  domain  <-  data
```

| Layer | Contains | May import | Must not import |
| --- | --- | --- | --- |
| domain | entities, repository contracts (abstract), use cases | Dart, equatable, the result type (dartz `Either` or a sealed `Result`), Failure | Flutter widgets, Dio, databases, GetIt, flutter_bloc |
| data | models (JSON, DB), remote and local data sources, repository implementations | domain, network client, database, storage | widgets, state-management packages |
| presentation | pages, widgets, state classes (Cubit/BLoC per the state profile) | domain (use cases, entities), state-management package, Flutter | data sources, Dio, databases directly |

Shared code lives in `lib/core/` (network, errors, DI, storage, utils) and `lib/shared/` (widgets, navigation, mixins).

## Feature layout

```
lib/features/<feature>/
  data/
    datasources/   <feature>_remote_data_source.dart, <feature>_local_data_source.dart
    models/        <entity>_model.dart   (fromJson / toJson, maps to the entity)
    repositories/  <feature>_repository_impl.dart
  domain/
    entities/      <entity>_entity.dart  (pure Dart, Equatable)
    repositories/  <feature>_repository.dart (abstract)
    usecases/      get_<entity>_usecase.dart
  presentation/
    manager/       <entity>_cubit.dart, <entity>_state.dart
    pages/         <feature>_page.dart
    widgets/
  <feature>_injection.dart
```

## Data flow

`View -> Cubit -> UseCase -> Repository (contract) -> RepositoryImpl -> DataSource -> API/DB`

- Data sources return raw models and **throw** on failure.
- Repository implementations wrap calls (for example with the project's `safeCall`) and return `Either<Failure, T>`; they own caching and fallbacks.
- Use cases are thin: one public `call`. Add one only when it is the project's convention or the logic is reused.

## Adding a feature

1. Scaffold with the Mason brick (approval first) or copy the reference feature's shape.
2. Domain first: entity, repository contract, use case.
3. Data: model, data sources, repository implementation.
4. Presentation: state, Cubit, page, widgets.
5. Wire: endpoint constant, `init<Feature>()` registered in the DI container, route, translations.

## Rules and why

- **Domain stays pure Dart.** It is what you test fastest and change least; framework imports there spread every framework change everywhere.
- **No storage annotations on new domain entities.** Put Hive or DB adapters on data models instead; an existing exception in the reference app is not a pattern to copy.
- **One error convention.** Do not add a second result type next to the project's existing one.

## Common mistakes

- Returning `Either` from a data source (that belongs to the repository).
- A Cubit calling a data source or Dio directly.
- Copying a stub feature that the project's `docs/agent-context.md` lists as a known deviation.
