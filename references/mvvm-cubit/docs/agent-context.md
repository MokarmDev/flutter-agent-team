# Agent context: MVVM + Cubit reference app

## Reference feature

- Path: `lib/features/home/`
- Why: complete MVVM slice: remote and local data sources, repository with first-page cache fallback, Cubit (ViewModel) with pagination and cancel-safe async, page and widgets, DI in `home_injection.dart`, tests under `test/features/home/`.
- Flow: `HomePage -> ProductCubit -> HomeRepository -> HomeRemoteDataSource / HomeLocalDataSource`

## Known deviations (do not copy)

| Path | What is wrong with it |
| --- | --- |
| `lib/features/cart/` | Stub: data source returns `Either` and throws `UnimplementedError`; page constructs `CartCubit()` instead of `sl<CartCubit>()` |
| `lib/features/profile/` | Same stub pattern as `cart` |
| `lib/features/theme/` | Local preference only: no `Either`, plain try/catch. Acceptable for simple local settings, not for API features |
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
