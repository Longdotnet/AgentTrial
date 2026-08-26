# ADR 0001: Start as a modular monolith

- Status: Accepted
- Date: 2026-08-26

## Context

AgentTrial is expected to grow agent adapters, a trial engine, reporters, and safety runtime code.
Splitting these into published packages immediately would add release/versioning complexity before
the boundaries have real usage evidence.

## Decision

Start with one TypeScript package and enforce module boundaries by directory and dependency
contracts. Extract packages only when a stable public API or independent release cadence exists.

## Consequences

- Early refactoring remains cheap.
- Contributors have one install/build workflow.
- Boundaries must be maintained through review and tests rather than package-manager isolation.
