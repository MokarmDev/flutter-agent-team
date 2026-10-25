---
name: navigation
description: Route conventions for the project's router (go_router in the reference apps): named routes, shell tabs, parameters that survive deep links, guards and redirects. Use when adding screens, tabs, deep links or auth redirects.
---

# Navigation

Generic go_router usage is covered by the official `dart-flutter` plugin; this skill holds the project conventions.

## Conventions (reference apps)

- Route names and paths are constants in one file (`RouteNames`), never string literals in widgets.
- The router is defined once (`app_router.dart`); tabs use `StatefulShellRoute.indexedStack` with the shared bottom navigation.
- Navigation is triggered from the UI (or a `BlocListener`), never from repositories or data sources.

## Adding a screen

1. Add the name and path constant.
2. Add the `GoRoute` (or a new shell branch for a tab, plus the tab metadata).
3. Pass identifiers in the path or query (`/orders/:id`), not objects in `extra`: `extra` is lost when the app is opened from a deep link or restored by the OS.
4. The destination screen loads its own data from the identifier.

## Guards

- Auth redirects live in the router's `redirect`, reading a session state that is listenable (`refreshListenable`).
- Redirects must be loop-free: test logged-out, logged-in and expired-session cases.

## Deep links

- Every deep-linkable route works from a cold start.
- Platform setup (Android App Links, iOS Universal Links) is a platform-config change and needs approval.
