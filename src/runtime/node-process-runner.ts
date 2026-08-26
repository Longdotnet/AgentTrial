import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";

import type {
  ProcessInvocation,
  ProcessResult,
  ProcessRunner,
} from "../application/ports/process-runner.js";

interface SpawnTarget {
  readonly command: string;
  readonly args: readonly string[];
}

function childEnvironment(overrides?: Readonly<Record<string, string>>): NodeJS.ProcessEnv {
  const inherited = { ...process.env };

  // These variables are internal to Node's test runner. Leaking them into a nested `node --test`
  // process makes Node treat that process as recursive test execution and skip the requested files.
  delete inherited.NODE_TEST_CONTEXT;
  delete inherited.NODE_TEST_WORKER_ID;

  return { ...inherited, ...overrides };
}

function windowsCommandCandidates(command: string, env: NodeJS.ProcessEnv): readonly string[] {
  const result = spawnSync("where.exe", [command], {
    encoding: "utf8",
    env,
    shell: false,
    windowsHide: true,
  });

  if (result.status !== 0 || typeof result.stdout !== "string") {
    return [];
  }

  return result.stdout
    .split(/\r?\n/u)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function resolveSpawnTarget(invocation: ProcessInvocation, env: NodeJS.ProcessEnv): SpawnTarget {
  if (process.platform !== "win32") {
    return { command: invocation.command, args: invocation.args };
  }

  const candidates = windowsCommandCandidates(invocation.command, env);
  const nativeExecutable = candidates.find((candidate) => {
    const extension = extname(candidate).toLowerCase();
    return extension === ".exe" || extension === ".com";
  });

  if (nativeExecutable !== undefined) {
    return { command: nativeExecutable, args: invocation.args };
  }

  const fallback = invocation.windowsNpmShim;
  if (fallback === undefined) {
    return { command: invocation.command, args: invocation.args };
  }

  const npmShim = candidates.find((candidate) => {
    const extension = extname(candidate).toLowerCase();
    return extension === ".cmd" || extension === ".bat";
  });

  if (npmShim === undefined) {
    return { command: invocation.command, args: invocation.args };
  }

  const packageSegments = fallback.packageName.split("/").filter((segment) => segment.length > 0);
  const binSegments = fallback.binPath.split(/[\\/]+/u).filter((segment) => segment.length > 0);
  const nodeEntryPoint = join(dirname(npmShim), "node_modules", ...packageSegments, ...binSegments);

  if (!existsSync(nodeEntryPoint)) {
    return { command: invocation.command, args: invocation.args };
  }

  // npm command shims are .cmd files on Windows. Running them through cmd.exe would require shell
  // escaping every argument. For a known Node-backed package, launch its declared JS bin directly
  // instead, preserving shell:false and avoiding an extra command-injection surface.
  return {
    command: process.execPath,
    args: [nodeEntryPoint, ...invocation.args],
  };
}

export class NodeProcessRunner implements ProcessRunner {
  async run(invocation: ProcessInvocation): Promise<ProcessResult> {
    return await new Promise((resolve) => {
      const startedAt = Date.now();
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let settled = false;
      const env = childEnvironment(invocation.env);
      const target = resolveSpawnTarget(invocation, env);

      const child = spawn(target.command, [...target.args], {
        cwd: invocation.cwd,
        env,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });

      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, invocation.timeoutMs);

      const finish = (result: ProcessResult): void => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        resolve(result);
      };

      child.on("error", (error: NodeJS.ErrnoException) => {
        const base = {
          exitCode: null,
          signal: null,
          stdout,
          stderr,
          timedOut,
          durationMs: Date.now() - startedAt,
        } satisfies ProcessResult;

        finish({
          ...base,
          ...(error.code === undefined ? {} : { errorCode: error.code }),
          ...(error.message.length === 0 ? {} : { errorMessage: error.message }),
        });
      });

      child.on("close", (exitCode, signal) => {
        finish({
          exitCode,
          signal,
          stdout,
          stderr,
          timedOut,
          durationMs: Date.now() - startedAt,
        });
      });
    });
  }
}
