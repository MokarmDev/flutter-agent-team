# Trello (`tracker: trello`)

`project` is the board ID or URL.

## Access

Atlassian's official Trello MCP server: `https://mcp.trello.com/v1`, OAuth 2.0 only (no API token). List its tools first; do not guess tool names.

## Status mapping

Canonical statuses map to list names on the board (for example `To Do`, `Doing`, `Review`, `Done`). Moving a ticket means moving the card to the mapped list.

## Known gaps (check again on each release of the server)

- **No comments yet:** write the shipping summary into the card description under a `## Updates` heading, or as a checklist item.
- **No labels yet:** keep `type` and `platforms` in the description.
- **Archive only, no delete.** Never archive a card without approval.

Card IDs are long; use the card's short link in branch names: `feat/AbC123xy-order-list`.
