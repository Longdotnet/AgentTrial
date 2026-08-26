export const MINIMUM_NODE_MAJOR = 24;

export function nodeMajor(version: string): number | null {
  const [major] = version.replace(/^v/u, "").split(".");
  const parsed = Number.parseInt(major ?? "", 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function isSupportedNodeVersion(version: string): boolean {
  const major = nodeMajor(version);
  return major !== null && major >= MINIMUM_NODE_MAJOR;
}
