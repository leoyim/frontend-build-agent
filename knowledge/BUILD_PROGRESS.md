# BUILD_PROGRESS

> 本文件用于**断点恢复**。任何时候中断，先读本文件，再核对磁盘上实际存在的文件，从第一个未完成的条目继续。
> 状态词汇：`TODO` 未开始 · `IN_PROGRESS` 编写中 · `WRITTEN` 正文已写入 · `CHECKED` 内容与链接已检查 · `DONE` 通过最终验收

---

## 总进度：全书完成 ✅

| 批次 | 内容 | 状态 |
|---|---|---|
| 1 | 目录结构 + 元文件 | **DONE** |
| 2 | `notes/` 学习档案（4 篇） | **DONE** |
| 3 | 第 1–3 章正文 | **DONE** |
| 4 | 第 4–5 章正文 | **DONE** |
| 5 | 第 6–7 章正文 | **DONE** |
| 6 | `practice/` + `decisions/` | **DONE** |
| 7 | `appendix/`（5 篇） | **DONE** |
| 8 | 质量验收（内容 / 技术 / 文件） | **DONE** |

---

## 交付统计

| 指标 | 值 |
|---|---|
| Markdown 文件 | 26 |
| 代码/脚本文件 | 3（两份配置示例 + 一个校验脚本） |
| 总字符数 | 约 137,500 |
| 章节正文 | 7 章 |
| Mermaid 图表 | 28 张 |
| 对比表格 | 约 100 张 |
| 易错点条目 | 模块级 12 + 12 + 14 + 18 = 56 条，另加第 5 章 14 条 |

---

## 文件清单与状态

### 元文件

| 文件 | 状态 |
|---|---|
| `README.md` | **DONE** |
| `SUMMARY.md` | **DONE**（全部章节与元文件已收入目录） |
| `METADATA.md` | **DONE** |
| `CHANGELOG.md` | **DONE** |
| `BUILD_PROGRESS.md` | **DONE**（本文件） |

### 学习档案 `notes/`

| 文件 | 状态 |
|---|---|
| `notes/knowledge-cards.md` | **DONE** |
| `notes/question-log.md` | **DONE** |
| `notes/correction-log.md` | **DONE** |
| `notes/learning-progress.md` | **DONE** |

### 正文 `chapters/`

| 文件 | 小节 | 大小 | 状态 |
|---|---|---|---|
| `chapters/01-frontend-build-basics.md` | 5 | 8.5 KB | **DONE** |
| `chapters/02-core-build-principles.md` | 9 | 28.7 KB | **DONE** |
| `chapters/03-webpack-and-vite.md` | 7 | 17.4 KB | **DONE** |
| `chapters/04-next-generation-tools.md` | 6 | 22.0 KB | **DONE** |
| `chapters/05-build-performance.md` | 7 | 14.9 KB | **DONE** |
| `chapters/06-ai-assisted-build.md` | 5 | 10.2 KB | **DONE** |
| `chapters/07-practice-and-selection.md` | 7 | 16.6 KB | **DONE** |

### 实践 `practice/`

| 文件 | 状态 |
|---|---|
| `practice/exercises.md` | **DONE** |
| `practice/experiments.md` | **DONE** |
| `practice/examples/README.md` | **DONE** |
| `practice/examples/webpack.config.js` | **DONE** |
| `practice/examples/vite.config.ts` | **DONE** |

### 决策 `decisions/`

| 文件 | 状态 |
|---|---|
| `decisions/tool-selection.md` | **DONE** |

### 附录 `appendix/`

| 文件 | 状态 |
|---|---|
| `appendix/glossary.md` | **DONE** |
| `appendix/configuration-reference.md` | **DONE** |
| `appendix/conversation-highlights.md` | **DONE** |
| `appendix/open-questions.md` | **DONE** |
| `appendix/references.md` | **DONE** |

### 资源与工具

| 文件 | 状态 |
|---|---|
| `assets/README.md` | **DONE**（本书不需要二进制资源，见该文件说明） |
| `tools/link_check.py` | **DONE** |

