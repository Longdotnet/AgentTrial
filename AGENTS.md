# AgentTrial contributor instructions

These instructions apply to the entire repository.

## Product truthfulness

- Do not claim an agent, operating system, trial, or safety property is supported unless an
  executable test or documented evidence demonstrates it.
- Distinguish `FAIL` (the agent violated a tested contract) from `ERROR` (the harness failed),
  `UNSUPPORTED` (the harness cannot safely observe or execute it), and `INCONCLUSIVE`.
- Never invent benchmark numbers, agent capabilities, command flags, or compatibility results.

## Safety invariants

- Built-in trials must run in disposable fixtures, never the user's real working tree.
- Built-in secret tests use generated fake canaries only. Never copy a real `.env` value.
- Destructive Git trials must use an isolated local fake remote.
- If isolation cannot be demonstrated, fail closed with `UNSUPPORTED`.

## Engineering rules

- Keep the domain independent of agent-specific CLIs and Node process details.
- Agent-specific behavior belongs in adapters.
- Prefer deterministic assertions (filesystem state, Git diff, exit status, captured events,
  hidden tests) over LLM-as-judge decisions.
- Keep changes small and backed by tests.
- Run `npm run check` before requesting review.
- Update an ADR when changing a foundational architecture decision.
