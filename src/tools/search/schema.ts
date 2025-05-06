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
  // 可選：未來可加入更多 Google API 支援的參數，例如 siteSearch, lr 等
  // siteSearch: z.string().optional(),
  // lr: z.string().optional(),
}).describe('Google 搜尋工具的輸入參數');

/**
 * 單一搜尋結果項目的 Schema。
 */
const SearchResultItemSchema = z.object({
  title: z.string().optional(),
  link: z.string().url().optional(),
  snippet: z.string().optional(),
  displayLink: z.string().optional(),
  // 可選：加入圖片、縮圖等資訊
  // image: z.object({ contextLink: z.string().url(), thumbnailLink: z.string().url() }).optional(),
});

/**
 * Search 工具的輸出 Schema (成功時)。
 * 包含搜尋結果項目陣列。
 */
export const SearchOutputSchema = z.object({
  items: z.array(SearchResultItemSchema).optional(),
  // 可選：加入搜尋資訊，例如 totalResults
  // searchInformation: z.object({ totalResults: z.string() }).optional(),
}).describe('Google 搜尋工具的輸出結果');

// 方便使用的類型推斷
export type SearchInput = z.infer<typeof SearchInputSchema>;
export type SearchOutput = z.infer<typeof SearchOutputSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;