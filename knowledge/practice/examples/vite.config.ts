/**
 * Vite 配置示例
 *
 * 用途：演示第 3 章讲解的机制。
 *
 * 注意第一件事：本文件几乎没有内容。
 * 这正是 §3.3 的结论 —— Vite 的默认值「连语言层一起管」：
 * TS 转译、JSX、CSS、静态资源、后缀（?raw / ?url / ?inline）、dev server、HMR 都不用配。
 *
 * 对照：Webpack 的默认值只管骨架（入口 / 输出 / 模式）。
 * 一句话：Webpack 管「东西放哪」，Vite 还管「东西怎么被理解」。
 *
 * 对应章节：§3.3 配置 / §3.4 环境变量 / §3.6 速度 / §7.5 选型
 */

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // ---------------------------------------------------------------
  // 环境变量（§3.4）
  //
  // 只有 VITE_ 前缀的变量默认暴露给前端代码 —— 这是安全设计，
  // 防止服务端密钥（DB_PASSWORD 之类）意外打进前端产物。
  //
  // 要在 config 里读「非 VITE_ 前缀」的变量，用 loadEnv：
  //   第三个参数传 '' = 不过滤前缀
  // ---------------------------------------------------------------
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      // Vite 的插件是工厂函数：xxx()。Webpack 是 new XxxPlugin()
      // HMR 边界由框架插件提供（这里就是 @vitejs/plugin-vue）
      vue(),
    ],

    resolve: {
      // 与 Webpack 同名，可以直接迁移
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    // ---------------------------------------------------------------
    // 开发服务器：Vite 内置，不需要装 webpack-dev-server
    // ---------------------------------------------------------------
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
        },
      },
      // Vite 8 提供：把客户端 console 转发到终端。
      // 官方说明「在使用 AI 编码代理时尤为实用」—— 因为 agent 看不见浏览器。
      // forwardConsole: true,
    },

    define: {
      // 静态替换：必须是完整字面量表达式。
      // import.meta.env[key] 这种动态取值拿不到值
      __APP_VERSION__: JSON.stringify(env.APP_VERSION),
    },

    build: {
      // -----------------------------------------------------------
      // Source Map（§2.7）
      // 默认 false —— 不生成，产物最小
      //
      // 可选值：false | true | 'inline' | 'hidden'
      // 想上传到监控平台但不公开 → 'hidden'（生成 .map 但不写注释）
      // 绝不用 true：注释留在产物里 → 任何人下载 .map 还原完整源码
      // -----------------------------------------------------------
      sourcemap: false,

      // -----------------------------------------------------------
      // 抽公共包（§2.5）
      // Rollup 自动抽公共包，不需要配 splitChunks。
      // 要自定义分组用 manualChunks。
      // -----------------------------------------------------------
      rollupOptions: {
        output: {
          // 缓存三件套在 Vite 侧的对应写法
          entryFileNames: 'assets/[name].[contenthash:8].js',
          chunkFileNames: 'assets/[name].[contenthash:8].js',
          assetFileNames: 'assets/[name].[contenthash:8][extname]',

          manualChunks: {
            // 按依赖维度分组。
            // 注意：分得太细 → chunk 数量爆炸 → 请求数反而变多
            'vendor-chart': ['echarts'],
            'vendor-ui': ['element-plus'],
          },
        },
      },
    },
  };
});

/**
 * ─────────────────────────────────────────────────────────────────
 * 组件库场景（library mode）的四个硬坑 —— §7.5
 * ─────────────────────────────────────────────────────────────────
 *
 * 组件库的需求与「应用」完全不同，不能照抄应用的选型理由：
 *   应用关注：冷启动快不快、生态成不成熟
 *   组件库关注：产物格式、类型声明、外部依赖不打包、入口字段对齐
 *
 * 1. Vite 默认不生成 .d.ts
 *    → 用 vite-plugin-dts，或单独跑 tsc --emitDeclarationOnly
 *
 * 2. build.lib.formats 需显式声明
 *    → 写 ['es', 'cjs']（Vite 5 之后默认只出 ESM）
 *
 * 3. peer 依赖必须 external 掉
 *    → 不配的话，产物里会打进一份 React
 *
 * 4. package.json 的 main / module / types / exports 要手动对齐产物
 *    → 配错的表现是「解析得到文件 A，运行时期待文件 B」
 *
 * 参考写法：
 *
 * export default defineConfig({
 *   build: {
 *     lib: {
 *       entry: 'src/index.ts',
 *       name: 'MyLib',
 *       formats: ['es', 'cjs'],
 *       fileName: (format) => `index.${format}.js`,
 *     },
 *     rollupOptions: {
 *       // 第 3 条：peer 依赖不打包
 *       external: ['vue', 'react', 'react-dom'],
 *       output: {
 *         globals: { vue: 'Vue', react: 'React' },
 *       },
 *     },
 *   },
 *   plugins: [vue(), dts()],  // 第 1 条：补 .d.ts
 * });
 */
