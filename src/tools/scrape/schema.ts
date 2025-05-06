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
}).describe('網頁抓取工具的輸入參數');

/**
 * Scrape 工具的輸出 Schema (成功時)。
 */
export const ScrapeOutputSchema = z.object({
  content: z.string().describe('抓取到的網頁 HTML 內容'),
  url: z.string().url().describe('實際抓取的最終 URL'),
}).describe('網頁抓取工具的輸出結果');

// 方便使用的類型推斷
export type ScrapeInput = z.infer<typeof ScrapeInputSchema>;
export type ScrapeOutput = z.infer<typeof ScrapeOutputSchema>;