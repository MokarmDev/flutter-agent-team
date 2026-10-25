---
name: error-handling
description: Map every failure (network, HTTP status, parsing, storage, platform) to a typed, user-safe Failure and a visible UI state, including server validation errors shown on form fields. Use when writing repositories, interceptors, or error UI.
---

# Error handling

## Flow

`DataSource throws -> Repository catches and maps -> Result (Either<Failure, T>) -> state -> UI`

Exceptions never cross the repository boundary; UI never sees an exception or a stack trace.

## Failure types (reference apps)

| Failure | When |
| --- | --- |
| `NetworkFailure` | no connection, DNS, connection timeout |
| `ServerFailure` | 5xx, unexpected response, unknown errors |
| `UnauthorizedFailure` / `TokenExpiredFailure` | 401 after refresh failed |
| `ForbiddenFailure` | 403 |
| `NotFoundFailure` | 404 |
| `ValidationFailure(message, fieldErrors)` | 422 (and 400 with field errors) |
| `CacheFailure` | local storage read or write failed |
| `CancelledFailure` | request cancelled; usually not shown to the user |

Extend the hierarchy only for a new category, and only with approval.

## HTTP mapping

| Status | Failure | Retry |
| --- | --- | --- |
| timeout / no connection | NetworkFailure | user retry; auto-retry only idempotent GETs |
| 401 | refresh once, then UnauthorizedFailure | after refresh |
| 403 | ForbiddenFailure | no |
| 404 | NotFoundFailure | no |
| 409 | ServerFailure with server message | no |
| 422 | ValidationFailure with field errors | no; user fixes input |
| 429 | ServerFailure, respect `Retry-After` | after delay |
| 5xx | ServerFailure | idempotent only, with backoff |

## Validation errors (Laravel and similar)

Typical body:

```json
{ "message": "The given data was invalid.", "errors": { "email": ["The email has already been taken."] } }
```

Parse `errors` into `Map<String, List<String>>` and keep it on `ValidationFailure.fieldErrors`. The form shows each message under its field and keeps the user's input.

## User-safe messages

- Never show `e.toString()`, stack traces, URLs with tokens, or raw server dumps.
- Log the technical error (without secrets) and show a translated, human message.
- Use the server's `message` only when the API contract says it is user-facing.

## Common mistakes

- Catch-all `catch (e)` that returns `e.toString()` to the UI.
- Force-unwrapping `response!.statusCode!` in error mapping.
- Treating a cancelled request as an error state.
