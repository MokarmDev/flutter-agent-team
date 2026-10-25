# Local tracker (`tracker: local`)

For projects with no external tracker. Tickets are Markdown files in the repository, so they are versioned with the code and need no account or token.

## Layout

```
docs/tickets/
  T-001-login-screen.md
  T-002-order-list.md
```

## File format

```markdown
---
id: T-002
title: Order list with pagination and offline cache
type: feature
status: ready          # backlog | ready | in_progress | in_review | done
platforms: [android, ios]
labels: [orders]
branch: ""
pr: ""
---

## Description
...

## Acceptance criteria
- [ ] Given ..., when ..., then ...
```

## Operations

- **Next ID:** the highest existing `T-NNN` plus one, zero-padded to three digits. Never reuse an ID.
- **Create:** write a new file named `<id>-<slug>.md` with status `backlog` or `ready`.
- **Move:** edit only the `status` line (and `branch` or `pr` when they change).
- **List:** read the frontmatter of every file in `docs/tickets/`.
- **Close:** set `status: done`; never delete the file.

Ticket changes are committed together with the related work, using the ticket ID in the commit message.
