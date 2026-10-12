/**
 * Webpack 配置示例
 *
 * 用途：演示第 2 章各节的机制。每段注释说明「为什么这么配」与「不这么配会怎样」。
 * 注意：这是教学示例，不是可直接使用的生产模板。
 *
 * 对应章节：§2.2 入口与输出 / §2.3 Loader / §2.5 代码分割 / §2.7 Source Map / §2.8 dev·prod
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    // ---------------------------------------------------------------
    // 入口：对象写法时，key 就是 output 里的 [name]
    // 多入口必须配 [name]，否则两个产物都叫 main.js，互相覆盖
    // ---------------------------------------------------------------
    entry: {
      app: './src/app.js',
      admin: './src/admin.js',
    },

    output: {
      // 必须绝对路径。写相对路径的行为不确定
      // （相对于 process.cwd() 还是配置文件位置，在多包仓库里会变）
      path: path.resolve(__dirname, 'dist'),

      // [name] 多入口必需
      // [contenthash] 按文件最终内容算 —— 生产首选
      //   不用 [hash]：任何改动导致所有文件失效
      //   不用 [chunkhash]：会被运行时胶水代码污染
      filename: '[name].[contenthash:8].js',
      chunkFilename: '[name].[contenthash:8].chunk.js',

      // 防旧产物堆积。不开的话，改了文件名后旧文件一直留在 dist/
      // → 产物分析被污染，部署时可能传过期文件
      clean: true,
    },

    // ---------------------------------------------------------------
    // mode 只是预设默认值，管不到的必须自己配（见 §2.8）
    // 这里演示的就是「mode 管不到的那些」
    // ---------------------------------------------------------------
    optimization: {
      // ① 模块 ID 用确定性算法。默认按引用顺序分配 → 加个 import 别人全变
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',

      // ② 把运行时胶水单独抽出来。
      //    不抽的话胶水留在各 chunk 里，一改就污染别人的 contenthash
      runtimeChunk: 'single',

      // ③ 抽公共包。Webpack 5 默认 chunks: 'async'
      //    → 只处理动态 import 产生的 chunk，同步入口之间的共享模块不会自动抽
      //    「抽公共包」不是默认行为，要显式开启
      splitChunks: {
        chunks: 'all',
        // minChunks 数的是「引用它的 chunk 数量」，不是「模块数量」
        minChunks: 2,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
        },
      },

      // 剔 console 也要自己配 —— mode 不管这件事
      ...(isProd && {
        minimizer: [
          new (require('terser-webpack-plugin'))({
            parallel: true, // Webpack 5 默认就是 true（worker 线程），不是纯单线程
            terserOptions: {
              compress: { drop_console: true },
            },
          }),
        ],
      }),
    },

    module: {
      rules: [
        // -----------------------------------------------------------
        // Loader 执行顺序：从右到左、从下到上
        // 本质是类型转换管道 —— 每一步的输出必须匹配下一步的输入
        // -----------------------------------------------------------
        {
          test: /\.scss$/,
          // 实际执行顺序：sass-loader → css-loader → style-loader
          // 读法：style(css(sass(file)))，最内层先执行
          use: ['style-loader', 'css-loader', 'sass-loader'],
          // 顺序写反不是"语法错"，而是喂错类型：
          // sass-loader 拿到 CSS 会解析失败
        },
        {
          test: /\.(ts|tsx)$/,
          // 注意 [\\/] 而不是直接用正斜杠 —— 跨平台路径分隔符
          exclude: /[\\/]node_modules[\\/]/,
          use: 'ts-loader',
        },
        {
          // 静态资源：Webpack 5 已内置 asset modules
          // 官方表述是 "without configuring additional loaders"
          // 但「仍需这一行 type 声明」—— 准确说法是「已内置，但需一行规则声明」
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },

    resolve: {
      // 省略扩展名时的查找顺序。注意顺序影响解析结果
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    plugins: [
      // 注意 new，不能漏
      new HtmlWebpackPlugin({ template: './public/index.html' }),
    ],

    // ---------------------------------------------------------------
    // Source Map：开发要快，生产要防泄露
    // ---------------------------------------------------------------
    // dev:  eval-cheap-module-source-map —— 快，只映射到行不映射到列
    // prod: hidden-source-map —— 生成 .map 但不写注释，可手动上传到监控平台
    //       绝不可以用 'source-map'：注释留在产物里 → 任何人下载 .map 还原源码
    devtool: isProd ? 'hidden-source-map' : 'eval-cheap-module-source-map',

    // ---------------------------------------------------------------
    // 缓存：让二次构建接近增量。
    // 讨论「Webpack 慢不慢」时必须带上它，否则是不公平对比。
    // ---------------------------------------------------------------
    cache: {
      type: 'filesystem',
      buildDependencies: {
        // 不配的话：改了配置文件但缓存不失效 → "改了配置没生效"的诡异现象
        config: [__filename],
      },
    },

    devServer: {
      port: 3000,
      hot: true, // HMR 需要显式配置（Vite 内置）
      open: true,
    },
  };
};

/**
 * 环境变量说明（§3.4）
 *
 * process 是 Node 全局对象，浏览器里不存在。
 * 下面这行不是"提供了 process"，而是构建期把文本整体替换成字符串字面量。
 *
 *   new webpack.DefinePlugin({
 *     // JSON.stringify 不能省 —— 否则替换后是 production 而不是 "production"
 *     'process.env.API_URL': JSON.stringify(process.env.API_URL),
 *   })
 *
 * 推论：静态替换只能替换完整字面量表达式。
 *   process.env['AP' + 'I_URL']  → 替换不到
 */
