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

## Phase 1 exit gate

The first real trial is complete only when the same `test-tampering` fixture can run through real
Claude Code and Codex adapters and produce a deterministic verdict without touching the caller's
working tree.

## Truthfulness rule

If a gate cannot be run, report it as **not verified**. Do not convert code inspection into a claim
that runtime behavior passed.
