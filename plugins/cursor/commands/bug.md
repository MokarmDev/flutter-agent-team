---
name: bug
description: "Investigate a bug with the read-only bug-investigator agent - reproduce, find the root cause with evidence, propose the smallest fix and a regression test, and a rule or eval to prevent it."
---
# Investigate bug

Input: <the text the user typed after the command>

1. Delegate to the `bug-investigator` agent with the input, logs and steps the user provided.
2. Save its diagnosis to `docs/bugs/<ID>.md` (ticket ID, or the next `B-NNN` number) and show the root cause, evidence, fix plan and regression test.
3. Ask the user whether to apply the fix: through `/quick` when small, or a ticket when not.
4. Show the proposed prevention (rule line, skill step or eval) and ask whether to add it.
