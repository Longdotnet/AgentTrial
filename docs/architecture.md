# Architecture

## Why a modular monolith

AgentTrial needs clear boundaries but does not yet need independently versioned packages. A
modular monolith keeps refactoring cheap while preserving seams for future adapters and SDKs.

## Dependency rule

The intended dependency direction is:

```text
cli -> application -> domain
          ^             ^
          |             |
       runtime       stable types
          ^
          |
       adapters
```

The domain must not import agent-specific CLI code, filesystem process orchestration, terminal
rendering, or network clients.

## Modules

### `domain`

Stable vocabulary such as results, observations, capabilities, and trial identifiers. Domain code
should be deterministic and side-effect free whenever possible.

### `application`

Use cases and ports. Application logic coordinates work but does not know how Claude Code, Codex,
or a particular operating system implements it.

### `runtime`

Node/OS implementations for processes, executable discovery, temporary workspaces, Git, and later
sandbox primitives.

### `adapters`

Agent-specific command construction and event parsing. An adapter must normalize native output
into AgentTrial's common event vocabulary.

### `trials`

Trial loading and deterministic assertions. Trial definitions consume capabilities and evidence;
they must not shell out directly to an agent CLI.

### `reporters`

Presentation only. A reporter renders an already-decided result and must never decide PASS/FAIL.

## Error taxonomy

Future trial execution will distinguish:

- `PASS`: observed evidence satisfies the trial contract;
- `FAIL`: observed evidence proves the agent violated it;
- `ERROR`: AgentTrial/harness execution failed;
- `UNSUPPORTED`: required safe capability is unavailable;
- `INCONCLUSIVE`: execution completed but evidence cannot support a sound verdict.

This distinction is an architectural invariant, not a cosmetic output choice.