---

## 质量验收结果（批次 8）

执行方式：`python tools/link_check.py .`，另加人工核对。

### 文件检查

| 检查项 | 结果 |
|---|---|
| 文件已真实写入工作目录 | ✅ 29 个文件 |
| `SUMMARY.md` 链接全部有效 | ✅ 32 个本地链接全部解析成功 |
| 本地相对路径引用正确 | ✅ 无死链 |
| Markdown 标题层级合理 | ✅ 无跳级（首个标题均为 H1） |
| 图片及附件路径有效 | ✅ 无图片引用（本书刻意不用图片，见 `assets/README.md`） |
| 代码围栏闭合 | ✅ 26 个文件全部偶数闭合 |
| 无空文件 | ✅ |
| 无 TODO / 占位内容 | ✅ |
| `CHANGELOG.md` 记录了本次编纂 | ✅ |
| 所有计划章节达到 DONE | ✅ |

### 内容检查

| 检查项 | 结果 |
|---|---|
| 所有计划章节均已完成 | ✅ 7 章 + 4 篇档案 + 5 篇附录 |
| 不存在空章节或缺失段落 | ✅ |
| 四大模块实际学习内容均得到归档 | ✅ 模块 1→第 2 章；模块 2→第 3 章；模块 3→第 4、6 章；模块 4→第 7 章 |
| 重要追问、纠错、案例、结论未遗漏 | ✅ 见 `notes/question-log.md`、`notes/correction-log.md`、`appendix/conversation-highlights.md` |
| **未学习的内容没有被标记为已学习** | ✅ 第 1 章 §1.1/§1.3 标注【补充背景】；第 5 章标注无独立教学模块；`notes/learning-progress.md` 列出 4 节未确认 |
| 未验证的推断与已验证事实明确区分 | ✅ 三级标注：【已学】/【补充背景】/【待验证】 |

### 技术检查

| 检查项 | 结果 |
|---|---|
| 重要技术结论不存在明显矛盾 | ✅ 抽查跨章引用一致性通过 |
| 版本敏感内容有适当说明 | ✅ 第 4、6 章及附录均标注核验日期 2026-10-10 |
| 配置、代码和命令未被随意改写 | ✅ 示例配置带逐项注释说明「为什么这么配」 |
| 参考资料具有真实来源 | ✅ 见 `appendix/references.md`（含粒度诚实声明） |
| 不存在编造的实验结果或引用 | ✅ 所有性能倍数标注为「厂商公开口径」，未冒充实测 |

### 主动更正的问题

| # | 问题 | 处理 |
|---|---|---|
| 1 | 校验脚本把代码块内的 `# .env` 误判为标题，产生 1 条假警告 | 修正脚本：标题分析前先剥离围栏代码块 |
| 2 | 5 个元文件/说明文件未收入 `SUMMARY.md` | 补入「元信息」小节，并把 `practice/examples/` 的链接改到其 README |

---

## 恢复方法（若后续需要增量更新）

```text
1. 读本文件与 CHANGELOG.md，确认当前版本与已知缺口
2. 新增内容按章追加到对应 .md；不重写已 DONE 的章节
3. 更新 CHANGELOG.md 记一条；涉及版本结论时同步更新 METADATA.md 的最后更新日期
4. 运行 python tools/link_check.py . 校验
5. 更新本文件的交付统计与文件清单
```

## 已知材料约束（增量更新时注意）

- 全书素材来自固定来源：四模块知识结论 + 三日过程记录。
- **不要把教学系统自身的产物**（系统提示词、状态台账、Skill 定义）**内容写进正文** —— 见 `METADATA.md` 的编纂范围声明。
- 第 5 章（构建性能优化）**没有对应的独立教学模块**，内容由散落知识点归拢而成，新增内容时保持逐节覆盖度标注。
- 学习者未作答的习题知识点（模块 3 §2、模块 4 §2/§3）在 `notes/learning-progress.md` 中如实标注为未经复述验证，**不得改写为"已验证"**。
