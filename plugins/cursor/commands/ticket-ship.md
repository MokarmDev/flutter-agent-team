---
name: ticket-ship
description: "Ship a ticket - confirm tests and review passed, open the pull request linked to the ticket, and move the ticket to In Review."
---
# Ship ticket <the text the user typed after the command>

1. Confirm `docs/test-reports/<the text the user typed after the command>.md` exists with no failures, and the latest review verdict is not "block". Otherwise stop and say what is missing.
2. Show the commits and the PR body (git-workflow skill template). Push the branch and open the PR only after the user approves.
3. Move the ticket to `in_review` and add a short summary (task-management skill).
4. Report the PR link.
