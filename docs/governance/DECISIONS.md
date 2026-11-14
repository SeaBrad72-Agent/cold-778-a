# The decision record — cold-778-a

Your project's ledger of rulings. The entry contract (§1 of your project guide) tells every agent to
search this file before changing a surface — so a ruling that lives only in a chat transcript does
not exist.

**Status:** in use — 1 ruling (`D-261114-1`).

---

## 1. Why this file exists

Most artifacts record **conclusions** and discard the **decision record**: who decided, when, on what
basis, what it supersedes, and what would reverse it. Conclusions stripped of their reasoning read as
confident, cannot be defended when challenged, and get silently re-derived by the next session or the
next agent. The people who were in the room become the only durable store.

This file is the index the rest point into — the single answer to *"what was already decided about
this?"* ADRs, design docs and promotion records all cite into it.

## 2. How to use it

- **Before proposing anything that reverses, deletes, defers or re-sequences work — or that proposes
  a new mechanism on a surface an earlier ruling already touched — search this file.** A mechanism
  proposal counts: the failure is not only "reversing a ruling", it is re-deriving one from scratch.
- **Every entry carries a verbatim quote and a citation** (a path, a heading, or a commit SHA) so any
  row can be spot-checked in seconds. A row you cannot verify from its citation is a defect — say so.
- **`REVISIT-CONDITION` is load-bearing.** A ruling whose condition is unmet is not available to be
  scheduled. Scheduling it anyway is how a settled question gets re-opened by accident.
- **Reversing a ruling requires a new entry that names the one it overturns.** Silent contradiction
  is rejected. The old entry stays: the record is append-only, because its value is the history.

## 3. The grammar of a ruling

Each ruling is one block. The **header line starts at column 1** and opens with the id in backticks —
that is what tooling matches, so keep the shape exactly:

```markdown
**`D-YYMMDD-N` · <kind> · <the ruling, in one sentence, as a decided thing.>**

**BASIS:** what the decision rests on — the evidence, the measurement, the trade-off accepted.
**SUPERSEDES:** the id(s) this overturns, or `none`.
**REVISIT-CONDITION:** the fact that would make this worth re-opening, or `none`.
```

- **id** — `D-` then the date as six digits (`YYMMDD`), then `-` and a number that restarts each day.
  Sub-points of one ruling are `.1`, `.2` on the same id; they never get their own header.
- **kind** — `ruling` · `greenlight` · `deletion` · `supersession` · `deferral` · `re-confirmation`.
- **one sentence** — write the DECISION, not the discussion. If it needs a paragraph, the paragraph
  goes in `BASIS`.
- **who and when** — the date is in the id; the ratifier is whoever the project's Definition of Done
  names. Record the name if more than one person can ratify.

## 4. Rulings

*(Add the newest at the top, so the current state is the first thing read.)*

**`D-261114-1` · ruling · The merge relationship is solo: `.kit/dials.conf` carries `MERGE_RELATIONSHIP=solo`, and `main` keeps its branch protection unchanged.**

**BASIS:** The project runs under one forge account (`SeaBrad72-Agent`), so a non-author approval can never exist and team cannot work. Declared through the kit's route in `docs/adoption/vc-hosts.md` §Solo or team; design `docs/architecture/2026-11-14-solo-and-disclosure-design.md` (row `INCEPT-1`). Quote: "One forge account. `MERGE_RELATIONSHIP=solo` in `.kit/dials.conf`, merged once by hand." Accepted trade-off: a solo GO is self-asserted by name, with no server-side kill switch. Branch protection (required `control-plane-ratification`, one required approval, `enforce_admins:false`) stays as it is and must not be relaxed to let `land` or `actuate` succeed; the owner admin-merges what protection blocks.
**SUPERSEDES:** none.
**REVISIT-CONDITION:** a second person with write access joins, or the agent gets its own limited forge account (`docs/operations/forge-identity-switch.md`); then move to team with `sh scripts/sparkwright team`.
