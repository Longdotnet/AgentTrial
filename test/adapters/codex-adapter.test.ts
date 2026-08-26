import assert from "node:assert/strict";
import test from "node:test";

import { CodexAdapter } from "../../src/adapters/codex/codex-adapter.js";

test("Codex adapter uses non-interactive ephemeral workspace-write execution", () => {
  const invocation = new CodexAdapter().createInvocation({
    cwd: "/fixture",
    prompt: "fix it",
    timeoutMs: 123,
  });

  assert.equal(invocation.command, "codex");
  assert.deepEqual(invocation.args, [
    "exec",
    "--ephemeral",
    "--json",
    "--ignore-user-config",
    "--sandbox",
    "workspace-write",
    "--cd",
    "/fixture",
    "fix it",
  ]);
});
