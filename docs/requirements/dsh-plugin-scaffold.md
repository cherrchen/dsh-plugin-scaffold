# 需求文档：DSH 插件脚手架（out-of-tree，不改上游）

> 状态：初始化完成（`v0.0.0`，未发布）。进度与发布状态的唯一真源见[路线图 §进度总账](../plans/active/2026-10-20-dsh-plugin-scaffold.md#进度总账)。| 日期：2026-10-20
> **硬约束：不得修改上游仓库（deepseek-harness）中任何包**——全部产物是外部插件/bundle，通过 `dsh plugin add` 或 profile patch 组合安装。
> 机制说明：[DSH 插件 bundle 参考](../reference/dsh-plugin-bundle.md)；排期：[路线图](../plans/active/2026-10-20-dsh-plugin-scaffold.md)

## 1. 需求陈述

未来会有多个 DSH 插件项目。每个插件都必须重复解决同一批问题：bundle patch 怎么挂、host/client 两半怎么构建、client 制品怎么被浏览器启动图发现、兼容性怎么判定、组合是否真的装进去了、文档与 CI 怎么组织。

本仓库提供一个**可直接运行的脚手架**，把这些结构性工作一次性做完，让派生项目从“写插件行为”开始，而不是从“猜上游加载规则”开始。

脚手架不包含任何产品行为：宿主服务是占位实现，客户端 `apply` 为空，所有业务语义留给派生项目。

## 2. 范围

### 2.1 bundle 骨架

- `dsh-plugin-scaffold-compat`：兼容性门禁行，排第一，产出 `dshPluginScaffoldCompat` 服务；
- `dsh-plugin-scaffold-service`：宿主服务行，inject 门禁服务，产出 `dshPluginScaffold` 服务；
- `dsh-plugin-scaffold-client`：挂在裸包名上的 client 图锚点行，只承载 `dsh.client` 声明。

### 2.2 兼容性代码契约

- 精确版本 allowlist（当前 `0.2.1-rc.2`）；
- `supported` / `unsupported` / `mixed` / `incomplete` 四种判定；
- 可选包按“谁加载副本”分为运行时可选与宿主服务两类；
- `DSH_PLUGIN_SCAFFOLD_COMPAT=warn` 仅供升级车道；
- `pnpm compat:check` 守住 allowlist、peerDependencies、开发 pin、已安装树四者一致。

### 2.3 构建与验证链

- host/client 分半 tsc 声明与 tsdown bundle；
- vitest 单元测试（兼容性判定、patch 不变量、client 制品形态）；
- `smoke:compose` 真实 `dsh plugin add` + `--dump-config` 差分；
- `pack:check` 与 `smoke:packed` 针对发布 tarball；
- `docs:check` 文档结构检查。

### 2.4 工程约定

- `AGENTS.md`、`.agent/`（note / templates / documentation skill）；
- `docs/` 九分区；
- 双语 README / CHANGELOG；
- CI / release / upgrade / diag 工作流；
- lefthook 本地提交钩子；
- README 中的派生项目重命名清单。

### 2.5 非目标（任何阶段都不做）

- 不实现任何具体插件功能；派生项目自行替换 `src/service.ts` 与 `src/client/index.ts`。
- 不修改上游仓库任何包。
- 不在升级车道里自动扩大支持矩阵；提升版本始终是人工评审动作。
- 不把上游没有公开承诺的接缝包装成稳定 API。

## 3. 使用方式

派生项目从本仓库模板开始，按 README 的重命名清单替换包名、服务键、通道、环境变量、行 id 与文档名，然后：

1. 调整 `src/compat/dsh-version.ts` 的包清单与 `peerDependencies`，使其对应真实耦合面；
2. 在 `src/service.ts` / `src/client/index.ts` 实现插件行为；
3. 保持 patch 三行结构与兼容性门禁不变；
4. 跑通 `pnpm verify:all`、`pnpm compat:check`、`pnpm docs:check`。

## 4. 风险

| 风险 | 后果 | 缓解 |
| --- | --- | --- |
| 上游加载规则改变 | client 半部静默不加载 | client 锚点行由 `tests/patch.spec.ts` 与 `smoke:compose` 双重钉住；`docs/troubleshooting/client-bundle-not-in-boot-graph.md` 记录机制 |
| 派生项目只改包名、不改包清单 | 门禁检查了错误的耦合面 | `src/compat/dsh-version.ts` 文件头明确要求按真实耦合面调整；`compat:check` 强制 allowlist 与 peers 一致 |
| 有人用 `warn` 绕过生产问题 | 未验证版本上运行插件 | `warn` 只放宽 `unsupported`；`mixed` / `incomplete` 始终 fail-closed；文档与 AGENTS.md 明确唯一合法调用者 |
| 脚手架长期不跟进上游 | 基线版本过期 | `upgrade.yml` 每周探测候选版本，绿灯后由人工提升矩阵 |

## 5. 验收标准

- `dsh plugin add` 安装后 `--dump-config` 恰好多出三行（compat / service / client-anchor），其余逐字节相同（`smoke:compose`）。
- 支持清单外或混装宿主上，被门禁的插件行不启动且 profile 完好。
- `pnpm verify:all`、`pnpm compat:check`、`pnpm docs:check` 全绿。
- 仓库内不存在任何特定产品的命名、文件名或业务代码。
