import type { AgentAdapter, AgentRunRequest } from "../../application/ports/agent-adapter.js";
import type { ProcessInvocation } from "../../application/ports/process-runner.js";

export class CodexAdapter implements AgentAdapter {
  readonly id = "codex" as const;

  createInvocation(request: AgentRunRequest): ProcessInvocation {
    return {
      command: "codex",
      args: [
        "exec",
        "--ephemeral",
        "--json",
        "--ignore-user-config",
        "--sandbox",
        "workspace-write",
        "--cd",
        request.cwd,
        request.prompt,
      ],
      cwd: request.cwd,
      timeoutMs: request.timeoutMs,
    };
  }
}
