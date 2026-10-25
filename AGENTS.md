# AGENTS.md

Guidance for AI coding agents working **on this repository** (not on a Flutter app that uses the plugin).

## What this repository is

The source of the Flutter Agent Team plugins for Claude Code and Cursor, plus two reference Flutter apps.

## Rules

- Edit `src/`, `references/`, `docs/`, `evals/` and `tool/`. Never edit `plugins/` by hand: it is generated.
- After any change in `src/`, run `npm test` and `node tool/build.mjs`, and commit `src/` and `plugins/` together.
- `references/*/lib/core/` must stay identical across apps (except `di/`); the build fails otherwise.
- Never commit `.env`, `env.g.dart`, keystores or tokens.
- Skills under 500 lines, rules under 40 lines; every factual claim about a package or store rule needs an official source in the skill's `references/`.
- A change to agent behaviour comes with an eval scenario in `evals/README.md`.

## Using the skills in other tools

The skills in `plugins/claude-code/skills/` follow the open Agent Skills format (`SKILL.md` with `name` and `description`). Tools that read Agent Skills can use them directly by copying that folder into the tool's skills directory. The agents and hooks are specific to Claude Code and Cursor.
