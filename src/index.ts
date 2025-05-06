// src/index.ts

/**
 * 應用程式主入口點。
 * 初始化並啟動 MCP 伺服器。
 * 繁體中文註解範例。
 */
import { startServer } from './core/server';

async function main() {
  console.log('啟動 MCP 伺服器...');
  try {
    await startServer();
    console.log('MCP 伺服器已成功啟動。');
    // 在這裡可以添加更多啟動後的邏輯，例如監聽關閉信號
  } catch (error) {
    console.error('啟動 MCP 伺服器時發生錯誤:', error);
    process.exit(1); // 錯誤時退出
  }
}

// 執行主函式
main();