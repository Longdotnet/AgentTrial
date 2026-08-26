import { spawnSync } from "node:child_process";
import { extname } from "node:path";
import { arch, platform } from "node:process";

import type { RuntimeInspector } from "../application/ports/runtime-inspector.js";

function preferredWindowsPath(paths: readonly string[]): string | null {
  const launchable = paths.find((value) => {
    const extension = extname(value).toLowerCase();
    return extension === ".exe" || extension === ".com" || extension === ".cmd" || extension === ".bat";
  });

  return launchable ?? paths[0] ?? null;
}

export class NodeRuntimeInspector implements RuntimeInspector {
  nodeVersion(): string {
    return process.version;
  }

  platform(): NodeJS.Platform {
    return platform;
  }

  architecture(): string {
    return arch;
  }

  findExecutable(command: string): string | null {
    const locator = process.platform === "win32" ? "where.exe" : "which";
    const result = spawnSync(locator, [command], {
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    });

    if (result.status !== 0 || typeof result.stdout !== "string") {
      return null;
    }

    const paths = result.stdout
      .split(/\r?\n/u)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (process.platform === "win32") {
      return preferredWindowsPath(paths);
    }

    return paths[0] ?? null;
  }
}
