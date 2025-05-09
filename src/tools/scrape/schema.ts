// src/tools/scrape/schema.ts

import { z } from 'zod';

/**
 * Scrape 工具的輸入 Schema。
 */
export const ScrapeInputSchema = z.object({
  url: z.string().url({ message: '請提供有效的 URL' }),
  selector: z.string().optional().describe('CSS 選擇器，用於僅抓取特定元素的 outerHTML'),
  waitForSelector: z.string().optional().describe('等待此 CSS 選擇器出現在頁面上'),
  timeout: z.number().int().positive().optional().default(60000).describe('頁面加載或等待選擇器的超時時間（毫秒）'),
  outputFormat: z.enum(['markdown', 'html']).optional().default('markdown').describe('指定輸出內容的格式，預設為 markdown'), // 新增 outputFormat
}).describe('網頁抓取工具的輸入參數');

/**
 * Scrape 工具的輸出 Schema (成功時)。
 */
export const ScrapeOutputSchema = z.object({
  markdown: z.string().optional().describe('抓取到的網頁內容 (Markdown 格式)'), // 修改為可選的 markdown 欄位
  html: z.string().optional().describe('抓取到的網頁內容 (原始 HTML 格式)'), // 新增可選的 html 欄位
  url: z.string().url().describe('實際抓取的最終 URL'),
}).describe('網頁抓取工具的輸出結果');

// 方便使用的類型推斷
export type ScrapeInput = z.infer<typeof ScrapeInputSchema>;
export type ScrapeOutput = z.infer<typeof ScrapeOutputSchema>;