# Search, Scrape, Map MCP Server (TypeScript)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- 假設使用 MIT 授權 -->

一個符合 Model Context Protocol (MCP) 規範的 TypeScript 伺服器，提供網路搜尋、網頁抓取和 Sitemap 解析工具，旨在與支援 MCP 的 AI 助理 (如 Roo Code) 無縫整合。

**版本:** 1.0.0
**GitHub 倉庫:** [https://github.com/chengemnoip/search-scrape-map-google-plan](https://github.com/chengemnoip/search-scrape-map-google-plan)
**原始計畫文件:** [search_mcp_server_TypeScript_plan_250504.md](search_mcp_server_TypeScript_plan_250504.md)

---

## 🚀 功能特色 (Features)

本 MCP 伺服器提供以下核心工具：

*   **網路搜尋 (`search`)**: 透過整合 Google Custom Search JSON API，提供強大的網路搜尋能力。支援指定結果數量和分頁。
*   **網頁抓取 (`scrape`)**: 利用 Playwright (Chromium 核心) 抓取指定 URL 的網頁內容。能夠處理 JavaScript 動態渲染的頁面，並可選擇性地抓取特定 CSS 選擇器對應的元素內容，或等待特定元素載入完成。
*   **Sitemap 解析 (`map`)**: 自動下載並解析 `sitemap.xml` 或 Sitemap Index 文件，快速提取其中包含的所有 URL 列表 (註：目前僅處理索引文件的第一層)。

## 🛠️ 技術棧 (Tech Stack)

*   **語言:** TypeScript 5.x
*   **運行環境:** Node.js (^18.0 || ^20.0)
*   **MCP SDK:** `@modelcontextprotocol/sdk`
*   **核心依賴:**
    *   `search`: `axios` (HTTP 請求)
    *   `scrape`: `playwright` (瀏覽器自動化)
    *   `map`: `axios` (HTTP 請求), `fast-xml-parser` (XML 解析)
*   **Schema 驗證:** `zod`
*   **開發與建置:** `pnpm`, `tsx`, `typescript`, `dotenv`
*   **程式碼品質:** `eslint`, `prettier`
*   **測試:** `jest`, `ts-jest` (目前尚未編寫測試案例)

## ⚙️ 安裝與設定 (Installation & Setup)

### 前置條件 (Prerequisites)

*   **Node.js:** 建議使用 LTS 版本 18 或 20。
*   **pnpm:** 推薦使用 pnpm 作為套件管理器 (`npm install -g pnpm`)。當然，您也可以使用 npm 或 yarn。
*   **Git:** 用於版本控制。
*   **Google API Key & CX ID:** `search` 工具需要 Google Custom Search API 的憑證。

### 安裝步驟 (Installation Steps)

1.  **Clone 倉庫:**
    ```bash
    git clone https://github.com/chengemnoip/search-scrape-map-google-plan.git
    cd search-scrape-map-google-plan
    ```
    (請將上面的 `search-scrape-map-google-plan` 替換為您實際的本地目錄名稱 `search_mcp_server_TypeScript_plan@250504`)

2.  **安裝依賴:**
    ```bash
    pnpm install
    ```
    *   此命令會安裝所有必要的套件，並自動下載 Playwright 所需的 Chromium 瀏覽器。如果瀏覽器下載失敗或需要其他瀏覽器核心，請參考 Playwright 文件執行 `pnpm exec playwright install --with-deps <browser_name>`。

### 環境變數設定 (Environment Variables)

`search` 工具需要 Google API 金鑰和自訂搜尋引擎 ID。您可以透過以下任一方式設定 (推薦方式 1)：

**方式 1: 在 Roo Code MCP 設定中配置 (推薦)**

此方式最為推薦，因為可以集中管理且不需在專案目錄存放敏感資訊。

1.  開啟 Roo Code (或 VS Code) 的 MCP 設定檔。路徑通常類似：
    *   Windows: `C:\Users\<您的使用者名稱>\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\mcp_settings.json`
    *   macOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`
    *   Linux: `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`
2.  找到 `"search-scrape-map-ts-plan"` 這個伺服器的配置區塊。
3.  在其 `env` 物件中填入您的金鑰和 ID：
    ```json
      "env": {
        "GOOGLE_API_KEY": "在此填入您的 Google API Key",
        "GOOGLE_CX_ID": "在此填入您的 Google CX ID"
      },
    ```
4.  儲存檔案並重新啟動 Roo Code / VS Code。

**方式 2: 使用 `.env` 文件 (本地開發備用)**

如果您無法或不想修改 Roo Code 設定，可以將金鑰放在專案根目錄的 `.env` 文件中。

1.  複製範本文件：
    ```bash
    cp .env.example .env
    ```
2.  編輯新建立的 `.env` 文件，填入您的憑證：
    ```dotenv
    # .env
    GOOGLE_API_KEY=在此填入您的 Google API Key
    GOOGLE_CX_ID=在此填入您的 Google CX ID
    # MCP_PORT=53011 # 此伺服器預設使用 stdio，此設定通常不影響
    ```
    **⚠️ 重要安全提示:** `.env` 文件已被 `.gitignore` 排除，切勿將此文件或您的真實金鑰提交到任何版本控制系統 (如 Git)。

**注意:** 伺服器程式設計為優先嘗試讀取 Roo Code 提供的環境變數。如果未提供，才會讀取本地的 `.env` 文件。

## ▶️ 啟動伺服器 (Running the Server)

*   **開發模式 (Development Mode):**
    使用 `tsx` 提供即時重新載入功能，方便開發調試。
    ```bash
    pnpm dev
    ```
    伺服器將以 Stdio (標準輸入/輸出) 模式啟動，並監聽來自 MCP 客戶端的連接請求。修改 `src` 目錄下的程式碼將自動觸發伺服器重啟。

*   **生產模式 (Production Mode):**
    1.  **建置 (Build):** 將 TypeScript 程式碼編譯為 JavaScript。
        ```bash
        pnpm build
        ```
        (編譯結果位於 `dist/` 目錄)
    2.  **啟動 (Start):** 執行編譯後的 JavaScript 程式碼。
        ```bash
        pnpm start
        ```
        (此指令實際執行 `node dist/index.js`)

## 🔧 工具使用說明 (MCP Tool Usage)

當伺服器成功啟動並被 Roo Code 等 MCP 客戶端連接後，即可調用以下工具：

### 1. `search`

*   **功能:** 執行 Google 自訂網路搜尋。
*   **描述:** "使用 Google Custom Search API 執行網路搜尋。"
*   **輸入參數 (`arguments`):**
    *   `query` (string, **必需**): 搜尋的關鍵字詞。
    *   `num` (integer, 可選, 預設 10): 希望返回的結果數量，範圍 1 到 10。
    *   `start` (integer, 可選, 預設 1): 從第幾個結果開始返回（用於分頁，例如 `start=1` 返回 1-10 項，`start=11` 返回 11-20 項）。
*   **輸出:**
    *   成功時: 返回一個文字字串，包含格式化的搜尋結果列表 (標題、連結、摘要)。
    *   失敗時: 返回描述錯誤原因的文字字串。
*   **範例調用 (JSON):**
    ```json
    {
      "tool_name": "search",
      "arguments": {
        "query": "TypeScript best practices",
        "num": 5
      }
    }
    ```

### 2. `scrape`

*   **功能:** 抓取指定 URL 的網頁內容。
*   **描述:** "使用 Playwright 抓取網頁內容，可選定特定元素或等待元素出現。"
*   **輸入參數 (`arguments`):**
    *   `url` (string, **必需**): 要抓取的目標網頁 URL。
    *   `selector` (string, 可選): CSS 選擇器。如果提供，僅返回匹配的第一個元素的 `outerHTML`。省略則返回整個頁面的 HTML。
    *   `waitForSelector` (string, 可選): 在抓取前，等待此 CSS 選擇器對應的元素出現在頁面中。
    *   `timeout` (integer, 可選, 預設 60000): 頁面導航或等待選擇器的最長等待時間（毫秒）。
*   **輸出:**
    *   成功時: 返回包含抓取到的 HTML 內容的文字字串。
    *   失敗時: 返回描述錯誤原因的文字字串（例如超時、找不到元素、URL 無效等）。
*   **範例調用 (JSON):**
    ```json
    // 抓取 GitHub MCP Servers 頁面的組織名稱
    {
      "tool_name": "scrape",
      "arguments": {
        "url": "https://github.com/modelcontextprotocol/servers",
        "selector": "span.author a.url"
      }
    }
    ```
    ```json
    // 抓取 example.com，但先等待 ID 為 #main 的元素出現
    {
      "tool_name": "scrape",
      "arguments": {
        "url": "https://example.com",
        "waitForSelector": "#main"
      }
    }
    ```

### 3. `map`

*   **功能:** 解析 Sitemap 文件並提取其中列出的 URL。
*   **描述:** "下載並解析指定的 Sitemap (sitemap.xml 或 Sitemap Index)，提取其中的 URL 列表。"
*   **輸入參數 (`arguments`):**
    *   `url` (string, **必需**): 指向 `sitemap.xml` 或 Sitemap Index 文件的 URL。
*   **輸出:**
    *   成功時: 返回一個文字字串，包含所有從 Sitemap 中成功提取並驗證為有效 URL 的列表，每行一個 URL。
    *   失敗時: 返回描述錯誤原因的文字字串（例如下載失敗、XML 格式錯誤、URL 無效等）。
*   **目前限制:** 如果輸入的是 Sitemap Index 文件，目前只會提取索引文件中列出的子 Sitemap URL，**不會**遞迴地去下載和解析這些子 Sitemap。
*   **範例調用 (JSON):**
    ```json
    {
      "tool_name": "map",
      "arguments": {
        "url": "https://developer.mozilla.org/sitemaps/en-us/sitemap.xml"
      }
    }
    ```

## ✅ 測試 (Testing)

專案已配置 Jest 和 ts-jest 用於測試。

*   **執行所有測試:**
    ```bash
    pnpm test
    ```
*   **監看模式 (Watch Mode):**
    ```bash
    pnpm test:watch
    ```
*   **產生覆蓋率報告:**
    ```bash
    pnpm test:cov
    ```
    (報告位於 `coverage/` 目錄)

**注意:** 目前尚未編寫任何實際的測試案例 (`tests/` 目錄下只有設定檔)。歡迎貢獻單元測試和整合測試！

## ✨ 程式碼風格 (Code Style)

本專案使用 ESLint 進行語法檢查和風格規範，並使用 Prettier 進行程式碼自動格式化。相關配置已設定完成。

*   **檢查 Lint 錯誤:** `pnpm lint`
*   **自動修復 Lint 問題:** `pnpm lint:fix`
*   **檢查 Prettier 格式:** `pnpm format:check`
*   **自動格式化程式碼:** `pnpm format`

## 📄 授權 (License)

本專案預計採用 **MIT 授權**。完整的授權條款請參見 [LICENSE](LICENSE) 文件。
(注意：`LICENSE` 文件目前是空的，需要填入標準 MIT 授權文本。)

## 💡 已知限制與未來工作 (Known Limitations & Future Work)

*   **API 金鑰安全:** 切勿將您的 `GOOGLE_API_KEY` 或 `GOOGLE_CX_ID` 硬編碼到程式碼中或提交到版本控制系統。請務必使用環境變數 (透過 Roo Code 設定或 `.env` 文件) 來管理這些機密資訊。
*   **`map` 工具遞迴:** 目前 `map` 工具遇到 Sitemap Index 時僅提取索引本身的 URL，尚未實現遞迴下載和解析子 Sitemap 的功能。
*   **測試覆蓋率:** 目前專案缺乏測試，需要為各個工具的 handler 編寫單元測試和整合測試。
*   **錯誤處理:** 可以進一步細化和改進工具的錯誤處理邏輯，提供更友善的錯誤訊息給使用者。
*   **Roo Code 配置的 API Key 回退:** 雖然計畫文件建議，但目前伺服器程式碼中尚未明確實作從 Roo Code 設定讀取環境變數的邏輯，僅依賴 `dotenv` 讀取 `.env` 文件或系統環境變數。未來可考慮加入讀取 MCP 客戶端上下文 (context) 的邏輯。
*   **提交前自動檢查:** 可考慮整合 Husky 和 lint-staged，在 `git commit` 時自動執行 lint 和 format 檢查。
*   **授權文件:** 填寫 `LICENSE` 文件內容。