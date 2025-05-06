# Search MCP Server (TypeScript)

一個符合 Model Context Protocol (MCP) 規範的 TypeScript 伺服器，提供網路搜尋、網頁抓取和 Sitemap 解析工具。

**版本:** 1.0.0
**計畫文件:** [search_mcp_server_TypeScript_plan_250504.md](search_mcp_server_TypeScript_plan_250504.md)

## 目標

此伺服器旨在提供以下核心功能，以便與支援 MCP 的 AI 助理 (如 Roo Code) 整合：

*   **`search`**: 使用 Google Custom Search JSON API 執行網路搜尋。
*   **`scrape`**: 使用 Playwright 抓取網頁內容，支援動態渲染頁面。
*   **`map`**: 使用 fast-xml-parser 解析 Sitemap (sitemap.xml) 並提取 URL 列表。

## 技術選型

*   **語言:** TypeScript
*   **運行環境:** Node.js (^18.0 || ^20.0)
*   **MCP SDK:** `@modelcontextprotocol/sdk`
*   **核心依賴:**
    *   `search`: `axios`, `google-auth-library` (用於可能的驗證)
    *   `scrape`: `playwright`
    *   `map`: `axios`, `fast-xml-parser`
*   **工具:** `pnpm`, `eslint`, `prettier`, `jest`, `ts-jest`, `tsx`

## 安裝

1.  **Clone 倉庫:**
    ```bash
    git clone <repository-url>
    cd search_mcp_server_TypeScript_plan@250504
    ```
2.  **安裝依賴:** (推薦使用 pnpm)
    ```bash
    pnpm install
    ```
    *   如果 Playwright 瀏覽器沒有自動下載，可能需要手動執行：`pnpm exec playwright install`

## 設定

1.  **複製環境變數範本:**
    ```bash
    cp .env.example .env
    ```
2.  **編輯 `.env` 文件:**
    *   填入您的 Google Custom Search API 金鑰 (`GOOGLE_API_KEY`)。
    *   填入您的 Google 自訂搜尋引擎 ID (`GOOGLE_CX_ID`)。
    *   `MCP_PORT` 為可選配置，預設為 `53011`。

    ```dotenv
    # .env
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
    GOOGLE_CX_ID=YOUR_GOOGLE_CX_ID_HERE
    MCP_PORT=53011
    ```
    **注意:** `.env` 文件已被加入 `.gitignore`，不會被提交到版本控制。

## 啟動指令

*   **開發模式 (使用 tsx 進行熱重載):**
    ```bash
    pnpm dev
    ```
*   **建置:**
    ```bash
    pnpm build
    ```
*   **啟動生產版本 (建置後):**
    ```bash
    pnpm start
    ```

## 工具使用範例 (透過 MCP 客戶端)

假設伺服器正在運行，您可以透過支援 MCP 的客戶端 (例如 Roo Code) 調用以下工具：

*   **`search`**:
    *   **輸入:** `{ "query": "TypeScript MCP SDK", "num": 5 }`
    *   **輸出 (範例):** (包含 5 個搜尋結果的文字或 JSON)
*   **`scrape`**:
    *   **輸入:** `{ "url": "https://modelcontextprotocol.io/", "selector": "h1" }`
    *   **輸出 (範例):** (包含 `<h1>` 標籤內容的文字)
*   **`map`**:
    *   **輸入:** `{ "url": "https://modelcontextprotocol.io/sitemap.xml" }` (假設存在)
    *   **輸出 (範例):** (包含從 Sitemap 提取的 URL 列表的文字)

## 測試

*   **執行所有測試:**
    ```bash
    pnpm test
    ```
*   **執行測試並監看變更:**
    ```bash
    pnpm test:watch
    ```
*   **執行測試並生成覆蓋率報告:**
    ```bash
    pnpm test:cov
    ```
    (報告將生成在 `coverage/` 目錄下)

## 程式碼風格

本專案使用 ESLint 和 Prettier 來確保程式碼風格一致性。

*   **檢查風格:** `pnpm lint`
*   **自動修復風格問題:** `pnpm lint:fix`
*   **檢查格式:** `pnpm format:check`
*   **自動格式化:** `pnpm format`

(計畫文件建議使用 Husky 和 lint-staged 在提交前自動檢查，此部分尚未配置。)

## 授權

(尚未添加授權文件內容)

## 注意事項

*   `map` 工具目前僅處理第一層 Sitemap Index，尚未實現遞迴解析子 Sitemap。
*   錯誤處理機制相對基礎，可進一步完善。
*   測試套件目前為空，需要根據實作添加單元測試和整合測試。