# hive_ce

Community-maintained fork of Hive with the same API. Packages: `hive_ce`, `hive_ce_flutter`, and `hive_ce_generator` for adapters.

## Setup

- Initialise once at startup (`Hive.initFlutter()`), register adapters, open the boxes the app needs.
- Type IDs are permanent: never reuse or change a `typeId` or a `HiveField` index after release. Add new fields with new indices.

## Patterns

- One box per cached collection; the local data source owns the box.
- Replace on first page or refresh, append on later pages, and never return a cached list as if it were a later page.
- Put adapters on data models, not on domain entities (Clean profile).

## Migrating from `hive`

Replace imports and dependencies with the `_ce` packages, regenerate adapters, and test that existing boxes still open on an upgraded install. This is a dependency change: ask first.
