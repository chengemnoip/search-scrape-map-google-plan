// src/tools/search/index.ts

import axios, { AxiosError } from 'axios';
// 移除類型導入，依賴推斷
import { SearchInputSchema, SearchOutputSchema, SearchInput, SearchOutput, SearchResultItem } from './schema';

// 從環境變數讀取 API 金鑰和 CX ID
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID;
const GOOGLE_SEARCH_API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';

/**
 * Search 工具的處理函式。
 * @param params - 經過 SearchInputSchema 驗證的輸入參數。
 * @returns - 包含搜尋結果或錯誤訊息的物件，其結構將由 SDK 推斷。
 */
// 移除類型註釋和 extra 參數，完全依賴推斷
async function searchToolHandler(params: SearchInput) {
  // 檢查必要的環境變數是否存在
  if (!GOOGLE_API_KEY) {
    console.error('錯誤：缺少 GOOGLE_API_KEY 環境變數。');
    const errorContent = { type: 'text' as const, text: '伺服器錯誤：缺少 Google API 金鑰配置。' }; // 使用 'as const' 幫助推斷
    return {
      content: [errorContent],
      isError: true,
    };
  }
  if (!GOOGLE_CX_ID) {
    console.error('錯誤：缺少 GOOGLE_CX_ID 環境變數。');
    const errorContent = { type: 'text' as const, text: '伺服器錯誤：缺少 Google 自訂搜尋引擎 ID 配置。' }; // 使用 'as const'
    return {
      content: [errorContent],
      isError: true,
    };
  }

  const { query, num, start } = params;

  console.log(`執行 Google 搜尋: query="${query}", num=${num}, start=${start}`);

  try {
    // 構建 API 請求 URL
    const requestUrl = `${GOOGLE_SEARCH_API_ENDPOINT}?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX_ID}&q=${encodeURIComponent(
      query
    )}&num=${num}&start=${start}`;

    // 發送請求
    const response = await axios.get(requestUrl);

    // 處理回應
    const responseData = response.data;

    // 提取需要的欄位並驗證輸出格式
    const searchResult: SearchOutput = {
      items: responseData.items?.map((item: any): SearchResultItem => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
      })) || [],
    };

    // 使用 Zod 驗證最終輸出是否符合 Schema (可選但建議)
    const validationResult = SearchOutputSchema.safeParse(searchResult);
    if (!validationResult.success) {
        console.error("Search Output 驗證失敗:", validationResult.error.errors);
        // 可以選擇返回部分結果或錯誤
         const errorContent = { type: 'text' as const, text: '伺服器錯誤：處理搜尋結果格式時發生問題。' }; // 使用 'as const'
         return {
            content: [errorContent],
            isError: true,
        };
    }


    // 將搜尋結果格式化為文字輸出
    let outputText = `搜尋 "${query}" 的結果 (第 ${start} 到 ${start + (searchResult.items?.length || 0) - 1} 項):\n\n`;
    if (searchResult.items && searchResult.items.length > 0) {
        searchResult.items.forEach((item, index) => {
            outputText += `${start + index}. ${item.title || '無標題'}\n`;
            outputText += `   連結: ${item.link || '無連結'}\n`;
            outputText += `   摘要: ${item.snippet || '無摘要'}\n\n`;
        });
    } else {
        outputText += "找不到相關結果。\n";
    }


    // 返回 ToolResponse
    const successContent = { type: 'text' as const, text: outputText }; // 使用 'as const'
    return {
       content: [successContent],
    };

  } catch (error) {
    console.error('執行 Google 搜尋時發生錯誤:', error);

    let errorMessage = '執行 Google 搜尋時發生未知錯誤。';
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        // API 返回了錯誤狀態碼
        errorMessage = `Google API 錯誤: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data?.error?.message || axiosError.response.data)}`;
      } else if (axiosError.request) {
        // 請求已發出，但未收到回應
        errorMessage = 'Google API 請求超時或無回應。';
      } else {
        // 請求設置錯誤
        errorMessage = `請求設置錯誤: ${axiosError.message}`;
      }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    const errorContent = { type: 'text' as const, text: errorMessage }; // 使用 'as const'
    return {
      content: [errorContent],
      isError: true,
    };
  }
}

// 移除工具定義導出，改為在 server.ts 中註冊
// 導出 schema、handler 和 schema 的 shape
export { SearchInputSchema, SearchOutputSchema, searchToolHandler };
// 移除不再需要的 Shape 導出