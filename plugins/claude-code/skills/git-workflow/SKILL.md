---
name: git-workflow
description: Name branches from ticket IDs, write Conventional Commits, and open pull requests linked to tickets. Use when creating a branch, committing, or opening a PR.
---

# Git workflow

## Branches

Pattern from `.agent-team.yaml` (`branch_pattern`, default `{type}/{id}-{slug}`):
- `feat/T-012-order-list`, `fix/MOB-88-login-crash`, `chore/42-upgrade-dio`.

## Commits

Conventional Commits with the ticket ID in the scope or footer:

```
feat(orders): add paginated order list

Refs: T-012
```

Types: feat, fix, refactor, test, docs, chore, perf, build, ci.

Keep commits focused: no unrelated changes. Never commit secrets, `.env` files, keystores or generated files the project ignores.

## Pull requests

Body template:

```markdown
## Ticket
<link or ID>  (GitHub: "Closes #42")

## What changed
- ...

## How it was verified
- `flutter analyze` -> ...
- `flutter test ...` -> ...

## Screenshots
<before / after for UI changes, light and dark, LTR and RTL>

## Risks
- ...
```

## Never without explicit approval

`git push --force`, `git reset --hard`, `git clean`, rewriting published history, changing git config, or committing on the user's behalf when they did not ask.
