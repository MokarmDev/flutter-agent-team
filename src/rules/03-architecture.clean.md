---
description: Clean Architecture layer boundaries for Dart files
globs: ["lib/**/*.dart"]
---

# Architecture: Clean (feature-first)

`presentation -> domain <- data`. Full guide: the `architecture-clean` skill.

| Layer | Must not import |
| --- | --- |
| domain (entities, repository contracts, use cases) | Flutter widgets, Dio, databases, GetIt, state-management packages |
| data (models, data sources, repository impls) | widgets, state-management packages |
| presentation (pages, widgets, state) | data sources, Dio, databases |

- Data sources throw; repository implementations return the project's result type.
- State classes call use cases or repository contracts, never data sources.
- No new storage annotations on domain entities.
