#!/usr/bin/env node

const { startService, buildPack, buildDll } = require('../index');

const command = process.argv[2];

async function run() {
  try {
    switch (command) {
      case 'dev':
        // 如果是异步的，加 await
        startService(); 
        break;
      case 'build':
        buildPack();
        break;
      case 'dll':
        buildDll();
        break;
      default:
        console.log('未知命令...');
        process.exit(1);
    }
  } catch (error) {
    console.error('执行出错:', error);
    process.exit(1);
  }
}

run();