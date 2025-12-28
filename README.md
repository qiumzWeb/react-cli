# buildreact

轻量级的 React 项目服务与构建工具，用于本地开发、构建与静态服务部署。

## 特性
- 本地开发服务器（热重载）
- 项目构建（生产优化）
- 静态文件预览/发布
- 可扩展的配置项与插件接口

## 环境要求
- Node.js >= 12
- npm 或 yarn

## 安装
在项目根目录运行（示例）：
```bash
# 使用 npm
npm install --save-dev qmzreact

# 或使用 yarn
yarn add --dev qmzreact
```

## 使用（示例）
在 package.json 中添加脚本：
```json
{
    "scripts": {
        "dev": "qmzreact dev",
        "build": "qmzreact build",
        "dll": "qmzreact dll",
    }
}
```

常用命令：
- npm run dev    — 启动开发服务器（支持热重载）
- npm run build  — 进行生产构建（压缩、代码分割）
- npm run dll  — 启用dll时， 用于构建dll文件

## 配置
支持项目根目录下的配置文件：
- build.config.js
示例配置：
```js
module.exports = {
    port: 3000,
    publicPath: '/',
    // 构建输出目录
    buildDir: 'dist',
    alias: {
        // 默认配置
        "@": path.resolve(__dirname, 'src')
    },
    // 代理配置
    proxy: {
        '/api': {
            target: 'http://localhost:8080',
            pathRewrite: { '^/api': '' }
        }
    }
    watch: ['./src/components'],
    // 是否启用 https服务
    isHttps: false,
    // 是否启用 dll
    dll: false,
    // 拆包
    commonChunks: {
        "echarts": ["echarts", "zrender"],
    },
    // 是否启用 eslint
    eslint: false,
    // 排除eslint检查的文件
    eslintExclude: ['./src/oldCode'],
    // node 服务中间件函数
    nodeMiddleware: function(req, res){},
    // webpack配置
    cssLoaderOptions: {},
    postcssLoaderOptions:  {},
    sassLoaderOptions:  {},
    babelLoaderOptions:  {},

};
```

## 贡献
欢迎提交 issue 与 PR。请遵循代码风格并补充必要的测试与文档。

## 许可证
MIT（如需其它许可证，请在此处替换）