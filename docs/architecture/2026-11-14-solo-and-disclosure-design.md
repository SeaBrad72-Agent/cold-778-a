# Design: declare solo and make the disclosure channel live (INCEPT-1)

**Row:** `INCEPT-1` · **Class:** control-plane (derived by `conformance/promotion-readiness.sh --class`)
**Lane:** small control-plane lane (`skills/design/SKILL.md` §When to use): under 50 non-test lines, adds
no mechanism. This short file and its lens table are the design GO's only basis. The plan file, the
review record and the security pass are still owed.
**Date:** 2026-11-14 · **Owner:** SeaBrad72-Agent

## Problem
Two items from the Inception "Owed" list are still open.

1. **The repository reads team.** It runs under one forge account, so only the solo merge relationship
   can work. Until `.kit/dials.conf` carries `MERGE_RELATIONSHIP=solo` on `main`, the kit's merge verbs
   and `sparkwright doctor` read team, which needs a second approver this project does not have.
2. **SECURITY.md names a placeholder channel repo.** Its `Channel repo:` line still reads `[owner/repo]`.
   Private vulnerability reporting was enabled on the repository by the owner on 2026-11-14.

## Decision
- Create `.kit/dials.conf` holding the single line `MERGE_RELATIONSHIP=solo`, as
  `docs/adoption/vc-hosts.md` §Solo or team prescribes.
- In `SECURITY.md`, replace `` `[owner/repo]` `` with `` `SeaBrad72-Agent/cold-778-a` ``. Nothing else in
  the file changes; the response-time defaults stay as shipped.
- Record the solo choice as ruling `D-261114-1` in `docs/governance/DECISIONS.md`, so a later agent
  searching for the merge relationship finds it (review round 1 finding).
- Branch protection stays exactly as applied: the required `control-plane-ratification` context and the
  one required approval still block an agent-run `land` or `actuate`, because no non-author approval
  can exist on one account. The owner admin-merges such PRs. Protection must not be relaxed to make
  `land` succeed; it is the only server-side stop (security round 1 finding).

## Approaches considered
1. **One PR for both (chosen).** Both are control-plane and each control-plane PR costs a full CI run
   and an owner GO; START-HERE §Solo or team says to batch them.
2. **Two PRs.** Cleaner history, but double the CI time and double the owner's GO acts for two
   one-line changes.
3. **Leave SECURITY.md for later.** It keeps advertising a placeholder repo, and
   `conformance/security-policy.sh` fails on the placeholder.

## Lens review

| # | Lens | Finding |
|---|---|---|
| 1 | Project principles | Holds. Security is foundational: the advertised disclosure channel becomes real. No principle bends. |
| 2 | Friction | Removes friction for the owner: the kit's verbs accept the owner's recorded GO with no second approver to find. Branch protection still requires the owner's admin merge on this repo (see Decision). Costs the owner one GO record and one hand merge per protected PR. |
| 3 | Software practice | It is the kit's documented route for both items, not a custom one. |
| 4 | Agentic practice | The agent writes two small files. It can verify the dial with `sparkwright doctor` after merge and the channel with `conformance/security-channel-live.sh`. It must trust the owner's GO, which it records but cannot authenticate. |
| 5 | CI | One full control-plane CI run (about 24 minutes per START-HERE, measured by the kit, not here). No new gate, no new flake surface. |
| 6 | DevOps and operations | No deploy. Rollback is a revert PR that deletes the dial and restores the line. Signal: `doctor` prints `merge relationship: solo`. |
| 7 | Security, privacy and guardrails | **Capability: yes, bounded.** With solo declared, the kit's merge verbs accept the owner's recorded GO alone, with no second approver and no server-side kill switch (`docs/adoption/vc-hosts.md`). This is the accepted solo trade-off for a one-account project. Data: none touched. No regulatory obligation. Definition of Ready flags: threat model no, privacy review no, evals no, compliance no. |
| 8 | Cost and efficiency | Build: minutes (estimate). Run: zero. CI: one run (about 24 minutes, kit's measurement). Ships in this project only. Size: 2 changed lines plus this file. |
| 9 | Product | Need: the owner must be able to merge their own work, and reporters need a working private channel. Metric: `doctor` reads solo, and `security-channel-live.sh` prints PASS. |
| 10 | Design | Smallest shape: one new line in one new file, and one replaced token. Nothing smaller closes both items. |
| 11 | Architecture | Uses the dial seam the kit already reads (`.kit/dials.conf`). No contract or neutrality change. |
| 12 | UX and accessibility | No user-facing surface. The owner sees `doctor` change from "undeclared — reads team" to "solo". |

## Design-promised controls

| Control | Discharged by |
|---|---|
| The dial reads solo once merged | `sh scripts/sparkwright doctor` prints `merge relationship: solo` after merge |
| The disclosure channel is live and names this repository | `sh conformance/security-channel-live.sh` prints PASS (probe plus wrong-repo guard) |
| The security policy carries no placeholder | `sh conformance/security-policy.sh` passes |
| The owner's GO is on the trail | `sh scripts/promotion-verify.sh record` on the PR head sha, class control-plane |
