import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isGenerated, isSecretFile, shellViolation, hasTicketId, readHookConfig, decide } from '../../src/hooks/guard.mjs';

const GUARD = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../src/hooks/guard.mjs');
const defaults = readHookConfig(null);

test('generated files are detected', () => {
  for (const f of ['lib/a.g.dart', 'lib/b.freezed.dart', 'lib\\generated\\locale_keys.g.dart', 'test/x.mocks.dart']) {
    assert.ok(isGenerated(f), f);
  }
  for (const f of ['lib/a.dart', 'lib/g.dart', 'lib/config/env/env.dart']) assert.ok(!isGenerated(f), f);
});

test('secret files are detected and examples are allowed', () => {
  for (const f of ['.env', 'lib/config/env/.env', '.env.prod', 'android/key.properties', 'upload.jks', 'release.keystore', 'AuthKey_X.p8', 'service-account.json']) {
    assert.ok(isSecretFile(f), f);
  }
  for (const f of ['.env.example', 'env.dart', 'google-services.json', 'pubspec.yaml', 'key.properties.example']) {
    assert.ok(!isSecretFile(f), f);
  }
});

test('destructive shell commands are blocked', () => {
  for (const c of ['rm -rf build', 'rm -fr lib', 'git push --force', 'git push -f origin main', 'git reset --hard HEAD~1', 'git clean -fdx', 'flutter pub get && rm -rf .dart_tool', 'cat lib/config/env/.env', 'Remove-Item -Recurse -Force build']) {
    assert.ok(shellViolation(c), c);
  }
  for (const c of ['flutter test', 'rm build/app.apk', 'git push origin feat/T-1-x', 'git reset --soft HEAD~1', 'cat pubspec.yaml', 'cat .env.example', 'dart format lib']) {
    assert.equal(shellViolation(c), null, c);
  }
});

test('ticket branches', () => {
  for (const b of ['feat/T-012-order-list', 'fix/MOB-88-crash', 'chore/42-upgrade']) assert.ok(hasTicketId(b), b);
  for (const b of ['main', 'feature/orders', 'dev']) assert.ok(!hasTicketId(b), b);
  assert.ok(shellViolation('git commit -m "x"', { requireTicketBranch: true, branch: 'main' }));
  assert.equal(shellViolation('git commit -m "x"', { requireTicketBranch: true, branch: 'feat/T-1-a' }), null);
  assert.equal(shellViolation('git commit -m "x"', { requireTicketBranch: false, branch: 'main' }), null);
});

test('config can disable checks', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'fat-'));
  writeFileSync(path.join(dir, '.agent-team.yaml'), 'version: 1\nhooks:\n  block_generated_edits: false\n  require_ticket_branch: true\ntracker: local\n');
  const cfg = readHookConfig(dir);
  assert.equal(cfg.block_generated_edits, false);
  assert.equal(cfg.require_ticket_branch, true);
  assert.equal(cfg.block_secret_reads, true);
  assert.equal(decide('pre-edit', { file: 'a.g.dart' }, cfg), null);
});

function run(args, input) {
  return spawnSync(process.execPath, [GUARD, ...args], { input: JSON.stringify(input), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: '' } });
}

test('Claude Code protocol: exit 2 with stderr blocks, exit 0 allows', () => {
  const blocked = run(['pre-edit'], { hook_event_name: 'PreToolUse', tool_name: 'Edit', tool_input: { file_path: 'lib/a.g.dart' } });
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /build_runner/);
  const ok = run(['pre-edit'], { hook_event_name: 'PreToolUse', tool_name: 'Edit', tool_input: { file_path: 'lib/a.dart' } });
  assert.equal(ok.status, 0);
  const shell = run(['pre-shell'], { tool_name: 'Bash', tool_input: { command: 'git push --force' } });
  assert.equal(shell.status, 2);
});

test('Cursor protocol: JSON permission on stdout', () => {
  const blocked = run(['pre-read', '--cursor'], { hook_event_name: 'beforeReadFile', file_path: '/w/.env' });
  assert.equal(blocked.status, 0);
  assert.equal(JSON.parse(blocked.stdout).permission, 'deny');
  const ok = run(['pre-shell', '--cursor'], { hook_event_name: 'beforeShellExecution', command: 'flutter test' });
  assert.equal(JSON.parse(ok.stdout).permission, 'allow');
  const post = run(['post-edit', '--cursor'], { hook_event_name: 'afterFileEdit', file_path: 'README.md' });
  assert.equal(post.status, 0);
  assert.equal(post.stdout, '{}');
});

test('garbage input never crashes', () => {
  const r = spawnSync(process.execPath, [GUARD, 'pre-shell'], { input: 'not json', encoding: 'utf8' });
  assert.equal(r.status, 0);
});
