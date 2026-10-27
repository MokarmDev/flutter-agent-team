# Agent context: Clean Architecture + BLoC reference app

## Reference feature

- Path: `lib/features/home/`
- Why: complete Clean Architecture slice: entity and repository contract in `domain/`, use case, remote and local data sources, repository implementation with first-page cache fallback, Cubit with pagination and cancel-safe async, DI in `home_injection.dart`, tests for use case, repository and Cubit.
- Flow: `HomePage -> ProductCubit -> GetProductUseCase -> HomeRepository -> HomeRepositoryImpl -> data sources`

## Known deviations (do not copy)

| Path | What is wrong with it |
| --- | --- |
| `lib/features/cart/` | Stub: data source returns `Either` and throws `UnimplementedError`; page constructs `CartCubit()` instead of `sl<CartCubit>()` |
| `lib/features/profile/` | Same stub pattern as `cart` |
| `lib/features/theme/` | Local preference only: no `Either` or use-case base class. Acceptable for simple local settings, not for API features |
| `lib/features/home/domain/entities/product/product_entity.dart` | Hive annotations on a domain entity. New features put storage adapters on data models |
| `lib/features/home/presentation/` | A few hard-coded strings (`Loading products...`, `Retry`); new UI uses `LocaleKeys` |

## Commands

| Task | Command |
| --- | --- |
| Set up env | `cp lib/config/env/.env.example lib/config/env/.env` |
| Code generation (Envied, Hive) | `dart run build_runner build --delete-conflicting-outputs` |
| Translation keys | `dart run easy_localization:generate --source-dir ./assets/translations -f keys -o locale_keys.g.dart` |
| Run (dev) | `flutter run --flavor dev -t lib/main_dev.dart` |
| Run (prod) | `flutter run --flavor prod -t lib/main_prod.dart` |
| Analyze | `flutter analyze` |
| Test | `flutter test` |
| New feature scaffold (ask first) | `mason get && mason make feature --feature_name <snake_name> --entity_name <PascalName>` |

## API

- Base URL: `BASE_URL` in `lib/config/env/.env`, read through Envied and the flavor config.
- Demo backend: dummyjson.com (`/products` with `skip` and `limit`).
- Errors: mapped in `lib/core/errors/failures.dart`; 422 bodies in the Laravel shape (`message`, `errors`) become `ValidationFailure.fieldErrors`.

## Project-specific notes

- Stack: Cubit (`flutter_bloc`), GetIt (`sl`), go_router with `StatefulShellRoute`, Dio through `ApiConsumer`, dartz `Either` with `safeCall`, Hive cache, `easy_localization`, flavors.
- Async Cubits mix in `CancelableSafeCubitMixin` and use `runCancelable` + `safeEmit`.
- Cubits are registered with `registerFactory`; repositories and data sources with `registerLazySingleton`.
- Uses the original `hive` package; migrating to `hive_ce` is planned and needs approval.
- `lib/core/` is kept identical across the Flutter Agent Team reference apps (except `di/`).
