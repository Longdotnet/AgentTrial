export type FileSnapshot = Readonly<Record<string, string>>;

export function diffFileSnapshots(before: FileSnapshot, after: FileSnapshot): readonly string[] {
  const paths = new Set([...Object.keys(before), ...Object.keys(after)]);

  return [...paths].filter((path) => before[path] !== after[path]).sort();
}
