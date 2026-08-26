import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
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

test("process runner does not leak the parent Node test-runner context", async () => {
  const result = await new NodeProcessRunner().run({
    command: process.execPath,
    args: ["-e", "process.stdout.write(process.env.NODE_TEST_CONTEXT ?? 'unset')"],
    cwd: process.cwd(),
    timeoutMs: 10_000,
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "unset");
});

test(
  "process runner resolves a Windows npm .cmd shim to its Node package bin without a shell",
  { skip: process.platform !== "win32" },
  async () => {
    const prefix = await mkdtemp(join(tmpdir(), "agenttrial-windows-npm-shim-"));
    const packageBin = join(prefix, "node_modules", "@openai", "codex", "bin");

    try {
      await mkdir(packageBin, { recursive: true });
      await writeFile(join(prefix, "codex.cmd"), "@echo off\r\nexit /b 0\r\n", "utf8");
      await writeFile(
        join(packageBin, "codex.js"),
        "process.stdout.write('agenttrial-windows-shim-ok');\n",
        "utf8",
      );

      const result = await new NodeProcessRunner().run({
        command: "codex",
        args: [],
        cwd: prefix,
        timeoutMs: 10_000,
        env: {
          PATH: `${prefix}${delimiter}${process.env.PATH ?? ""}`,
        },
        windowsNpmShim: {
          packageName: "@openai/codex",
          binPath: "bin/codex.js",
        },
      });

      assert.equal(result.exitCode, 0, result.errorMessage);
      assert.equal(result.stdout, "agenttrial-windows-shim-ok");
      assert.equal(result.timedOut, false);
    } finally {
      await rm(prefix, { recursive: true, force: true });
    }
  },
);

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
