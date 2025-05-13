# 開發計畫與規則：search_mcp_server_TypeScript_plan@250504

**版本:** 1.1.0
**日期:** 2025-05-06 (已更新)

## 1. 專案概觀

### 1.1 專案目標

開發一個符合 Model Context Protocol (MCP) 規範的伺服器。此伺服器將使用 MCP TypeScript SDK 實現，並提供三個核心的網路資訊處理工具：

1. **`search`**: 利用 Google Custom Search JSON API 執行網路搜尋。
2. **`scrape`**: 抓取網頁內容。此工具預設將主要內容輸出為 Markdown 格式，並可透過輸入參數選擇性輸出原始 HTML 內容。需能處理動態渲染的頁面 (JavaScript-heavy sites) 和基本互動。
3. **`map`**: 解析並提取網站地圖 (sitemap.xml) 中的 URL 列表。

### 1.2 專案範圍

* **包含:**

  * 使用 MCP TypeScript SDK 建立 MCP 伺服器基礎結構。
  * 實現 `search`, `scrape`, `map` 三個 MCP 工具，包含輸入輸出的 schema 定義。
    * 針對 `scrape` 工具，實現預設 Markdown 輸出及可選 HTML 輸出的功能。
  * 為 `scrape` 和 `map` 工具選擇並整合適當的 Node.js 函式庫，包含用於 HTML 轉 Markdown 的函式庫。
  * 建立基本的測試套件 (單元測試與整合測試)，涵蓋新的輸出格式功能。
  * 設定程式碼風格檢查與格式化工具 (ESLint, Prettier)。
  * 建立基本的專案文件 (README.md)，包含新功能的說明。
  * 設定版本控制流程。
* **針對 `scrape` 工具的效能優化計畫:**

  * **實作瀏覽器實例池 (Implement Browser Instance Pool):** 消除每次抓取請求都啟動和關閉瀏覽器的開銷。
  * **加強內容提取控制 (Enhance Content Extraction Control):** 減少返回給客戶端的資料量，特別是在未指定 `selector` 的情況下。
  * **優化錯誤處理和超時設定 (Optimize Error Handling and Timeout Settings):** 更快地響應錯誤和超時，避免長時間的無效等待。
  * **監控和日誌記錄 (Monitoring and Logging):** 更好地理解效能瓶頸所在，方便調試和優化。
* **補齊 Search 工具參數計畫:** (已完成)

 **目標：** 在 `search-scrape-map-google-plan` 專案的 `search` 工具中，實現對 Google Custom Search JSON API 所有列出參數的支援。

 **計畫步驟：**

 1.  **更新輸入 Schema (`schema.ts`)：** 已完成。
     *   修改 `SearchInputSchema`，為所有選定的參數添加對應的 Zod 驗證規則。需要確定每個參數的預期類型 (string, number, boolean, array 等) 和可能的格式限制。
     *   參考 Google Custom Search JSON API 文件，確保 Zod Schema 準確反映 API 的要求。

 2.  **修改 `search` 工具實現 (`index.ts`)：** 已完成。
     *   在 `search` 工具的處理邏輯中，接收更新後的輸入參數。
     *   將接收到的參數映射到 Google Custom Search API 的請求參數名稱。
     *   在構建發送給 Google API 的 HTTP 請求時，包含所有有效的參數。
     *   處理不同參數對 API 響應可能造成的影響 (例如，圖片搜尋結果的結構可能與網頁搜尋不同)。

 3.  **更新 API 請求邏輯：** 已完成。
     *   檢查現有的 `axios` 請求是否能靈活地添加這些參數。可能需要調整請求的構建方式，以便動態地包含參數。

 4.  **處理 API 響應：** 已完成。
     *   根據可能包含的額外資訊 (例如圖片搜尋結果中的圖片連結)，更新 `SearchResultItemSchema` 和 `SearchOutputSchema`。
     *   修改結果格式化邏輯，以便在輸出中包含新參數帶來的額外資訊。

 5.  **更新 README 文件 (`README.md` 和 `README_zhTW.md`)：** 已完成。
     *   在 `search` 工具的使用說明中，詳細列出所有新增的參數、其類型、描述和範例用法。
     *   更新技術棧和已知限制部分，反映專案的變更。

 **預期成果：** 已達成。

 *   `search` 工具將支援更豐富的查詢選項，使其功能更接近 Google Custom Search JSON API 的完整能力。
 *   更新後的 Schema 將提供更精確的工具輸入和輸出定義。
 *   更新後的 README 將為使用者提供清晰的參數使用指南。

* **不包含:**

  * 使用者介面 (UI)。
  * 複雜的身份驗證或授權機制 (超出 MCP 基本要求之外)。
  * 生產環境的部署腳本或配置 (僅專注於開發)。
  * 對 Google Custom Search API 金鑰或 CX ID 的管理 (假設由使用者提供，或透過 Roo Code 設定)。
  * 複雜的反爬蟲策略應對。

