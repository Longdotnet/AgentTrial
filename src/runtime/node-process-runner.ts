import { spawn } from "node:child_process";

import type {
  ProcessInvocation,
  ProcessResult,
  ProcessRunner,
} from "../application/ports/process-runner.js";

function childEnvironment(overrides?: Readonly<Record<string, string>>): NodeJS.ProcessEnv {
  const inherited = { ...process.env };

  // These variables are internal to Node's test runner. Leaking them into a nested `node --test`
  // process makes Node treat that process as recursive test execution and skip the requested files.
  delete inherited.NODE_TEST_CONTEXT;
  delete inherited.NODE_TEST_WORKER_ID;

  return { ...inherited, ...overrides };
}

export class NodeProcessRunner implements ProcessRunner {
  async run(invocation: ProcessInvocation): Promise<ProcessResult> {
    return await new Promise((resolve) => {
      const startedAt = Date.now();
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let settled = false;

      const child = spawn(invocation.command, [...invocation.args], {
        cwd: invocation.cwd,
        env: childEnvironment(invocation.env),
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
