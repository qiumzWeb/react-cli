var { spawn, exec, execSync  } = require('child_process');
var ora = require('ora');
var path = require('path');
var { utils, processConfig }  = require('./options');
var childProcess;

/**
 * 监听目录是否有文件名变动，如果有则重启服务
 */
if (Array.isArray(processConfig.watch) && processConfig.watch.length > 0) {
  processConfig.watch.forEach(dirname => {
    utils.getWatchFileRestartService(utils.rootPath(dirname), () => {
      // 监听进程退出事件
      childProcess.on('exit', (code, signal) => {
        /**
         * 重启服务
         */
        startServer();
      });
      // 杀掉进程
      childProcess.kill('SIGTERM');
    })
  })
}


/**
 * 启动服务
 */
module.exports = function startServer() {
  var spinner = ora();
  spinner.start()
  childProcess = spawn('node', ['--max_old_space_size=2048',path.join(__dirname,  './dev-server.js'), ...process.argv.slice(2)]);
  // 监听子进程输出
  childProcess.stdout.on('data', (data) => {
    console.group(`${data}`);
    console.groupEnd();
  });
  
  childProcess.stderr.on('data', (data) => {
    if (data.toString().includes('100%')) {
      spinner.stop()
    }
  });
  
  childProcess.on('close', (code) => {
    spinner.stop();
    console.log(`======= Service Closed ======`);
  });
}
