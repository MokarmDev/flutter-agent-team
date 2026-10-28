#!/usr/bin/env node
// Builds the Claude Code and Cursor plugins from src/ and lints the sources.
// Usage:
//   node tool/build.mjs          build plugins/ and lint
//   node tool/build.mjs --check  lint and fail if plugins/ is out of date (CI)
// Zero dependencies (Node 18+).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { lintReferenceApps } from './reference-apps.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'plugins');
const CHECK = process.argv.includes('--check');

const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));
const META = {
  name: 'flutter-agent-team',
  displayName: 'Flutter Agent Team',
  version: pkg.version,
  description: 'A team of Flutter AI agents (product, architecture, UI, data, QA, review, debugging) with skills, rules and guard hooks that adapt to your project\'s architecture and state management.',
  author: { name: 'MokarmDev', url: 'https://github.com/MokarmDev' },
  homepage: 'https://github.com/MokarmDev/flutter-agent-team',
  repository: 'https://github.com/MokarmDev/flutter-agent-team',
  license: 'MIT',
  keywords: ['flutter', 'dart', 'mobile', 'agents', 'clean-architecture', 'mvvm', 'bloc'],
};

const errors = [];
const warn = [];
const err = (m) => errors.push(m);

// ---------- helpers ----------

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out.sort();
}

function parseValue(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return v.replace(/^["']|["']$/g, '');
}

// Frontmatter parser for the simple `key: value` / `key: [a, b]` subset used in src/.
export function parseFrontmatter(text, file) {
  const t = text.replace(/\r\n/g, '\n');
  if (!t.startsWith('---\n')) { err(`${file}: missing frontmatter`); return { data: {}, body: t }; }
  const end = t.indexOf('\n---\n', 4);
  if (end === -1) { err(`${file}: unterminated frontmatter`); return { data: {}, body: t }; }
  const data = {};
  for (const line of t.slice(4, end).split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][\w-]*):\s?(.*)$/);
    if (!m) { err(`${file}: cannot parse frontmatter line "${line}"`); continue; }
    data[m[1]] = parseValue(m[2]);
  }
  return { data, body: t.slice(end + 5).replace(/^\n+/, '') };
}

