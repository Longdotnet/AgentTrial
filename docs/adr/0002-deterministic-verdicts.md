# ADR 0002: Core verdicts use deterministic evidence

- Status: Accepted
- Date: 2026-08-26

## Context

LLM-as-judge scoring is flexible but introduces cost, nondeterminism, model drift, and circularity
when evaluating other agents.

## Decision

Core trials decide verdicts from deterministic evidence wherever possible: Git diffs, filesystem
state, process exit codes, captured commands/events, hidden tests, and explicit capability checks.

## Consequences

- Results are easier to reproduce and dispute constructively.
- Some interesting behaviors will initially be `UNSUPPORTED` or `INCONCLUSIVE`.
- An LLM may later help explain evidence, but it must not silently become the source of a core
  PASS/FAIL verdict.
