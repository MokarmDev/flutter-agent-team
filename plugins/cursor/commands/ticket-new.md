---
name: ticket-new
description: "Turn an idea, bug report or design link into one or more Ready tickets with acceptance criteria, using the product-manager agent."
---
# New ticket

Input: <the text the user typed after the command>

1. Delegate to the `product-manager` agent with the input above.
2. It asks its clarifying questions, slices the work, and writes the tickets with the task-management skill's template.
3. Show the tickets as a preview. Create them only after the user approves (unless `write_mode: auto`).
4. Finish with the ticket IDs and the next step: `/ticket-start <ID>`.
