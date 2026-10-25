---
name: ticket-start
description: Start work on a ticket - check it is Ready, create the branch, move it to In Progress, and have the architect write the implementation plan.
argument-hint: "<ticket ID>"
---

# Start ticket $ARGUMENTS

1. Fetch the ticket with the task-management skill. If it is not Ready, list what is missing and stop.
2. Check the working tree is clean (`git status`). If not, stop and ask.
3. Create the branch from `branch_pattern` and move the ticket to `in_progress`.
4. Delegate to the `architect` agent. Save the plan it returns to `docs/plans/$ARGUMENTS.md`.
5. Show the plan summary and its approval-gated decisions. Stop and wait for the user's approval.
6. Next step: `/ticket-build $ARGUMENTS`.
