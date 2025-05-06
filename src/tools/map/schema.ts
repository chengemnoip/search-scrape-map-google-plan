// src/tools/map/schema.ts

import { z } from 'zod';

/**
 * Map 工具的輸入 Schema。
 */
export const MapInputSchema = z.object({
  url: z.string().url({ message: '請提供有效的 Sitemap URL' }),
}).describe('Sitemap 解析工具的輸入參數');

/**
 * Map 工具的輸出 Schema (成功時)。
 */
export const MapOutputSchema = z.object({
  urls: z.array(z.string().url()).describe('從 Sitemap 中提取的 URL 列表'),
}).describe('Sitemap 解析工具的輸出結果');

// 方便使用的類型推斷
export type MapInput = z.infer<typeof MapInputSchema>;
export type MapOutput = z.infer<typeof MapOutputSchema>;