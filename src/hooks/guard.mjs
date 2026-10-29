#!/usr/bin/env node
// Flutter Agent Team guard hooks for Claude Code and Cursor.
// Usage: node guard.mjs <check> [--cursor]
//   checks: pre-edit | pre-read | pre-shell | post-edit
// Zero dependencies; works on macOS, Linux and Windows (Node 18+).

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

export const GENERATED_PATTERNS = [
  /\.g\.dart$/, /\.freezed\.dart$/, /\.gr\.dart$/, /\.mocks\.dart$/,
  /\.config\.dart$/, /(^|[\\/])generated_plugin_registrant\.dart$/,
];

export function generatorFor(file) {
  const base = path.basename(file);
  if (base === 'locale_keys.g.dart') {
    return 'the localization generator (for example: dart run easy_localization:generate -f keys -o locale_keys.g.dart)';
  }
  if (base === 'generated_plugin_registrant.dart') return 'flutter pub get';
  return 'dart run build_runner build --delete-conflicting-outputs';
}

export function isGenerated(file) {
  const f = String(file || '').replace(/\\/g, '/');
  return GENERATED_PATTERNS.some((re) => re.test(f));
}

const SECRET_EXAMPLE = /\.(example|sample|template|dist)$/i;
export function isSecretFile(file) {
  const base = path.basename(String(file || '').replace(/\\/g, '/')).toLowerCase();
  if (!base) return false;
  if (SECRET_EXAMPLE.test(base)) return false;
  if (base === '.env' || base.startsWith('.env.')) return true;
  if (base === 'key.properties') return true;
  if (/\.(jks|keystore|p12|p8|pem|mobileprovision)$/.test(base)) return true;
  if (/^service[-_]?account.*\.json$/.test(base)) return true;
  return false;
}

// Returns a reason string when the shell command must be blocked, otherwise null.
export function shellViolation(command, { requireTicketBranch = false, branch = null } = {}) {
  const cmd = String(command || '');
  const parts = cmd.split(/&&|\|\||;|\|/).map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const tokens = p.split(/\s+/);
    const bin = path.basename(tokens[0] || '').toLowerCase();
    const flags = tokens.filter((t) => t.startsWith('-')).join(' ');
    if (bin === 'rm' && /-[a-z]*r/i.test(flags) && /-[a-z]*f/i.test(flags)) {
      return 'Recursive forced delete (rm -rf) is blocked. Delete specific files, or ask the user to do it.';
    }
    if (/^remove-item$/i.test(bin) && /-recurse/i.test(p) && /-force/i.test(p)) {
      return 'Remove-Item -Recurse -Force is blocked. Ask the user to delete files.';
    }
    if (bin === 'git') {
      const sub = tokens[1];
      if (sub === 'push' && /(^|\s)(--force|-f|--force-with-lease)(\s|=|$)/.test(p)) {
        return 'Force push is blocked. Ask the user to do it if it is really needed.';
      }
      if (sub === 'reset' && /--hard/.test(p)) return 'git reset --hard is blocked: it discards work.';
      if (sub === 'clean' && /-[a-z]*f/i.test(flags)) return 'git clean -f is blocked: it deletes untracked files.';
      if (sub === 'commit' && requireTicketBranch && branch && !hasTicketId(branch)) {
        return `Branch "${branch}" has no ticket ID. Create a ticket branch first (for example feat/T-012-short-name), or use /quick on a ticket branch.`;
      }
    }
    if (['cat', 'type', 'less', 'more', 'head', 'tail', 'get-content', 'gc', 'bat', 'strings'].includes(bin)) {
      const target = tokens.slice(1).find((t) => !t.startsWith('-') && isSecretFile(t));
      if (target) return `Reading secret file "${target}" is blocked. Ask the user for the specific non-secret value you need.`;
    }
  }
  return null;
}

export function hasTicketId(branch) {
  if (['main', 'master', 'develop', 'dev', 'HEAD'].includes(branch)) return false;
  return /(^|[\/_-])([A-Z][A-Z0-9]+-\d+|T-\d+|\d+)([\/_-]|$)/.test(branch);
}

// Minimal reader for the `hooks:` block of .agent-team.yaml (flat booleans only).
export function readHookConfig(root) {
  const defaults = {
    block_generated_edits: true,
    block_secret_reads: true,
    block_destructive_shell: true,
    format_dart_on_edit: true,
    analyze_dart_on_edit: true,
    require_ticket_branch: false,
  };
  const file = root ? path.join(root, '.agent-team.yaml') : null;
  if (!file || !existsSync(file)) return defaults;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  let inHooks = false;
  for (const line of lines) {
    if (/^hooks:\s*$/.test(line)) { inHooks = true; continue; }
    if (inHooks && /^\S/.test(line)) inHooks = false;
    if (!inHooks) continue;
    const m = line.match(/^\s+([a-z_]+):\s*(true|false)\b/);
    if (m && m[1] in defaults) defaults[m[1]] = m[2] === 'true';
  }
  return defaults;
}

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

function currentBranch(cwd) {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { return null; }
}

function extract(input, cursor) {
  const ti = input.tool_input || {};
  const file = input.file_path || ti.file_path || ti.notebook_path || ti.path || '';
  const command = input.command || ti.command || '';
  const root = process.env.CLAUDE_PROJECT_DIR
    || (Array.isArray(input.workspace_roots) && input.workspace_roots[0])
    || input.cwd || process.cwd();
  return { file, command, root, cwd: input.cwd || root, cursor };
}

