var startService = require('./conf/webpack-server')
var buildPack = require('./conf/build')
var buildDll = require('./conf/config/webpack.dll.conf.js')
module.exports = {
    startService,
    buildPack,
    buildDll
}