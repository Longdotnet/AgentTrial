import type { DoctorReport, ToolDiagnostic, ToolId } from "../domain/diagnostics.js";
import type { RuntimeInspector } from "./ports/runtime-inspector.js";

const TOOLS: ReadonlyArray<Readonly<{ id: ToolId; command: string }>> = [
  { id: "git", command: "git" },
  { id: "claude", command: "claude" },
  { id: "codex", command: "codex" },
];

export function createDoctorReport(runtime: RuntimeInspector): DoctorReport {
  const tools: ToolDiagnostic[] = TOOLS.map(({ id, command }) => {
    const path = runtime.findExecutable(command);

    return path === null
      ? { id, command, installed: false }
      : { id, command, installed: true, path };
  });

  return {
    nodeVersion: runtime.nodeVersion(),
    platform: runtime.platform(),
    architecture: runtime.architecture(),
    tools,
  };
}
