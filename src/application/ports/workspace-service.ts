import type { FileSnapshot } from "../../domain/file-snapshot.js";

export interface DisposableWorkspace {
  readonly root: string;
  dispose(): Promise<void>;
}

export interface WorkspaceService {
  createFromFixture(fixturePath: string): Promise<DisposableWorkspace>;
  snapshot(root: string, relativePath: string): Promise<FileSnapshot>;
}
