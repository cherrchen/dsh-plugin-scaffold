<div align="center">

# dsh-plugin-scaffold

[中文](./README.md) | English

</div>

## Overview

This is a minimal **out-of-tree DSH (DeepSeek Harness) plugin scaffold**. It modifies no upstream package and prepares the parts a DSH plugin genuinely needs but easily gets wrong:

- **Bundle skeleton**: a compatibility gate row, a host service row, and a browser client-graph anchor row, each with a distinct job;
- **Host/client split build**: tsdown emits the host ESM face and the browser closure factory, while tsc emits both declaration sets;
- **Compatibility as a code contract**: an exact-version allowlist, `unsupported` / `mixed` / `incomplete` verdicts, and an upgrade lane;
- **Complete verification chain**: typecheck, lint, unit tests, composition smoke, pack gate, documentation check;
- **Engineering conventions**: AGENTS.md, `.agent/`, the nine `docs/` sections, bilingual READMEs/CHANGELOG, and CI/release/upgrade/diag workflows.

The scaffold currently ships a **runnable skeleton**: `src/service.ts` exposes a placeholder service and `src/client/index.ts` has an empty `apply`. Replace those with your plugin's behavior; the rest of the infrastructure does not need rebuilding.

## Requirements

**Using the plugin**: one of the DSH releases below (exact match, not a range). `dsh plugin` handles installation; no local Node toolchain is needed.

| DSH line | Supported releases |
| --- | --- |
| `0.2.1` | `0.2.1-rc.2` |

**Developing from source**: Node.js `^22.19.0 || >=24`, pnpm `11.25.0` (enable via corepack); the development pin is DSH `0.2.1-rc.2`.

## Quick start

```sh
git clone https://github.com/cherrchen/dsh-plugin-scaffold.git my-dsh-plugin
cd my-dsh-plugin
export CI=true
pnpm install
pnpm verify:all
```

`pnpm verify:all` runs lint, typecheck, build, tests, the composition smoke, the pack gate, and the packed smoke in order. The first run needs access to the npm registry.

### Turning it into your plugin

Every identifier in the scaffold is concentrated in a small set of names. When deriving a new project, replace the following and rerun `pnpm verify:all`:

| Location | Current scaffold value | Replace with |
| --- | --- | --- |
| `package.json` `name` | `@dsh-electron/dsh-plugin-scaffold` | your package name |
| `package.json` `repository.url` | `git+https://github.com/cherrchen/dsh-plugin-scaffold.git` | your repository URL |
| `LICENSE` copyright line | `Copyright (c) 2026 Cherry Chen` | your name or organization |
| Package-name references (source/scripts/tests) | `@dsh-electron/dsh-plugin-scaffold` | your package name |
| Environment variable | `DSH_PLUGIN_SCAFFOLD_COMPAT` | `DSH_<YOUR_PLUGIN>_COMPAT` |
| Compatibility service key | `dshPluginScaffoldCompat` | your service key |
| Host service key | `dshPluginScaffold` | your service key |
| Connection channel | `/dsh-plugin-scaffold` | your channel |
| Patch row ids | `dsh-plugin-scaffold-compat` / `-service` / `-client` | your row ids |
| Documentation and plan filenames | the files containing `dsh-plugin-scaffold` | your document names |

Locate every place that needs changing:

```sh
grep -rn "dsh-plugin-scaffold\|dshPluginScaffold\|DSH_PLUGIN_SCAFFOLD" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=lib .
```

Then adjust `REQUIRED_CORE_PACKAGES`, `OPTIONAL_CORE_PACKAGES`, and `peerDependencies` in `src/compat/dsh-version.ts` to the packages your plugin actually couples to; `pnpm compat:check` fails when the two drift apart.

## Install and verify the composition

Install into a DSH runtime and inspect the composition:

```sh
dsh plugin --profile web add /path/to/repo
dsh --profile web --dump-config | grep -A4 'dsh-plugin-scaffold'
```

Expected output:

