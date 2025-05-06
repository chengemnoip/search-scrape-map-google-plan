// src/tools/scrape/index.ts

import { chromium, Browser, Page } from 'playwright'; // 移除 PlaywrightLaunchOptions
import { ScrapeInputSchema, ScrapeOutputSchema, ScrapeInput, ScrapeOutput } from './schema';
// 移除類型導入，依賴推斷 (如同 search 工具的修正)

/**
 * Scrape 工具的處理函式。
 * @param params - 經過 ScrapeInputSchema 驗證的輸入參數。
 * @returns - 符合 MCP ToolResponse 格式的抓取結果或錯誤訊息。
 */
// 移除類型註釋和 extra 參數，完全依賴推斷
async function scrapeToolHandler(params: ScrapeInput) {
  const { url, selector, waitForSelector, timeout } = params;

  console.log(`執行網頁抓取: url="${url}"${selector ? `, selector="${selector}"` : ''}${waitForSelector ? `, waitForSelector="${waitForSelector}"` : ''}, timeout=${timeout}`);

  let browser: Browser | null = null;
  try {
    // Playwright 啟動選項 (移除類型註釋)
    const launchOptions = {
      headless: true, // 預設使用無頭模式
      // args: ['--no-sandbox', '--disable-setuid-sandbox'] // 在某些環境下可能需要
    };

    // 啟動瀏覽器
    browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({
        // 可選：設定 User Agent, viewport 等
        // userAgent: 'Mozilla/5.0 ...',
        // viewport: { width: 1280, height: 720 }
    });
    const page: Page = await context.newPage();

    // 導航到目標 URL
    console.log(`導航至 ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeout }); // 等待 DOM 加載完成

    // 如果需要，等待特定選擇器
    if (waitForSelector) {
      console.log(`等待選擇器 "${waitForSelector}"...`);
      await page.waitForSelector(waitForSelector, { state: 'visible', timeout: timeout });
    }

    let content: string;
    // 獲取內容
    if (selector) {
      console.log(`抓取選擇器 "${selector}" 的 outerHTML...`);
      const element = await page.locator(selector).first(); // 使用 first() 避免多個匹配時報錯
      if (!element) {
          throw new Error(`選擇器 "${selector}" 未找到元素。`);
      }
      content = await element.evaluate(node => node.outerHTML);
    } else {
      console.log('抓取整個頁面 HTML...');
      content = await page.content();
    }

    const finalUrl = page.url(); // 獲取最終的 URL (可能經過重定向)

    // 關閉瀏覽器
    await browser.close();
    browser = null; // 標記為已關閉

    console.log(`抓取成功: ${finalUrl}`);

    const result: ScrapeOutput = { content, url: finalUrl };

    // 驗證輸出 (可選)
    const validationResult = ScrapeOutputSchema.safeParse(result);
     if (!validationResult.success) {
        console.error("Scrape Output 驗證失敗:", validationResult.error.errors);
         return {
            content: [{ type: 'text' as const, text: '伺服器錯誤：處理抓取結果格式時發生問題。' }],
            isError: true,
        };
    }

    // 返回成功結果 (只返回抓取的內容)
    return {
      content: [{ type: 'text' as const, text: validationResult.data.content }],
    };

  } catch (error) {
    console.error('執行網頁抓取時發生錯誤:', error);
    if (browser) {
      await browser.close(); // 確保瀏覽器被關閉
    }

    let errorMessage = '執行網頁抓取時發生未知錯誤。';
     if (error instanceof Error) {
        // 處理 Playwright 可能拋出的特定錯誤類型
        if (error.message.includes('Timeout')) {
            errorMessage = `操作超時 (${timeout}ms): ${error.message}`;
        } else if (error.message.includes('failed to find element matching selector')) {
            errorMessage = `找不到元素: ${error.message}`;
        } else if (error.message.includes('net::ERR_')) {
            errorMessage = `導航錯誤: ${error.message}`;
        }
        else {
            errorMessage = error.message;
        }
    }

    return {
      content: [{ type: 'text' as const, text: `抓取錯誤: ${errorMessage}` }],
      isError: true,
    };
  }
}

// 導出 schema 和 handler
export { ScrapeInputSchema, ScrapeOutputSchema, scrapeToolHandler };