function yamlScalar(v) {
  if (typeof v === 'boolean') return String(v);
  const s = String(v);
  return /[:#\[\]{}&*!|>'"%@`,]|^\s|\s$/.test(s) ? JSON.stringify(s) : s;
}

function frontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${yamlScalar(item)}`);
    } else lines.push(`${k}: ${yamlScalar(v)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

const files = new Map(); // relative output path -> content
const put = (rel, content) => files.set(rel.split(path.sep).join('/'), content);

// ---------- load sources ----------

const shared = (await fs.readFile(path.join(SRC, 'shared/non-negotiables.md'), 'utf8')).trim()
  + '\n\n' + (await fs.readFile(path.join(SRC, 'shared/senior-baseline.md'), 'utf8')).trim() + '\n';

const skillDirs = (await fs.readdir(path.join(SRC, 'skills'), { withFileTypes: true }))
  .filter((d) => d.isDirectory()).map((d) => d.name).sort();
const commandFiles = (await fs.readdir(path.join(SRC, 'commands'))).filter((f) => f.endsWith('.md')).sort();
const commandNames = commandFiles.map((f) => f.replace(/\.md$/, ''));
const agentFiles = (await fs.readdir(path.join(SRC, 'agents'))).filter((f) => f.endsWith('.md')).sort();
const ruleFiles = (await fs.readdir(path.join(SRC, 'rules'))).filter((f) => f.endsWith('.md')).sort();

const KEBAB = /^[a-z][a-z0-9-]*$/;

// ---------- skills ----------

async function checkLinks(file, body) {
  for (const m of body.matchAll(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g)) {
    const target = path.resolve(path.dirname(file), m[1]);
    if (!target.startsWith(SRC)) continue;
    if (!await exists(target)) err(`${path.relative(ROOT, file)}: broken link ${m[1]}`);
  }
}

for (const name of skillDirs) {
  const dir = path.join(SRC, 'skills', name);
  const skillFile = path.join(dir, 'SKILL.md');
  if (!await exists(skillFile)) { err(`skills/${name}: missing SKILL.md`); continue; }
  const text = await fs.readFile(skillFile, 'utf8');
  const { data, body } = parseFrontmatter(text, `skills/${name}/SKILL.md`);
  if (data.name !== name) err(`skills/${name}: frontmatter name must be "${name}"`);
  if (!KEBAB.test(name)) err(`skills/${name}: name must be kebab-case`);
  if (!data.description || data.description.length < 40) err(`skills/${name}: description missing or too short`);
  if (data.description && data.description.length > 1024) err(`skills/${name}: description over 1024 characters`);
  const lines = text.split('\n').length;
  if (lines > 500) err(`skills/${name}: SKILL.md has ${lines} lines (max 500)`);
  await checkLinks(skillFile, body);
  for (const f of await walk(dir)) {
    const rel = path.relative(path.join(SRC, 'skills'), f);
    const content = await fs.readFile(f, 'utf8');
    if (f.endsWith('.md') && f !== skillFile) await checkLinks(f, content);
    put(`claude-code/skills/${rel}`, content);
    put(`cursor/skills/${rel}`, content);
  }
}

// ---------- rules (compiled into the init skill for both tools) ----------

const ruleSources = [];
for (const f of ruleFiles) {
  const text = await fs.readFile(path.join(SRC, 'rules', f), 'utf8');
  const { data, body } = parseFrontmatter(text, `rules/${f}`);
  const bodyLines = body.trim().split('\n').length;
  if (bodyLines > 40) err(`rules/${f}: ${bodyLines} lines (max 40)`);
  if (!data.description) err(`rules/${f}: missing description`);
  if (!data.always && !(Array.isArray(data.globs) && data.globs.length)) err(`rules/${f}: needs "always: true" or globs`);
  ruleSources.push({ base: f.replace(/\.md$/, ''), data, body });
}

function ruleForClaude(r) {
  const fm = r.data.always ? '' : frontmatter({ paths: r.data.globs });
  return fm + `<!-- ${r.data.description} -->\n\n` + r.body;
}
function ruleForCursor(r) {
  return frontmatter({
    description: r.data.description,
    globs: r.data.always ? undefined : r.data.globs.join(','),
    alwaysApply: Boolean(r.data.always),
  }) + r.body;
}

// ---------- commands (user-invoked skills in Claude Code, commands in Cursor) ----------

const templates = {};
for (const f of await fs.readdir(path.join(SRC, 'templates'))) {
  templates[f] = await fs.readFile(path.join(SRC, 'templates', f), 'utf8');
}

for (const f of commandFiles) {
  const name = f.replace(/\.md$/, '');
  if (skillDirs.includes(name)) err(`commands/${f}: name clashes with a skill`);
  const text = await fs.readFile(path.join(SRC, 'commands', f), 'utf8');
  const { data, body } = parseFrontmatter(text, `commands/${f}`);
  if (data.name !== name) err(`commands/${f}: frontmatter name must be "${name}"`);
  if (!data.description) err(`commands/${f}: missing description`);

  const skillFm = frontmatter({
    name,
    description: data.description,
    'argument-hint': data['argument-hint'] || undefined,
    'disable-model-invocation': true,
  });
  const only = (tool) => body.split('\n').filter((l) => !l.startsWith(tool === 'claude-code' ? '- **Cursor:**' : '- **Claude Code:**')).join('\n');
  put(`claude-code/skills/${name}/SKILL.md`, skillFm + only('claude-code'));
  put(`cursor/skills/${name}/SKILL.md`, skillFm + only('cursor'));

  const cursorBody = name === 'agent-team-init'
    ? `# Initialise Flutter Agent Team\n\nFollow the \`agent-team-init\` skill from the flutter-agent-team plugin step by step. Its folder holds the templates and the rules (use \`rules/cursor/\`). Use the text the user typed after the command as the tracker choice, if any.\n`
    : body.replace(/\$ARGUMENTS/g, '<the text the user typed after the command>');
  put(`cursor/commands/${name}.md`, frontmatter({ name, description: data.description }) + cursorBody);

  if (name === 'agent-team-init') {
    for (const [t, c] of Object.entries(templates)) {
      put(`claude-code/skills/${name}/templates/${t}`, c);
      put(`cursor/skills/${name}/templates/${t}`, c);
    }
    for (const r of ruleSources) {
      for (const tool of ['claude-code', 'cursor']) {
        put(`${tool}/skills/${name}/rules/claude/${r.base}.md`, ruleForClaude(r));
        put(`${tool}/skills/${name}/rules/cursor/${r.base}.mdc`, ruleForCursor(r));
      }
    }
  }
}

// ---------- agents ----------

const READ_ONLY_TOOLS = ['Read', 'Grep', 'Glob', 'Bash'];
for (const f of agentFiles) {
  const name = f.replace(/\.md$/, '');
  const text = await fs.readFile(path.join(SRC, 'agents', f), 'utf8');
  const { data, body } = parseFrontmatter(text, `agents/${f}`);
  if (data.name !== name) err(`agents/${f}: frontmatter name must be "${name}"`);
  if (!['read-only', 'write'].includes(data.access)) err(`agents/${f}: access must be read-only or write`);
  const skills = Array.isArray(data.skills) ? data.skills : [];
  for (const s of skills) if (!skillDirs.includes(s)) err(`agents/${f}: unknown skill "${s}"`);

  const scope = data.access === 'write' && Array.isArray(data.write_scope)
    ? `\n# Write scope\n\nCreate or edit files only under: ${data.write_scope.map((g) => `\`${g}\``).join(', ')}. Anything else goes back to the user or the owning agent.\n`
    : '';
  const skillNote = skills.length
    ? `\n# Skills\n\nAlways use: ${skills.map((s) => `\`${s}\``).join(', ')}. Also load the profile's \`architecture-*\` and \`state-*\` skills (see the project context protocol below).\n`
    : '';
  const fullBody = body.trimEnd() + '\n' + scope + skillNote + '\n' + shared;

  put(`claude-code/agents/${name}.md`, frontmatter({
    name,
    description: data.description,
    tools: data.access === 'read-only' ? READ_ONLY_TOOLS.join(', ') : undefined,
    model: data.model || 'inherit',
    color: data.color,
    skills: skills.length ? skills : undefined,
  }) + fullBody);

  put(`cursor/agents/${name}.md`, frontmatter({
    name,
    description: data.description,
    model: data.model || 'inherit',
    readonly: data.access === 'read-only',
  }) + fullBody);
}

