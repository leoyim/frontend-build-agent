# 参考资料

> **诚实声明（请先读）**
>
> 本文件只列**实际核验过的来源**，并标注核验方式与粒度。
>
> 课程进行中的核验方式是**联网检索官方文档 / 官方站点 / 发布记录**，核验日期集中在 **2026-10-10**。
>
> **粒度说明**：过程记录中只逐字保留了**一个**完整 URL（Vite 依赖预构建文档）。其余来源是在**官方站点 / 官方仓库 / 官方博客**这一层级记录的，**未逐字保留具体 URL 与版本快照**。本文件如实标注这一差别 —— 需要精确引用时，请到对应官方站点核对当前内容。
>
> **凡本书中标注为【待验证】的结论，其来源均不在本文件内** —— 它们是没有来源的推断。

---

## 一、逐字记录过 URL 的来源

| # | 来源 | 支撑的结论 | 章节 |
|---|---|---|---|
| 1 | `https://vite.dev/guide/dep-pre-bundling` | 依赖预构建的**两个目的**（CJS/UMD → ESM 兼容 + 性能）；`lodash-es` 600+ 内部模块 → 600+ 请求；执行者为 **Rolldown**（早期 esbuild） | §3.2 |

---

## 二、按官方站点层级记录（未逐字保留 URL）

### 官方文档

| 来源 | 类型 | 支撑的结论 | 章节 |
|---|---|---|---|
| **Webpack 官方文档** — Concepts 系列 | 机制文档 | 依赖图三动作、Loader / Plugin 概念、`module.rules` 与 `plugins` 的关系 | §2.1–§2.3 |
| **Webpack 官方文档** — Asset Modules | 机制文档 | 静态资源 "without configuring additional loaders" 的原文表述，以及仍需 `type` 声明的精度修正 | §3.3 |
| **Webpack 官方文档** — Optimization / SplitChunksPlugin | API 文档 | `chunks` 默认 `'async'`；`minChunks` 的语义 | §2.2、§2.5 |
| **Webpack 官方文档** — Devtool | API 文档 | devtool 各值的速度 / 质量梯度 | §2.7 |
| **Webpack 官方文档** — Cache | API 文档 | `cache: { type: 'filesystem' }` | §5.3 |
| **Vite 官方文档** — Why Vite | 机制文档 | 打包式 vs 原生 ESM 的架构差异 | §3.1 |
| **Vite 官方文档** — Env Variables and Modes | 机制文档 | `VITE_` 前缀、`loadEnv`、`import.meta.env` 为静态替换 | §3.4 |
| **Vite 官方文档** — Build Options | API 文档 | `build.sourcemap` 默认 `false`；`build.lib.formats`；`forwardConsole` | §2.7、§7.5、§6.3 |
| **Vite 官方文档** — Features（静态资源后缀） | API 文档 | `?raw` / `?url` / `?inline` | §3.5 |
| **Rollup 官方文档** — Plugin Development | 机制文档 | Rollup 插件钩子（含 `generateBundle` 等在 dev 下不触发的钩子） | §3.5 |

### 官方站点 / 官方仓库（工具事实）

