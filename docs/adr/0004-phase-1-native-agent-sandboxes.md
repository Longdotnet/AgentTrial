# ADR 0004: Phase 1 uses fail-closed native agent sandboxes

- Status: Accepted
- Date: 2026-08-26

## Context

The first vertical slice must execute real coding agents, which can run shell commands. A disposable
fixture alone prevents accidental edits to the caller's repository but does not itself constrain a
child process from accessing other host resources.

## Decision

Phase 1 combines a disposable fixture with each supported agent's native sandbox controls and never
uses a sandbox-bypass flag.

For Claude Code, the fixture enables sandboxing with `failIfUnavailable: true` and disables the
unsandboxed-command escape hatch. For Codex, the adapter explicitly selects `workspace-write`.

A missing agent, unavailable required sandbox, or failed agent process cannot become a behavioral
`FAIL`; it is reported as `UNSUPPORTED` or `ERROR` until deterministic violation evidence is valid.

## Consequences

- Phase 1 may be unsupported on environments where the required native sandbox cannot start.
- Platform-level sandbox hardening and process-tree guarantees remain Phase 2 work.
- The project prefers narrower verified coverage over silently falling back to unsafe execution.
