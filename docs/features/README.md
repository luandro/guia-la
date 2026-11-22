# Feature artifacts

Each feature gets a folder `docs/features/<slug>/` with three files, written
in order (D-15, AI-native SDLC):

1. `intent.md` — problem, outcome, affected users and systems, constraints,
   open questions. The owner reviews it before it is committed.
2. `spec.md` — requirements and design. Flags contradictions with
   [SPEC.md](../../SPEC.md) and [planning/decisions.md](../../planning/decisions.md).
3. `plan.md` — files that change, order of work, risks, rejected options,
   and the tests that prove it. Updated in the same commit when the
   implementation diverges.

Copy [_template/](_template/) to start.
