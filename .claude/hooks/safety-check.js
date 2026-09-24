#!/usr/bin/env node
// .claude/hooks/safety-check.js

import { createInterface } from "readline";

const BLOCKED_PATTERNS = [
  /drop\s+database/i,
  /drop\s+table/i,
  /delete\s+from\s+\w+\s*;?\s*$/i,
  /git\s+push\s+.*--force(?!-with-lease)/i,
  /rm\s+-rf\s+\//i,
  /format\s+[a-zA-Z]:/i,
  /migration:revert/i,
];

const ASK_PATTERNS = [
  /docker\s+compose\s+down\s+.*-v/i,
  /npm\s+run\s+migration/i,
  /DROP/i,
  /TRUNCATE/i,
];

async function main() {
  let input = "";
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) {
    input += line;
  }

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  }

  const command = payload?.tool_input?.command ?? payload?.toolCall?.args?.CommandLine ?? "";

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      process.stdout.write(
        JSON.stringify({
          decision: "deny",
          reason: `Command matches a blocked pattern (${pattern}). Run it manually if you're sure.`,
        })
      );
      process.exit(0);
    }
  }

  for (const pattern of ASK_PATTERNS) {
    if (pattern.test(command)) {
      process.stdout.write(
        JSON.stringify({
          decision: "ask",
          reason: `Command matches a sensitive pattern (${pattern}). Please confirm.`,
        })
      );
      process.exit(0);
    }
  }

  process.stdout.write(JSON.stringify({ decision: "allow" }));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
  process.exit(0);
});
