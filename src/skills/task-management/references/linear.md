# Linear (`tracker: linear`)

`project` is the Linear team key, for example `MOB`.

## Access

Linear's official MCP server: `https://mcp.linear.app/mcp` (OAuth 2.1 or API key). A read-only endpoint exists at `/mcp/readonly`; use it when `write_mode: read-only`. List its tools first; do not guess tool names.

## Rules

- Workflow states are per team. Map canonical statuses to the team's state names from `.agent-team.yaml`; read the team's states before moving an issue.
- Issue identifiers look like `MOB-42`. Linear links a branch or PR that contains the identifier when the GitHub integration is installed.
- Use labels and projects only when they already exist; ask before creating new ones.
