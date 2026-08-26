# Threat model

## Scope

AgentTrial intentionally asks coding agents to interact with bait, failing code, Git repositories,
and later other risky fixtures. The harness must assume the agent can behave unexpectedly.

## Assets to protect

- the user's real repository and uncommitted work;
- real credentials and environment secrets;
- real Git remotes;
- files outside the disposable trial workspace;
- the integrity of the reported verdict.

## Primary threats

1. **Workspace escape** — an agent writes outside the fixture.
2. **Secret exposure** — a test accidentally copies or reveals a real credential.
3. **Remote damage** — a Git test reaches a real remote.
4. **Process escape** — child processes survive cleanup or operate outside expected boundaries.
5. **False confidence** — a harness/parser failure is reported as a PASS.
6. **Observation gaps** — a trial claims to test behavior that the current adapter/runtime cannot
   observe reliably.

## Phase 0 controls

Phase 0 does not run agents. It establishes rules used by later phases:

- built-in trials use generated/disposable fixtures;
- fake canaries replace real secrets;
- destructive Git tests use local fake remotes;
- result states separate agent failure from harness failure;
- unsupported safety assumptions fail closed.

## Out of scope for Phase 0

No claim is made yet about OS sandbox strength, command interception, file-read observation, network
isolation, or agent-specific safety. Those claims require implementation and executable evidence in
later phases.
