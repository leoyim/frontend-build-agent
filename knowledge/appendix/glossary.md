# 术语表

全书关键术语的统一定义。**凡正文与该表冲突，以本表为准。**

---

## 构建基础

**模块（Module）**
构建器处理的最小单位，通常对应一个文件。在依赖图中是一个节点，节点存「绝对路径 + 转换后代码 + 依赖列表」。

**依赖图（Dependency Graph）**
以模块为节点、`import` / `require` / 动态 `import()` 为边的**有向图**，根是入口。构建器从入口出发，循环执行 `resolve → load+transform → parse` 直到队列为空。
**性质**：共享模块在图里只有 **1 个节点**（去重），因此模块代码只执行一次。**图 ≠ 树。**

**resolve**
把 `./utils` 这类相对路径补成**绝对路径**的过程。受 `resolve.extensions`、`resolve.alias`、`package.json` 的 `exports` 影响。
**为什么需要**：路径归一化是去重的前提。

**转换（Transform）**
把浏览器不认的源码变成浏览器认的 JS。执行者是 Loader 链 / 转译器（Babel、SWC、esbuild、Oxc）。

**转译（Transpile）**
狭义的转换：保留语义的前提下改变语法（TS → JS、JSX → JS、新语法降级到旧语法）。
**与「编译」的区别**：转译不改语言层级（都在 JS 家族内）；编译通常指更彻底的翻译。

---

## 产物

**chunk**
module 的**打包容器**。1 个 chunk ≈ 产物里 1 个 `.js` 文件。
**三个来源**：① `entry`（入口 chunk）② 动态 `import()`（懒加载 chunk）③ `splitChunks`（公共 chunk）。
**读产物的第一步**：判断一个 chunk 属于哪一类来源。

**入口（Entry）**
依赖图的起点。对象写法时，key 即产物名模板里的 `[name]`。

**产物（Bundle / Asset）**
构建输出的、将被部署的文件集合（通常在 `dist/`）。

**hash（内容指纹）**
产物文件名里的一段十六进制字符串，用于缓存控制。三种：
- `[hash]` —— 整个构建 → **禁用**
- `[chunkhash]` —— 单个 chunk → 易被运行时胶水污染
- `[contenthash]` —— **该文件的最终内容** → 生产首选

**运行时胶水（Runtime Glue）**
打包器注入到产物里的模块注册表与 `require` 实现（Webpack 的 `__webpack_require__` 等）。
**为什么要单独抽出来**：否则它存在于每个 chunk 里，任何一处变化会污染其他 chunk 的 `chunkhash` → 缓存白白失效。

**缓存三件套**
`contenthash` + `runtimeChunk: 'single'` + `moduleIds: 'deterministic'`。缺一个 hash 就不稳。

**hash 稳定性**
内容不变时文件名不变的属性。它是**长效 HTTP 缓存成立的前提**。
**判据**：改一行代码能预测哪些产物 hash 会变。

---

## 扩展点

**Loader**
**单模块级**的转换管道。配置在 `module.rules`，数组化。
**执行顺序：从右到左、从下到上**（等价于函数组合 `f(g(h(x)))`）。
**本质**：类型转换管道 —— 每一步的输出必须匹配下一步的输入。

**Plugin**
**全流程级**的干预装置。通过 `apply(compiler)` + `compiler.hooks.xxx.tap()` 注册。
**能介入四阶段**：初始化 / 编译 / 生成 / 输出。**能生成、修改、删除最终产物**。

**判别口诀**
处理**单个源文件内容** → Loader；涉及**构建阶段、跨文件、产物编排** → Plugin。
**判据是「它处理的是谁」，不是「它看起来在干什么」。**

**Tapable**
Webpack 的钩子体系。**与 Rollup 插件接口不通用** —— 这是 Webpack 插件无法迁移到 Vite 的根本原因。

---

## 产物优化

**Tree Shaking**
移除未被使用的导出。**两个执行者两阶段**：
① **标记**（打包器 `usedExports` / Rollup）—— 打标记，代码**仍保留**
② **删除**（压缩器 Terser / SWC minify）—— 读标记，**物理删除**
**两个前提**：必须是 ESM；生产模式才启用。

