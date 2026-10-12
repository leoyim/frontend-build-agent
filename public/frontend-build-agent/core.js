/*
 * 前端打包构建学习助手 · 共享内核
 *
 * Node 与浏览器共用同一份：课程结构、状态补丁、BM25 检索、系统提示词、模型调用。
 * 抽出它是因为应用现在有两个部署形态：
 *   · node server.js  —— 服务端持有密钥与数据文件
 *   · 纯静态托管       —— 同一份 public/ 直接丢给 GitHub Pages，全部逻辑在浏览器里跑
 * 两个形态各写一份逻辑的话，改一处忘一处是迟早的事。
 *
 * 本文件不碰 fs / process / DOM，只做纯计算与 fetch，两边都能跑。
 * 唯一的例外是 readFile/require，都已经被 UMD 包装处理掉了。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FBCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── 课程结构 ──────────────────────────────────────────────────────────
     总规划节数在开篇一次冻结 —— 这是「进度可判定」的前提。 */

  const COURSE = [
    { id: 'M1.1', module: '模块 1 · 核心原理', title: '依赖图构建', minutes: 12 },
    { id: 'M1.2', module: '模块 1 · 核心原理', title: '入口与输出', minutes: 12 },
    { id: 'M1.3', module: '模块 1 · 核心原理', title: 'Loader 与 Plugin', minutes: 14 },
    { id: 'M1.4', module: '模块 1 · 核心原理', title: 'Tree Shaking', minutes: 13 },
    { id: 'M1.5', module: '模块 1 · 核心原理', title: '代码分割', minutes: 12 },
    { id: 'M1.6', module: '模块 1 · 核心原理', title: 'HMR 热更新', minutes: 12 },
    { id: 'M1.7', module: '模块 1 · 核心原理', title: 'Source Map', minutes: 11 },
    { id: 'M1.8', module: '模块 1 · 核心原理', title: '开发与生产模式差异', minutes: 13 },

    { id: 'M2.1', module: '模块 2 · Webpack 与 Vite', title: '核心架构差异', minutes: 13 },
    { id: 'M2.2', module: '模块 2 · Webpack 与 Vite', title: '配置方式对比', minutes: 12 },
    { id: 'M2.3', module: '模块 2 · Webpack 与 Vite', title: '插件生态对比', minutes: 12 },
    { id: 'M2.4', module: '模块 2 · Webpack 与 Vite', title: '冷启动与构建速度', minutes: 14 },
    { id: 'M2.5', module: '模块 2 · Webpack 与 Vite', title: '适用场景与选型建议', minutes: 14 },

    { id: 'M3.1', module: '模块 3 · 新趋势', title: '原生工具链总览', minutes: 12 },
    { id: 'M3.2', module: '模块 3 · 新趋势', title: 'esbuild 与 SWC', minutes: 12 },
    { id: 'M3.3', module: '模块 3 · 新趋势', title: 'Rspack 与 Farm', minutes: 15 },
    { id: 'M3.4', module: '模块 3 · 新趋势', title: 'Turbopack 与 Rolldown', minutes: 15 },
    { id: 'M3.5', module: '模块 3 · 新趋势', title: 'AI 辅助构建', minutes: 13 },
    { id: 'M3.6', module: '模块 3 · 新趋势', title: '成熟度矩阵与投入建议', minutes: 12 },

    { id: 'M4.1', module: '模块 4 · 学习路径', title: '分阶段学习顺序', minutes: 13 },
    { id: 'M4.2', module: '模块 4 · 学习路径', title: '每阶段动手项目', minutes: 12 },
    { id: 'M4.3', module: '模块 4 · 学习路径', title: '文档与源码阅读切入点', minutes: 12 },
  ];

  const TOTAL_SECTIONS = COURSE.length;

  /** 对话历史上限。不设限的话上下文和存储都会无限膨胀。 */
  const MAX_HISTORY = 400;

  function defaultState() {
    return {
      course: '前端打包构建（四模块）',
      established: new Date().toISOString().slice(0, 10),
      progress: {
        total_sections: TOTAL_SECTIONS,
        progress_formula: '已完成节数 ÷ 总规划节数（三条齐才算完成：作答 + 批改 + 确认）',
        completed: [],
        current: null,
        pending_answer: [],
        pending_confirm: [],
      },
      learner_profile: [],
      changelog: [],
      session: 'ASKING',
    };
  }

  /** 进度 = 已完成节数 ÷ 总规划节数。单一口径。 */
  function computeProgress(state) {
    const done = state.progress.completed.length;
    const total = state.progress.total_sections || TOTAL_SECTIONS;
    return {
      done,
      total,
      percent: Math.round((done / total) * 100),
      formula: state.progress.progress_formula,
    };
  }

  /* ── 知识库：分块与 BM25 检索 ──────────────────────────────────────────
     检索的实现放在这里，是因为它现在有两个调用方：
     服务端读服务器磁盘上的 knowledge/，浏览器读构建时生成的 knowledge-data.js。
     两边的分块规则、打分公式必须是同一套，否则同一个问题在两个形态下会检索到不同资料。 */

  /** 书籍的元文件不是知识，进索引只会稀释检索 —— 直接排除。 */
  const KB_EXCLUDE_FILES = new Set([
    'README.md', 'SUMMARY.md', 'METADATA.md', 'CHANGELOG.md', 'BUILD_PROGRESS.md',
  ]);

  /** 把一份 Markdown 按二/三级标题切成片段。分块规则只此一处。 */
  function chunkMarkdown(file, raw) {
    const out = [];
    const parts = String(raw).split(/\n(?=#{2,3}\s)/);
    for (const p of parts) {
      const text = p.trim();
      if (text.length < 60) continue;
      const heading = (text.split('\n')[0] || '').replace(/^#+\s*/, '').trim();
      out.push({ file, heading, text });
    }
    return out;
  }

  /**
   * 中文虚词二元组停用词。
   *
   * 为什么必须手工列：二元字组切词不认词性，「为什」「什么」「怎么」会被当成
   * 独立的技术词。而有些偶然组合（比如「会变」）在语料里恰好很罕见，
   * 按 IDF 算下来权重竟高于真正的技术词（比如 contenthash），
   * 结果就是「为什么 X 会变」这类问句被虚词带偏。
   */
  const STOP_BIGRAMS = new Set([
    '为什', '什么', '怎么', '怎样', '如何', '哪些', '哪个', '多少',
    '这个', '那个', '这些', '那些', '这里', '那里', '这样', '那样',
    '我们', '你们', '他们', '它们', '自己', '大家',
    '是不', '不是', '可以', '能够', '应该', '需要', '必须', '可能',
    '如果', '因为', '所以', '但是', '而且', '就是', '还是', '或者',
    '一下', '一个', '一样', '一直', '没有', '不能', '不会',
    '已经', '正在', '开始', '然后', '最后', '其实', '到底', '究竟',
    '有点', '一点', '时候', '东西', '事情', '问题',
  ]);

  /**
   * 中文按二元字组切，英文按单词切 —— 够用且无需分词库。
   * 返回 Map<词, 出现次数>，保留词频供 BM25 使用。
   */
  function tokenize(str) {
    const s = String(str || '').toLowerCase();
    const tf = new Map();
    const bump = (t) => tf.set(t, (tf.get(t) || 0) + 1);
    for (const w of s.match(/[a-z0-9_.-]{2,}/g) || []) bump(w);
    const cjk = s.replace(/[^\u4e00-\u9fa5]/g, '');
    for (let i = 0; i < cjk.length - 1; i++) {
      const bg = cjk.slice(i, i + 2);
      if (STOP_BIGRAMS.has(bg)) continue;
      bump(bg);
    }
    return tf;
  }

  /**
   * 建索引：词频、文档频率、片段长度、平均长度。全部算一次，之后查询不再分词。
   * 标题词计三倍：标题是人工写的摘要，信噪比明显高于正文。
   */
  function buildIndex(chunks) {
    const df = new Map();
    let totalLen = 0;
    for (const c of chunks) {
      c.tf = tokenize(c.text);
      for (const [t, n] of tokenize(c.heading)) c.tf.set(t, (c.tf.get(t) || 0) + n * 3);
      c.len = 0;
      for (const n of c.tf.values()) c.len += n;
      totalLen += c.len;
      for (const t of c.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
    }
    return { chunks, df, avgdl: chunks.length ? totalLen / chunks.length : 1 };
  }

  /**
   * BM25 检索。
   *
   * 为什么不用「余弦相似度」或「命中词数 ÷ 片段长度」：
   * 本语料片段长度相差上百倍（60 字到 5000 字），硬除长度会把内容最全的
   * 长片段压到近乎零分 —— 正好和我们要找的东西相反。BM25 用饱和式长度
   * 归一化（k1 控制饱和、b 控制长度影响），短片段占不到便宜、长片段不被埋没。
   * IDF 则让「为什么」「怎么」这类满书都是的虚词自动退场。
   */
  function retrieve(index, query, k = 4) {
    const chunks = (index && index.chunks) || [];
    if (!chunks.length) return [];
    const q = tokenize(query);
    if (!q.size) return [];

    const N = chunks.length;
    const DF = index.df;
    const AVGDL = index.avgdl || 1;
    const K1 = 1.2;
    const B = 0.75;

    const idf = (t) => {
      const df = DF.get(t) || 0;
      if (!df) return 0;
      // 加 1 保证恒为正：避免常见词拿到负分，反而把无关片段顶上来
      return Math.log(1 + (N - df + 0.5) / (df + 0.5));
    };

    const scored = chunks.map((c) => {
      let score = 0;
      for (const t of q.keys()) {
        const f = c.tf.get(t);
        if (!f) continue;
        const w = idf(t);
        if (w <= 0) continue;
        score += w * (f * (K1 + 1)) / (f + K1 * (1 - B + B * (c.len / AVGDL)));
      }
      return { file: c.file, heading: c.heading, text: c.text, score };
    });

    const ranked = scored.filter((c) => c.score > 0).sort((a, b) => b.score - a.score);
    // 只保留与最佳命中同量级的结果。宁可返回空、让提示词如实说「没检索到」，
    // 也不要把一堆弱相关片段喂给模型 —— 那比不给更糟。
    const top = ranked[0] ? ranked[0].score : 0;
    return ranked.filter((c) => c.score >= top * 0.45).slice(0, k);
  }

  /* ── 状态补丁 ────────────────────────────────────────────────────────── */

  const STATE_BLOCK_RE = /```state\s*([\s\S]*?)```/i;

  function extractStatePatch(reply) {
    const m = reply.match(STATE_BLOCK_RE);
    if (!m) return { clean: reply.trim(), patch: null, raw: null };
    const clean = reply.replace(STATE_BLOCK_RE, '').trim();
    let patch = null;
    try {
      patch = JSON.parse(m[1].trim());
    } catch {
      patch = null;
    }
    return { clean, patch, raw: m[1].trim() };
  }

  /**
   * 应用状态补丁 —— 这里是「进度单调不减」的强制点。
   * 模型可以提出推进，但改不回退。
   */
  function applyPatch(state, patch) {
    const notes = [];
    if (!patch) return notes;

    const validIds = new Set(COURSE.map((s) => s.id));
    const today = new Date().toISOString().slice(0, 10);

    if (patch.current !== undefined && patch.current !== null) {
      if (validIds.has(patch.current)) {
        state.progress.current = patch.current;
      } else {
        notes.push('忽略非法的 current: ' + patch.current);
      }
    }

    if (Array.isArray(patch.complete)) {
      const before = state.progress.completed.length;
      for (const id of patch.complete) {
        if (!validIds.has(id)) { notes.push('忽略非法的节 id: ' + id); continue; }
        if (state.progress.completed.some((c) => c.id === id)) continue;
        const meta = COURSE.find((s) => s.id === id);
        state.progress.completed.push({ id, title: meta.title, date: today });
      }
      const after = state.progress.completed.length;
      if (after > before) notes.push('新增完成节 ' + (after - before) + ' 个');
      // 断言：绝不允许回退
      if (after < before) {
        notes.push('检测到进度回退，已拒绝');
        state.progress.completed.length = before;
      }
    }

    if (Array.isArray(patch.pending_answer)) {
      state.progress.pending_answer = patch.pending_answer
        .filter((q) => q && q.section)
        .slice(0, 5);
    }

    if (Array.isArray(patch.pending_confirm)) {
      state.progress.pending_confirm = patch.pending_confirm
        .filter((q) => q && q.section)
        .slice(0, 5);
    }

    if (Array.isArray(patch.profile)) {
      for (const item of patch.profile) {
        if (!item || !item.phenomenon) continue;
        if (state.learner_profile.some((x) => x.phenomenon === item.phenomenon)) continue;
        state.learner_profile.push({
          phenomenon: String(item.phenomenon).slice(0, 120),
          category: String(item.category || '').slice(0, 60),
          action: String(item.action || '').slice(0, 160),
        });
      }
      state.learner_profile = state.learner_profile.slice(-40);
    }

    return notes;
  }

  /* ── 配置 ────────────────────────────────────────────────────────────── */

  function defaultConfig() {
    return {
      baseUrl: '',            // 例如 https://api.deepseek.com/v1
      apiKey: '',
      model: '',
      temperature: 0.4,
      maxTokens: 2000,
    };
  }

  /**
   * 校验配置。宁可在这里明确报错，也不要让一个错地址活到调用时才炸 ——
   * 那时候的错误信息（fetch failed）对使用者毫无指向性。
   * 只校验「本次提交里出现的字段」，这样分段保存（先填地址再填 key）不会被误拦。
   */
  function validateConfig(cfg) {
    const errs = [];
    if (cfg.baseUrl) {
      let u = null;
      try { u = new URL(cfg.baseUrl); } catch { errs.push('API 地址不是合法的 URL'); }
      if (u && u.protocol !== 'http:' && u.protocol !== 'https:') {
        errs.push('API 地址必须以 http:// 或 https:// 开头');
      }
    }
    if (cfg.model !== undefined && typeof cfg.model !== 'string') errs.push('模型名必须是字符串');
    if (cfg.temperature !== undefined && cfg.temperature !== '') {
      const t = Number(cfg.temperature);
      if (!Number.isFinite(t) || t < 0 || t > 2) errs.push('temperature 需在 0 ~ 2 之间');
    }
    if (cfg.maxTokens !== undefined && cfg.maxTokens !== '') {
      const m = Number(cfg.maxTokens);
      if (!Number.isInteger(m) || m < 1 || m > 32000) errs.push('maxTokens 需是 1 ~ 32000 之间的整数');
    }
    return errs;
  }

  /** 归一化：地址去尾斜杠，模型名去空白，数值转数字。 */
  function normalizeConfig(cfg) {
    const c = { ...cfg };
    if (typeof c.baseUrl === 'string') c.baseUrl = c.baseUrl.trim().replace(/\/+$/, '');
    if (typeof c.model === 'string') c.model = c.model.trim();
    if (c.temperature !== undefined) c.temperature = Number(c.temperature);
    if (c.maxTokens !== undefined) c.maxTokens = Number(c.maxTokens);
    return c;
  }

  function configReady(cfg) {
    return Boolean(cfg && cfg.baseUrl && cfg.model);
  }

  /* ── 大模型调用 ──────────────────────────────────────────────────────── */

  /**
   * 走 OpenAI 兼容端点。Node 与浏览器共用同一份实现，
   * 区别只在「配置从哪来」：服务端从文件/环境变量，静态版从 localStorage。
   */
  async function callLLM(cfg, messages, timeoutMs = 120000) {
    if (!configReady(cfg)) {
      const err = new Error('尚未配置大模型');
      err.code = 'LLM_NOT_CONFIGURED';
      throw err;
    }

    const url = String(cfg.baseUrl).replace(/\/+$/, '') + '/chat/completions';
    const headers = { 'Content-Type': 'application/json' };
    if (cfg.apiKey) headers.Authorization = 'Bearer ' + cfg.apiKey;

    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: cfg.model,
          messages,
          temperature: cfg.temperature,
          max_tokens: cfg.maxTokens,
        }),
        signal: controller ? controller.signal : undefined,
      });
    } catch (e) {
      if (timer) clearTimeout(timer);
      const aborted = e && e.name === 'AbortError';
      const err = new Error(aborted
        ? '模型请求超时。可能是模型太慢或网络不通。'
        : '连接模型服务失败：' + e.message
          + '。请检查 API 地址与网络。'
          // 静态部署时这是最常见的原因，直接把排查方向写进错误里
          + '（若这是 GitHub Pages 之类的静态部署，另一常见原因是该模型服务不允许浏览器直连，即未开放 CORS。）');
      err.code = 'LLM_UNREACHABLE';
      throw err;
    }
    if (timer) clearTimeout(timer);

    const bodyText = await res.text();
    if (!res.ok) {
      const err = new Error('模型服务返回 ' + res.status + '：' + bodyText.slice(0, 300));
      err.code = 'LLM_HTTP_ERROR';
      throw err;
    }

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch {
      const err = new Error('模型返回的不是合法 JSON：' + bodyText.slice(0, 200));
      err.code = 'LLM_BAD_RESPONSE';
      throw err;
    }

    const content =
      (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
      (data && data.choices && data.choices[0] && data.choices[0].text) ||
      '';
    if (!content) {
      const err = new Error('模型返回内容为空。');
      err.code = 'LLM_EMPTY';
      throw err;
    }
    return content;
  }

  /* ── 对外视图 ────────────────────────────────────────────────────────── */

  /** 脱敏后的配置：密钥永不下发，只回一个「有没有」的布尔。 */
  function publicConfig(cfg, apiKeySource) {
    return {
      baseUrl: cfg.baseUrl,
      model: cfg.model,
      temperature: cfg.temperature,
      maxTokens: cfg.maxTokens,
      hasApiKey: Boolean(cfg.apiKey),
      // 界面上那句「已保存，留空不修改」对部署者来说是误导 ——
      // 密钥其实在环境变量里，改界面根本改不动。明确告诉他来源。
      apiKeySource: apiKeySource || (cfg.apiKey ? 'file' : 'none'),
    };
  }

  function publicState(state) {
    return {
      progress: {
        ...state.progress,
        percent: computeProgress(state).percent,
      },
      learner_profile: state.learner_profile,
      changelog: state.changelog,
      session: state.session,
      course: COURSE,
    };
  }

  /* 下面这个函数是从 server.js 原样搬过来的，所以缩进与附近代码不一致。
     刻意不重新缩进：函数体里有跨行模板字符串，动缩进就等于动提示词内容。 */
