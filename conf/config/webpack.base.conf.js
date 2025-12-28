var webpack = require('webpack')
var { merge } = require('webpack-merge');
var path = require('path')
var config = require('./index')
var { processConfig, utils } = require('../options');
var loaders = require('./loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
var fs = require('fs');
var entry = [];
var entryFile = ['./src/index.js', './src/index.jsx', './src/index.ts', './src/index.tsx'];
for (var i = 0; i < entryFile.length; i++) {
    try {
        fs.accessSync(utils.rootPath(entryFile[i]), fs.constants.F_OK);
        entry = [utils.rootPath(entryFile[i])];
        break;
    } catch (err) {
        // continue to next candidate
    }
}
var plugins = [];
if (processConfig.dll) {
    plugins = [
        new AddAssetHtmlPlugin({
          filepath: config.dev.assetsDllOutPath + '/react-vendor.js',
          publicPath: config.build.assetsPublicPath + 'js',
          outputPath: 'js',
          includeSourcemap: false
        }),
        new webpack.DllReferencePlugin({
          context: __dirname,
          manifest: utils.rootPath('./dll/react-vendor-manifest.json')
        })
    ]
}
module.exports = {
    entry: [
        ...processConfig.entry,
        ...entry
    ],
    resolve: {
        modules: ['node_modules', 'public'],
        extensions: ['.js','.jsx', '.ts', '.tsx'],
        alias: merge({
            '@': utils.rootPath('./src'),
        }, processConfig.alias)
    },
    module: {
        rules: loaders
    },
    plugins:[
        // 生成 html
        new HtmlWebpackPlugin({
            template: utils.rootPath('./public/index.html'),
            minify: false
        }),
        ...plugins,
    ]
}


