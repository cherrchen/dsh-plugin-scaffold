# User Guide

中文：[README.md](./README.md)

The user-facing guide: the top-level README covers the "how"; this guide fills in the "why" and the exact semantics, for the moments the defaults don't cover.

## Contents

- [Why the supported matrix is an exact list](#why-the-supported-matrix-is-an-exact-list)
- [What the composition actually does](#what-the-composition-actually-does)
- [Differences between install sources](#differences-between-install-sources)
- [How to turn this into your plugin](#how-to-turn-this-into-your-plugin)

## Why the supported matrix is an exact list

Both halves of this plugin sit on seams upstream makes **no semver promise** for: the client slot names, the Connection channel, and the composition rows' mount semantics. So `peerDependencies` names only the releases that have actually been through the full verification, and startup checks again: if the host's release is not on the list, or several `@deepseek-ai/dsh-*` packages disagree about which release they are, the gated service row **does not start**, the composition degrades to "this plugin is not installed", and one explanatory line is logged. To diagnose, see [troubleshooting](../troubleshooting/unsupported-dsh-release.md); for the reasoning, [ADR-0001](../decisions/ADR-0001-dsh-compat-contract.md).

## What the composition actually does

`cordis.patch.yml` does exactly one thing: it inserts this plugin's three rows into the upstream bundle — the compatibility gate, the host service half, and the client-graph anchor mounted at the bare package name. It **disables nothing** upstream. What each row is for — and why the bare-name row cannot be skipped — is covered by the [DSH plugin bundle reference](../reference/dsh-plugin-bundle.md) and [troubleshooting](../troubleshooting/client-bundle-not-in-boot-graph.md).

## Differences between install sources

- **npm / tarball (once published)**: pre-built artifacts, ready to use.
- **GitHub**: delivers source code, built automatically during `add` by the package's own `prepare` script (a direct bundle of `src/`, no type-checking), so `allowBuilds` has to cover this package itself. With no ref the install tracks the head of `main`; a version ref like `#vX.Y.Z` pins the content.
- **From source**: pnpm `link:` links the local checkout; dependencies are already installed in this repository and no `allowBuilds` is needed — but `pnpm build` must run first to produce `lib/` (not tracked by Git).

When running DSH from a source checkout, `dsh` is not on PATH — replace `dsh` in the commands with `pnpm dsh`.

## How to turn this into your plugin

This repository is a template. The first step for a derived project is not writing features but completing the rename table in the README ("Turning it into your plugin") and adjusting the package lists in `src/compat/dsh-version.ts`. After that, implement `src/service.ts` and `src/client/index.ts`.

Do not remove any of the three patch rows: the gate row keeps the plugin from starting on an unverified host, and the client anchor row lets the browser discover the `dsh.client` declaration.
