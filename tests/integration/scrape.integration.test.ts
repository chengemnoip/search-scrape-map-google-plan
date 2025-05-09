// tests/integration/scrape.integration.test.ts

import { scrapeToolHandler } from '../../src/tools/scrape';
import { ScrapeInput } from '../../src/tools/scrape/schema';
import { ToolResponse } from '@modelcontextprotocol/sdk'; // 假設 MCP SDK 提供了 ToolResponse 類型

// 使用一個簡單的測試網頁 URL
const TEST_URL = 'https://example.com/';

describe('Scrape Tool Integration Tests', () => {
  jest.setTimeout(30000); // 增加測試超時時間，因為網頁抓取可能需要時間

  test('should scrape page content and return markdown by default', async () => {
    const params: ScrapeInput = {
      url: TEST_URL,
      timeout: 60000, // 明確提供 timeout
      outputFormat: 'markdown', // 明確提供 outputFormat，與預設值一致
    };

    const response: ToolResponse = await scrapeToolHandler(params);

    expect(response).toBeDefined();
    expect(response.isError).toBeFalsy();
    expect(response.content).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content[0].type).toBe('text');

    const scrapedText = response.content[0].text;
    expect(scrapedText).toBeDefined();
    expect(typeof scrapedText).toBe('string');
    // 簡單檢查是否包含預期的 Markdown 內容
    expect(scrapedText).toContain('# Example Domain');
    expect(scrapedText).toContain('This domain is for use in illustrative examples in documents.');
  });

  test('should scrape page content and return html when outputFormat is html', async () => {
    const params: ScrapeInput = {
      url: TEST_URL,
      timeout: 60000, // 明確提供 timeout
      outputFormat: 'html', // 明確提供 outputFormat
    };

    const response: ToolResponse = await scrapeToolHandler(params);

    expect(response).toBeDefined();
    expect(response.isError).toBeFalsy();
    expect(response.content).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content[0].type).toBe('text');

    const scrapedText = response.content[0].text;
    expect(scrapedText).toBeDefined();
    expect(typeof scrapedText).toBe('string');
    // 簡單檢查是否包含預期的 HTML 內容
    expect(scrapedText).toContain('<!doctype html>');
    expect(scrapedText).toContain('<title>Example Domain</title>');
    expect(scrapedText).toContain('<h1>Example Domain</h1>');
  });

    test('should scrape page content and return markdown when outputFormat is markdown', async () => {
        const params: ScrapeInput = {
            url: TEST_URL,
            timeout: 60000, // 明確提供 timeout
            outputFormat: 'markdown', // 明確提供 outputFormat
        };

        const response: ToolResponse = await scrapeToolHandler(params);

        expect(response).toBeDefined();
        expect(response.isError).toBeFalsy();
        expect(response.content).toBeDefined();
        expect(response.content.length).toBeGreaterThan(0);
        expect(response.content[0].type).toBe('text');

        const scrapedText = response.content[0].text;
        expect(scrapedText).toBeDefined();
        expect(typeof scrapedText).toBe('string');
        // 簡單檢查是否包含預期的 Markdown 內容
        expect(scrapedText).toContain('# Example Domain');
        expect(scrapedText).toContain('This domain is for use in illustrative examples in documents.');
    });

  test('should return error for invalid URL', async () => {
    const params: ScrapeInput = {
      url: 'invalid-url', // 無效 URL
      timeout: 60000, // 明確提供 timeout
      outputFormat: 'markdown', // 明確提供 outputFormat
    };

    const response: ToolResponse = await scrapeToolHandler(params);

    expect(response).toBeDefined();
    expect(response.isError).toBeTruthy();
    expect(response.content).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content[0].type).toBe('text');
    expect(response.content[0].text).toContain('抓取錯誤: 請提供有效的 URL'); // 檢查錯誤訊息
  });

  // 可以添加更多測試案例，例如測試 selector, waitForSelector, timeout 等
});