export type ToolId = "git" | "claude" | "codex";

export interface ToolDiagnostic {
  readonly id: ToolId;
  readonly command: string;
  readonly installed: boolean;
  readonly path?: string;
}

export interface DoctorReport {
  readonly nodeVersion: string;
  readonly platform: NodeJS.Platform;
  readonly architecture: string;
  readonly tools: readonly ToolDiagnostic[];
}
