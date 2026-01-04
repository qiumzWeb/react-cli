
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
// capture previous NODE_STATUS so we can detect a restart that happened
// before the compilation changed it to "running"
var previousNodeStatus = process.env.NODE_STATUS || ''
// // force page reload when html-webpack-plugin template changes
compiler.hooks.make.tap('compilation', function (compilation) {
    compilation.hooks.finishModules.tap('html-webpack-plugin-after-emit', function (modules) {
        // capture the status before flipping to running so done hook can
        // know if we came from a 'rebuild' state
        previousNodeStatus = process.env.NODE_STATUS
        process.env.NODE_STATUS = "running";
        hotMiddleware.publish({ action: 'reload' })
    })
})
// print compiler finished info
compiler.hooks.done.tap('AfterCompiler', function(stats) {
  setTimeout(() => {
    // If we were restarted (previousNodeStatus === 'rebuild') then the
    // hot middleware client in the browser may not have reconnected yet to
    // receive a single publish. Send the reload multiple times with a few
    // retries to increase the chance the client receives it.
    if (previousNodeStatus === 'rebuild' || process.env.NODE_STATUS === 'rebuild') {
        var delays = [0, 500, 1500, 3000]
        delays.forEach(function (d) {
            setTimeout(function () {
                try {
                    hotMiddleware.publish({ action: 'reload' })
                } catch (e) {
                    // swallow any errors from publish and continue retries
                    console.error('hotMiddleware.publish error:', e && e.message)
                }
            }, d)
        })
        // reset captured status so subsequent compilations behave normally
        previousNodeStatus = ''
    }
    console.log('webpack \x1b[1mcompiled \x1B[32mfinished \x1B[37min',new Date().toLocaleString(),'\x1b[0m')
  }, 2000)
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
        if (process.env.NODE_STATUS === 'build') {
            opn(uri)
        }
      })
} else {
    service = app.listen(port, function (err) {
        if (err) {
            console.log(err)
            return
        }
        var uri = 'http://localhost:' + port // 直接显示页面
        console.log('Listening at ' + uri + '\n')
        if (process.env.NODE_STATUS === 'build') {
            opn(uri)
        }

    })
}

module.exports = service
