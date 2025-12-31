var { spawn, exec, execSync  } = require('child_process');
var ora = require('ora');
var path = require('path');
var chalk = require('chalk');
var { utils, processConfig }  = require('./options');
var childProcess;

/**
 * 监听目录是否有文件名变动，如果有则重启服务
 */
var watchFiles = [
  utils.configFilePath, processConfig.compileDir,
  ...processConfig.watch
]
watchFiles.forEach(dirname => {
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



/**
 * 启动服务
 */
module.exports = function startServer() {
  var spinner = ora('Starting dev server... \n');
  spinner.start();
  childProcess = spawn(
    'node',
    ['--max_old_space_size=4096', path.join(__dirname, './dev-server.js'), ...process.argv.slice(2)],
    {
      env: Object.assign({}, process.env, {
        NODE_ENV: 'development', // 根据需要修改或添加其它环境变量
        // EXAMPLE_VAR: 'value'
      }),
      stdio: 'pipe'
    }
  );

  // 监听子进程输出
  childProcess.stdout.on('data', (data) => {
    // 保留原有输出
    console.group(`${data}`);
    console.groupEnd();
  });

  // 从 stderr 解析进度并用 ora 显示
  childProcess.stderr.on('data', (data) => {
    const str = data.toString();
    // 匹配百分比，如 "45%" 或 "100%"
    const m = str.match(/(\d{1,3})%/);
    if (m) {
      const pct = m[1];
      spinner.text = `Building ${chalk.green.bold(pct + '%')} `;
      if (pct === '100' || str.includes('100%')) {
        spinner.succeed(chalk.green.bold('Build 100%'));
        if (spinner.isSpinning) spinner.stop();
      }
      return;
    }
    if (str.includes('100%')) {
      spinner.succeed(chalk.green.bold('Build 100%'));
      if (spinner.isSpinning) spinner.stop();
    }
    // 捕获错误等信息并显示
    if (/error/i.test(str) && !str.includes('SassError')) {
      spinner.fail(str.split(/\r?\n/)[0]);
    }
  });

  childProcess.on('close', (exitCode) => {
    if (spinner.isSpinning) spinner.stop();
    console.log(`======= Service Closed (code: ${exitCode}) ======`);
  });
}
