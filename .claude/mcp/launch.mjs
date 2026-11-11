#!/usr/bin/env node
// Starts a read-only database MCP server with credentials taken from backend/.env,
// so .mcp.json can be committed without secrets. Usage: launch.mjs postgres <db> | launch.mjs mongodb

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envFile = path.join(projectDir, "backend", ".env");

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    process.stderr.write(`[mcp] ${name} is not set (expected in backend/.env)\n`);
    process.exit(1);
  }
  return value;
}

function credentials(userVar, passwordVar) {
  return `${encodeURIComponent(required(userVar))}:${encodeURIComponent(required(passwordVar))}`;
}

const POSTGRES_DATABASES = [
  "identity_db",
  "catalog_db",
  "cart_db",
  "order_db",
  "promo_db",
  "analytics_db",
];

function postgres(database) {
  if (!POSTGRES_DATABASES.includes(database)) {
    process.stderr.write(`[mcp] unknown database "${database}"\n`);
    process.exit(1);
  }

  const port = process.env.POSTGRES_PORT ?? "5432";
  const auth = credentials("POSTGRES_USER", "POSTGRES_PASSWORD");

  return {
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "-e",
      "DATABASE_URI",
      "crystaldba/postgres-mcp",
      "--access-mode=restricted",
    ],
    env: { DATABASE_URI: `postgresql://${auth}@host.docker.internal:${port}/${database}` },
    shell: false,
  };
}

function mongodb() {
  const host = process.env.MONGO_HOST ?? "localhost";
  const port = process.env.MONGO_PORT ?? "27018";
  const database = required("MONGO_INITDB_DATABASE");
  const auth = credentials("MONGO_INITDB_ROOT_USERNAME", "MONGO_INITDB_ROOT_PASSWORD");

  return {
    command: "npx",
    args: ["-y", "mongodb-mcp-server@3.3.0", "--readOnly"],
    env: {
      MDB_MCP_CONNECTION_STRING: `mongodb://${auth}@${host}:${port}/${database}?authSource=admin`,
      MDB_MCP_TELEMETRY: "disabled",
    },
    shell: process.platform === "win32",
  };
}

const [kind, database] = process.argv.slice(2);
const server = kind === "postgres" ? postgres(database) : kind === "mongodb" ? mongodb() : undefined;

if (!server) {
  process.stderr.write("Usage: launch.mjs postgres <database> | launch.mjs mongodb\n");
  process.exit(1);
}

const child = spawn(server.command, server.args, {
  stdio: "inherit",
  shell: server.shell,
  env: { ...process.env, ...server.env },
});

child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
