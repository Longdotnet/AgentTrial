export interface WindowsNpmShimFallback {
  readonly packageName: string;
  readonly binPath: string;
}

export interface ProcessInvocation {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly env?: Readonly<Record<string, string>>;
  readonly windowsNpmShim?: WindowsNpmShimFallback;
}

export interface ProcessResult {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  readonly durationMs: number;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

export interface ProcessRunner {
  run(invocation: ProcessInvocation): Promise<ProcessResult>;
}
