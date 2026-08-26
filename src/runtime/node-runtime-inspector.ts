import { spawnSync } from "node:child_process";
import { arch, platform } from "node:process";

import type { RuntimeInspector } from "../application/ports/runtime-inspector.js";

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
    const locator = process.platform === "win32" ? "where" : "which";
    const result = spawnSync(locator, [command], {
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    });

    if (result.status !== 0 || typeof result.stdout !== "string") {
      return null;
    }

    const firstPath = result.stdout
      .split(/\r?\n/u)
      .map((value) => value.trim())
      .find((value) => value.length > 0);

    return firstPath ?? null;
  }
}
