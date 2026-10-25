# Jira (`tracker: jira`)

`project` is the Jira project key, for example `MOB`.

## Access

Atlassian's official remote MCP server (`https://mcp.atlassian.com/v1/mcp`, OAuth 2.1 or API token). It also covers Confluence. List its tools first; do not guess tool names.

## Rules

- **Transitions differ per project.** Never set a status directly. Read the available transitions for the issue and pick the one whose target status matches the mapped name in `.agent-team.yaml`.
- Required fields differ per project and issue type. Read the create metadata (or ask) before creating; never invent a custom field.
- Acceptance criteria go in the description unless the project has a dedicated field the user names.
- Issue keys look like `MOB-42`; the branch contains the key: `feat/MOB-42-order-list`. Jira links branches and PRs that contain the key when the GitHub integration is installed.
