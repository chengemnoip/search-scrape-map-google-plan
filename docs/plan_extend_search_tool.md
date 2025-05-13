# 補齊 Search 工具參數計畫

**目標：** 在 `search-scrape-map-google-plan` 專案的 `search` 工具中，實現對 Google Custom Search JSON API 所有列出參數的支援。

**計畫步驟：**

1.  **更新輸入 Schema (`schema.ts`)：**
    *   修改 `SearchInputSchema`，為所有選定的參數添加對應的 Zod 驗證規則。需要確定每個參數的預期類型 (string, number, boolean, array 等) 和可能的格式限制。
    *   參考 Google Custom Search JSON API 文件，確保 Zod Schema 準確反映 API 的要求。

2.  **修改 `search` 工具實現 (`index.ts`)：**
    *   在 `search` 工具的處理邏輯中，接收更新後的輸入參數。
    *   將接收到的參數映射到 Google Custom Search API 的請求參數名稱。
    *   在構建發送給 Google API 的 HTTP 請求時，包含所有有效的參數。
    *   處理不同參數對 API 響應可能造成的影響 (例如，圖片搜尋結果的結構可能與網頁搜尋不同)。

3.  **更新 API 請求邏輯：**
    *   檢查現有的 `axios` 請求是否能靈活地添加這些參數。可能需要調整請求的構建方式，以便動態地包含參數。

4.  **處理 API 響應：**
    *   根據可能包含的額外資訊 (例如圖片搜尋結果中的圖片連結)，更新 `SearchResultItemSchema` 和 `SearchOutputSchema`。
    *   修改結果格式化邏輯，以便在輸出中包含新參數帶來的額外資訊。

5.  **更新 README 文件 (`README.md` 和 `README_zhTW.md`)：**
    *   在 `search` 工具的使用說明中，詳細列出所有新增的參數、其類型、描述和範例用法。
    *   更新技術棧和已知限制部分，反映專案的變更。

**預期成果：**

*   `search` 工具將支援更豐富的查詢選項，使其功能更接近 Google Custom Search JSON API 的完整能力。
*   更新後的 Schema 將提供更精確的工具輸入和輸出定義。
*   更新後的 README 將為使用者提供清晰的參數使用指南。