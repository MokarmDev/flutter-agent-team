---
name: networking-rest
description: REST networking with one configured HTTP client (Dio in the reference apps): base URL per flavor, timeouts, interceptor order, single-flight token refresh, redacted logging, pagination and cancellation. Use when adding endpoints or changing network behaviour.
---

# REST networking

## Client setup

- One client instance, registered in DI. Features never create their own.
- Base URL from the flavor or environment configuration, never hard-coded in a feature.
- Timeouts always set (connect, send, receive). Defaults in the reference apps: 15 s / 30 s / 30 s.
- Endpoint paths live in one constants file.

## Interceptor order

1. **Auth:** add the access token from secure storage.
2. **Refresh (single-flight):** on 401, one refresh for all concurrent requests (Dio's `QueuedInterceptor` or a shared `Completer`), retry each original request once, and on refresh failure clear the session and route to login.
3. **Logging (debug builds only):** method, URL, status and timing. Redact `Authorization`, `Cookie`, `Set-Cookie` and any token fields. Never log bodies of auth endpoints.

Changing interceptors, auth or token storage needs approval.

## Endpoints

- A remote data source method per endpoint: builds the request, parses the response into models, throws on failure.
- Parse defensively: the payload shape is confirmed from a real response, and parsing errors become `ServerFailure` in the repository.

## Pagination

- Follow the server contract (page/limit, skip/limit, or cursor). The server's response decides whether more pages exist; a short page is only a fallback signal.
- A failed page never re-adds earlier items; cached data is only used for the first page.

## Cancellation and idempotency

- Pass a `CancelToken` when a screen can leave mid-request and the request is expensive.
- Never auto-retry a non-idempotent POST; use an idempotency key if the API supports one.

## Uploads

Use `FormData` only for multipart endpoints; send progress to the UI for large files; set a longer send timeout.

## Common mistakes

- Logging headers or bodies in release builds.
- Several refresh calls racing after a burst of 401s.
- A base URL hard-coded in a data source.
