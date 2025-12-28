var webpack = require('webpack');
var path = require('path');
var { merge } = require('webpack-merge');
var config = require('./index');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
var baseWebpackConfig = require('./webpack.base.conf');
var TerserPlugin = require('terser-webpack-plugin');
var splitChunks = require('./chunks');
var options = require('../options');
var { utils } = options;

var webpackConfig = merge(baseWebpackConfig, {
    mode: 'production',
    output: {
      publicPath: config.build.assetsPublicPath,
      path: config.build.assetsRoot,
      filename: (chunk) => {
          return utils.assetsPath('js/react-[name].js')
      },
      chunkFilename: (chunk) => {
          return utils.assetsPath('js/react-[name].chunk.[contenthash].js')
      }
    },
    cache: config.build.cachesDllDirectory,
    // 拆包优化
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            warnings: false,
            compress: {
              comparisons: false,
              drop_console: true,
              drop_debugger: true,
            },
            parse: {},
            mangle: true,
            output: {
              comments: false,
              ascii_only: true
            }
          },
          parallel: true,
          extractComments: false
        }),
        new CssMinimizerPlugin({
          parallel: true
        })
      ],
      removeEmptyChunks: true,
      sideEffects: true,
      concatenateModules: true,
      providedExports: true,
      usedExports: true,
      splitChunks: splitChunks,
    },
    plugins: [
      // extract css into its own file
      // vendor_alifd
      new MiniCssExtractPlugin({
        ignoreOrder: true,
        filename: function(module){
          let name = module && module.chunk && module.chunk.name
          if (name != 'main') {
            name = 'vendor'
          }
          return utils.assetsPath(`css/react-${name}.css`)
        },
        chunkFilename: utils.assetsPath('css/react-[name].chunk.[contenthash].css'),
      }),
    ]
}, options.webpackConfig)

module.exports = webpackConfig
