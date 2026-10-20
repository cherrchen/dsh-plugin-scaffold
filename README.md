<div align="center">

# dsh-plugin-scaffold

中文 | [English](./README.en.md)

</div>

## 项目简介

这是一个最小的 **out-of-tree DSH（DeepSeek Harness）插件脚手架**。它不修改上游任何包，把搭一个 DSH 插件真正需要、却很容易搭错的部分先准备好：

- **bundle 骨架**：兼容性门禁行、宿主服务行、浏览器 client 图锚点行，三行各司其职；
- **host/client 分半构建**：tsdown 产出宿主 ESM 与浏览器闭包工厂，tsc 产出两套声明；
- **兼容性代码契约**：精确版本 allowlist、`unsupported` / `mixed` / `incomplete` 判定、升级车道；
- **完整验证链**：类型检查、lint、单测、组合冒烟、打包门禁、文档检查；
- **工程约定**：AGENTS.md、`.agent/`、`docs/` 九分区、双语 README/CHANGELOG、CI/release/upgrade/diag 工作流。

脚手架当前只提供**可运行的骨架**：`src/service.ts` 暴露一个占位服务，`src/client/index.ts` 的 `apply` 为空。把这里替换成你的插件行为即可，其余基础设施不需要重搭。

## 环境要求

**作为插件使用者**：一个下表中的 DSH 版本（精确匹配，不是范围）。`dsh plugin` 负责安装，无需本地 Node 工具链。

| DSH 系列 | 受支持的版本 |
| --- | --- |
| `0.2.1` | `0.2.1-rc.2` |

**从源码开发**：Node.js `^22.19.0 || >=24`，pnpm `11.25.0`（建议经 corepack 启用）；开发 pin 的 DSH 为 `0.2.1-rc.2`。

## 快速开始

```sh
git clone https://github.com/cherrchen/dsh-plugin-scaffold.git my-dsh-plugin
cd my-dsh-plugin
export CI=true
pnpm install
pnpm verify:all
```

`pnpm verify:all` 会依次跑 lint、typecheck、build、test、组合冒烟、打包门禁与打包冒烟。首次运行需要能访问 npm registry。

### 把它变成你的插件

脚手架里的所有标识都集中在一组明确的 name 上。派生新项目时，按下表替换后再跑 `pnpm verify:all`：

| 位置 | 脚手架当前值 | 替换为 |
| --- | --- | --- |
| `package.json` `name` | `@dsh-electron/dsh-plugin-scaffold` | 你的包名 |
| `package.json` `repository.url` | `git+https://github.com/cherrchen/dsh-plugin-scaffold.git` | 你的仓库地址 |
| `LICENSE` 版权行 | `Copyright (c) 2026 Cherry Chen` | 你的名字或组织 |
| 包名引用（源码/脚本/测试） | `@dsh-electron/dsh-plugin-scaffold` | 你的包名 |
| 环境变量 | `DSH_PLUGIN_SCAFFOLD_COMPAT` | `DSH_<YOUR_PLUGIN>_COMPAT` |
| 兼容性服务键 | `dshPluginScaffoldCompat` | 你的服务键 |
| 宿主服务键 | `dshPluginScaffold` | 你的服务键 |
| Connection 通道 | `/dsh-plugin-scaffold` | 你的通道 |
| patch 行 id | `dsh-plugin-scaffold-compat` / `-service` / `-client` | 你的行 id |
| 文档与计划文件名 | 含 `dsh-plugin-scaffold` 的文件 | 你的文档名 |

一次定位所有需要改的地方：

```sh
grep -rn "dsh-plugin-scaffold\|dshPluginScaffold\|DSH_PLUGIN_SCAFFOLD" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=lib .
```

随后按你的插件实际耦合的包，调整 `src/compat/dsh-version.ts` 里的 `REQUIRED_CORE_PACKAGES`、`OPTIONAL_CORE_PACKAGES` 与 `peerDependencies`；`pnpm compat:check` 会在两处漂移时报错。

## 安装与验证组合

安装进 DSH 运行时并检查组合：

```sh
dsh plugin --profile web add /path/to/repo
dsh --profile web --dump-config | grep -A4 'dsh-plugin-scaffold'
```

预期输出：

