---
name: local-database
description: Choose and use local storage (hive_ce, sqflite, preferences, secure storage, and later drift, isar, objectbox), with migrations and the rule of what may be stored where. Use when caching data, persisting user data, or storing tokens.
---

# Local database and storage

The profile's `local_db` list names what the project uses. Open the matching reference before writing code:

- [references/hive-ce.md](references/hive-ce.md)
- [references/sqflite.md](references/sqflite.md)
- [references/preferences-and-secure-storage.md](references/preferences-and-secure-storage.md)

## Choosing (only when the project has not chosen yet; adding one needs approval)

| Need | Use |
| --- | --- |
| Small settings (theme, locale, flags) | shared_preferences |
| Tokens, secrets, personal identifiers | flutter_secure_storage |
| Simple object cache, key-value boxes | hive_ce |
| Relational data, queries, joins, migrations | sqflite (or drift for typed queries) |

The original `hive` package is no longer actively developed; new projects use the community fork `hive_ce`, which keeps the same API with `hive_ce` imports. A project whose profile says `hive` keeps using `package:hive/...` imports until a migration ticket is approved; never mix the two.

## Rules

- Storage access lives in local data sources only; repositories decide when to read or write.
- Tokens and secrets go only to secure storage. Never to preferences, Hive or SQLite in plain form.
- Cache is a copy: every cached record can be rebuilt from the server; user-created data that cannot be rebuilt needs a migration plan and backup thought.
- Schema changes need a migration (versioned), never a silent wipe of user data.
- Keep boxes and tables scoped and bounded; clear caches on logout.

## Tests

Test repositories with a fake local data source. Test migrations with a real in-memory or temporary database when the project supports it.
