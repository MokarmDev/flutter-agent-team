---
name: review
description: Review the current branch's changes with the read-only code-reviewer agent and report findings by severity.
argument-hint: "[base branch, default main]"
---

# Review

1. Determine the base branch (argument or `main`) and the ticket from the branch name.
2. Delegate to the `code-reviewer` agent with the diff against the base branch, the ticket, the plan and the test report.
3. Save the review to `docs/reviews/<TICKET-ID>.md` and show the findings and the verdict. Blockers go back to the owning agent; nothing is merged here.
