#!/usr/bin/env node

import { ClaudeAdapter } from "../adapters/claude/claude-adapter.js";
import { CodexAdapter } from "../adapters/codex/codex-adapter.js";
import { createDoctorReport } from "../application/doctor.js";
import type { AgentAdapter } from "../application/ports/agent-adapter.js";
import { runTestTampering } from "../application/run-test-tampering.js";
import type { AgentId } from "../domain/agent.js";
import type { DoctorReport, ToolDiagnostic } from "../domain/diagnostics.js";
import type { TestTamperingResult } from "../domain/trial.js";
import { NodeProcessRunner } from "../runtime/node-process-runner.js";
import { NodeRuntimeInspector } from "../runtime/node-runtime-inspector.js";
import { NodeWorkspaceService } from "../runtime/node-workspace-service.js";

const VERSION = "0.0.0";

function renderTool(tool: ToolDiagnostic): string {
  if (!tool.installed) {
    return `  - ${tool.id.padEnd(7)} not detected`;
  }

  return `  ✓ ${tool.id.padEnd(7)} ${tool.path ?? "detected"}`;
}

function renderDoctor(report: DoctorReport): string {
  return [
    "⚖ AgentTrial doctor",
    "",
    `Node:     ${report.nodeVersion}`,
    `Platform: ${report.platform}/${report.architecture}`,
    "",
    "Tools:",
    ...report.tools.map(renderTool),
    "",
    "Phase 1 note: real-agent test-tampering validation is still in progress.",
  ].join("\n");
}

function printHelp(): void {
  console.log(
    `AgentTrial ${VERSION}\n\nUsage:\n  agenttrial doctor\n  agenttrial run test-tampering --agent <claude|codex> [--keep-workspace]\n  agenttrial --help\n  agenttrial --version`,
  );
}

function parseAgent(args: readonly string[]): AgentId | null {
  const index = args.indexOf("--agent");
  const value = index === -1 ? undefined : args[index + 1];
  return value === "claude" || value === "codex" ? value : null;
}

function adapterFor(agentId: AgentId): AgentAdapter {
  return agentId === "claude" ? new ClaudeAdapter() : new CodexAdapter();
}

function renderTrialResult(result: TestTamperingResult): string {
  const changed =
    result.evidence.forbiddenPathsChanged.length === 0
      ? "none"
      : result.evidence.forbiddenPathsChanged.join(", ");

  return [
    "⚖ AgentTrial",
    "",
    `Trial:    ${result.trialId}`,
    `Agent:    ${result.agentId}`,
    `Verdict:  ${result.status}`,
    "",
    result.summary,
    "",
    "Evidence:",
    `  baseline test exit: ${String(result.evidence.baselineTestExitCode)}`,
    `  agent exit:         ${String(result.evidence.agentExitCode)}`,
    `  agent timed out:    ${String(result.evidence.agentTimedOut)}`,
    `  post-test exit:     ${String(result.evidence.postTestExitCode)}`,
    `  tests/ changed:     ${changed}`,
    ...(result.workspacePath === undefined ? [] : [`  workspace:          ${result.workspacePath}`]),
  ].join("\n");
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const [command, trialId] = argv;

  if (command === "doctor") {
    console.log(renderDoctor(createDoctorReport(new NodeRuntimeInspector())));
    return 0;
  }

  if (command === "run" && trialId === "test-tampering") {
    const agentId = parseAgent(argv);
    if (agentId === null) {
      console.error("Missing or invalid --agent. Expected claude or codex.\n");
      printHelp();
      return 2;
    }

    const result = await runTestTampering(
      {
        adapter: adapterFor(agentId),
        processRunner: new NodeProcessRunner(),
        workspaceService: new NodeWorkspaceService(),
      },
      { keepWorkspace: argv.includes("--keep-workspace") },
    );

    console.log(renderTrialResult(result));
    return result.status === "PASS" ? 0 : 1;
  }

  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return 0;
  }

  if (command === undefined || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  console.error(`Unknown command: ${argv.join(" ")}\n`);
  printHelp();
  return 2;
}

process.exitCode = await main();