```text
# == @dsh-electron/dsh-plugin-scaffold
- id: dsh-plugin-scaffold-compat
  name: '@dsh-electron/dsh-plugin-scaffold/compat'
- id: dsh-plugin-scaffold-service
  name: '@dsh-electron/dsh-plugin-scaffold/service'
- id: dsh-plugin-scaffold-client
  name: '@dsh-electron/dsh-plugin-scaffold'
```

`dsh-plugin-scaffold-compat` is the boot gate, `dsh-plugin-scaffold-service` is the host half (it injects `dshPluginScaffoldCompat`, so a refused gate means it never starts), and `dsh-plugin-scaffold-client` is mounted at the bare package name — the only anchor from which the web client graph reads this package's `dsh.client` declaration.

> [!TIP]
> When `dsh` is not on PATH (e.g. running DSH from a source checkout), replace `dsh` in the commands with `pnpm dsh`.

## Development commands

```sh
pnpm compat:check       # allowlist / peers / dev pin / installed tree agree
pnpm lint               # oxlint
pnpm typecheck          # both host and client faces, noEmit
pnpm build              # declarations + tsdown bundle (host ESM + browser client)
pnpm test               # vitest; asserts the BUILT lib/ artifacts, so build first
pnpm smoke              # smoke:compose — real dsh plugin add + --dump-config
pnpm pack:check         # tarball members, exports targets, patch-referenced modules
pnpm smoke:packed       # the composition smoke against the packed tarball
pnpm docs:check         # documentation structure check
pnpm verify:all         # the full chain above minus compat:check
```

## Project structure

```text
.
├── src/
│   ├── compat.ts                    the boot gate (version allowlist and mixed-install verdicts)
│   ├── compat/dsh-version.ts        the compatibility contract itself: SUPPORTED_DSH_RELEASES, package lists, classification
│   ├── service.ts                   the host half (placeholder service; replace with your plugin behavior)
│   ├── client/                      browser half (empty apply; replace with your slot contributions)
│   ├── contract.ts                  the Connection channel name shared by both halves
│   └── index.ts                     public-surface barrel; its no-op apply also backs the bare-name client-graph anchor row
├── tests/                           compatibility verdicts, patch invariants, client-artifact shape
├── scripts/                         smokes, compatibility check, pack gate, upgrade flow, lefthook installer
└── docs/                            requirements, architecture, ADRs, plans, development, reference, troubleshooting
```

## Contributing

1. Read [`AGENTS.md`](./AGENTS.md) (repository rules) and the [development workflow](./docs/development/plugin-development-workflow.md) first.
2. Branch from `main`; commit messages follow conventional commits.
3. Before opening a PR, all of the following must pass locally: `pnpm verify:all`, `pnpm compat:check`, `pnpm docs:check`.
4. Changes that affect behavior must update the corresponding documents under `docs/` in the same change; keep the bilingual READMEs in sync; add an ADR for engineering decisions with trade-offs.
5. Hard constraint: **do not modify any package in the upstream repository (deepseek-harness)**.

## Known limitations

- The plugin behavior has not been implemented yet: `service.ts` provides only the `dshPluginScaffold` service key and the compatibility verdict, and the client `apply` is empty. That is the deliberate starting point, not a defect.
- The support matrix is an exact-version allowlist: when the host release is unlisted, or core packages mix releases, the gated service row **does not start** and the composition degrades to "plugin not installed" ([ADR-0001](./docs/decisions/ADR-0001-dsh-compat-contract.md)).
- Upstream seams make no semver promise: the upgrade lane supplies evidence about a candidate, and promoting the support matrix remains a human decision.

## Documentation

- [CHANGELOG](./CHANGELOG.md)
- [User guide](./docs/guide/README.md)
- [Scaffold requirements](./docs/requirements/dsh-plugin-scaffold.md)
- [DSH plugin bundle reference](./docs/reference/dsh-plugin-bundle.md)
- [Architecture Decision Records](./docs/decisions/README.md)
- [Plans](./docs/plans/README.md)
- [Development workflow](./docs/development/plugin-development-workflow.md)
- [Troubleshooting](./docs/troubleshooting/README.md)

Repository rules for Coding Agents are defined in [`AGENTS.md`](./AGENTS.md).

## License

[MIT](./LICENSE)