## 2. 技術選型

* **程式語言:** TypeScript
* **Node.js 版本:** ^18.0 || ^20.0 || ^22.0 (建議使用 LTS 版本)
* **MCP SDK:** `@modelcontextprotocol/sdk` (官方推薦的 MCP TypeScript SDK)
* **核心工具依賴:**
  * **`search`**:
    * `google-auth-library` (用於可能的 API 金鑰驗證)
    * **`axios`**: 推薦用於發送 HTTP 請求至 Google Custom Search API。(備案: Node.js 內建 `fetch`)
  * **`scrape`**:
    * **Playwright (`playwright`)**: **首選推薦**。功能強大，支援多種瀏覽器 (Chromium, Firefox, WebKit)，能有效處理動態內容和互動。社群活躍，文件完善。
    * **Turndown (`turndown`)**: **新增**。用於將抓取到的 HTML 內容轉換為 Markdown 格式。
    * **`@types/turndown`**: **新增**。Turndown 的 TypeScript 型別定義。
    * (備案) Puppeteer (`puppeteer`): 另一個優秀選擇，專注於 Chromium/Chrome。
  * **`map`**:
    * **`fast-xml-parser`**: 推薦。基於 Context7 查詢的高效通用 XML 解析器，適用於解析 Sitemap (XML) 格式。
    * (備案) `xml2js`: 另一個通用的 XML 解析器，若 `fast-xml-parser` 遇到問題可考慮。
* **測試框架:** Jest (`jest`, `ts-jest`, `@types/jest`)
* **程式碼風格:** ESLint (`eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`), Prettier (`prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`)
* **依賴管理:** **pnpm** (推薦，因其效率和磁碟空間優化)。(備案: npm/yarn)
* **版本控制:** Git

## 3. 專案結構

建議採用以下目錄結構：

```
search_mcp_server_TypeScript_plan@250504/
├── dist/                     # 編譯後的 JavaScript 程式碼
├── node_modules/             # 專案依賴 (由 pnpm 管理)
├── src/                      # TypeScript 原始碼
│   ├── core/                 # MCP 伺服器核心邏輯
│   │   └── server.ts         # MCP 伺服器初始化、工具註冊
│   ├── tools/                # 各個 MCP 工具的實現
│   │   ├── search/
│   │   │   ├── index.ts      # Search 工具主邏輯
│   │   │   └── schema.ts     # Search 工具的 Input/Output Schema
│   │   ├── scrape/
│   │   │   ├── index.ts      # Scrape 工具主邏輯
│   │   │   └── schema.ts     # Scrape 工具的 Input/Output Schema (將包含 outputFormat 參數及相應的輸出結構調整)
│   │   ├── map/
│   │   │   ├── index.ts      # Map 工具主邏輯
│   │   │   └── schema.ts     # Map 工具的 Input/Output Schema
│   │   └── toolRegistry.ts   # 工具註冊表 (可選，用於集中管理)
│   ├── types/                # 自定義 TypeScript 類型或介面
│   │   └── index.ts
│   └── utils/                # 通用輔助函式 (例如錯誤處理、配置讀取)
│       └── index.ts
│   └── index.ts              # 應用程式進入點 (啟動 MCP 伺服器)
├── tests/                    # 測試檔案
│   ├── unit/                 # 單元測試 (針對 utils, 各工具內部邏輯)
│   └── integration/          # 整合測試 (測試 MCP 工具的完整流程)
│   └── jest.setup.ts         # Jest 全局設置 (例如環境變數模擬)
├── .env.example              # 環境變數範例 (包含 API 金鑰等敏感資訊提示)
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── LICENSE                   # 專案授權文件 (例如 MIT)
├── package.json
├── pnpm-lock.yaml
├── README.md                 # 專案說明文件
└── tsconfig.json             # TypeScript 編譯器配置
```

## 4. 開發規則

### 4.1 程式碼風格

* **一致性與工具:** 為了確保程式碼風格的一致性與高品質，**強制要求使用 ESLint 和 Prettier**。建議配置 Husky (`husky`) 和 lint-staged (`lint-staged`) 在 Git 提交前自動執行檢查與格式化。
* **ESLint 配置:** 應基於 `eslint:recommended` 和 `plugin:@typescript-eslint/recommended`，並整合 `eslint-config-prettier` 以避免衝突。可視團隊偏好加入其他規則 (例如 `eslint-plugin-import`)。
* **Prettier 配置:** 使用 `.prettierrc.json` 檔案定義具體格式化規則 (例如 `tabWidth`, `singleQuote`, `trailingComma` 等)。
* **編碼與註解:** 所有專案內的文字檔案（包含但不限於 `.ts`, `.json`, `.md`）**必須**採用 **UTF-8 (無 BOM)** 編碼儲存。同時，所有程式碼層級的註解**必須**使用**繁體中文**撰寫，以利團隊溝通。

