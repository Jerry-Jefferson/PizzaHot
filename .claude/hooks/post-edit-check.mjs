#!/usr/bin/env node
// .claude/hooks/post-edit-check.mjs
//
// PostToolUse hook for Write/Edit/MultiEdit. Runs lint + tests only for the app
// the edited file belongs to (backend/ or frontend/); other paths are skipped.
// On failure it exits 2 and writes the output tail to stderr so Claude sees it.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const OUTPUT_TAIL_LINES = 40;

const CHECKS = {
  backend: [
    { name: "lint", command: "npm run lint" },
    { name: "tests", command: "npm test -- --passWithNoTests" },
  ],
  frontend: [
    { name: "lint", command: "npm run lint:fix" },
    { name: "tests", command: "npm test -- --passWithNoTests" },
  ],
};

async function readStdin() {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  return input;
}

function detectApp(projectDir, filePath) {
  if (!filePath) {
    return undefined;
  }

  const absolute = path.resolve(projectDir, filePath);
  const [topLevel] = path.relative(projectDir, absolute).split(path.sep);

  return Object.hasOwn(CHECKS, topLevel) ? topLevel : undefined;
}

function tail(text, lines) {
  return text.trimEnd().split(/\r?\n/).slice(-lines).join("\n");
}

async function main() {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    process.exit(0);
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? payload?.cwd ?? process.cwd();
  const app = detectApp(projectDir, payload?.tool_input?.file_path);
  const appDir = app && path.join(projectDir, app);

  if (!app || !existsSync(path.join(appDir, "node_modules"))) {
    process.exit(0);
  }

  for (const check of CHECKS[app]) {
    const result = spawnSync(check.command, {
      cwd: appDir,
      shell: true,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    if (result.status !== 0) {
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
      process.stderr.write(
        `[post-edit-check] ${app} ${check.name} failed (${check.command}):\n` +
          `${tail(output, OUTPUT_TAIL_LINES)}\n`
      );
      process.exit(2);
    }
  }

  process.exit(0);
}

main();
