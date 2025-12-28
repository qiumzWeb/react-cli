var webpack = require('webpack');
var { merge } = require('webpack-merge');
var config = require('../config');
var path = require('path');
var baseWebpackConfig = require('./webpack.base.conf');
var ESLintPlugin = require('eslint-webpack-plugin');
var options = require('../options');
var { utils, processConfig } = options;

var devConf = merge(baseWebpackConfig, {
    mode: 'development',
    devtool: false, // 是否生成 sourceMap 文件
    entry: [path.resolve(__dirname, '../dev-client.js')],
    output: {
        publicPath: config.dev.assetsPublicPath,
    },
    cache: config.dev.cachesDllDirectory,
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProgressPlugin(),
    ]
}, options.webpackConfig)
if (config.dev.eslint) {
  devConf.plugins.push(new ESLintPlugin({
    context: utils.rootPath('./src'),
    exclude: processConfig.eslintExclude,
    failOnError: false,
    lintDirtyModulesOnly: true,
    extensions: ['ts', 'tsx'],
  }))
}
module.exports = devConf;