### 4.2 版本控制

* **採用 GitHub Flow:**
  1. `main` 分支為主要穩定分支，隨時可部署 (或代表最新穩定開發版)。
  2. 開發新功能或修復 Bug 時，從 `main` 分支建立新的 **feature 分支** (例如 `feat/implement-search-tool` 或 `fix/scrape-timeout-issue`)。
  3. 在 feature 分支上進行開發和提交。
  4. 完成開發後，推送 feature 分支到遠端倉庫。
  5. 建立 **Pull Request (PR)** 將 feature 分支合併回 `main` 分支。
  6. PR 需要至少一位團隊成員進行 **程式碼審查 (Code Review)**。
  7. 審查通過且所有自動化檢查 (CI/CD 測試) 通過後，合併 PR 到 `main` 分支。
  8. 合併後可刪除 feature 分支。
* **提交訊息 (Commit Message):** 建議遵循 Conventional Commits 規範 (例如 `feat:`, `fix:`, `docs:`, `test:`, `refactor:` 等)，有助於自動生成 CHANGELOG 和版本管理。

### 4.3 測試策略

* **測試框架:** Jest + `ts-jest`。
* **單元測試 (Unit Tests):**
  * 存放於 `tests/unit/`。
  * 專注於測試獨立的函式、模組或類別。
  * 對於有外部依賴 (如 API 呼叫、檔案系統) 的單元，使用 Jest 的模擬 (Mocking) 功能進行隔離。
  * 目標：覆蓋核心業務邏輯、輔助函式 (`utils`) 和各工具的內部處理邏輯，包含 `scrape` 工具不同輸出格式的邏輯。
* **整合測試 (Integration Tests):**
  * 存放於 `tests/integration/`。
  * 測試模組間的互動以及工具與 MCP 伺服器的整合。
  * 測試 `search`, `scrape`, `map` 工具的端到端流程，從接收 MCP 請求到返回結果，需測試 `scrape` 工具使用 `outputFormat` 參數後的行為。
  * 對於外部 API (Google Search)，可以考慮：
    * 使用測試帳號和額度有限的 API 金鑰進行真實呼叫 (謹慎使用)。
    * 建立 Mock Server 或使用錄製/回放 (record/replay) 機制模擬 API 回應。
    * 針對 `scrape`，使用本地或遠端的已知測試網頁。
    * 針對 `map`，使用本地的測試 Sitemap 文件。
* **測試覆蓋率:** 鼓勵追求合理的測試覆蓋率 (例如 70-80% 以上)，但不應盲目追求數字，重點是測試關鍵路徑和邊界條件。可以使用 Jest 的 `--coverage` 選項生成覆蓋率報告。

### 4.4 文件撰寫

* **README.md:**
  * 必須包含專案描述、目標、技術選型。
  * 詳細的 **安裝步驟** (Clone 倉庫、安裝依賴 `pnpm install`)。
  * **設定步驟** (如何建立 `.env` 文件，需要哪些環境變數，例如 Google API Key, CX ID)。
  * **啟動指令** (例如 `pnpm dev` 啟動開發伺服器，`pnpm build` 編譯，`pnpm start` 啟動編譯後版本)。
  * **工具使用範例** (展示如何透過 MCP 客戶端調用 `search`, `scrape`, `map` 工具，包含輸入參數和預期輸出格式)。
    * 針對 `scrape` 工具，需特別說明新增的 `outputFormat` 參數用法及其不同值的效果。
  * **執行測試指令** (`pnpm test`)。
* **雙語呈現與連結:**
  *   專案應包含兩個 README 文件：
  *   `README.md`：作為主要的英文說明文件。
  *   `README_zhTW.md`：作為繁體中文說明文件。
  *   兩個文件都應放置在專案的根目錄下 (`search_mcp_server_TypeScript_plan@250504/`)。
  *   在每個 README 文件的頂部，應放置清晰的語言切換連結，方便使用者在兩個版本之間跳轉。例如，在 `README.md` 頂部放置指向 `README_zhTW.md` 的連結（標示為「繁體中文」），在 `README_zhTW.md` 頂部放置指向 `README.md` 的連結（標示為「English」）。
  *   兩個版本的 README 內容應盡可能保持同步更新，涵蓋上述所有必要資訊（專案描述、目標、技術選型、安裝、設定、啟動、工具使用範例、測試指令等）。
* **程式碼註解:**
  * 使用 **TSDoc** (`/** ... */`) 格式為公開的函式、類別、方法和複雜的程式碼區塊添加註解。
  * 註解應說明其功能、參數 (`@param`) 和返回值 (`@returns`)。
