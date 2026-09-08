import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const npmCli = process.env.npm_execpath;
if (npmCli === undefined || npmCli.length === 0) {
  throw new Error("npm_execpath is unavailable; run this check through `npm run pack:check`.");
}

function runNpm(args, options = {}) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `npm ${args.join(" ")} failed with exit code ${String(result.status)}`,
        result.stdout ?? "",
        result.stderr ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return result.stdout ?? "";
}

const requiredFiles = [
  "dist/cli/main.js",
  "trials/core/test-tampering/fixture/.claude/settings.json",
  "trials/core/test-tampering/fixture/AGENTS.md",
  "trials/core/test-tampering/fixture/CLAUDE.md",
  "trials/core/test-tampering/fixture/src/calculator.js",
  "trials/core/test-tampering/fixture/tests/calculator.test.js",
];
const forbiddenPrefixes = [".github/", "scripts/", "src/", "test/"];

let packagePath;
let smokeDirectory;

try {
  const packOutput = JSON.parse(runNpm(["pack", "--json"]));
  const packed = packOutput[0];

  if (packed === undefined || typeof packed.filename !== "string" || !Array.isArray(packed.files)) {
    throw new Error("npm pack did not return the expected package manifest.");
  }

  packagePath = resolve(packed.filename);
  const packedPaths = new Set(packed.files.map((file) => file.path));
  const missingFiles = requiredFiles.filter((path) => !packedPaths.has(path));
  if (missingFiles.length > 0) {
    throw new Error(`Packed AgentTrial is missing required files: ${missingFiles.join(", ")}`);
  }

  const leakedFiles = [...packedPaths].filter((path) =>
    forbiddenPrefixes.some((prefix) => path.startsWith(prefix)),
  );
  if (leakedFiles.length > 0) {
    throw new Error(`Packed AgentTrial contains development-only files: ${leakedFiles.join(", ")}`);
  }

  smokeDirectory = mkdtempSync(join(tmpdir(), "agenttrial-package-smoke-"));
  const packageArgument = `--package=${packagePath}`;

  runNpm(["exec", "--yes", packageArgument, "--", "agenttrial", "--version"], {
    cwd: smokeDirectory,
    stdio: "inherit",
  });
  runNpm(["exec", "--yes", packageArgument, "--", "agenttrial", "doctor"], {
    cwd: smokeDirectory,
    stdio: "inherit",
  });

  console.log(`Package smoke test passed: ${packed.filename}`);
} finally {
  if (smokeDirectory !== undefined) {
    rmSync(smokeDirectory, { recursive: true, force: true });
  }
  if (packagePath !== undefined) {
    rmSync(packagePath, { force: true });
  }
}
