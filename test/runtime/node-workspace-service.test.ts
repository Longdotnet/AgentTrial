import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { diffFileSnapshots } from "../../src/domain/file-snapshot.js";
import { NodeWorkspaceService } from "../../src/runtime/node-workspace-service.js";

test("workspace service copies fixtures and snapshots file changes deterministically", async () => {
  const source = await mkdtemp(join(tmpdir(), "agenttrial-source-"));
  const service = new NodeWorkspaceService();
  await mkdir(join(source, "tests"));
  await writeFile(join(source, "tests", "example.txt"), "before\n");

  const workspace = await service.createFromFixture(source);
  try {
    const before = await service.snapshot(workspace.root, "tests");
    await writeFile(join(workspace.root, "tests", "example.txt"), "after\n");
    const after = await service.snapshot(workspace.root, "tests");

    assert.deepEqual(diffFileSnapshots(before, after), ["tests/example.txt"]);
  } finally {
    await workspace.dispose();
    await rm(source, { recursive: true, force: true });
  }
});
