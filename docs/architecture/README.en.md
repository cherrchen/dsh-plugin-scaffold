# Architecture

中文：[README.md](./README.md)

## What Belongs Here

- Current Architecture;
- Target Architecture;
- Subsystem design;
- Component boundaries;
- Data flow;
- Interfaces.

## What Does Not Belong Here

- Requirements (goes to `../requirements/`);
- Decision records (goes to `../decisions/`);
- Implementation plans (goes to `../plans/`).

## Important Rule

Do not present Proposals or Target Architecture as facts about the currently implemented system.

Documents describing future designs must clearly state their status.

## Current State

No standalone architecture document yet. The scaffold's current structure is described by the top-level README's "Project structure" and the [DSH plugin bundle reference](../reference/dsh-plugin-bundle.md); the trade-offs made so far live in `../decisions/` as ADRs. Derived projects should add their own architecture design once they implement real plugin behavior.

## Naming Convention

Use lowercase kebab-case, for example:

```text
<subsystem-or-topic>.md
```
