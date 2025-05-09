// src/tools/scrape/index.ts

import { chromium, Browser, Page } from 'playwright';
import { ScrapeInputSchema, ScrapeOutputSchema, ScrapeInput, ScrapeOutput } from './schema';
import TurndownService from 'turndown'; // 引入 TurndownService

// 在模組層級創建一個可選的瀏覽器實例
let browserInstance: Browser | null = null;

/**
 * 獲取或創建 Playwright 瀏覽器實例。
 * 實現瀏覽器實例池，避免重複啟動和關閉瀏覽器。
 */
async function getBrowserInstance(): Promise<Browser> {
  if (browserInstance && !browserInstance.isConnected()) {
    // 如果現有實例存在但已斷開連接，則設置為 null
    browserInstance = null;
  }

  if (!browserInstance) {
    const launchOptions = {
      headless: true, // 預設使用無頭模式
      // args: ['--no-sandbox', '--disable-setuid-sandbox'] // 在某些環境下可能需要
    };
    console.log('啟動新的瀏覽器實例...');
    browserInstance = await chromium.launch(launchOptions);
  }

  return browserInstance;
}


/**
 * Scrape 工具的處理函式。
 * @param params - 經過 ScrapeInputSchema 驗證的輸入參數。
 * @returns - 符合 MCP ToolResponse 格式的抓取結果或錯誤訊息。
 */
async function scrapeToolHandler(params: ScrapeInput) {
  const { url, selector, waitForSelector, timeout, outputFormat } = params; // 引入 outputFormat

  console.log(`執行網頁抓取: url="${url}"${selector ? `, selector="${selector}"` : ''}${waitForSelector ? `, waitForSelector="${waitForSelector}"` : ''}, timeout=${timeout}, outputFormat=${outputFormat}`);

  let context;
  let page: Page | null = null;

  try {
    // 獲取瀏覽器實例
    const browser = await getBrowserInstance();
    
    // 從實例創建新的上下文和頁面
    context = await browser.newContext({
        // 可選：設定 User Agent, viewport 等
        // userAgent: 'Mozilla/5.0 ...',
        // viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // 導航到目標 URL
    console.log(`導航至 ${url}...`);
    // 使用 AbortController 實現更精確的超時控制（Playwright goto 已有 timeout，此處作為備選或額外控制）
    const navigationPromise = page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeout }); // 等待 DOM 加載完成
    await navigationPromise;


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
      content = await element.evaluate((node: Element) => node.outerHTML);
    } else {
      // 加強內容提取控制：在沒有 selector 時，優先獲取頁面主要文本內容
      console.log('抓取頁面主要文本內容...');
      // 可以嘗試更智能的方式提取主要內容，例如使用特定的庫或基於內容結構判斷
      // 這裡簡單地獲取 body 的 innerText 作為示例
      try {
          content = await page.locator('body').innerText();
      } catch (e) {
          console.warn('無法獲取 body innerText，嘗試獲取整個頁面 content()');
          content = await page.content(); // 回退到獲取整個頁面 HTML
      }
    }

    const finalUrl = page.url(); // 獲取最終的 URL (可能經過重定向)

    // 關閉頁面和上下文，但不關閉瀏覽器實例
    await page.close();
    await context.close();
    page = null; // 標記為已關閉

    console.log(`抓取成功: ${finalUrl}`);

    let result: ScrapeOutput;

    // 根據 outputFormat 處理內容
    if (outputFormat === 'markdown') {
      const turndownService = new TurndownService();
      const markdownContent = turndownService.turndown(content);
      result = { markdown: markdownContent, url: finalUrl };
    } else { // outputFormat === 'html'
      result = { html: content, url: finalUrl };
    }

    // 驗證輸出
    const validationResult = ScrapeOutputSchema.safeParse(result);
     if (!validationResult.success) {
        console.error("Scrape Output 驗證失敗:", validationResult.error.errors);
         return {
            content: [{ type: 'text' as const, text: '伺服器錯誤：處理抓取結果格式時發生問題。' }],
            isError: true,
        };
    }

    // 返回成功結果
    // 根據 outputFormat 返回相應的內容
    return {
      content: [{
        type: 'text' as const,
        text: outputFormat === 'markdown' ? validationResult.data.markdown || '' : validationResult.data.html || ''
      }],
    };

  } catch (error) {
    console.error('執行網頁抓取時發生錯誤:', error);
    // 在錯誤發生時確保頁面和上下文被關閉
    if (page) {
      await page.close();
    }
    if (context) {
        await context.close();
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