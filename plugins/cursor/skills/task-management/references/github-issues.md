# GitHub Issues (`tracker: github`)

`project` is `owner/repo`.

## Access, in order of preference

1. **GitHub MCP server** (official). List its tools first and use the issue, label and pull-request tools it exposes. Do not guess tool names.
2. **`gh` CLI** fallback, when it is installed and authenticated (`gh auth status`):
   - Read: `gh issue view <number> --repo <owner/repo> --json number,title,body,labels,state,url`
   - List: `gh issue list --repo <owner/repo> --state open --json number,title,labels,url`
   - Create: `gh issue create --repo <owner/repo> --title "..." --body-file <file> --label "..."`
   - Edit labels: `gh issue edit <number> --repo <owner/repo> --add-label "..." --remove-label "..."`
   - Comment: `gh issue comment <number> --repo <owner/repo> --body-file <file>`
   - PR: `gh pr create --title "..." --body-file <file> --base <base>`
3. Neither available: produce the ticket as Markdown for the user to paste, and say so.

## Status mapping

GitHub issues are only open or closed. Represent canonical statuses with labels named in `.agent-team.yaml` (for example `status: ready`, `status: in progress`). If the repository uses a GitHub Project board, ask the user for the board and its Status field values before writing to it.

## Linking

- The branch name contains the issue number: `feat/42-order-list`.
- The PR body contains `Closes #42` so merging closes the issue.
