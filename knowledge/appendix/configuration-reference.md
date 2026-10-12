# 配置参考

关键配置项的作用、默认行为、适用条件与常见坑。

> **版本提示**：本文件基于 2026-10-10 的官方文档整理。**配置项的默认值随版本变化**，使用前请复核官方文档。核验线索见 `references.md`。
>
> **可运行的完整示例**见 `practice/examples/`。

---

## 一、Webpack 关键配置

### 入口与输出

| 配置项 | 作用 | 默认 / 注意 | 常见坑 |
|---|---|---|---|
| `entry` | 依赖图起点 | 默认 `./src/index.js` | **多入口必须配 `[name]`**，否则产物互相覆盖 |
| `output.path` | 输出目录 | 默认 `./dist` | **必须绝对路径**，用 `path.resolve(__dirname, ...)` |
| `output.filename` | 入口产物名 | 默认 `main.js` | 生产用 `[name].[contenthash:8].js` |
| `output.chunkFilename` | 非入口 chunk 名 | — | 非入口 chunk 也要配，否则也是固定名 |
| `output.clean` | 构建前清空输出目录 | 默认 `false` | 不开会导致旧产物堆积，污染产物分析 |
| `output.publicPath` | 产物引用前缀 | 默认 `'auto'` | CDN 部署时必配 |

### optimization

| 配置项 | 作用 | production 下的默认 | 常见坑 |
|---|---|---|---|
| `minimize` | 是否压缩 | `true` | 关掉后 Tree Shaking 的删除阶段不执行 |
| `nodeEnv` | 设置 `NODE_ENV` | `'production'` | 经 DefinePlugin 实现**构建期替换** |
| `usedExports` | Tree Shaking 标记 | `true` | 只做标记，删除靠压缩器 |
| `sideEffects` | 启用 sideEffects 分析 | `true` | 需要库本身在 `package.json` 里写了这个字段 |
| `concatenateModules` | Scope Hoisting | `true` | — |
| `moduleIds` | 模块 ID 生成方式 | `'deterministic'` | 非 `deterministic` 时 hash 极不稳 |
| `chunkIds` | chunk ID 生成方式 | `'deterministic'` | 同上 |
| `splitChunks.chunks` | 抽包范围 | **`'async'`**（注意！） | 想抽同步共享模块必须写 `'all'` |
| `splitChunks.minChunks` | 抽包阈值 | `1` | **数的是「引用它的 chunk 数量」**，不是模块数量 |
| `runtimeChunk` | 抽运行时 | `false` | 缓存三件套之一，建议 `'single'` |
| `cache.type` | 缓存类型 | — | 设 `'filesystem'` 让二次构建接近增量 |

### module.rules（Loader）

| 配置项 | 作用 | 常见坑 |
|---|---|---|
| `test` | 匹配文件正则 | **写过窄会漏转**：`/\.ts$/` 漏掉 `.tsx` |
| `use` | Loader 数组 | **执行顺序从右到左** |
| `exclude` | 排除目录 | 一般要 `exclude: /node_modules/`，否则构建极慢 |
| `type` | asset modules 类型 | 静态资源需一行 `type: 'asset/resource'` |

### devtool

| 值 | 速度 | 质量 | 适用 |
|---|---|---|---|
| `eval` | 极快 | 差 | dev 迭代 |
| `eval-cheap-module-source-map` | 快 | 中 | **dev 推荐** |
| `source-map` | 慢 | 最高 | **生产禁用**（源码泄露） |
| `hidden-source-map` | 慢 | 最高 | **生产推荐**：生成但不写注释 |
| `nosources-source-map` | 慢 | 高 | 生产需对外暴露时 |

**默认行为**：`mode: 'production'` 下 `devtool: false` —— **默认不生成 source map**。

### resolve

| 配置项 | 作用 | 常见坑 |
|---|---|---|
| `extensions` | 省略扩展名时的查找顺序 | **顺序影响解析结果** |
| `alias` | 路径别名 | 与 Vite 同名，可迁移 |
| `plugins` | resolve 插件 | **Rspack 不支持**，迁移时需处理 |
| `exportsFields` | 是否读 `package.json` 的 `exports` | 影响子路径能否被解析 |

### plugins

| 配置项 | 作用 | 常见坑 |
|---|---|---|
| `plugins: [new XxxPlugin()]` | 注册插件 | **忘了 `new` 会报错** |

---

## 二、Vite 关键配置

### 一句话总览

**Vite 的默认值覆盖了语言层**（TS 转译、JSX、CSS、静态资源、后缀、dev server、HMR），所以配置文件通常很短。

### 顶层

| 配置项 | 作用 | 默认 | 常见坑 |
|---|---|---|---|
| `plugins` | 插件数组（**工厂函数**） | `[]` | Webpack 是 `new XxxPlugin()`，这里是 `xxx()` |
| `resolve.alias` | 路径别名 | — | 与 Webpack 同名，可迁移 |
| `define` | **构建期字面量替换** | — | 值要 `JSON.stringify()` |
| `server` | 开发服务器 | 内置 | 不需要装 webpack-dev-server |
| `build` | 生产构建 | 走 Rollup / Rolldown | — |

