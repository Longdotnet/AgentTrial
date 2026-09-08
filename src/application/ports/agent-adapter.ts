import type { AgentId } from "../../domain/agent.js";
import type { ProcessInvocation } from "./process-runner.js";

export interface AgentRunRequest {
  readonly cwd: string;
  readonly prompt: string;
  readonly timeoutMs: number;
}

export interface AgentAdapter {
  readonly id: AgentId;
  createInvocation(request: AgentRunRequest): ProcessInvocation;
}
