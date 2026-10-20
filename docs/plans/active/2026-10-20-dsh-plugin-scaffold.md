# DSH 插件脚手架开发路径与进度总账

> 状态：初始化完成 | 日期：2026-10-20
> 本文档同时是路线图与**进度总账**——进度、编号与发布状态的唯一真源。需求见[脚手架需求](../../requirements/dsh-plugin-scaffold.md)，机制见[bundle 参考](../../reference/dsh-plugin-bundle.md)，兼容性契约见 [ADR-0001](../../decisions/ADR-0001-dsh-compat-contract.md)。

## 进度总账

| 阶段 | 内容 | 状态 | 发布 |
| --- | --- | --- | --- |
| 初始化 | bundle 骨架（compat/service/client-anchor 三行）、兼容性契约、host/client 构建、tests、组合冒烟、打包门禁、lefthook、CI/release/upgrade/diag 工作流、docs 体系、双语 README/CHANGELOG、派生项目重命名清单 | 完成（2026-10-20） | 未发版（`v0.0.0`） |
| 派生 | 由使用者在派生项目中替换占位行为（`src/service.ts`、`src/client/index.ts`）并按 README 重命名 | 不属于本仓库里程碑 | — |

### 初始化（2026-10-20）

本仓库提供一个与具体产品无关的 out-of-tree DSH 插件骨架。结构包含：根 README/CHANGELOG 双语对、AGENTS.md、`.agent/`（note 双语对、templates、documentation skill）、docs 九分区（requirements/architecture/decisions/plans/development/guide/reference/troubleshooting + plans active/completed）、lefthook 提交钩子（`scripts/install-lefthook.mjs` + `lefthook.yml` + `pnpm hooks:install` 手动安装）、`.github/workflows/`（ci / release / upgrade / diag）、pnpm `11.25.0` + Node `^22.19.0 || >=24`、tsdown 双 face 构建、vitest + oxlint、`compat:check` 静态门禁、`pack:check` / `smoke:packed` 打包门禁、`upgrade-dsh.mjs` 升级车道。

插件行（`cordis.patch.yml` 的 insert，恰好三行）：

| id | name | 职责 |
| --- | --- | --- |
| `dsh-plugin-scaffold-compat` | `…/compat` | 启动门禁：`classifyInstallation()` 判定，`unsupported`/`mixed`/`incomplete` 抛 `DshCompatUnsupportedError` |
| `dsh-plugin-scaffold-service` | `…/service` | 宿主服务半部：`dshPluginScaffold` 服务键（inject `dshPluginScaffoldCompat`） |
| `dsh-plugin-scaffold-client` | 裸包名 | client 图锚点：web 客户端图只从裸包名行读 `dsh.client` |

**验证证据（2026-10-20）**：`pnpm verify:all` 全绿——lint / typecheck / build（`lib/index.js`、`lib/service.js`、`lib/compat.js` + `lib/client.js` 闭包工厂）/ vitest 39 通过（1 项升级车道用例在 enforce 模式下按设计跳过）/ `smoke:compose` 17 项通过（真实 `dsh plugin add` 后 `--dump-config` 逐字节对照：恰好三行插入、上游行零改动）/ `pack:check`（tarball 19 成员齐全、import 图闭合）/ `smoke:packed` 对打包产物复跑组合冒烟通过；`pnpm compat:check` 与 `pnpm docs:check` 独立通过。

**一处对常见约定的偏离**：`postinstall` 自动装钩子在 npm 包里是错的——`dsh plugin add` 安装的 tarball 会把 `postinstall` 当构建脚本拦下（`ERR_PNPM_IGNORED_BUILDS`），`smoke:packed` 可复现。改为 `pnpm hooks:install` 手动安装，消费者零副作用。

## 派生项目如何使用

1. 按 README「把它变成你的插件」替换包名、服务键、通道、环境变量、行 id 与文档名。
2. 调整 `src/compat/dsh-version.ts` 的包清单与 `peerDependencies`，使其对应真实耦合面。
3. 在 `src/service.ts` 与 `src/client/index.ts` 实现插件行为，保留三行 patch 结构与门禁注入。
4. 跑通 `pnpm verify:all`、`pnpm compat:check`、`pnpm docs:check`。

## 里程碑纪律

- 派生项目自行建立 `plans/active|completed/YYYY-MM-DD-*.md`；本仓库不再规划产品里程碑。
- 发版由 tag 触发（`pnpm release <kind> --tag`）；发版前先把本表与 CHANGELOG 同步，三者同批提交（见[发版流程](../../development/release-workflow.md)）。
