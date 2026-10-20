# Plans

中文：[README.md](./README.md)

## What Belongs Here

Implementation plans for large development tasks, such as:

- Features;
- Refactors;
- Migrations;
- Architectural changes.

## Directory Layout

```text
active/     plans that are in progress or not yet started
completed/  completed plans
```

When a task is finished, move its plan from `active/` to `completed/`:

```text
active/
→
completed/
```

Plans with long-term reference value should not be deleted.

## What Does Not Belong Here

- Scratch TODOs for small tasks;
- Abandoned drafts with no reference value (just delete those);
- Formal design documents (goes to `../architecture/`, or use `../../.agent/templates/design.md`).

## Current State

active:

- [2026-10-20-dsh-plugin-scaffold.md](./active/2026-10-20-dsh-plugin-scaffold.md) — the DSH plugin scaffold development path and **progress ledger**: initialization (bundle skeleton, compatibility contract, build/verification chain, documentation system) is complete; `v0.0.0` unreleased.

completed: none yet.

### Numbering

- This repository only has an initialization stage; derived projects define their own milestones.
- Single source of truth: the roadmap's [progress ledger](./active/2026-10-20-dsh-plugin-scaffold.md#进度总账).

## Naming Convention

Use lowercase kebab-case, for example:

```text
YYYY-MM-DD-<short-title>.md
```

See the `.agent/templates/plan.md` template.
