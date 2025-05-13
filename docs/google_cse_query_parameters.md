# Google Custom Search JSON API v1 - cse.list 查詢參數

以下是從 Google Custom Search JSON API v1 `cse.list` 方法參考頁面抓取的查詢參數列表：

| 參數名稱         | 類型                 | 描述                                                                                                                               |
| :--------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `c2coff`         | string               | 啟用或停用「簡體中文搜尋」。預設值為 0 (啟用)。支援值：1 (停用), 0 (啟用)。                                                              |
| `cr`             | string               | 限制顯示來自特定國家/地區的文件搜尋結果。使用布林運算子。判斷國家/地區依據：網址 TLD、伺服器 IP 地理位置。參閱[國家/地區參數值頁面](https://developers.google.com/custom-search/docs/xml_results#countryCollections)。 |
| `cx`             | string               | 要用於這項要求的程式化搜尋引擎 ID。                                                                                                |
| `dateRestrict`   | string               | 以日期限制結果。支援值：`d[number]` (天), `w[number]` (週), `m[number]` (月), `y[number]` (年)。                                           |
| `exactTerms`     | string               | 搜尋結果中所有文件必須包含的詞組。                                                                                                 |
| `excludeTerms`   | string               | 不應出現在任何文件中的字詞或詞組。                                                                                                 |
| `fileType`       | string               | 限制只傳回指定擴充功能檔案的結果。參閱 [Google 可建立索引的檔案類型](https://support.google.com/webmasters/answer/35287?hl=zh-Hant)。       |
| `filter`         | string               | 控管是否開啟重複內容篩選器。預設為 1 (啟用)。支援值：0 (關閉), 1 (啟用)。                                                                  |
| `gl`             | string               | 使用者的地理位置 (雙字母國家/地區代碼)。強化來源國家/地區相符的結果。參閱[國家/地區代碼頁面](https://developers.google.com/custom-search/docs/xml_results#countryCodes)。 |
| `googlehost`     | string               | **已淘汰**。使用 `gl` 參數。執行搜尋時所用的當地 Google 網域。                                                                         |
| `highRange`      | string               | 指定搜尋範圍的結束值。與 `lowRange` 搭配使用。                                                                                     |
| `hl`             | string               | 設定使用者介面語言。明確設定可改善效能和品質。參閱[介面語言](https://developers.google.com/custom-search/docs/xml_results#interfaceLanguages)。 |
| `hq`             | string               | 將指定查詢字詞附加至查詢 (邏輯 AND 運算)。                                                                                           |
| `imgColorType`   | enum (ImgColorType)  | 傳回黑白、灰階、透明或彩色圖片。可接受值：`"color"`, `"gray"`, `"mono"`, `"trans"`。                                                 |
| `imgDominantColor`| enum (ImgDominantColor)| 傳回特定主色的圖片。可接受值：`"black"`, `"blue"`, `"brown"`, `"gray"`, `"green"`, `"orange"`, `"pink"`, `"purple"`, `"red"`, `"teal"`, `"white"`, `"yellow"`。 |
| `imgSize`        | enum (ImgSize)       | 傳回指定大小的圖片。可接受值：`"huge"`, `"icon"`, `"large"`, `"medium"`, `"small"`, `"xlarge"`, `"xxlarge"`。                         |
| `imgType`        | enum (ImgType)       | 傳回特定類型的圖片。可接受值：`"clipart"`, `"face"`, `"lineart"`, `"stock"`, `"photo"`, `"animated"`。                                 |
| `linkSite`       | string               | 指定所有搜尋結果應包含特定網址的連結。                                                                                             |
| `lowRange`       | string               | 指定搜尋範圍的起始值。與 `highRange` 搭配使用。                                                                                     |
| `lr`             | string               | 僅搜尋特定語言。例如 `lr=lang_ja`。參閱支援的語言列表。                                                                              |
| `num`            | integer              | 要傳回的搜尋結果數量。有效值 1 到 10。                                                                                             |
| `orTerms`        | string               | 提供要在文件中尋找的其他搜尋字詞，結果必須包含至少一個。                                                                                   |
| `q`              | string               | 查詢字串。                                                                                                                         |
| `relatedSite`    | (deprecated) string  | **已淘汰**。                                                                                                                       |
| `rights`         | string               | 依授權建立的篩選器。支援值：`cc_publicdomain`, `cc_attribute`, `cc_sharealike`, `cc_noncommercial`, `cc_nonderived` 及其組合。              |
| `safe`           | enum (Safe)          | 搜尋安全層級。可接受值：`"active"` (啟用安全搜尋), `"off"` (停用安全搜尋，預設)。                                                           |
| `searchType`     | enum (SearchType)    | 指定搜尋類型。`"image"`：自訂圖片搜尋。未指定則限於網頁。                                                                               |
| `siteSearch`     | string               | 指定要一律納入或從結果中排除的網站。                                                                                               |
| `siteSearchFilter`| enum (SiteSearchFilter)| 控管要納入或排除 `siteSearch` 參數所命名網站的結果。可接受值：`"e"` (排除), `"i"` (加入)。                                                |
| `sort`           | string               | 要套用至結果的排序運算式 (例如 `sort=date`)。                                                                                      |
| `start`          | integer (uint32 format)| 要傳回的第一個結果的索引。每頁預設 10 個結果。`start + num` 總和不能大於 100。`num` 最大值為 10。                                         |