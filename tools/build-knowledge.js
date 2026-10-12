#!/usr/bin/env node
/**
 * 把 knowledge/ 下的 Markdown 预处理成 public/knowledge.json。
 *
 * 为什么要有这一步，而不是让两端各自读 Markdown：
 * 服务端有 fs，浏览器没有 —— 浏览器只能读一份提前准备好的数据。
 * 如果两边各写一遍「遍历目录 + 过滤文件 + 按标题分块」，规则迟早会分叉，
 * 同一个问题在本地跑和部署到 Pages 上会检索到不同资料。
 * 所以分块只在这里做一次，产物由两端共用。
 *
 * 分块规则本身来自 public/core.js，不是这个脚本自定义的。
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const core = require('../public/core.js');

const ROOT = path.join(__dirname, '..');
const KB_DIR = process.env.KNOWLEDGE_DIR || path.join(ROOT, 'knowledge');
const OUT = path.join(ROOT, 'public', 'knowledge.json');

const chunks = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      // 与服务端同一套排除规则：tools/ 是书稿脚本，assets/ 是配图
      if (name === 'tools' || name === 'assets') continue;
      walk(full);
      continue;
    }
    if (!name.endsWith('.md')) continue;
    if (core.KB_EXCLUDE_FILES.has(name)) continue;
    for (const c of core.chunkMarkdown(name, fs.readFileSync(full, 'utf8'))) chunks.push(c);
  }
}

walk(KB_DIR);

if (!chunks.length) {
  console.error('没有从 ' + KB_DIR + ' 分到任何片段 —— 语料没接上，生成中止');
  process.exit(1);
}

const json = JSON.stringify(chunks);
fs.writeFileSync(OUT, json, 'utf8');

console.log('已生成 public/knowledge.json');
console.log('  来源   ' + KB_DIR);
console.log('  片段   ' + chunks.length + ' 个');
console.log('  体积   ' + (json.length / 1024).toFixed(0) + ' KB');
