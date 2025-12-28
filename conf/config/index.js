var path = require('path');
var { processConfig, webpackConfig, utils } = require('../options');
var dllChunks = Array.isArray(processConfig.dll.chunks) ? processConfig.dll.chunks : [];
var commonChunks = utils.isObj(processConfig.commonChunks) ? processConfig.commonChunks : {};
var proxy = utils.isObj(processConfig.proxy) ? processConfig.proxy : {};
var proxyTable = {};
for (let key in proxy) {
    proxyTable[key] = {
        target: proxy[key].target,
        changeOrigin: true,
        pathRewrite: proxy[key].pathRewrite || { [`^${key}`]: '' },
        secure: false,
    }
};


module.exports = {
    build: {
        assetsRoot: processConfig.outpath,
        assetsPublicPath: processConfig.publicPath,
        assetsDllChunks: {
            ['react-vendor']: ['react', 'react-dom', 'react-router', 'react-router-dom', ...dllChunks],
        },
        assetsChunks: commonChunks,
        cachesDllDirectory: {
          type: 'filesystem',
          name: 'build_production',
          // 开启压缩
          compression: 'gzip',
          buildDependencies: {
            config: [
              './build.config.js'
            ]
          }
        },
    },
    dev: {
        port: processConfig.port,
        eslint: processConfig.eslint,
        assetsDllOutPath: processConfig.dll.outpath,
        assetsPublicPath: processConfig.publicPath,
        cachesDllDirectory: {
          type: 'filesystem',
          name: 'local_development',
          buildDependencies: {
            config: [
              './build.config.js'
            ]
          }
        },
        proxyTable,
        cssSourceMap: false
    }
}
