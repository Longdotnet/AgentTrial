import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../.tmp/test-dist/test", import.meta.url));

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(path)));
    } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
      files.push(path);
    }
  }

  return files;
}

const files = (await collect(root)).sort();
if (files.length === 0) {
  console.error("No compiled test files found.");
  process.exitCode = 1;
} else {
  const result = spawnSync(process.execPath, ["--test", ...files], {
    stdio: "inherit",
    shell: false,
  });

  process.exitCode = result.status ?? 1;
}