| 来源 | 支撑的结论 | 章节 |
|---|---|---|
| **Rspack 官方站点** | 1.0 发布与 production-ready 声明；"10x faster than webpack"；loader runner 完全兼容；top 50 插件 >80%；`builtin:swc-loader` 推荐；采用了 Module Federation 2.0；采用方名单（字节内部 >1000 应用、微软 / 亚马逊 / 阿里 / Discord） | §4.3 |
| **Rspack 迁移文档 + `rspack-compat` 仓库** | `HtmlWebpackPlugin` → `HtmlRspackPlugin`、`MiniCssExtractPlugin` → `CssExtractRspackPlugin`、`css-loader` → 内置、`resolve.plugins` 不支持；逐插件兼容起始版本 | §4.3、§7.6 |
| **Farm 官方站点** | `vitePlugins`；Farm JS 插件必须配 `filters`；Partial bundling；三类插件的划分 | §4.3 |
| **Next.js / Turbopack 官方发布记录** | Next.js 15.0 中 `next dev` 稳定；**Next.js 16.0（2025-10-21）dev 与 build 双双稳定并成为默认**；`--webpack` 退回；`webpack()` 配置导致 `next build` 失败；三条设计（单图 / 函数级增量落盘 / dev 懒编译）；转换用 SWC、CSS 用 Lightning CSS、不做类型检查；`experimental.turbo.rules`；Sass `~` 前缀不支持 | §4.4 |
| **Vercel 官方口径** | Turbopack 生产构建快 2–5x、Fast Refresh 快至 10x（厂商自测） | §4.4 |
| **Rolldown / VoidZero 官方博客与发布记录** | 时间线（2024-04 首发 → 2026-05-07 1.0 稳定）；基于 Oxc；Rollup 插件 API 兼容；Vite 8（2026-03-12）成为默认；比 Rollup 快 10–30x 的官方口径；真实案例（Linear 46s→6s、GitLab 2.5min→22s、Ramp -57%、Beehiiv -64%、Mercedes-Benz.io -38%）；Node 20.19+ / 22.12+ 与 ESM-only；Yarn PnP 兼容问题；`build.rolldownOptions` | §4.4、§4.5 |
| **Cloudflare 官方公告**（VoidZero 加入 Cloudflare，2026-06-04） | agents as users 原话；agent 对工具的三项要求；"For agents, speed is a reliability requirement"；`@cloudflare/vite-plugin` 周下载量与解释；100 万美元 Vite 生态基金；Vite 保持 MIT / 厂商中立 | §6.1、§6.3 |

### 社区实践（AI 辅助构建部分）

| 来源 | 支撑的结论 | 章节 |
|---|---|---|
| `@paretools/build`、`cpp-build-mcp` 一类 **MCP build server** | 结构化诊断（file / line / column / severity / message / code）；两步式（摘要 → 详情）；原始日志不进上下文窗口 | §6.3 |
| **Frontman、Stagewise** 一类运行时感知工具 | 以 dev server 中间件 / 浏览器代理形式，通过 MCP 暴露 DOM / 组件树 / computed style / 模块图 / 路由 / 服务日志 | §6.3 |

---

## 三、官方文档的推荐阅读入口

**课程给出的"读哪些页"的清单**（对应 §7.4）：

| 工具 | 值得逐字读的机制页 |
|---|---|
| Webpack | **Concepts** 系列 |
| Vite | **Why Vite**、**Dependency Pre-Bundling** |
| Rollup | **Plugin Development** |
| Rspack | **migration 指南** + `rspack-compat` 仓库 |

**读文档的判据**：

> **读到「已知限制 / deprecated」段落时，停下精读。** 那是坑的官方来源。

---

## 四、本书未使用的来源

**以下类型的来源未被本书采用**，列出来是为了说明取材边界：

| 类型 | 为什么不用 |
|---|---|
| 二手技术博客 / 公众号文章 | 结论可能滞后或转述失真，且无法确认一手来源 |
| 厂商营销页的性能对比图 | 无法确认测试条件，且是**厂商自测** |
| 社区问答（Stack Overflow 等） | 答案质量与时效差异大，不适合作为书籍依据 |
| 未标注版本的教程 | 配置项默认值随版本变化 |

**本书中所有性能倍数均标注为「厂商公开口径」**，并明确提示需自测 —— 见 `decisions/tool-selection.md` 第四节。

---

## 五、复核建议

工具链演进速度快。**阅读本书时若发现某条版本相关结论与当前官方文档不符，以官方文档为准。**

建议的复核顺序：

1. 先查该工具的官方 **migration / breaking changes 页** —— 官方承认的变更，性价比最高
2. 再查对应配置项的**官方 API 文档** —— 确认默认值有没有变
3. 最后查**发布记录 / 官方博客** —— 确认版本时间线

**复核后请更新**：对应章节的结论 + `METADATA.md` 的最后更新日期 + `CHANGELOG.md` 记一条。
