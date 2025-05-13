// src/tools/search/index.ts

import axios, { AxiosError } from 'axios';
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
async function searchToolHandler(params: SearchInput) {
  // 檢查必要的環境變數是否存在
  if (!GOOGLE_API_KEY) {
    console.error('錯誤：缺少 GOOGLE_API_KEY 環境變數。');
    const errorContent = { type: 'text' as const, text: '伺服器錯誤：缺少 Google API 金鑰配置。' };
    return {
      content: [errorContent],
      isError: true,
    };
  }
  if (!GOOGLE_CX_ID) {
    console.error('錯誤：缺少 GOOGLE_CX_ID 環境變數。');
    const errorContent = { type: 'text' as const, text: '伺服器錯誤：缺少 Google 自訂搜尋引擎 ID 配置。' };
    return {
      content: [errorContent],
      isError: true,
    };
  }

  const {
    query,
    num,
    start,
    c2coff,
    cr,
    dateRestrict,
    exactTerms,
    excludeTerms,
    fileType,
    filter,
    gl,
    hq,
    lr,
    orTerms,
    rights,
    safe,
    searchType,
    siteSearch,
    siteSearchFilter,
    sort,
    imgColorType,
    imgDominantColor,
    imgSize,
    imgType,
    highRange, // 新增
    lowRange,  // 新增
    linkSite,  // 新增
  } = params;

  console.log(`執行 Google 搜尋: query="${query}"`);

  // 構建 API 請求參數物件 (移到 try 塊外部)
  const apiParams: Record<string, any> = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CX_ID,
    q: query,
    num: num,
    start: start,
  };

  // 添加其他可選參數（僅當它們在輸入中存在時）
  if (c2coff !== undefined) apiParams.c2coff = c2coff;
  if (cr !== undefined) apiParams.cr = cr;
  if (dateRestrict !== undefined) apiParams.dateRestrict = dateRestrict;
  if (exactTerms !== undefined) apiParams.exactTerms = exactTerms;
  if (excludeTerms !== undefined) apiParams.excludeTerms = excludeTerms;
  if (fileType !== undefined) apiParams.fileType = fileType;
  if (filter !== undefined) apiParams.filter = filter;
  if (gl !== undefined) apiParams.gl = gl;
  if (hq !== undefined) apiParams.hq = hq;
  if (lr !== undefined) apiParams.lr = lr;
  if (orTerms !== undefined) apiParams.orTerms = orTerms;
  if (rights !== undefined) apiParams.rights = rights;
  if (safe !== undefined) apiParams.safe = safe;
  if (searchType !== undefined) {
    apiParams.searchType = searchType;
    // 圖片搜尋相關參數，僅在 searchType 為 image 時添加
    if (searchType === 'image') {
      if (imgColorType !== undefined) apiParams.imgColorType = imgColorType;
      if (imgDominantColor !== undefined) apiParams.imgDominantColor = imgDominantColor;
      if (imgSize !== undefined) apiParams.imgSize = imgSize;
      if (imgType !== undefined) apiParams.imgType = imgType;
    }
  }
  if (siteSearch !== undefined) apiParams.siteSearch = siteSearch;
  if (siteSearchFilter !== undefined) apiParams.siteSearchFilter = siteSearchFilter;
  if (sort !== undefined) apiParams.sort = sort;
  if (highRange !== undefined) apiParams.highRange = highRange; // 新增
  if (lowRange !== undefined) apiParams.lowRange = lowRange;   // 新增
  if (linkSite !== undefined) apiParams.linkSite = linkSite;   // 新增


  console.log('API 請求參數:', apiParams); // 輸出完整的 API 請求參數，方便調試

  try {
    // 發送請求
    const response = await axios.get(GOOGLE_SEARCH_API_ENDPOINT, {
      params: apiParams,
    });

    // 處理回應
    const responseData = response.data;

    // 提取需要的欄位並驗證輸出格式
    const searchResult: SearchOutput = {
      items: responseData.items?.map((item: any): SearchResultItem => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        // 提取圖片相關資訊
        image: item.image ? {
          contextLink: item.image.contextLink,
          thumbnailLink: item.image.thumbnailLink,
          byteSize: item.image.byteSize,
          height: item.image.height,
          width: item.image.width,
        } : undefined,
      })) || [],
      // 提取搜尋資訊
      searchInformation: responseData.searchInformation ? {
        formattedTotalResults: responseData.searchInformation.formattedTotalResults,
        formattedSearchTime: responseData.searchInformation.formattedSearchTime,
        totalResults: responseData.searchInformation.totalResults,
        searchTime: responseData.searchInformation.searchTime,
      } : undefined,
      // 提取 queries 資訊 (用於下一頁等)
      queries: responseData.queries ? {
        request: responseData.queries.request,
        nextPage: responseData.queries.nextPage,
      } : undefined,
    };

    // 使用 Zod 驗證最終輸出是否符合 Schema (可選但建議)
    const validationResult = SearchOutputSchema.safeParse(searchResult);
    if (!validationResult.success) {
        console.error("Search Output 驗證失敗:", validationResult.error.errors);
        // 可以選擇返回部分結果或錯誤
         const errorContent = { type: 'text' as const, text: '伺服器錯誤：處理搜尋結果格式時發生問題。' };
         return {
            content: [errorContent],
            isError: true,
        };
    }


    // 將搜尋結果格式化為文字輸出
    let outputText = `搜尋 "${query}" 的結果`;
    if (searchResult.searchInformation?.formattedTotalResults) {
      outputText += ` (約 ${searchResult.searchInformation.formattedTotalResults} 項結果`;
      if (searchResult.searchInformation?.formattedSearchTime) {
        outputText += `, 耗時 ${searchResult.searchInformation.formattedSearchTime} 秒`;
      }
      outputText += `)`;
    }
    outputText += ` (第 ${start} 到 ${start + (searchResult.items?.length || 0) - 1} 項):\n\n`;

    if (searchResult.items && searchResult.items.length > 0) {
        searchResult.items.forEach((item, index) => {
            outputText += `${start + index}. ${item.title || '無標題'}\n`;
            outputText += `   連結: ${item.link || '無連結'}\n`;
            if (item.snippet) {
              outputText += `   摘要: ${item.snippet}\n`;
            }
            if (item.image?.thumbnailLink) {
              outputText += `   縮圖: ${item.image.thumbnailLink}\n`;
            }
            outputText += `\n`;
        });
    } else {
        outputText += "找不到相關結果。\n";
    }

    // 添加下一頁資訊 (如果存在)
    if (searchResult.queries?.nextPage && searchResult.queries.nextPage.length > 0) {
      const nextPageInfo = searchResult.queries.nextPage[0];
      // 確保 nextPageInfo 存在且屬性不為 undefined
      if (nextPageInfo && nextPageInfo.startIndex !== undefined && nextPageInfo.totalResults !== undefined) {
        outputText += `\n下一頁從第 ${nextPageInfo.startIndex} 項開始 (共 ${nextPageInfo.totalResults} 項結果)。`;
      }
    }


    // 返回 ToolResponse
    const successContent = { type: 'text' as const, text: outputText };
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

    const errorContent = { type: 'text' as const, text: errorMessage };
    return {
      content: [errorContent],
      isError: true,
    };
  }
}

// 導出 schema、handler
export { SearchInputSchema, SearchOutputSchema, searchToolHandler };