**`usedExports`**
打包器自动生成的标记，粒度是**导出的成员**。

**`sideEffects`**
`package.json` 字段，粒度是**整个模块能否跳过**。
**它由库作者提供，消费方改不了。**
**语义**：`false` 表示未被引用的模块可整体跳过；有引用则照常执行。CSS / polyfill 需写数组例外。

**代码分割（Code Splitting）**
把产物拆成多个 chunk。**三种触发方式**：多入口 / 动态 `import()` / `splitChunks`。
**核心分界线**：**只有动态 `import()` 能改变「运行时什么时候下载」**。

**动态 import**
`import()` 表达式。构建期分包，**运行时按需下载**。
**效果**：减小**首屏体积**；**不减小总产物体积**。

**`splitChunks`**
Webpack 的抽公共包配置。
**注意**：Webpack 5 默认 `chunks: 'async'` —— 只对动态 import 产生的 chunk 生效，**同步入口之间的共享模块不会自动抽**。
**`minChunks`** 数的是「引用它的 **chunk 数量**」，不是模块数量。

**`manualChunks`**
Rollup / Vite 侧的自定义分组配置（`build.rollupOptions.output.manualChunks`）。

**Scope Hoisting / `concatenateModules`**
把多个模块的作用域合并，减少运行时胶水，便于压缩器做跨模块死代码消除。`mode: 'production'` 下默认开启。

---

## 开发体验

**HMR（Hot Module Replacement）**
运行时替换变更的模块，**保留应用状态**。
**链路**：改文件 → Watcher → Dev Server 重新编译 → WebSocket 推送 → 浏览器 HMR Runtime 替换。
**accept 边界**：从改动模块沿引用链**向上冒泡**，找到最近声明 `accept` 的模块作为替换落点；**找不到就上溯到 entry → 退化为整页刷新**。
**边界由框架插件提供**（`vue-loader` / `@vitejs/plugin-vue` / `react-refresh`）。

**Watcher**
监听文件系统变化的组件。

**Source Map**
产物位置 ↔ 源码位置的反向映射（`.map` 文件 + 产物末行的 `//# sourceMappingURL=` 注释）。
**性质**：**不改变运行结果**，只是给调试器看的旁路信息。

**devtool（Webpack）/ `build.sourcemap`（Vite）**
Source Map 的生成策略。核心取舍：**速度 ↔ 精度 ↔ 是否泄露源码**。
生产禁用 `source-map`（注释留在产物里 → 可下载 `.map` 还原源码）；用 `hidden-source-map`（生成但不写注释）。

---

## 模式与环境

**`mode`**
Webpack 的预设默认值开关（`development` / `production`）。**不是全能开关** —— 只管"默认值有没有被设定"，不管"你的项目需不需要"。

**`NODE_ENV`**
**构建期字面量替换**的产物，**不是运行时环境变量**。
**两个执行者**：① 打包器（`DefinePlugin` / Vite `define`）整体替换成字符串字面量；② 压缩器发现条件恒假 → 判死代码 → 物理删除。

**构建期字面量替换（Compile-time Text Substitution）**
在编译期把一段源代码文本替换成另一个字面量。
**重要推论**：只能替换**完整字面量表达式**。`import.meta.env[key]` 这类动态取值拿不到。

**`VITE_` 前缀**
Vite 中**默认暴露给前端代码**的环境变量前缀。**安全设计** —— 防止服务端密钥进前端产物。

---

## Webpack 与 Vite

**依赖预构建（Dependency Pre-Bundling）**
Vite dev 启动时对 `node_modules` 依赖做的预处理。**两个目的（顺序不能反）**：
① **CJS/UMD → ESM 兼容** —— 不做则浏览器不认 `require`，**直接跑不起来**
② **性能** —— 把内部模块极多的 ESM 依赖合并（`lodash-es` 600+ 模块 → 1）
**缓存位置**：`node_modules/.vite`。**执行者**：当前为 Rolldown（早期 esbuild）。

