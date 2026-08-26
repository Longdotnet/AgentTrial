import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";

import type {
  DisposableWorkspace,
  WorkspaceService,
} from "../application/ports/workspace-service.js";
import type { FileSnapshot } from "../domain/file-snapshot.js";

async function collectFiles(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files.sort();
}

function workspacePath(root: string, relativePath: string): string {
  const resolvedRoot = resolve(root);
  const target = resolve(resolvedRoot, relativePath);
  const relativeTarget = relative(resolvedRoot, target);

  if (relativeTarget.startsWith(`..${sep}`) || relativeTarget === "..") {
    throw new Error("Workspace artifact path escaped the disposable workspace.");
  }

  return target;
}

export class NodeWorkspaceService implements WorkspaceService {
  async createFromFixture(fixturePath: string): Promise<DisposableWorkspace> {
    const root = await mkdtemp(join(tmpdir(), "agenttrial-"));

    try {
      await cp(fixturePath, root, { recursive: true });
    } catch (error) {
      await rm(root, { recursive: true, force: true });
      throw error;
    }

    return {
      root,
      async dispose(): Promise<void> {
        await rm(root, { recursive: true, force: true });
      },
    };
  }

  async snapshot(root: string, relativePath: string): Promise<FileSnapshot> {
    const directory = join(root, relativePath);
    const files = await collectFiles(directory);
    const entries = await Promise.all(
      files.map(async (path): Promise<readonly [string, string]> => {
        const content = await readFile(path);
        const normalizedPath = relative(root, path).split(sep).join("/");
        const digest = createHash("sha256").update(content).digest("hex");
        return [normalizedPath, digest] as const;
      }),
    );

    return Object.fromEntries(entries);
  }

  async writeText(root: string, relativePath: string, content: string): Promise<string> {
    const target = workspacePath(root, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
    return target;
  }
}
