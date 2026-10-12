# CHANGELOG

本文件记录本书的编纂与后续修订。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)；版本号遵循语义化版本。

---

## [1.0.0] - 2026-10-10

### 新增 —— 首次编纂

由 2026-10-08 至 2026-10-10 的一场四模块、二十二节互动教学的对话与过程记录整理成书。

**正文（7 章）**

- 第 1 章 · 前端构建基础：模块机制演进（补充背景）、构建工具的三件事、依赖管理（补充背景）、开发与生产构建差异、全书知识地图
- 第 2 章 · 核心构建原理：依赖图、入口与输出、Loader 与 Plugin、Tree Shaking、代码分割、HMR、Source Map、开发与生产模式差异，含 12 条常见误区
- 第 3 章 · Webpack 与 Vite：架构分野、依赖预构建、配置对比、环境变量机制、插件生态、速度指标拆分，含 12 条常见误区
- 第 4 章 · 新一代构建工具：原生化动因、esbuild/SWC、Rspack/Farm、Turbopack/Rolldown、成熟度矩阵与投入建议，含 14 条常见误区
- 第 5 章 · 构建性能优化：指标先行、耗时来源分类、三层缓存、产物优化、并行与增量、六步测量法，含覆盖度说明
- 第 6 章 · AI 辅助构建工程：视角转换、三层价值、结构化诊断与运行时感知、风险边界
- 第 7 章 · 工程实践与选型：五台阶能力模型、动手项目、文档与源码切入点、选型决策矩阵、迁移评估模板，含 18 条常见误区

**学习档案（`notes/`）**

- `knowledge-cards.md`：核心概念与结论卡片
- `question-log.md`：学习过程中的重要提问与对应知识点
- `correction-log.md`：典型误区、修正原因与最终理解
- `learning-progress.md`：覆盖度与确认状态

**实践与决策**

- `practice/exercises.md`、`practice/experiments.md`、`practice/examples/`
- `decisions/tool-selection.md`

**附录**

- `glossary.md`、`configuration-reference.md`、`conversation-highlights.md`、`open-questions.md`、`references.md`

**元文件**

- `README.md`、`SUMMARY.md`、`METADATA.md`、`BUILD_PROGRESS.md`

### 说明

- 首次确立**结论三级标注**约定：【已学】【补充背景】【待验证】。
- 首次确立**编纂范围边界**：只收录学习内容，不收录教学系统自身的产物（系统提示词、状态台账、Skill 定义等）。
- 第 1 章 §1.1、§1.3 与第 5 章部分小节为编纂者补充内容，已在正文与 `METADATA.md` 中标注。

### 已知缺口

- 模块 3 §2（esbuild / SWC）、模块 4 §2、§3 的习题未作答，对应知识点未经复述验证。
- 模块 3 §5（AI 辅助构建）习题已批改但未获「无疑问」确认。
- 所有性能倍数为厂商公开口径，未在真实项目上实测。

---

## 后续版本规划

| 版本 | 计划内容 |
|---|---|
| 1.1.0 | 补入未作答习题的验证结论；补充真实项目上的构建基准测量数据 |
| 1.2.0 | 补写课程未覆盖的内容：Monorepo 构建、微前端构建实现、部署与 CDN 层优化 |
| 按需 | 工具版本变更后的结论复核（Rolldown / Rspack / Turbopack 的版本相关陈述） |