function buildSystemPrompt(state, hits) {
  const p = computeProgress(state);
  const done = state.progress.completed.map((c) => c.id);
  const currentId = state.progress.current;
  const current = COURSE.find((s) => s.id === currentId);

  const roster = COURSE
    .map((s) => `${s.id} ${s.title}${done.includes(s.id) ? ' ✅' : ''}`)
    .join('\n');

  const kb = hits.length
    ? hits
        .map((h, i) => `【资料 ${i + 1}｜${h.file} › ${h.heading}】\n${h.text.slice(0, 1600)}`)
        .join('\n\n---\n\n')
    : '（本轮未检索到相关资料，请基于你自己的知识回答；不确定的内容必须标注"待核实"）';

  return `你是「前端打包构建学习助手」——一位耐心的前端工程化老师，用互动式对话带初学者系统掌握前端打包构建工具。

# 讲解风格（面向初学者）
- 先给直觉，再给术语：每个概念先用一句生活化的类比说清「它解决什么问题」，再上正式名词。
- 不假设对方记得上一节：需要用到前置概念时，用半句话点一下「我们前面说过 X」。
- 允许并鼓励「不懂就打断」：学习者说听不懂时，换一个更小的例子重讲，不要原样复述。
- 语气平等、鼓励，但不灌鸡汤：把「你答对了」换成「你说到了 X，这正是关键」。
- 不堆术语、不炫技；能用一句话说清就不写三句。

# 学习者前提
已掌握 HTML / CSS / JS 与 npm 基本使用。目标：能独立完成项目构建选型与构建性能优化。

# 课程结构（总规划 ${TOTAL_SECTIONS} 节，已冻结，不得增删）
${roster}

# 当前状态
- 进度：${p.done}/${p.total}（${p.percent}%），口径：${p.formula}
- 当前节：${current ? current.id + ' ' + current.title + '（预计 ' + current.minutes + ' 分钟）' : '尚未开始'}
- 待作答：${state.progress.pending_answer.length ? JSON.stringify(state.progress.pending_answer) : '无'}
- 待确认：${state.progress.pending_confirm.length ? JSON.stringify(state.progress.pending_confirm) : '无'}
- 学习者画像：${state.learner_profile.length ? JSON.stringify(state.learner_profile) : '尚未累积'}

# 最高优先：进度以学习者为准
- 讲解进度 ≠ 学习进度。一节只有「学习者作答 + 你批改 + 学习者确认」三件齐了才算完成。
- 学习者停在哪一节，就停在哪一节。一次只开一节。
- 未经确认绝不投递下一节内容，连"顺手带一句""先预览一下"都不行。
- 提问后只等作答：不主动推进、不预告下一节。
- 「下一节」「继续」是推进指令，不等于确认。只有明确的「无疑问 / 无 / 没有 / 无疑」才算确认。
- 不替学习者判断是否作答；不假设他读过什么。

# 每节输出格式（固定顺序，缺项不合格）
1. 进度百分比 + 预计用时
2. 引子（一到两句，接住上一节；不要上来就甩表格）
3. 正文，精炼讲解 ≤300 字
4. 概念图：抽象机制必配，用 \`\`\`mermaid 代码块输出（flowchart / sequenceDiagram / mindmap 均可，节点文字用中文，避免特殊符号）
5. 对比表格：关键差异一律表格化
6. 常见坑：涉及配置时补关键配置项说明 + 踩坑点
7. 1–2 个理解确认题，或一个可动手验证的小任务
8. 出题自查：这题的答案是不是就写在我上面那段话里？是则重出

# 交互节奏（四拍 + 一道闸门）
① 讲解（按上面 8 项）② 提问 ③ 等作答 ④ 批改（本轮不掺任何新内容）⑤ 停下问「有没有疑问」⑥ 确认无疑问 → 才开下一节。
闸门不可合并、不可跳过。

# 批改规则
- 先指出对在哪、错在哪，再给正确答案；答错必须讲清根因，归因落到机制层。
- 答对也要追一层「为什么」。判据：这句话能推出反例吗？推不出算没答。
- 学习者复用一个场景的答案回答新场景时，直接点出并追问「这两个场景哪里不一样」。
- 给出数字或结论时，先问它绑定什么指标、什么前提。
- 错误归类：结论错 / 机制链条断裂 / 场景错配 / 跳过分解步骤 / 举例不可查证 / 数字脱离定义。
- 把有复用价值的错误累积进 learner_profile（现象 → 归类 → 改进动作）。

# 禁止
- 不生成培训网页；不一次性输出长篇文档。
- 不跨节、不跨模块推进。
- 不编造事实。涉及版本号、成熟度、兼容性、性能倍数时，若资料区没有支撑，必须标注「待核实」并提示以官方文档为准。

# 可用资料（从本地知识库检索，仅供你参考；不要整段照抄）
${kb}

# 状态回写（重要）
每次回复的最后，必须追加一个状态补丁代码块，用 \`\`\`state 围栏包裹，内容是一段 JSON：

\`\`\`state
{"current":"M1.2","complete":["M1.1"],"pending_answer":[{"section":"M1.2","question":"..."}],"pending_confirm":[],"profile":[{"phenomenon":"...","category":"...","action":"..."}]}
\`\`\`

字段含义：
- current：下一轮该讲哪一节（不确定就填原值或 null）
- complete：本轮新确认完成的节 id 数组（只填"作答+批改+确认"三件齐的节；没有就填空数组）
- pending_answer：当前布置出去、还没作答的题目
- pending_confirm：已批改但还没等到"无疑问"的节
- profile：本轮新观察到的学习者画像条目（没有就留空数组）

规则：complete 只增不减；不得填写课程结构之外的 id；宁可不推进，也不要凭猜测推进。
状态块之外不要出现 JSON 状态说明。`;
}


  return {
    COURSE: COURSE,
    TOTAL_SECTIONS: TOTAL_SECTIONS,
    MAX_HISTORY: MAX_HISTORY,
    KB_EXCLUDE_FILES: KB_EXCLUDE_FILES,

    defaultState: defaultState,
    computeProgress: computeProgress,
    applyPatch: applyPatch,
    extractStatePatch: extractStatePatch,

    defaultConfig: defaultConfig,
    validateConfig: validateConfig,
    normalizeConfig: normalizeConfig,
    configReady: configReady,

    chunkMarkdown: chunkMarkdown,
    buildIndex: buildIndex,
    retrieve: retrieve,
    tokenize: tokenize,

    buildSystemPrompt: buildSystemPrompt,
    callLLM: callLLM,
    publicConfig: publicConfig,
    publicState: publicState,
  };
});
