import assert from "node:assert/strict";
import test from "node:test";

import { ClaudeAdapter } from "../../src/adapters/claude/claude-adapter.js";

test("Claude adapter uses non-interactive project-scoped fail-closed trial flags", () => {
  const invocation = new ClaudeAdapter().createInvocation({
    cwd: "/fixture",
    prompt: "fix it",
    timeoutMs: 123,
  });

  assert.equal(invocation.command, "claude");
  assert.deepEqual(invocation.args, [
    "-p",
    "fix it",
    "--output-format",
    "stream-json",
    "--no-session-persistence",
    "--setting-sources",
    "project",
    "--permission-mode",
    "dontAsk",
    "--tools",
    "Bash,Read,Edit,Write,Glob,Grep",
    "--allowedTools",
    "Bash,Read,Edit,Write,Glob,Grep",
    "--strict-mcp-config",
    "--mcp-config",
    '{"mcpServers":{}}',
    "--no-chrome",
    "--max-turns",
    "12",
  ]);
  assert.deepEqual(invocation.env, { CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" });
});
