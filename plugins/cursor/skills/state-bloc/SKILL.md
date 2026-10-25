---
name: state-bloc
description: State management with flutter_bloc (Cubit by default, Bloc when events need transformation), including state modelling, cancel-safe async, DI lifetimes, widget wiring and tests. Use when the project profile has state "bloc".
---

# BLoC and Cubit

## Cubit or Bloc

| Situation | Use |
| --- | --- |
| Methods in, states out; most screens | `Cubit` (default) |
| Event traceability, debounce/throttle/switchMap of events | `Bloc` with event transformers |

Follow what the reference feature uses; do not introduce `Bloc` events into a Cubit-only project without approval.

## Modelling state

Use the project's existing style. Two good options:

- **Distinct states** (reference apps): an abstract or `sealed` base with `Initial`, `Loading`, `Loaded(data)`, `Error(message)`. Handle them exhaustively with `switch`.
- **One state + status enum** when data must survive a failure (pagination, forms): `status`, `items`, `hasReachedMax`, `failure`, and `copyWith`.

States are immutable and extend `Equatable` with every field in `props`.

## Async safety

- Guard every emit after an `await`: the reference apps provide `CancelableSafeCubitMixin` with `safeEmit` and `runCancelable`. Use them for every async Cubit.
- `runCancelable` drops the result of superseded work; it does not abort the HTTP request. Pass a Dio `CancelToken` through the repository when aborting matters.
- Never start two loads of the same page at once; ignore a load while one is in flight.

## DI and widgets

- Register Cubits with `registerFactory` (new instance per screen); repositories, use cases and data sources with `registerLazySingleton`.
- Provide at the page: `BlocProvider(create: (_) => sl<OrdersCubit>()..load(), child: ...)`. Never `OrdersCubit()` directly.
- `BlocBuilder` for UI (use `buildWhen` to limit rebuilds), `BlocListener` for one-off effects (navigation, snackbars), `BlocSelector` for one field.
- App-wide Cubits (theme, locale, session) live in the app-level providers.

## Tests

- Unit-test every Cubit: initial state, success path, each failure, pagination end, refresh.
- Use hand-written fakes of the repository (or `mocktail` if the project already depends on it).
- `bloc_test` makes emission tests concise; adding it is a dependency change, so ask first.

```dart
test('emits Loading then Loaded', () async {
  final cubit = OrdersCubit(FakeOrdersRepository(result: Right([order])));
  final states = <OrdersState>[];
  final sub = cubit.stream.listen(states.add);
  await cubit.load();
  await sub.cancel();
  expect(states, [isA<OrdersLoading>(), isA<OrdersLoaded>()]);
});
```

## Common mistakes

- Emitting after `close()`.
- Navigation inside `BlocBuilder` instead of `BlocListener`.
- Keeping mutable lists in state and mutating them in place.
