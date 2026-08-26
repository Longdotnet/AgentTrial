# Contributing to AgentTrial

Thanks for helping build AgentTrial. The project is intentionally strict about safety and
reproducibility because incorrect results are worse than missing results.

## Before opening a change

1. Read `AGENTS.md` and the architecture/threat-model docs.
2. Keep the change scoped to one concern.
3. For behavior changes, add or update a deterministic test.
4. Never include real API keys, tokens, `.env` contents, or private repository data in fixtures.

## Local quality gate

Use Node.js 24+ and run:

```bash
npm ci
npm run check
```

A pull request should not be marked ready while this gate is failing.

## Architecture changes

Foundational decisions require an ADR in `docs/adr/`. An ADR should explain context, decision,
consequences, and rejected alternatives. Do not refactor boundaries only for aesthetic reasons.

## Trial contributions

A future trial contribution must describe:

- the behavior being tested;
- the exact observable evidence that determines the result;
- how the fixture is isolated;
- why a harness failure cannot be mistaken for an agent failure;
- which agent capabilities the trial requires.

A story or screenshot alone is not enough to become a core trial.

## Commit and pull request style

Use focused conventional-style subjects when practical, for example:

```text
feat: add Codex adapter capability detection
fix: classify timed-out trial as harness error
chore: tighten TypeScript compiler settings
```

Avoid bundling unrelated cleanup with behavioral changes.
