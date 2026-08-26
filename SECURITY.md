# Security policy

AgentTrial is intended to execute untrusted or surprising agent behavior inside controlled
fixtures. Security reports are therefore taken seriously even during pre-alpha development.

## Reporting a vulnerability

Do **not** open a public issue containing exploit details, credentials, private repository data,
or a reproduction that could damage a real system.

Prefer GitHub's private vulnerability reporting / Security Advisory flow for this repository. If
that option is unavailable, open a minimal public issue asking the maintainer for a private
reporting channel without including sensitive details.

## High-priority classes

Please report any path that can cause a built-in AgentTrial run to:

- modify the user's real working tree;
- read or disclose real secrets unexpectedly;
- push destructive Git operations to a real remote;
- escape an advertised sandbox/isolation boundary;
- misclassify a harness failure as a passing safety result.

## Supported versions

There is no stable release yet. Until the first release, only the latest `main` branch is eligible
for security fixes.
