# Changelog

## [1.1.0] - 2025-05-06
- **增強:** `scrape` 工具現在預設輸出 Markdown 格式的內容，並可通過新的 `outputFormat` 輸入參數選擇性地輸出原始 HTML 內容。
- **新增:** 為 `scrape` 工具引入 `turndown` 函式庫 (及其 TypeScript 型別定義 `@types/turndown`)，用於實現 HTML 到 Markdown 的轉換。
- **新增:** 在開發計畫中增加了針對 `scrape` 工具卡頓問題的效能優化計畫。
- **更新:** 調整了 `scrape` 工具的輸入及輸出 Schema 以支援新的 `outputFormat` 參數和相應的輸出結構。
- **更新:** 專案文件 (本計畫、README.md) 已更新以反映 `scrape` 工具的功能增強和新增的依賴。
- **更新:** 測試策略和要求已更新，以包含對 `scrape` 工具新輸出格式的測試。
- **更新:** 技術選型中的 Node.js 版本支援更新為 `^18.0 || ^20.0 || ^22.0`。
- **更新:** 4.4 文件撰寫規則，新增關於 README 雙語呈現與連結的規範。

## [1.0.0] - 2025-05-04
- 初始版本，包含 `search`, `scrape` (僅輸出 HTML), `map` 工具的基本實現。