# Contributing

Thank you for helping. The most valuable contributions are **field experience** (a store rejection, a production bug, a review rule you always apply) and **fixes to agent behaviour** backed by an eval.

## Layout

| Path | What | Edit? |
| --- | --- | --- |
| `src/agents/` | One file per agent, neutral frontmatter (`access`, `skills`, `write_scope`) | Yes |
| `src/skills/<name>/` | `SKILL.md` plus `references/` and `templates/` | Yes |
| `src/commands/` | User-invoked workflows (`/ticket-start` ...) | Yes |
| `src/rules/` | Short constraints with `globs` or `always: true` | Yes |
| `src/hooks/` | `guard.mjs` and the hook configs for each tool | Yes |
| `src/templates/` | `.agent-team.yaml` and `agent-context.md` templates | Yes |
| `plugins/` | Generated Claude Code and Cursor plugins | **Never by hand** |
| `references/` | Reference Flutter apps the agents copy | Yes; keep `lib/core` identical across apps |
| `evals/` | Scenarios that test the agents | Yes |

## Workflow

```bash
npm test                    # hook tests
node tool/build.mjs         # lint src/ and regenerate plugins/
node tool/build.mjs --check # what CI runs
```

Commit `src/` and the regenerated `plugins/` together.

## Writing rules for agents

- **Agent** = a role (who acts, with which access). **Skill** = how to do something, loaded on demand. **Rule** = a short constraint that always applies to matching files. **Hook** = a constraint that must be enforced, not just asked for.
- Skills stay under 500 lines; put provider details in `references/`.
- Rules stay under 40 lines and describe constraints, not procedures.
- Every claim about a package, a store rule or an API must be verifiable; link the official source in `references/`.
- A behaviour change to an agent comes with an eval scenario in `evals/README.md` that fails before the change and passes after.

## Sharing experience

Open an issue with the **Experience** template: the rule, decision or mistake, why it matters, and which agent it belongs to. It is folded in as a rule line, a skill step, a reference note or an eval scenario.
