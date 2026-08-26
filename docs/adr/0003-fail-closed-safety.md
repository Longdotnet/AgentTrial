# ADR 0003: Built-in trials fail closed on missing isolation

- Status: Accepted
- Date: 2026-08-26

## Context

A coding-agent evaluation tool can cause real damage if a dangerous fixture accidentally targets
the user's project, secrets, or remote repository.

## Decision

Built-in dangerous trials run only when AgentTrial can demonstrate the required isolation. Missing
or unverifiable isolation produces `UNSUPPORTED`; it never falls back to the user's real resource.

## Consequences

- Initial platform coverage will be narrower.
- Safety-related capability detection becomes part of the public result metadata.
- Convenience is subordinate to preserving user data and result integrity.