// ---------- hooks, manifests ----------

const guard = await fs.readFile(path.join(SRC, 'hooks/guard.mjs'), 'utf8');
put('claude-code/hooks/guard.mjs', guard);
put('cursor/hooks/guard.mjs', guard);
put('claude-code/hooks/hooks.json', await fs.readFile(path.join(SRC, 'hooks/hooks.claude.json'), 'utf8'));
put('cursor/hooks/hooks.json', await fs.readFile(path.join(SRC, 'hooks/hooks.cursor.json'), 'utf8'));
for (const j of ['hooks/hooks.claude.json', 'hooks/hooks.cursor.json']) {
  try { JSON.parse(await fs.readFile(path.join(SRC, j), 'utf8')); } catch (e) { err(`${j}: invalid JSON (${e.message})`); }
}

put('claude-code/.claude-plugin/plugin.json', JSON.stringify({ ...META, icon: './assets/icon.png' }, null, 2) + '\n');
put('cursor/.cursor-plugin/plugin.json', JSON.stringify({ ...META, logo: 'assets/icon.png' }, null, 2) + '\n');
const icon = await fs.readFile(path.join(ROOT, 'assets/icon.png'));
put('claude-code/assets/icon.png', icon);
put('cursor/assets/icon.png', icon);
const readmeBody = `${META.description}\n\nIt ships 7 agents (product-manager, architect, flutter-developer, data-integrator, qa-engineer, code-reviewer, bug-investigator), workflow commands such as /agent-team-init, /ticket-new, /ticket-start, /ticket-build, /review and /ticket-ship, skills for Clean Architecture, MVVM, BLoC, networking, local storage, localization and testing, and guard hooks that block edits to generated files, reads of secret files and destructive shell commands.\n\nRun /agent-team-init in your Flutter project after installing. Full documentation: ${META.homepage}\n\nThis folder is generated by \`node tool/build.mjs\` from \`src/\`; do not edit it by hand.\n`;
put('claude-code/README.md', `# ${META.displayName}\n\n## Install\n\n\`\`\`\n/plugin install flutter-agent-team --marketplace MokarmDev/flutter-agent-team\n\`\`\`\n\n${readmeBody}`);
put('cursor/README.md', `# ${META.displayName}\n\n## Install\n\nIn Cursor: Settings, Plugins, Import from Repo, then enter \`https://github.com/MokarmDev/flutter-agent-team\`.\n\n${readmeBody}`);

// ---------- stray-text and secrets lint over src ----------

for (const f of await walk(SRC)) {
  const c = await fs.readFile(f, 'utf8');
  if (/<\/?(content|invoke|parameter)>/.test(c)) err(`${path.relative(ROOT, f)}: contains stray tool markup`);
  if (/(api[_-]?key|secret|password)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i.test(c)) err(`${path.relative(ROOT, f)}: looks like a hard-coded secret`);
}

// ---------- reference apps share one core ----------
// lib/core must be identical across reference apps (except DI wiring), so a fix lands everywhere.
// Expected apps are always required (missing references/ used to skip this check silently).

for (const m of await lintReferenceApps(ROOT)) err(m);

// ---------- write or check ----------

async function currentOutput() {
  const map = new Map();
  if (!await exists(OUT)) return map;
  for (const f of await walk(OUT)) map.set(path.relative(OUT, f).split(path.sep).join('/'), await fs.readFile(f));
  return map;
}

if (errors.length) {
  console.error(`Lint failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

if (CHECK) {
  const cur = await currentOutput();
  const stale = [];
  for (const [rel, c] of files) {
    const prev = cur.get(rel);
    if (!prev || !prev.equals(Buffer.isBuffer(c) ? c : Buffer.from(c))) stale.push(rel);
  }
  for (const rel of cur.keys()) if (!files.has(rel)) stale.push(rel);
  if (stale.length) {
    console.error(`plugins/ is out of date (${stale.length} file(s)). Run: node tool/build.mjs`);
    for (const s of stale.slice(0, 20)) console.error(`  - ${s}`);
    process.exit(1);
  }
  console.log(`OK: ${files.size} generated files are up to date; ${skillDirs.length} skills, ${commandNames.length} commands, ${agentFiles.length} agents, ${ruleFiles.length} rules.`);
} else {
  await fs.rm(OUT, { recursive: true, force: true });
  for (const [rel, c] of files) {
    const p = path.join(OUT, rel);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, c);
  }
  console.log(`Built ${files.size} files into plugins/: ${skillDirs.length} skills, ${commandNames.length} commands, ${agentFiles.length} agents, ${ruleFiles.length} rules.`);
}
for (const w of warn) console.warn(`warning: ${w}`);