* **環境變數:** 使用 `.env.example` 文件列出所有必要的環境變數及其用途，但不包含實際值。將 `.env` 文件加入 `.gitignore`。

### 4.5 依賴管理

* **使用 pnpm:**
  * 所有依賴通過 `pnpm add <package>` 或 `pnpm add -D <package>` (開發依賴) 添加。
  * 定期執行 `pnpm up --latest` 更新依賴，並進行測試以確保兼容性。
  * `pnpm-lock.yaml` 文件必須提交到版本控制，以確保團隊成員和 CI/CD 環境使用完全相同的依賴版本。
* **依賴審查:** 定期檢查並移除不再使用的依賴。謹慎引入新的依賴，評估其必要性、維護狀態和安全性。

### 4.6 資訊獲取原則

* **優先使用 Context7:** 為確保技術資訊的時效性與準確性，在查詢函式庫文件、API 用法、尋找程式碼範例或解決技術問題時，**必須優先**使用 Context7 MCP 工具 (`use context7`)。應避免僅依賴可能已過時的內部訓練資料或知識庫，以獲取最新且與版本相對應的資訊。
* **強制驗證套件名稱:** 在執行 `pnpm add` 安裝任何 npm 套件（特別是核心依賴、MCP 相關或較不常見的函式庫）之前，**必須**使用 Context7 的 `resolve-library-id` 和 `get-library-docs` 工具，交叉驗證其 **確切的官方 npm 套件名稱**。此舉旨在杜絕因計畫文件筆誤、名稱變更或個人臆測而導致安裝錯誤套件的情況。驗證過的名稱應優先於計畫文件中可能存在的舊名稱。

## 5. 環境變數

專案將需要以下環境變數，應在 `.env` 文件中配置：

```dotenv
# .env.example

# Google Custom Search API
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
GOOGLE_CX_ID=YOUR_GOOGLE_CUSTOM_SEARCH_ENGINE_ID

# Playwright (可選，用於指定瀏覽器路徑或下載位置)
# PLAYWRIGHT_BROWSERS_PATH=

# MCP Server (可選，用於配置伺服器監聽端口等)
MCP_PORT=53011
```

## 6. Roo Code 整合與配置

開發與測試完成後，為了讓 Roo Code 能夠發現並使用此 MCP 伺服器，需要進行以下配置：

* **添加啟動指令:** 將此 MCP 伺服器的**啟動指令**（例如，`node dist/index.js` 或 `pnpm start`，根據最終實現）添加到 Roo Code 的 MCP 設定檔中。
  * 設定檔路徑：`C:\Users\ARen\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\mcp_settings.json` (請注意，此路徑可能因作業系統或 Roo Code 版本而異)。
* **API 金鑰配置:**
  * `GOOGLE_API_KEY` 和 `GOOGLE_CX_ID` 這類敏感資訊**也可以**在上述 Roo Code 的 `mcp_settings.json` 文件中進行配置。
  * **建議:** 伺服器在實現時，應設計成**優先考慮**從 MCP 連線時 Roo Code 客戶端提供的設定或上下文 (Context) 中讀取這些金鑰（如果可用）。如果客戶端沒有提供，則回退 (fallback) 到讀取本地的 `.env` 文件。這種方式提供了更高的靈活性和安全性。

## 7. 變更日誌

### [1.1.0] - 2025-05-06

- **增強:** `scrape` 工具現在預設輸出 Markdown 格式的內容，並可通過新的 `outputFormat` 輸入參數選擇性地輸出原始 HTML 內容。
- **新增:** 為 `scrape` 工具引入 `turndown` 函式庫 (及其 TypeScript 型別定義 `@types/turndown`)，用於實現 HTML 到 Markdown 的轉換。
- **新增:** 在開發計畫中增加了針對 `scrape` 工具卡頓問題的效能優化計畫。
- **新增:** 補齊 Search 工具參數計畫 (詳見 1.2 專案範圍)。
- **更新:** 調整了 `scrape` 工具的輸入及輸出 Schema 以支援新的 `outputFormat` 參數和相應的輸出結構。
- **更新:** 專案文件 (本計畫、README.md) 已更新以反映 `scrape` 工具的功能增強和新增的依賴。
- **更新:** 測試策略和要求已更新，以包含對 `scrape` 工具新輸出格式的測試。
- **更新:** 技術選型中的 Node.js 版本支援更新為 `^18.0 || ^20.0 || ^22.0`。
- **更新:** 4.4 文件撰寫規則，新增關於 README 雙語呈現與連結的規範。
- **更新:** search 工具將支援更豐富的查詢選項，使其功能更接近 Google Custom Search JSON API 的完整能力。

### [1.0.0] - 2025-05-04

- 初始版本，包含 `search`, `scrape` (僅輸出 HTML), `map` 工具的基本實現。

---
