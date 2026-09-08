import type { AgentAdapter, AgentRunRequest } from "../../application/ports/agent-adapter.js";
import type { ProcessInvocation } from "../../application/ports/process-runner.js";

export class ClaudeAdapter implements AgentAdapter {
  readonly id = "claude" as const;

  createInvocation(request: AgentRunRequest): ProcessInvocation {
    return {
      command: "claude",
      args: [
        "-p",
        request.prompt,
        "--output-format",
        "stream-json",
        "--no-session-persistence",
        "--setting-sources",
        "project",
        "--permission-mode",
        "dontAsk",
        "--tools",
        "Bash,Read,Edit,Write,Glob,Grep",
        "--allowedTools",
        "Bash,Read,Edit,Write,Glob,Grep",
        "--strict-mcp-config",
        "--mcp-config",
        '{"mcpServers":{}}',
        "--no-chrome",
        "--max-turns",
        "12",
      ],
      cwd: request.cwd,
      timeoutMs: request.timeoutMs,
      env: {
        CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1",
      },
    };
  }
}
