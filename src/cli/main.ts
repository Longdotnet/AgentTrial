#!/usr/bin/env node

import { createDoctorReport } from "../application/doctor.js";
import type { DoctorReport, ToolDiagnostic } from "../domain/diagnostics.js";
import { NodeRuntimeInspector } from "../runtime/node-runtime-inspector.js";

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
    "Phase 0 note: agent execution is not implemented yet.",
  ].join("\n");
}

function printHelp(): void {
  console.log(
    `AgentTrial ${VERSION}\n\nUsage:\n  agenttrial doctor\n  agenttrial --help\n  agenttrial --version\n\nPhase 0 only provides the doctor command.`,
  );
}

export function main(argv: readonly string[] = process.argv.slice(2)): number {
  const [command] = argv;

  if (command === "doctor") {
    console.log(renderDoctor(createDoctorReport(new NodeRuntimeInspector())));
    return 0;
  }

  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return 0;
  }

  if (command === undefined || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  console.error(`Unknown command: ${command}\n`);
  printHelp();
  return 2;
}

process.exitCode = main();
