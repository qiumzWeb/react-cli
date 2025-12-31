var path = require('path');
var fs = require('fs');
var devMode = process.env.NODE_ENV !== 'production';
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var { merge } = require('webpack-merge');
var { utils, processConfig } = require('../options');
var sassGlobalStyles = '';
processConfig.sassGlobalStyles.forEach((item) => {
  return sassGlobalStyles += `@import "${item}";`;
});
try {
  fs.accessSync(utils.rootPath('src/global.scss'), fs.constants.F_OK);
  sassGlobalStyles += `@import "@/global.scss";`;
} catch (err) {
  // console.log(err);
};
module.exports = [
  {
    test: /\.t|jsx?$/,
    use: [
      {
        loader: "thread-loader",
        // 有同样配置的 loader 会共享一个 worker 池
        options: {
          // 产生的 worker 的数量，默认是 (cpu 核心数 - 1)，或者，
          // 在 require('os').cpus() 是 undefined 时回退至 1
          // workers: 3,

          // 一个 worker 进程中并行执行工作的数量
          // 默认为 20
          workerParallelJobs: 60,
    
          // 额外的 node.js 参数
          workerNodeArgs: ['--max-old-space-size=2048'],
    
          // 允许重新生成一个僵死的 work 池
          // 这个过程会降低整体编译速度
          // 并且开发环境应该设置为 false
          poolRespawn: false,
    
          // 闲置时定时删除 worker 进程
          // 默认为 500（ms）
          // 可以设置为无穷大，这样在监视模式(--watch)下可以保持 worker 持续存在
          poolTimeout: 2000,

          // 池分配给 worker 的工作数量
          // 默认为 200
          // 降低这个数值会降低总体的效率，但是会提升工作分布更均一
          // poolParallelJobs: 50,

          // 池的名称
          // 可以修改名称来创建其余选项都一样的池
          name: "node-build-pool"
        },
      },
      {
        loader: 'babel-loader',
          options: merge({
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: 3.22
                }
              ],
              "@babel/preset-react",
              "@babel/preset-flow",
              '@babel/preset-typescript',
            ]
          }, processConfig.babelLoaderOptions)
        }
    ],
    exclude: (modulePath) => {
      // 定义你"强制需要编译"的模块列表
      const includeModules = processConfig.compileDependencies;
      if (modulePath.includes('node_modules')) {
        // 检查当前路径是否包含这些包名
        const shouldInclude = includeModules.some(name => 
          modulePath.includes(`node_modules${path.sep}${name}${path.sep}`));
        return !shouldInclude;
      } else {
        return false;
      }
    }
  },
  {
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    use: [
        {
          loader: 'url-loader',
          options: {
              limit: 1024,
              outputPath: 'imgs',
          }
        }
    ],
  },
  {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    use: [
        {
          loader: 'url-loader',
          options: {
              limit: 10000,
              name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
    ],
  },
  {
    test: /\.(sa|sc|c)ss$/,
    use: [
      devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: merge({
          modules: {
            // 1. 开启“局部模式”（意味着：我要对类名进行处理）
            mode: 'local',
            
            // 2. 定义生成的规则（名字长什么样）
            localIdentName: '[name]__[local]___[hash:base64:5]',
            exportLocalsConvention: 'camelCase',
            
            // 3. 自定义函数：遇到 node_modules 就“放行”，否则“使用上面的规则”
            getLocalIdent: (context, localIdentName, localName, options) => {
              // 如果是 node_modules 里的文件
              if (context.resourcePath.includes('node_modules')) {
                // 直接返回原始类名（相当于变相的 global 模式）
                return localName; 
              }
              
              // 如果是自己 src 里的文件
              // 返回 null，告诉 css-loader：“请用 localIdentName 的规则去生成哈希”
              return null;
            }
          }
        }, processConfig.cssLoaderOptions)
      },
      {
        loader: 'postcss-loader',
        options: {
          // 2. PostCSS 插件配置写在这里
          postcssOptions: merge({
            plugins: [
              require('autoprefixer')({
                overrideBrowserslist: [
                  '> 0.5%',
                  'last 2 versions',
                  'not dead',
                  'iOS >= 9',
                  'Android >= 5'
                ]
              })
              // 如果还有其他插件，继续在这里添加，例如：
              // require('postcss-preset-env')({ ... })
            ]
          }, processConfig.postcssLoaderOptions)
        }
      },
      {
        loader: "sass-loader",
        options: merge({
          additionalData: sassGlobalStyles,
          implementation: require('sass'),
          sassOptions: {
            silenceDeprecations: [
              'legacy-js-api',
              'import',
              'global-builtin',
              'if-function',
            ], // 静默 @import 警告
          },
          sassOptions: {
            fiber: false,
          },
        }, processConfig.sassLoaderOptions)
      }
    ],
  },
]