### server

| 配置项 | 作用 | 常见坑 |
|---|---|---|
| `port` | 端口 | 默认 `5173` |
| `proxy` | 接口代理 | 常用 `changeOrigin: true` |
| `hot` | HMR | 默认开启 |
| `forwardConsole` | **把客户端 console 转发到终端**（Vite 8） | 官方说明「在使用 AI 编码代理时尤为实用」 |

### build

| 配置项 | 作用 | 默认 | 常见坑 |
|---|---|---|---|
| `sourcemap` | Source Map | **`false`** | `true` 会泄露源码；用 `'hidden'` |
| `lib` | 库模式 | — | 见下方组件库硬坑 |
| `lib.formats` | 产物格式 | **Vite 5 后只出 ESM** | 需显式 `['es', 'cjs']` |
| `rollupOptions` | 透传给 Rollup | — | — |
| `rollupOptions.output.manualChunks` | 自定义分组 | — | 分组太细 → 请求数爆炸 |
| `rolldownOptions` | Rolldown 的对应配置 | — | **Vite 8 起由 `rollupOptions` 改为 `rolldownOptions`** |
| `target` | 目标浏览器 | — | 决定语法降级程度 |

### 环境变量

| 文件 / 机制 | 作用 |
|---|---|
| `.env` | 通用环境变量 |
| `.env.local` | 本地覆盖，**不应提交** |
| `.env.[mode]` | 模式专属 |
| `VITE_` 前缀 | **只有带此前缀的变量默认暴露给前端代码**（安全设计） |
| `import.meta.env` | 代码中读取的入口 |
| `loadEnv(mode, cwd, '')` | config 中读非 `VITE_` 前缀变量 |

**核心坑**：`import.meta.env.X` 是**静态替换**，必须写完整字面量表达式。`import.meta.env[key]` **拿不到值**。

---

## 三、产物体积与结构

| 事项 | Webpack | Vite |
|---|---|---|
| 抽公共包 | `optimization.splitChunks`（**默认 `chunks: 'async'`**） | Rollup 自动；自定义用 `manualChunks` |
| 动态导入 | 代码里的 `import()` | 同 |
| 排除外部依赖 | `externals` | `rollupOptions.external` |
| 产物分析 | `webpack-bundle-analyzer` | `rollup-plugin-visualizer` |

---

## 四、组件库场景的四个硬坑（Vite library mode）

| # | 坑 | 正确做法 |
|---|---|---|
| 1 | Vite **默认不生成 `.d.ts`** | `vite-plugin-dts`，或单独 `tsc --emitDeclarationOnly` |
| 2 | `build.lib.formats` 需**显式**声明 | `['es', 'cjs']`（Vite 5 后默认只出 ESM） |
| 3 | peer 依赖被打进产物 | **必须 `rollupOptions.external`**（否则产物里带一份 React） |
| 4 | 入口字段没对齐 | `package.json` 的 `main` / `module` / `types` / `exports` **手动对齐产物** |

**第 4 条的表现**：「解析得到文件 A，运行时期待文件 B」—— 一类很难排查的运行时错误。

---

## 五、Rspack 迁移对照

| 原 Webpack 配置 | Rspack 对应 |
|---|---|
| `HtmlWebpackPlugin` | `HtmlRspackPlugin` |
| `MiniCssExtractPlugin` | `CssExtractRspackPlugin` |
| `css-loader` | 内置 `type: 'css'` |
| `babel-loader` / `swc-loader` | **`builtin:swc-loader`**（减少 JS ↔ Rust 往返） |
| `resolve.plugins` | **不支持** |
| 配置文件 | `rspack.config.js`（≈ webpack 配置改名） |

**兼容性边界**：loader runner 与 Webpack **完全兼容**；下载量 top 50 的 webpack 插件 **>80%** 可用或有替代 —— **不是 100%**。

---

## 六、Farm 关键配置

| 配置项 | 作用 | 常见坑 |
|---|---|---|
| `vitePlugins` | 直接挂 Vite / Rollup / unplugin 插件 | — |
| Farm JS 插件 | 自定义 JS 逻辑 | **必须配 `filters`**，否则明显掉速 |
| 配置文件 | `farm.config.ts` | 与 Vite 配置**不通用，需重写** |

---

## 七、常用别名与等价物速查

| 目的 | Webpack | Vite |
|---|---|---|
| 原始文本导入 | `raw-loader` | `?raw` |
| 资源 URL 导入 | `file-loader` | `?url` |
| 内联为 DataURL | `url-loader` | `?inline` |
| 注入样式到 DOM | `style-loader` + `css-loader` | 内置（`import './a.css'`） |
| 抽 CSS 文件 | `MiniCssExtractPlugin` | 内置（`build.cssCodeSplit`） |
| 生成 HTML | `HtmlWebpackPlugin` | 内置（根目录 `index.html`） |
| 定义常量 | `DefinePlugin` | `define` |
| 开发服务器 | `webpack-dev-server` | 内置 |
| HMR | 需配置 | 内置 |
