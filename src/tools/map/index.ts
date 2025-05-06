// src/tools/map/index.ts

import axios, { AxiosError } from 'axios';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { MapInputSchema, MapOutputSchema, MapInput, MapOutput } from './schema';
// 移除類型導入，依賴推斷

/**
 * Map 工具的處理函式。
 * @param params - 經過 MapInputSchema 驗證的輸入參數。
 * @returns - 符合 MCP ToolResponse 格式的 URL 列表或錯誤訊息。
 */
// 移除類型註釋和 extra 參數，完全依賴推斷
async function mapToolHandler(params: MapInput) {
  const { url } = params;
  console.log(`執行 Sitemap 解析: url="${url}"`);

  try {
    // 1. 下載 Sitemap 內容
    console.log(`下載 Sitemap 從 ${url}...`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MCPSitemapBot/1.0)', // 設定 User-Agent
        'Accept': 'application/xml, text/xml', // 優先接受 XML
      },
      responseType: 'text', // 確保以文字形式接收回應
      timeout: 30000, // 設定 30 秒超時
    });
    const xmlData = response.data;

    // 2. 驗證 XML 格式 (可選但建議)
    const validationResult = XMLValidator.validate(xmlData);
    if (validationResult !== true) {
        console.error('Sitemap XML 驗證失敗:', validationResult.err);
        throw new Error(`無效的 Sitemap XML 格式: ${validationResult.err?.msg}`);
    }

    // 3. 解析 XML
    console.log('解析 Sitemap XML...');
    const parser = new XMLParser({
        ignoreAttributes: false, // 保留屬性以便未來擴展，但目前邏輯不使用
        attributeNamePrefix: "@_",
        textNodeName: "#text",
        isArray: (jpath) => {
            // 強制將 url 和 sitemap 標籤視為陣列
            if (jpath === "urlset.url" || jpath === "sitemapindex.sitemap") return true;
            return false; // 其他標籤預設不視為陣列
        }
    });
    const parsedData = parser.parse(xmlData);

    // 4. 提取 URL
    let urls: string[] = [];
    if (parsedData.urlset && Array.isArray(parsedData.urlset.url)) {
      // 處理標準 Sitemap
      console.log('偵測到標準 Sitemap (urlset)...');
      urls = parsedData.urlset.url
        .map((item: any) => item?.loc)
        .filter((locUrl: any): locUrl is string => typeof locUrl === 'string' && locUrl.length > 0); // 添加 any 類型註釋
        console.log(`提取到 ${urls.length} 個 URL。`);
    } else if (parsedData.sitemapindex && Array.isArray(parsedData.sitemapindex.sitemap)) {
      // 處理 Sitemap Index
      console.log('偵測到 Sitemap Index (sitemapindex)...');
      // TODO: 實現遞迴抓取和解析子 Sitemap (目前僅提取索引中的 URL)
      urls = parsedData.sitemapindex.sitemap
        .map((item: any) => item?.loc)
        .filter((locUrl: any): locUrl is string => typeof locUrl === 'string' && locUrl.length > 0); // 添加 any 類型註釋
      console.log(`提取到 ${urls.length} 個子 Sitemap URL (注意：目前未遞迴處理)。`);
      // 可以在此處添加遞迴邏輯或提示使用者這些是索引 URL
    } else {
      console.warn('未知的 Sitemap 格式或內容為空。');
      // 可以在這裡嘗試更寬鬆的解析或返回空結果
    }

    // 5. 驗證輸出格式
    const outputResult: MapOutput = { urls };
    const outputValidation = MapOutputSchema.safeParse(outputResult);
    if (!outputValidation.success) {
        console.error("Map Output 驗證失敗:", outputValidation.error.errors);
         return {
            content: [{ type: 'text' as const, text: '伺服器錯誤：處理 Sitemap 結果格式時發生問題。' }],
            isError: true,
        };
    }

    // 6. 返回結果
    console.log(`Sitemap 解析完成，共找到 ${outputValidation.data.urls.length} 個有效 URL。`);
    // 將 URL 列表格式化為文字輸出
    const outputText = `從 ${url} 解析出的 URL 列表 (${outputValidation.data.urls.length} 個):\n${outputValidation.data.urls.join('\n')}`;

    return {
      content: [{ type: 'text' as const, text: outputText }],
    };

  } catch (error) {
    console.error('執行 Sitemap 解析時發生錯誤:', error);

    let errorMessage = '執行 Sitemap 解析時發生未知錯誤。';
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      errorMessage = `下載 Sitemap 失敗: ${axiosError.message}`;
      if (axiosError.response) {
        errorMessage += ` (狀態碼: ${axiosError.response.status})`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      content: [{ type: 'text' as const, text: `Sitemap 解析錯誤: ${errorMessage}` }],
      isError: true,
    };
  }
}

// 導出 schema 和 handler
export { MapInputSchema, MapOutputSchema, mapToolHandler };