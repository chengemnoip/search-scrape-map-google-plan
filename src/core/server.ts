import { ScrapeInputSchema } from '../tools/scrape/schema';
// src/core/server.ts

/**
 * MCP 伺服器核心邏輯。
 * 負責初始化伺服器、註冊工具以及開始監聽連線。
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Updated path
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"; // Added stdio transport
import dotenv from 'dotenv';
import { z } from 'zod'; // Added zod
// MCPTool type definition is not directly exported from mcp.js or stdio.js
// We will import specific tool types later when defining tools if needed.

// 載入 .env 檔案中的環境變數
// 確保在任何可能使用環境變數的程式碼之前調用 config()
dotenv.config();

// 僅導入工具 handler
import { searchToolHandler } from '../tools/search/index';
import { scrapeToolHandler } from '../tools/scrape/index';
import { mapToolHandler } from '../tools/map/index'; // 導入 map handler

// Tools and resources will be registered directly on the server instance

/**
 * 啟動 MCP 伺服器。
 */
export async function startServer(): Promise<void> {
  // 載入 .env 檔案中的環境變數
  dotenv.config();

  // 定義伺服器名稱和版本
  const serverName = "SearchMCP";
  const serverVersion = "1.0.0";

  // 創建 MCP 伺服器實例
  const server = new McpServer({
    name: serverName,
    version: serverVersion
    // 其他選項，例如 logLevel: 'debug'
  });

  // --- 工具註冊 ---
  console.log('註冊工具...');

  server.tool('search',
    // 直接在此處定義 schema 形狀
    {
      query: z.string().min(1, { message: '搜尋關鍵字不可為空' }).describe('要執行的搜尋查詢'),
      num: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .default(10)
        .describe('要返回的搜尋結果數量 (1-10)'),
      start: z.number().int().min(1).optional().default(1).describe('結果的起始索引 (用於分頁)'),
    },
    searchToolHandler  // The async function to handle the tool call
    // 注意：輸出 schema (SearchOutputSchema) 由 handler 的返回類型推斷，
    // 或者如果 handler 返回 ToolResponse，則由 ToolResponse 的泛型參數推斷。
    // McpServer 的 .tool 方法簽名設計為接收輸入 schema 和 handler。
  );
  console.log("  - 工具 'search' 已註冊。");

  // 註冊 scrape 工具
  // 使用導入的 ScrapeInputSchema
  server.tool('scrape',
    ScrapeInputSchema.shape, // 使用完整的輸入 schema 的原始形狀
    scrapeToolHandler
  );
  console.log("  - 工具 'scrape' 已註冊。");

  // 註冊 map 工具
  server.tool('map',
    // 直接定義 map schema 形狀
    {
      url: z.string().url({ message: '請提供有效的 Sitemap URL' }).describe('要解析的 Sitemap URL'),
    },
    mapToolHandler
  );
  console.log("  - 工具 'map' 已註冊。");

  // --- 資源註冊 ---
  // 稍後將在此處使用 server.resource() 註冊資源 (如果需要)
  console.log('註冊資源... (稍後實現)');
  // Example (placeholder):
  // server.resource("placeholder_resource", "placeholder://data", async () => ({ contents: [{ uri: "placeholder://data", text: "Placeholder Data" }] }));


  // 創建並連接 Stdio 傳輸 (根據計畫，預設使用 stdio)
  const transport = new StdioServerTransport();
  console.log('連接到 Stdio 傳輸...');
  await server.connect(transport);
  console.log(`MCP 伺服器 '${serverName}' v${serverVersion} 已透過 Stdio 啟動並等待連接...`);


  // 優雅關閉處理
  const shutdown = async (signal: string) => {
    console.log(`\n收到 ${signal} 信號，正在關閉 MCP 伺服器...`);
    try {
      // StdioTransport 不需要顯式 close，伺服器關閉時會處理
      // 如果使用其他 transport (如 HTTP)，可能需要 transport.close()
      await server.close(); // 關閉伺服器實例
      console.log('MCP 伺服器已關閉。');
      process.exit(0);
    } catch (err) {
      console.error('關閉伺服器時發生錯誤:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Stdio 模式下，伺服器會持續運行直到進程結束或收到關閉信號
  // 不需要像 HTTP 伺服器那樣顯式監聽端口
}