# 目录

## 正文

1. [第 1 章 · 前端构建基础](chapters/01-frontend-build-basics.md)
   - 1.1 从无模块到 ESM：浏览器加载代码的三次进化【补充背景】
   - 1.2 构建工具究竟做了什么
   - 1.3 依赖管理与 npm 的角色【补充背景】
   - 1.4 开发构建与生产构建：两个目标，两套策略【已学】
   - 1.5 全书知识地图

2. [第 2 章 · 核心构建原理](chapters/02-core-build-principles.md)
   - 2.1 依赖图：构建器的世界模型
   - 2.2 入口与输出：从图到 chunk 到文件
   - 2.3 Loader 与 Plugin：单文件转换与全流程干预
   - 2.4 Tree Shaking：两个执行者的接力
   - 2.5 代码分割：三种触发方式与一条分界线
   - 2.6 HMR 热更新：一条从文件改动到模块替换的链路
   - 2.7 Source Map：调试器与产物之间的反向映射
   - 2.8 开发模式与生产模式：差异全景与 `mode` 的边界
   - 2.9 本章常见误区（12 条）

3. [第 3 章 · Webpack 与 Vite](chapters/03-webpack-and-vite.md)
   - 3.1 架构分野：打包式构建 vs 原生 ESM
   - 3.2 依赖预构建：Vite dev 专属的两件事
   - 3.3 配置方式对比：默认值覆盖了哪一层
   - 3.4 环境变量机制：一个被构建期替换"伪造"出的对象
   - 3.5 插件生态对比：一套概念还是两套
   - 3.6 速度对比：把"快"拆成四个指标
   - 3.7 本章常见误区（12 条）

4. [第 4 章 · 新一代构建工具](chapters/04-next-generation-tools.md)
   - 4.1 为什么原生化：并行度决定难度
   - 4.2 esbuild 与 SWC：转译与压缩层
   - 4.3 Rspack 与 Farm：借别人的生态
   - 4.4 Turbopack 与 Rolldown：另外两种打法
   - 4.5 成熟度矩阵与投入建议
   - 4.6 本章常见误区（14 条）

5. [第 5 章 · 构建性能优化](chapters/05-build-performance.md)
   - 5.1 优化的前提：先有指标，再有结论
   - 5.2 三类耗时来源与各自的优化手段
   - 5.3 缓存：三层结构与各自的失效条件
   - 5.4 产物层面的优化：体积与结构
   - 5.5 并行与增量：原生工具与增量引擎
   - 5.6 优化验证：六步测量法
   - 5.7 本章覆盖度说明与常见误区

6. [第 6 章 · AI 辅助构建工程](chapters/06-ai-assisted-build.md)
   - 6.1 视角转换：AI 成了构建工具的用户
   - 6.2 三层价值：从配置助手到工具使用者
   - 6.3 实践形态：结构化诊断与运行时感知
   - 6.4 风险与边界
   - 6.5 本章常见误区（与术语澄清）

7. [第 7 章 · 工程实践与选型](chapters/07-practice-and-selection.md)
   - 7.1 顺序按能力排，不按工具排
   - 7.2 五个台阶与判定标准
   - 7.3 每阶段的动手项目
   - 7.4 文档与源码的阅读切入点
   - 7.5 选型决策矩阵
   - 7.6 迁移评估：一页纸模板
   - 7.7 本章常见误区（18 条）

## 学习档案

- [知识卡片](notes/knowledge-cards.md) —— 核心概念、原理、适用条件、结论
- [问题记录](notes/question-log.md) —— 学习过程中的重要提问与对应知识点
- [纠错记录](notes/correction-log.md) —— 典型误区、修正原因、最终理解
- [学习进度与覆盖度](notes/learning-progress.md) —— 讲了什么、确认了什么、还差什么

## 实践

- [动手项目与练习](practice/exercises.md) —— 五个台阶对应的动手项目
- [实验设计](practice/experiments.md) —— 基准测量与验证方法
- [示例代码](practice/examples/README.md) —— 配置示例（`webpack.config.js` / `vite.config.ts`）

## 决策

- [工具选型决策记录](decisions/tool-selection.md)

## 附录

- [术语表](appendix/glossary.md)
- [配置参考](appendix/configuration-reference.md)
- [关键对话与追问](appendix/conversation-highlights.md)
- [开放问题](appendix/open-questions.md)
- [参考资料](appendix/references.md)

## 元信息

- [METADATA.md](METADATA.md) —— 版本、材料覆盖范围与编纂边界
- [CHANGELOG.md](CHANGELOG.md) —— 修订记录与后续规划
- [BUILD_PROGRESS.md](BUILD_PROGRESS.md) —— 章节状态与断点恢复
- [assets/README.md](assets/README.md) —— 资源说明（本书不需要二进制资源）
- [tools/link_check.py](tools/link_check.py) —— 链接与结构校验脚本