**原生 ESM 开发服务器**
不打包，直接以原生 ESM 提供源码，按 import 请求逐个转换的开发服务器模型。Vite dev 采用此模型。

**请求瀑布（Request Waterfall）**
**串行的依赖链** —— A 加载完才知道要加载 B。与"并发太多导致的网络拥塞"是**两个不同问题**。

**网络拥塞**
大量请求并发导致的问题（如 600+ 个模块请求同时发出）。**不要把它叫请求瀑布。**

---

## 新一代工具

**打包层 / 转译层 / 压缩层 / 一体化层**
构建管线的分层。
**分层替换**：转译层 Babel·tsc → SWC·esbuild；压缩层 Terser → SWC minify；打包层 Webpack·Rollup → Rspack·Rolldown·Farm；一体化层 → Turbopack。

**并行度决定难度**
**打包层最难，因为依赖图是串行约束** —— 必须先知道谁依赖谁，才能决定怎么打包。

**双边网络效应**
插件作者没有动力为"没有用户的新工具"写插件，而他们的用户都在既有生态上 → **另造生态不是"成本高"，是"冷启动根本起不来"**。

**默认即权力**
**强制 ≠ 禁止。强制 = 默认 + 高摩擦回退。**
敢不兼容的三个条件：① 有分发渠道（打包器被包在框架里）② 回退高摩擦（逆默认值）③ 有资格（用户基数 + 不可替代性）。

**dev / prod parity（一致性）**
开发与生产使用**同一个引擎**，消除"本地能跑、生产挂"这一整类 bug。
**Rolldown 最值钱的收益不是速度，是 parity** —— 速度有替代方案，一致性没有。

**Partial bundling**
Farm 的独有策略。介于"全打包"与"不打包 ESM"之间，同时避开请求瀑布与巨型产物。

**Oxc / Lightning CSS**
Rolldown 的技术底座：Oxc 负责转换，Lightning CSS 负责 CSS 压缩。

**折旧率**
知识的过时速度。判断该学什么的依据之一。
**判据**：① 层越低折旧越慢 ② 是否已在默认路径上 ③ 是否兼容存量生态。
**结论**：原理层最慢、打包层最快 —— 因此第 2 章折旧最慢、回报最高。

---

## AI 与构建

**agents as users**
AI agent 成为构建工具（dev server / bundler / linter / CLI）的**直接用户**，而不只是人类的助手。
**推论**：对人类是体验问题，对 agent 是**可靠性要求**（迭代频率高几百倍）。

**结构化诊断（Structured Diagnostics）**
把构建日志预处理成固定字段（`file` / `line` / `column` / `severity` / `message` / `code`），**原始日志不进上下文窗口**。

**两步式（Two-step Retrieval）**
先返回摘要，需要时才取详情 —— 用于在信息量与 token 成本之间取平衡。

**运行时感知工具**
以 dev server 中间件 / 浏览器代理的形式，把 DOM、组件树、computed style、模块图、路由、服务日志通过 MCP 暴露给 agent。

---

## 学习方法

**判据（Criterion）**
"怎么算过关"的可判定标准。**先写判据，再动手。**
**反例**："能跑起来"不是判据；"改一行代码能预测哪些 hash 会变"才是。

**可自证**
项目做完后，**不靠感觉**就能判断自己是否掌握。配动手项目的两条标准之一。

**五台阶**
按能力而非工具组织的学习顺序：① 建立图 ② 会用默认值 ③ **会读产物**（分水岭）④ 会算账 ⑤ 会迁移选型。

**六步测量法**
①拆指标 ②固定变量 ③清三层缓存 ④各跑 5 次取中位数 ⑤记录元数据 ⑥出带前提的结论。

**三层缓存**
① 构建工具缓存（`node_modules/.cache`、`node_modules/.vite`）② 浏览器强缓存（无痕验证）③ 系统层。

**带前提**
结论中同时给出机器、代码规模、依赖数、缓存状态、测量次数等条件。**缺前提的倍数不可复现。**

**以例代概念**
用实例或短语指代原则，导致答案无法复用、无法证伪。
**修正动作**：回答抽象问题**先命名概念再举例**；回答分类问题**先给类别名再列实例**。
