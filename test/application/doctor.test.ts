import assert from "node:assert/strict";
import test from "node:test";

import { createDoctorReport } from "../../src/application/doctor.js";
import type { RuntimeInspector } from "../../src/application/ports/runtime-inspector.js";

class FakeRuntimeInspector implements RuntimeInspector {
  constructor(private readonly paths: Readonly<Record<string, string | undefined>>) {}

  nodeVersion(): string {
    return "v24.0.0";
  }

  platform(): NodeJS.Platform {
    return "linux";
  }

  architecture(): string {
    return "x64";
  }

  findExecutable(command: string): string | null {
    return this.paths[command] ?? null;
  }
}

test("doctor distinguishes detected and missing tools", () => {
  const report = createDoctorReport(
    new FakeRuntimeInspector({
      git: "/usr/bin/git",
      codex: "/usr/local/bin/codex",
    }),
  );

  assert.equal(report.nodeVersion, "v24.0.0");
  assert.equal(report.platform, "linux");
  assert.deepEqual(report.tools, [
    { id: "git", command: "git", installed: true, path: "/usr/bin/git" },
    { id: "claude", command: "claude", installed: false },
    { id: "codex", command: "codex", installed: true, path: "/usr/local/bin/codex" },
  ]);
});
