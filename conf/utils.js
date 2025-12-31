var path = require('path')
var fs = require('fs')
var crypto = require('crypto')
var { cosmiconfigSync } = require('cosmiconfig');

var configFilePath = 'build.config.js';

function isObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 获取用户配置信息
 * 该函数尝试从指定位置加载构建配置文件
 * 如果配置文件不存在或无效，则使用空对象作为默认配置
 */
function getUserConfig() {
  var explorer = cosmiconfigSync('build', { searchPlaces: [configFilePath] });
  var userBuildConfig = {};
  try {
    var result = explorer.load(rootPath(configFilePath));
    if (
      result &&
      result.config &&
      isObj(result.config)
    ) {
      userBuildConfig = result.config;
    }
  } catch (e) {
    // ignore
  }
  return userBuildConfig;
}

/*
 * 返回静态资源路径(不需要被处理的资源)
 * project/static
 * */
function assetsPath(_path) {
    return path.posix.join('', _path)
}

function rootPath(..._path) {
    return path.join(process.cwd(), ..._path)
}

// 监听webpack监控以外的文件重启服务
/**
 * 监听文件或目录变化并重启服务
 * @param {string} pathname - 需要监听的文件或目录路径
 * @param {function} restartService - 重启服务的回调函数
 */
function getWatchFileRestartService(pathname, restartService) {
  var reStart = typeof restartService === 'function' && restartService || function () { };
  // 获取文件或目录的状态信息
  fs.stat(pathname, (err, stats) => {
    if (!err) {
      // 监听文件或目录的变化事件
      fs.watch(pathname, (eventType, filename) => {
        // 如果是文件，直接重启服务
        if (stats.isFile()) {
            // 只在文件内容实际修改（mtime 变化）时重启
            fs.stat(pathname, (err2, newStats) => {
              if (err2) return;
              if (eventType == 'rename') {
                reStart();
              }
              if (eventType == 'change') {
                  fs.readFile(pathname, (err2, data) => {
                    if (err2) return;
                    // 计算内容哈希，首次读取时保存哈希，之后比较
                    var hash = crypto.createHash('sha256').update(data).digest('hex');
                    if (!stats._contentHash) {
                      stats._contentHash = hash;
                      return;
                    }
                    // 内容未变则不重启
                    if (stats._contentHash === hash) return;
                    // 更新保存的状态与哈希，避免重复触发
                    stats._contentHash = hash;
                    reStart();
                  });
              }
            });
        } else if (stats.isDirectory()) {
          // 如果是文件夹，则判断是否删除或者新增
          if (eventType == 'rename') {
            reStart();
          }
        }
      })
    }
  });
}

module.exports = {
  configFilePath,
  getWatchFileRestartService,
  rootPath,
  assetsPath,
  getUserConfig,
  isObj
}