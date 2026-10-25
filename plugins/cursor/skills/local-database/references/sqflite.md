# sqflite

## Setup

- Open the database once (singleton in DI) with a `version` and `onCreate` / `onUpgrade`.
- Every schema change bumps `version` and adds an `onUpgrade` step; steps run in order from the old version.

## Patterns

- Use parameterised queries (`whereArgs`), never string-built SQL.
- Wrap multi-step writes in a transaction.
- Map rows to data models in the local data source; repositories never see `Map<String, Object?>` rows.
- Store timestamps as UTC milliseconds and money as integer minor units.

## Tests

Use `sqflite_common_ffi` with an in-memory database for data-source tests if the project already depends on it; adding it needs approval.
