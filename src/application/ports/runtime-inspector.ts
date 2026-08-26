export interface RuntimeInspector {
  nodeVersion(): string;
  platform(): NodeJS.Platform;
  architecture(): string;
  findExecutable(command: string): string | null;
}
