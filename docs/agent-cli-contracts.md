# Agent CLI contracts

AgentTrial does not guess coding-agent CLI flags. Adapter contracts are verified against official
documentation before they are committed, and the matching argument arrays are covered by tests.

Last verified: **2026-08-26**.

## Claude Code

Official references:

- https://code.claude.com/docs/en/cli-usage
- https://code.claude.com/docs/en/headless
- https://code.claude.com/docs/en/sandboxing
- https://code.claude.com/docs/en/agent-sdk/claude-code-features

Phase 1 deliberately uses:

- `-p` for non-interactive execution;
- `--output-format stream-json` for machine-readable events;
- `--no-session-persistence` to avoid saving the trial session;
- `--setting-sources project` so the fixture's project `CLAUDE.md` is loaded while user/local
  filesystem settings are excluded;
- `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` to prevent per-repository auto memory from influencing the
  built-in trial;
- project sandbox settings with `failIfUnavailable: true` and `allowUnsandboxedCommands: false`.

The fixture intentionally does **not** use `--bare`, because bare mode skips `CLAUDE.md` and would
invalidate a test of project instructions.

Managed policy settings and some host-level Claude configuration are outside the control of
`--setting-sources`; a real run must record that limitation rather than claim perfect environment
purity.

## Codex CLI

Official references:

- https://developers.openai.com/codex/noninteractive
- https://developers.openai.com/codex/cli/reference
- https://github.com/openai/codex/blob/main/codex-cli/package.json

Phase 1 deliberately uses:

- `codex exec` for non-interactive execution;
- `--ephemeral` to avoid persisting rollout files;
- `--json` for newline-delimited machine-readable events;
- `--ignore-user-config` to prevent `$CODEX_HOME/config.toml` from changing the built-in trial while
  preserving Codex authentication;
- `--sandbox workspace-write` so model-generated commands can modify only the intended workspace
  according to Codex's sandbox policy;
- `--cd <fixture>` to make the disposable fixture the workspace root.

The adapter does **not** use `--dangerously-bypass-approvals-and-sandbox` / `--yolo`.

### Windows npm installs

A global npm install exposes commands through `.cmd` shims on Windows. Node's shell-free process
spawn cannot safely rely on executing such a shim by bare command name. AgentTrial therefore records
Codex's declared npm bin (`@openai/codex` -> `bin/codex.js`). When Windows resolves `codex` only to an
npm `.cmd` shim, the runtime locates that package entry point relative to the shim and launches it
with the current Node executable while keeping `shell: false`.

This is intentionally preferred over `shell: true`: coding-agent prompts and future arguments must
not be routed through `cmd.exe` merely to accommodate npm shims.

## Verification rule

A docs-backed command contract is not the same as a successful real-agent run. Phase 1 remains
incomplete until the same fixture is executed by authenticated Claude Code and Codex installations
and their results are recorded as evidence.
