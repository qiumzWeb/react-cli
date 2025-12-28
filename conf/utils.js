var path = require('path')
var fs = require('fs')
var { cosmiconfigSync } = require('cosmiconfig');

function isObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 获取用户配置信息
 * 该函数尝试从指定位置加载构建配置文件
 * 如果配置文件不存在或无效，则使用空对象作为默认配置
 */
function getUserConfig() {
  var explorer = cosmiconfigSync('build', { searchPlaces: ['build.config.js'] });
  var userBuildConfig = {};
  try {
    var result = explorer.load(rootPath('build.config.js'));
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

function rootPath(_path) {
    return path.join(process.cwd(), _path)
}

// 监听webpack监控以外的文件重启服务
function getWatchFileRestartService(pathname, restartService) {
  let isFileRename = false
  fs.access(pathname, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.watch(pathname, (eventType, filename) => {
        if (eventType == 'rename') {
          isFileRename = true
        }
        if (isFileRename) {
          // 检查文件
          // 新增文件 且存在 index 的入口文件时 重启服务
          ['./index.ts', './index.tsx', './index.js', './index.jsx'].forEach(file => {
            fs.access(path.join(pathname, filename, file), fs.constants.F_OK, (err) => {
              if (!err) {
                isFileRename = false;
                typeof restartService === 'function' && restartService();
              }
            });
          })
        }
      })
    }
  });
}

module.exports = {
  getWatchFileRestartService,
  rootPath,
  assetsPath,
  getUserConfig,
  isObj
}