```text
# == @dsh-electron/dsh-plugin-scaffold
- id: dsh-plugin-scaffold-compat
  name: '@dsh-electron/dsh-plugin-scaffold/compat'
- id: dsh-plugin-scaffold-service
  name: '@dsh-electron/dsh-plugin-scaffold/service'
- id: dsh-plugin-scaffold-client
  name: '@dsh-electron/dsh-plugin-scaffold'
```

`dsh-plugin-scaffold-compat` 是启动门禁，`dsh-plugin-scaffold-service` 是宿主服务半部（它 inject `dshPluginScaffoldCompat`，门禁不过即不启动），`dsh-plugin-scaffold-client` 挂在裸包名上，是 web 客户端图读取 `dsh.client` 声明的唯一锚点。

> [!TIP]
> `dsh` 不在 PATH 里时（例如用源码仓库跑 DSH），把命令里的 `dsh` 换成 `pnpm dsh`。

## 开发命令

```sh
pnpm compat:check       # allowlist / peers / 开发 pin / 已安装树四者一致
pnpm lint               # oxlint
pnpm typecheck          # host + client 两面，noEmit
pnpm build              # 声明 + tsdown bundle（host ESM + browser client）
pnpm test               # vitest；断言 BUILT lib/ 产物，所以要先 build
pnpm smoke              # smoke:compose，真实 dsh plugin add + --dump-config
pnpm pack:check         # tarball 成员、exports 目标、patch 引用模块
pnpm smoke:packed       # 对打包产物复跑组合冒烟
pnpm docs:check         # 文档结构检查
pnpm verify:all         # 上面除 compat:check 外的完整链
```

## 项目结构

```text
.
├── src/
│   ├── compat.ts                    启动门禁（版本 allowlist 与混装判定）
│   ├── compat/dsh-version.ts        兼容性契约本体：SUPPORTED_DSH_RELEASES、包清单、分类
│   ├── service.ts                   宿主服务半部（占位服务，替换为你的插件行为）
│   ├── client/                      浏览器半部（空 apply，替换为你的槽位贡献）
│   ├── contract.ts                  host/client 共用的 Connection 通道名
│   └── index.ts                     公共面 barrel；空 apply 同时承载裸包名 client 锚点行
├── tests/                           兼容性判定、patch 不变量、client 制品形态
├── scripts/                         冒烟、兼容性检查、打包门禁、升级流程、lefthook 安装器
└── docs/                            需求、架构、ADR、计划、开发流程、参考与故障排查
```

## 贡献指南

1. 先读 [`AGENTS.md`](./AGENTS.md)（仓库级规则）与[开发工作流](./docs/development/plugin-development-workflow.md)。
2. 从 `main` 拉分支；提交信息遵循 conventional commits。
3. PR 前本地必须全部通过：`pnpm verify:all`、`pnpm compat:check`、`pnpm docs:check`。
4. 影响行为的变更需同批更新 `docs/` 下对应文档；README 保持中英双语同步；有取舍的工程决策请新增 ADR。
5. 硬约束：**不修改上游仓库（deepseek-harness）任何包**。

## 已知限制

- 插件行为尚未实现：`service.ts` 只提供 `dshPluginScaffold` 服务键与兼容性裁决，客户端 `apply` 为空。这是刻意的起点，不是缺陷。
- 支持矩阵是精确版本 allowlist：宿主版本不在清单上、或核心包混装了不同版本时，被门禁的服务行**不启动**，组合退化为"没装这个插件"（[ADR-0001](./docs/decisions/ADR-0001-dsh-compat-contract.md)）。
- 上游接缝没有 semver 承诺：升级车道只提供候选版本的证据，提升支持矩阵是人工决策。

## 文档

- [版本变更记录（CHANGELOG）](./CHANGELOG.md)
- [用户指南](./docs/guide/README.md)
- [脚手架需求](./docs/requirements/dsh-plugin-scaffold.md)
- [DSH 插件 bundle 参考](./docs/reference/dsh-plugin-bundle.md)
- [决策记录（ADR）](./docs/decisions/README.md)
- [计划](./docs/plans/README.md)
- [开发工作流](./docs/development/plugin-development-workflow.md)
- [常见问题排查](./docs/troubleshooting/README.md)

Coding Agent 的仓库级规则定义于 [`AGENTS.md`](./AGENTS.md)。

## 许可证

[MIT](./LICENSE)
