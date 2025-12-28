
var config = require('./config');
var path = require('path');
var express = require('express');
var https = require('https');
var fs = require('fs');
var webpack = require('webpack');
var opn = require('open');
var proxyMiddleware = require('http-proxy-middleware');
var webpackConfig = require('./config/webpack.dev.conf');
var options = require('./options');
var { utils, processConfig } = options;
var port = config.dev.port
var proxyTable = config.dev.proxyTable
var app = express()
var compiler = webpack(webpackConfig)
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
})
var hotMiddleware = require('webpack-hot-middleware')(compiler)
// // force page reload when html-webpack-plugin template changes
compiler.hooks.make.tap('compilation', function (compilation) {
    compilation.hooks.finishModules.tap('html-webpack-plugin-after-emit', function (modules) {
        hotMiddleware.publish({ action: 'reload' })
    })
})
// print compiler finished info
compiler.hooks.done.tap('AfterCompiler', function(stats) {
  setTimeout(() => {
    console.log('webpack \x1b[1mcompiled \x1B[32mfinished \x1B[37min',new Date().toLocaleString(),'\x1b[0m')
  }, 1000)
})


// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
    var options = proxyTable[context]
    if (typeof options === 'string') {
        options = { target: options }
    }
    app.use(context, proxyMiddleware.createProxyMiddleware(options))
})
// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())
// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)
// serve pure static assets
app.use('/', express.static('./public'))
app.use('/', function(req, res, next){
    if (typeof processConfig.nodeMiddleware === 'function') {
        processConfig.nodeMiddleware(req, res)
    }
    // res.cookie('process_env', process.env.NODE_ENV.replace(/\"/g, ""), {
    //     // domain: '.cainiao.com'
    // })
    // res.cookie('WEB_BASE_URL', 'http://' + req.headers.host)
    next()
})

var service = null;

if (processConfig.isHttps) {
    service = https.createServer({
        key: fs.readFileSync(path.resolve(__dirname, './server.key')),
        cert: fs.readFileSync(path.resolve(__dirname, './server.cert'))
      }, app)
      .listen(port, function (err) {
        if (err) {
            console.log(err)
            return
        }
        var uri = 'https://localhost:' + port // 直接显示页面
        console.log('Listening at ' + uri + '\n')
        opn(uri)
      })
} else {
    service = app.listen(port, function (err) {
        if (err) {
            console.log(err)
            return
        }
        var uri = 'http://localhost:' + port // 直接显示页面
        console.log('Listening at ' + uri + '\n')
        opn(uri)

    })
}

module.exports = service
