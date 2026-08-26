# ⚖️ AgentTrial

> **Put your coding agent on trial.**

AgentTrial is an open-source CLI in development for **deterministic behavioral tests** of
coding agents. The goal is to test whether an agent actually follows rules and boundaries —
not to rank model intelligence.

> [!IMPORTANT]
> **Status: pre-alpha / Phase 0.** The test engine and agent adapters are not implemented yet.
> Do not use this repository as evidence that Claude Code, Codex, or any other agent is safe.

## Product contract

AgentTrial is being designed around five non-negotiable rules:

1. Never modify the user's real project while running a built-in trial.
2. Never use a user's real secret as test bait.
3. Never push destructive Git operations to a real remote.
4. Never report an agent failure when the harness itself failed.
5. Prefer deterministic evidence over LLM-as-judge scoring.

The target experience is intentionally simple:

```console
$ npx agenttrial doctor
$ npx agenttrial run
$ npx agenttrial compare claude codex
```

Those `run` and `compare` commands are roadmap examples, **not implemented commands yet**.

## Phase 0

The current phase establishes the engineering foundation:

- Node.js 24 LTS + TypeScript
- strict compiler settings
- modular-monolith boundaries
- cross-platform CI on Linux, macOS, and Windows
- formatting and linting with Biome
- deterministic unit tests using the Node.js test runner
- architecture decisions and threat-model documentation
- a minimal `agenttrial doctor` CLI shell

## Development

Requirements:

- Node.js 24+
- npm

```bash
npm ci
npm run check
npm run doctor
```

`npm run check` is the local quality gate: lint, typecheck, tests, then production build.

## Architecture

AgentTrial starts as a modular monolith. The important dependency direction is:

```text
CLI → Application → Domain
       ↑            ↑
   Runtime       stable types
```

Agent-specific process details belong behind adapters. Trial definitions must not know how a
particular agent CLI works, and reporters must not decide trial outcomes.

See [`docs/architecture.md`](docs/architecture.md),
[`docs/threat-model.md`](docs/threat-model.md), and [`docs/adr/`](docs/adr/).

## Roadmap

- **Phase 0:** foundation and quality gates
- **Phase 1:** one end-to-end `test-tampering` vertical slice on Claude Code and Codex
- **Phase 2:** disposable workspace and safety runtime
- **Phase 3:** first deterministic core trial suite
- **Later:** reproducibility metadata, user-config contracts, shareable reports, more adapters

Each phase has an exit gate. Features do not advance merely because code exists; the evidence
must pass first.

## Contributing

AgentTrial is early. Contributions that improve safety, reproducibility, architecture, or a
reproducible agent failure case are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and
[`AGENTS.md`](AGENTS.md) before changing code.

## Security

Please do not publish exploitable security details in a public issue. See
[`SECURITY.md`](SECURITY.md).

## License

MIT © 2026 Longdotnet
