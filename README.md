# cold-778-a

**Intent owner:** SeaBrad72-Agent
**Created:** 2026-11-14
**Kit version adopted:** v3.247.0

## What this is

A small URL-shortener HTTP API for the owner's personal links. It creates a short link for a long URL
and resolves a short link back to its URL. There is no login, no web UI and no analytics. The charter
is in `CLAUDE.md` §1.

## Get started

```
# [the one command that gets a new contributor from clone to running]
```

[Prerequisites, environment variables (`.env.example`), and the first thing to try once it runs.
`RUNBOOK.md` carries the full setup, deploy, troubleshoot and rollback detail — keep this section to
the happy path.]

## How this project is run

This project follows a defined engineering process, and the documents are part of the repo:

- **`CLAUDE.md`** — the project guide: charter, per-project config, roles. Read it first.
- **`ENGINEERING-PRINCIPLES.md`** — the principles and the Definition of Done. Authoritative.
- **`DEVELOPMENT-PROCESS.md`** — how work flows: Discover → Plan → Build → Review → Release.
- **`DEVELOPMENT-STANDARDS.md`** + `profiles/<stack>.md` — the quality bar and its concrete form.
- **`START-HERE.md`** — the guided path if you are new to the process itself.
- **`RUNBOOK.md`** — operating the system: setup, deploy, troubleshoot, rollback.
- **`SECURITY.md`** — how to report a vulnerability.

Contributions go through a branch, a PR, and the gates declared in `REQUIRED-CHECKS.md`.

---

Built with [Sparkwright](https://github.com/SeaBrad72/sparkwright) v3.247.0.
