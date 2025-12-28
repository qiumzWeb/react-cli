// https://github.com/shelljs/shelljs
require('shelljs/global')
module.exports = function buildPackage() {
    env.NODE_ENV = 'production'
    var path = require('path')
    var config = require('./config')
    var ora = require('ora')
    var webpack = require('webpack')
    var webpackConfig = require('./config/webpack.prod.conf')
    var spinner = ora('building for production...')
    spinner.start()
    var assetsRoot = path.resolve(config.build.assetsRoot)

    rm('-rf', assetsRoot) // 删除 assetsRoot(dist) 目录下的文件及目录， 忽略不存在的目录
    mkdir('-p', assetsRoot) // 若路径中的某些目录尚不存在, 系统将自动建立好那些尚不存在的目录,即一次可以建立多个目录
    cp('-R', 'public/*', assetsRoot) // 复制目录及目录内的所有项目

    // webpack 打包
    webpack(webpackConfig, function (err, stats) {
        spinner.stop()
        if (err) throw err
        process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n')
    })
}

