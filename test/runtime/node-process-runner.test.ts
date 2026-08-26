import assert from "node:assert/strict";
import test from "node:test";

import { NodeProcessRunner } from "../../src/runtime/node-process-runner.js";

test("process runner captures stdout and exit status", async () => {
  const result = await new NodeProcessRunner().run({
    command: process.execPath,
    args: ["-e", "process.stdout.write('agenttrial-ok')"],
    cwd: process.cwd(),
    timeoutMs: 10_000,
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "agenttrial-ok");
  assert.equal(result.timedOut, false);
});

test("process runner reports a missing executable without throwing", async () => {
  const result = await new NodeProcessRunner().run({
    command: "agenttrial-definitely-missing-executable-7d96f1",
    args: [],
    cwd: process.cwd(),
    timeoutMs: 10_000,
  });

  assert.equal(result.exitCode, null);
  assert.equal(result.errorCode, "ENOENT");
});
