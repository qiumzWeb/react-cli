var utils = require('./utils');
var userConfig = utils.getUserConfig();
var { merge } = require('webpack-merge')
var argvs = process.argv.slice(2);
var isHttps = argvs.indexOf('--https') > -1;
var argvPort = argvs.indexOf('--port') > -1 ? argvs[argvs.indexOf('--port') + 1] : null;
var {
    watch, port, dll, commonChunks, proxy, eslint, entry,
    nodeMiddleware, publicPath, buildDir, eslintExclude, alias,
    cssLoaderOptions, postcssLoaderOptions, sassLoaderOptions, 
    babelLoaderOptions, cacheBuildDependencies, compileDependencies,
    sassGlobalStyles, compileDir,
    ...webpackConfig
} = userConfig;


exports.utils = utils;

exports.processConfig = {
    compileDir: (compileDir && typeof compileDir === 'string') ? compileDir : 'src',
    watch: Array.isArray(watch) ? watch : watch ? [watch] : [],
    port: argvPort || port || 8888,
    isHttps,
    dll: dll ? merge({
        chunks: [],
        outpath: utils.rootPath('./dll')
    }, utils.isObj(dll) ? dll : {}) : false,
    commonChunks,
    proxy,
    eslint: eslint || false,
    eslintExclude: eslintExclude || [],
    nodeMiddleware,
    publicPath: publicPath || '/',
    outpath: utils.rootPath(buildDir || './build'),
    entry: Array.isArray(entry) ? entry : entry ? [entry] : [],
    alias: utils.isObj(alias) ? alias : {},
    cssLoaderOptions: utils.isObj(cssLoaderOptions) ? cssLoaderOptions : {},
    postcssLoaderOptions: utils.isObj(postcssLoaderOptions) ? postcssLoaderOptions : {},
    sassLoaderOptions: utils.isObj(sassLoaderOptions) ? sassLoaderOptions : {},
    babelLoaderOptions: utils.isObj(babelLoaderOptions) ? babelLoaderOptions : {},
    cacheBuildDependencies: Array.isArray(cacheBuildDependencies) ? cacheBuildDependencies : [],
    compileDependencies: Array.isArray(compileDependencies) ? compileDependencies : [],
    sassGlobalStyles: Array.isArray(sassGlobalStyles) ? sassGlobalStyles : [],
};

exports.webpackConfig = merge({}, webpackConfig);
