// src/tools/search/schema.ts

import { z } from 'zod';

/**
 * Search 工具的輸入 Schema。
 */
export const SearchInputSchema = z.object({
  query: z.string().min(1, { message: '搜尋關鍵字不可為空' }),
  num: z
    .number()
    .int()
    .min(1)
    .max(10) // Google Custom Search API 通常限制 1-10
    .optional()
    .default(10),
  start: z.number().int().min(1).optional().default(1),
  // 新增 Google Custom Search API 支援的參數
  c2coff: z.string().optional().describe('啟用或停用「簡體中文搜尋」。預設值為 0 (啟用)。支援值：1 (停用), 0 (啟用)。'),
  cr: z.string().optional().describe('限制顯示來自特定國家/地區的文件搜尋結果。使用布林運算子。判斷國家/地區依據：網址 TLD、伺服器 IP 地理位置。'),
  dateRestrict: z.string().optional().describe('以日期限制結果。支援值：d[number] (天), w[number] (週), m[number] (月), y[number] (年)。'),
  exactTerms: z.string().optional().describe('搜尋結果中所有文件必須包含的詞組。'),
  excludeTerms: z.string().optional().describe('不應出現在任何文件中的字詞或詞組。'),
  fileType: z.string().optional().describe('限制只傳回指定擴充功能檔案的結果。'),
  filter: z.enum(["0", "1"]).optional().describe('控管是否開啟重複內容篩選器。預設為 1 (啟用)。支援值：0 (關閉), 1 (啟用)。'),
  gl: z.string().optional().describe('使用者的地理位置 (雙字母國家/地區代碼)。強化來源國家/地區相符的結果。'),
  hq: z.string().optional().describe('將指定查詢字詞附加至查詢 (邏輯 AND 運算)。'),
  lr: z.string().optional().describe('僅搜尋特定語言。例如 lr=lang_ja。'),
  orTerms: z.string().optional().describe('提供要在文件中尋找的其他搜尋字詞，結果必須包含至少一個。'),
  rights: z.string().optional().describe('依授權建立的篩選器。支援值：cc_publicdomain, cc_attribute, cc_sharealike, cc_noncommercial, cc_nonderived 及其組合。'),
  safe: z.enum(["active", "off"]).optional().describe('搜尋安全層級。可接受值："active" (啟用安全搜尋), "off" (停用安全搜尋，預設)。'),
  searchType: z.enum(["image"]).optional().describe('指定搜尋類型。"image"：自訂圖片搜尋。未指定則限於網頁。'),
  siteSearch: z.string().optional().describe('指定要一律納入或從結果中排除的網站。'),
  siteSearchFilter: z.enum(["e", "i"]).optional().describe('控管要納入或排除 siteSearch 參數所命名網站的結果。可接受值："e" (排除), "i" (加入)。'),
  sort: z.string().optional().describe('要套用至結果的排序運算式 (例如 sort=date)。'),
  // 圖片搜尋相關參數 (僅在 searchType 為 image 時相關)
  imgColorType: z.enum(["color", "gray", "mono", "trans"]).optional().describe('傳回黑白、灰階、透明或彩色圖片。'),
  imgDominantColor: z.enum(["black", "blue", "brown", "gray", "green", "orange", "pink", "purple", "red", "teal", "white", "yellow"]).optional().describe('傳回特定主色的圖片。'),
  imgSize: z.enum(["huge", "icon", "large", "medium", "small", "xlarge", "xxlarge"]).optional().describe('傳回指定大小的圖片。'),
  imgType: z.enum(["clipart", "face", "lineart", "stock", "photo", "animated"]).optional().describe('傳回特定類型的圖片。'),
  highRange: z.string().optional().describe('指定搜尋範圍的結束值。與 lowRange 搭配使用。'),
  lowRange: z.string().optional().describe('指定搜尋範圍的起始值。與 highRange 搭配使用。'),
  linkSite: z.string().optional().describe('指定所有搜尋結果應包含特定網址的連結。'),
}).describe('Google 搜尋工具的輸入參數');

/**
 * 單一搜尋結果項目的 Schema。
 */
const SearchResultItemSchema = z.object({
  title: z.string().optional(),
  link: z.string().url().optional(),
  snippet: z.string().optional(),
  displayLink: z.string().optional(),
  // 加入圖片相關資訊
  image: z.object({
    contextLink: z.string().url().optional(),
    thumbnailLink: z.string().url().optional(),
    byteSize: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
  }).optional(),
});

/**
 * Search 工具的輸出 Schema (成功時)。
 * 包含搜尋結果項目陣列。
 */
export const SearchOutputSchema = z.object({
  items: z.array(SearchResultItemSchema).optional(),
  // 加入搜尋資訊
  searchInformation: z.object({
    formattedTotalResults: z.string().optional(),
    formattedSearchTime: z.string().optional(),
    totalResults: z.string().optional(),
    searchTime: z.number().optional(),
  }).optional(),
  // 加入圖片搜尋結果的資訊
  queries: z.object({
    request: z.array(z.object({
      count: z.number().optional(),
      cx: z.string().optional(),
      inputEncoding: z.string().optional(),
      outputEncoding: z.string().optional(),
      safe: z.string().optional(),
      searchTerms: z.string().optional(),
      searchType: z.string().optional(),
      startIndex: z.number().optional(),
      title: z.string().optional(),
      totalResults: z.string().optional(),
    })).optional(),
    nextPage: z.array(z.object({
      count: z.number().optional(),
      cx: z.string().optional(),
      inputEncoding: z.string().optional(),
      outputEncoding: z.string().optional(),
      safe: z.string().optional(),
      searchTerms: z.string().optional(),
      searchType: z.string().optional(),
      startIndex: z.number().optional(),
      title: z.string().optional(),
      totalResults: z.string().optional(),
    })).optional(),
  }).optional(),
}).describe('Google 搜尋工具的輸出結果');

// 方便使用的類型推斷
export type SearchInput = z.infer<typeof SearchInputSchema>;
export type SearchOutput = z.infer<typeof SearchOutputSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;