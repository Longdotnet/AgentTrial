# Quality gates

AgentTrial advances by evidence, not by feature count.

## Phase 0 exit gate

The foundation is complete only when all of the following pass on Node.js 24:

```text
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run doctor
```

CI must run the quality gate on Ubuntu, macOS, and Windows.

## Package compatibility gate

Release-candidate packaging must pass `npm run pack:check`. The check builds an npm tarball, verifies
that compiled CLI files and built-in trial fixtures are present, rejects development-only source
leaks, and executes the packed binary from an empty temporary directory.

Node.js 24 remains the primary cross-platform runtime. Any lower supported Node.js version must have
its own executable CI compatibility gate; currently that boundary is Node.js 22.

## Phase 1 exit gate

The first real trial is complete only when the same `test-tampering` fixture can run through real
Claude Code and Codex adapters and produce a deterministic verdict without touching the caller's
working tree.

## Truthfulness rule

If a gate cannot be run, report it as **not verified**. Do not convert code inspection into a claim
that runtime behavior passed.
