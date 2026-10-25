---
paths:
  - "lib/**/data/**"
  - "lib/core/network/**"
  - "lib/core/errors/**"
---
<!-- Data layer, networking and error mapping -->

# Data layer

- No invented endpoints or fields: confirm against a real response or contract.
- Map every error to a typed failure; 422 field errors reach the form; never return `e.toString()` to the UI.
- Never log tokens, cookies, passwords or personal data; network logging is debug-only and redacted.
- Cached data is only used for the first page; a failed later page never duplicates items.
- Tokens only in secure storage.
