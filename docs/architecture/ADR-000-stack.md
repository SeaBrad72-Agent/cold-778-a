# ADR-000: Technology Stack Selection

**Status:** Accepted
**Date:** 2026-11-14
**Deciders:** SeaBrad72-Agent (intent owner)

## Context
We're starting cold-778-a: a small URL-shortener HTTP API for the owner's personal links. It creates a
short link for a long URL and resolves a short link back to it. Success is both paths working through
the API, covered by tests, with green CI. Login, a web UI and analytics are out of scope (charter,
`CLAUDE.md` §1).

The stack was chosen at `sparkwright new`, which asks for the stack before any charter exists. This
record checks that choice against the charter after the fact, rather than deriving it fresh.

## Decision
Use **TypeScript on Node.js (>= 24)**, captured in `profiles/typescript-node.md`, as scaffolded: Node's
built-in `http` server, Vitest for tests, ESLint and `tsc` for lint and type-check. The data store is
not chosen here; it is decided in the design of the first feature slice, inside the db-backed archetype
this project kept at Inception.

## Fit rationale
- **Workload:** the service is IO-bound request-serving with two endpoints and almost no computation.
  Node's event loop handles that shape well, and nothing in it is CPU-bound.
- **Ecosystem / libraries:** everything the charter needs is in the Node standard library (HTTP server,
  URL parsing, random bytes for short codes). No decisive library pulls toward another stack.
- **Team skills:** the owner already builds TypeScript/Node services, so they can read and own the code.
- **Deploy target:** none is required by the charter. A small Node service runs in a container or on a
  managed platform alike, so this choice does not narrow a later deploy decision.

## Alternatives considered
1. **Go** — pros: a single static binary, a strong standard-library HTTP server, low memory.
   Cons: no fit advantage at this size, and the owner's existing work is TypeScript.
2. **Python (FastAPI)** — pros: very little code for a two-endpoint API. Cons: adds a framework
   dependency for what the standard library already covers in Node, and no team-skill advantage.

## Consequences
- Profile in effect: `profiles/typescript-node.md` (selected).
- Easier: the scaffold, CI and conformance checks already match this profile, so the first slice starts
  from a working pipeline.
- Harder: input validation and storage still need choosing (the owner's standards name Zod and Prisma;
  each needs justifying as a new dependency in the slice that adds it).
- Accepted trade-off: the stack was selected before the charter, then checked against it.

## Follow-up
- [x] Profile selected and committed with the incepted baseline
- [ ] CI baseline green on empty project (per profile)
- [ ] `.env.example` seeded from profile
- [ ] Data store chosen in the first feature slice's design
