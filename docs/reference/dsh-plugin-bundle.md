# DSH 插件 bundle 参考

本文记录一个 out-of-tree DSH 插件从包清单到浏览器加载的稳定机制。它是本脚手架的参考事实，也是派生项目改动这些结构时的约束依据。

## 1. 包清单里的四个声明

| 字段 | 作用 |
| --- | --- |
| `exports` | 宿主与浏览器加载的入口：`.`、`./compat`、`./service`、`./client` |
| `files` | 发布 tarball 必须携带的文件；`lib/*.js`、`lib/types/**/*.d.ts`、`cordis.patch.yml`、README/CHANGELOG/LICENSE |
| `dsh.bundle.patch` | 指向 bundle patch，`dsh plugin add` 把它追加为组合层 |
| `dsh.client` | 声明 web 客户端平台与客户端依赖；只有被裸包名 loader 行扫描时才会被读取 |

## 2. 三行 patch 各做什么

`cordis.patch.yml` 只插入本插件的行，不 disable 上游任何能力：

```text
dsh-plugin-scaffold-compat    →  ./compat   启动门禁，产出 dshPluginScaffoldCompat
dsh-plugin-scaffold-service   →  ./service  宿主服务，inject 门禁服务
dsh-plugin-scaffold-client    →  <裸包名>   client 图锚点，只承载 dsh.client
```

顺序是契约的一部分：门禁行必须在所有 inject `dshPluginScaffoldCompat` 的行之前。cordis 不启动 injected service 缺失的行，所以门禁拒绝时后续行**不存在**，组合退化为“没装这个插件”，profile 本身保持完好。

## 3. client 图为什么必须挂裸包名

web 客户端模块扫描读取每个 loader 行的 `name`，用它解析包清单并读取 `dsh.client`。解析入口对子路径 specifier 直接短路——子路径行永远不是 client 行。因此：

- 只挂 `./compat`、`./service` 这类子路径行时，浏览器永远不会加载 `lib/client.js`；
- 必须保留一行 `name` 恰为裸包名的载体行，即使它的 `apply` 什么都不做。

回归防护：`tests/patch.spec.ts` 断言锚点行的存在与裸包名形态；`scripts/smoke-compose.mjs` 在真实安装链上断言三行插入。症状与诊断见[故障排查](../troubleshooting/client-bundle-not-in-boot-graph.md)。

## 4. 浏览器制品的唯一形态

Web 客户端只接受一种制品：一个 CJS 闭包工厂，通过 `window.__ModuleLoader__.load` 注册在确切包名下：

```js
window.__ModuleLoader__.load({ id: '<package-name>', factory: (require) => {
  // bundle body
  return module.exports
} })
```

`tsdown.config.ts` 的 client 配置负责生成 banner/footer/intro。模块表只 seed 少量共享词（react、cordis、部分 client 包），其余全部内联；因此 bundle 里不得出现相对模块 specifier，否则 `pack:check` 会把注释里的路径也当成缺失的 import。

## 5. host / client 两半的通信

- 宿主半部（`src/service.ts`）持有服务与真实逻辑；
- 浏览器半部（`src/client/index.ts`）通过 `connection` 服务打开 `src/contract.ts` 里的 `CHANNEL`；
- 两半共享的只有通道名，不共享运行时对象；通道名在 client bundle 构建时内联。

脚手架当前不建立通道端点，也不注册槽位贡献——这是派生项目要填的部分。

## 6. 兼容性门禁

`src/compat/dsh-version.ts` 是支持矩阵的唯一真源。运行时由 `src/compat.ts` 判定并注册 `dshPluginScaffoldCompat`；静态由 `scripts/check-dsh-compat.mjs` 检查 allowlist、peerDependencies、开发 pin 与已安装树一致。

判定分四种：`supported`、`unsupported`（版本统一但不在 allowlist）、`mixed`（核心包版本不一致）、`incomplete`（必需包缺失）。`DSH_PLUGIN_SCAFFOLD_COMPAT=warn` 只放宽连贯但未列入的 `unsupported`，且唯一合法调用者是升级车道。设计理由见 [ADR-0001](../decisions/ADR-0001-dsh-compat-contract.md)。

## 7. 构建产物

| 产物 | 生产者 | 消费者 |
| --- | --- | --- |
| `lib/index.js`、`lib/compat.js`、`lib/service.js` | tsdown host 配置 | 宿主 loader |
| `lib/client.js` + sourcemap | tsdown client 配置 | 浏览器模块表 |
| `lib/types/**/*.d.ts` | `tsc -p tsconfig.host.json` / `tsconfig.client.json` | TypeScript 消费者 |

`lib/` 不进 Git；`pnpm test` 断言的是构建后的字节，所以必须先 `pnpm build`。