function respond(reason, cursor) {
  if (cursor) {
    const out = reason
      ? { permission: 'deny', user_message: reason, agent_message: reason }
      : { permission: 'allow' };
    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  }
  if (reason) {
    process.stderr.write(`[flutter-agent-team] ${reason}\n`);
    process.exit(2);
  }
  process.exit(0);
}

export function decide(check, ctx, config, branch = null) {
  switch (check) {
    case 'pre-edit':
      if (config.block_generated_edits && isGenerated(ctx.file)) {
        return `"${ctx.file}" is generated. Edit its source and regenerate with: ${generatorFor(ctx.file)}.`;
      }
      if (config.block_secret_reads && isSecretFile(ctx.file)) {
        return `"${ctx.file}" holds secrets. Do not write it; ask the user, and keep an .example file instead.`;
      }
      return null;
    case 'pre-read':
      if (config.block_secret_reads && isSecretFile(ctx.file)) {
        return `Reading "${ctx.file}" is blocked because it holds secrets. Ask the user for the specific non-secret value you need.`;
      }
      return null;
    case 'pre-shell':
      if (!config.block_destructive_shell && !config.block_secret_reads && !config.require_ticket_branch) return null;
      return shellViolation(ctx.command, { requireTicketBranch: config.require_ticket_branch, branch });
    default:
      return null;
  }
}

// Splits `dart analyze --format=machine` output into issues.
// Line shape: SEVERITY|TYPE|CODE|FILE|LINE|COLUMN|LENGTH|MESSAGE, with `|` and `\` escaped by a backslash.
export function parseAnalyzerMachine(text) {
  const issues = [];
  for (const line of String(text || '').split(/\r?\n/)) {
    const fields = [];
    let cur = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '\\' && i + 1 < line.length) { cur += line[++i]; continue; }
      if (c === '|') { fields.push(cur); cur = ''; continue; }
      cur += c;
    }
    fields.push(cur);
    if (fields.length < 8 || !/^(ERROR|WARNING|INFO)$/.test(fields[0])) continue;
    issues.push({
      severity: fields[0], code: fields[2], file: fields[3],
      line: Number(fields[4]), column: Number(fields[5]), message: fields.slice(7).join('|'),
    });
  }
  return issues;
}

// Feedback for the agent when the edited file has analyzer errors; null when it has none.
// Warnings and infos are left to the agent's own `flutter analyze` run, so mid-change noise stays low.
export function analysisFeedback(issues, file, max = 10) {
  const errors = issues.filter((i) => i.severity === 'ERROR');
  if (!errors.length) return null;
  const shown = errors.slice(0, max).map((e) => `  ${e.line}:${e.column} ${e.code.toLowerCase()}: ${e.message}`);
  const more = errors.length > max ? `\n  ...and ${errors.length - max} more` : '';
  return `dart analyze found ${errors.length} error(s) in "${file}":\n${shown.join('\n')}${more}\n`
    + 'Fix them before reporting the change as done. If they come from a step of this change you have not made yet, continue and re-check.';
}

function runDart(args, ctx, timeout) {
  // shell is needed on Windows, where `dart` is often a .bat wrapper; quote the path for it.
  const win = process.platform === 'win32';
  const file = win ? `"${ctx.file}"` : ctx.file;
  return execFileSync('dart', [...args, file], { cwd: ctx.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout, shell: win });
}

function isEditableDart(file) {
  return file.endsWith('.dart') && !isGenerated(file);
}

function formatDart(ctx) {
  if (!isEditableDart(ctx.file)) return;
  try { runDart(['format'], ctx, 30000); } catch { /* dart not on PATH or format failed: never block on formatting */ }
}

function analyzeDart(ctx) {
  if (!isEditableDart(ctx.file)) return null;
  let out;
  try {
    out = runDart(['analyze', '--format=machine'], ctx, 45000);
  } catch (e) {
    // Exit codes 1-3 mean issues were found; anything else (dart missing, timeout) is skipped silently.
    if (typeof e.stdout !== 'string' || !e.stdout) return null;
    out = e.stdout;
  }
  return analysisFeedback(parseAnalyzerMachine(out), ctx.file);
}

async function main() {
  const check = process.argv[2];
  const cursor = process.argv.includes('--cursor');
  let input = {};
  try { input = JSON.parse(readStdin() || '{}'); } catch { input = {}; }
  const ctx = extract(input, cursor);
  const config = readHookConfig(ctx.root);

  if (check === 'post-edit') {
    if (config.format_dart_on_edit) formatDart(ctx);
    if (cursor) {
      // Cursor's afterFileEdit output is not shown to the agent, so analysis runs only for Claude Code.
      process.stdout.write('{}');
      process.exit(0);
    }
    // Claude Code shows PostToolUse stderr to the agent when the hook exits 2; the edit itself already happened.
    const feedback = config.analyze_dart_on_edit ? analyzeDart(ctx) : null;
    if (feedback) {
      process.stderr.write(`[flutter-agent-team] ${feedback}\n`);
      process.exit(2);
    }
    process.exit(0);
  }
  const branch = check === 'pre-shell' && /\bgit\s+commit\b/.test(ctx.command) ? currentBranch(ctx.cwd) : null;
  respond(decide(check, ctx, config, branch), cursor);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
