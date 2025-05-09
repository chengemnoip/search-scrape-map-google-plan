# Search, Scrape, Map MCP Server (TypeScript)

[繁體中文](README_zhTW.md) | **English**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Assuming MIT License -->

A TypeScript server compliant with the Model Context Protocol (MCP), providing web search, web scraping, and Sitemap parsing tools, designed for seamless integration with MCP-enabled AI assistants like Roo Code.

**Version:** 1.1.0
**GitHub Repository:** [https://github.com/chengemnoip/search-scrape-map-google-plan](https://github.com/chengemnoip/search-scrape-map-google-plan)
**Original Plan Document (Chinese):** [search_mcp_server_TypeScript_plan_250504.md](search_mcp_server_TypeScript_plan_250504.md)

---

## 🚀 Features

This MCP server offers the following core tools:

*   **Web Search (`search`)**: Leverages the Google Custom Search JSON API for powerful web searching capabilities. Supports specifying the number of results and pagination.
*   **Web Scraping (`scrape`)**: Uses Playwright (Chromium core) to scrape web content from a given URL. Capable of handling dynamically rendered pages via JavaScript, optionally scraping content from specific CSS selectors, or waiting for specific elements to load. **Now supports outputting content in Markdown format by default, with an option to get raw HTML.**
*   **Sitemap Parsing (`map`)**: Automatically downloads and parses `sitemap.xml` or Sitemap Index files, quickly extracting the list of URLs contained within (Note: Currently only processes the first level of index files).

## 🛠️ Tech Stack

*   **Language:** TypeScript 5.x
*   **Runtime:** Node.js (^18.0 || ^20.0 || ^22.0)
*   **MCP SDK:** `@modelcontextprotocol/sdk`
*   **Core Dependencies:**
    *   `search`: `axios` (HTTP requests)
    *   `scrape`: `playwright` (Browser automation), `turndown` (HTML to Markdown)
    *   `map`: `axios` (HTTP requests), `fast-xml-parser` (XML parsing)
*   **Schema Validation:** `zod`
*   **Development & Build:** `pnpm`, `tsx`, `typescript`, `dotenv`
*   **Code Quality:** `eslint`, `prettier`
*   **Testing:** `jest`, `ts-jest` (Test cases not yet implemented)

## ⚙️ Installation & Setup

### Prerequisites

*   **Node.js:** LTS versions 18, 20, or 22 are recommended.
*   **pnpm:** Recommended package manager (`npm install -g pnpm`). Alternatively, npm or yarn can be used.
*   **Git:** For version control.
*   **Google API Key & CX ID:** Required for the `search` tool to function, obtained from Google Cloud Console and Programmable Search Engine setup.

### Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/chengemnoip/search-scrape-map-google-plan.git
    # Replace 'search-scrape-map-google-plan' with your actual local directory name if different
    cd your-local-project-directory-name 
    ```
    (e.g., `cd search_mcp_server_TypeScript_plan@250504`)

2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
    *   This command installs all necessary packages and automatically downloads the Chromium browser required by Playwright. If the browser download fails or you need a different browser core, refer to the Playwright documentation and run `pnpm exec playwright install --with-deps <browser_name>`.

### Environment Variables Setup

The `search` tool requires a Google API Key and a Custom Search Engine ID (CX ID). Configure these credentials using one of the following methods (Method 1 is recommended):

**Method 1: Configure in Roo Code MCP Settings (Recommended)**

This is the preferred method for centralized management and keeping sensitive information out of the project directory.

1.  Open the MCP settings file in Roo Code (or VS Code). The path is typically:
    *   Windows: `C:\Users\<YourUsername>\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\mcp_settings.json`
    *   macOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`
    *   Linux: `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`
2.  Locate the configuration block for this server (identified by the key you set, e.g., `"search-scrape-map-ts-plan"`).
3.  Add your credentials to the `env` object within that block:

    ```json
    // Example snippet to add/modify within mcp_settings.json -> mcpServers
        "search-scrape-map-ts-plan": { // Or your custom key name
          "name": "Search/Scrape/Map Server (TS Plan)", // Display name in Roo Code
          "description": "Provides search, scrape, and map tools via Google/Playwright.", // Server description
          "command": "pnpm", // Using pnpm handles path resolution well
          "args": [
            "--dir",
            "/absolute/path/to/your/project/search_mcp_server_TypeScript_plan@250504", // !! IMPORTANT: Replace with the **absolute path** to YOUR project directory !!
            "start" // Executes the "start" script from package.json (node dist/index.js)
          ],
          // --- Alternatively, use node directly if you know the exact path ---
          // "command": "node",
          // "args": [
          //   "/absolute/path/to/your/project/search_mcp_server_TypeScript_plan@250504/dist/index.js" // !! IMPORTANT: Replace with the **absolute path** to dist/index.js !!
          // ],
          "env": {
            // Enter your actual key and ID here
            "GOOGLE_API_KEY": "YOUR_GOOGLE_API_KEY_HERE",
            "GOOGLE_CX_ID": "YOUR_GOOGLE_CX_ID_HERE"
          },
          "disabled": false, // Set to false to enable the server
          "alwaysAllow": [ // List all tools provided by this server
            "search",
            "scrape",
            "map"
          ]
        }
    // --- End example snippet ---
    ```
    **Important Notes:**
    *   Replace `/absolute/path/to/your/project/...` in `"args"` with the correct **absolute path** to your local `search_mcp_server_TypeScript_plan@250504` directory.
    *   Replace `"YOUR_GOOGLE_API_KEY_HERE"` and `"YOUR_GOOGLE_CX_ID_HERE"` in the `"env"` object with your actual Google API Key and CX ID.
    *   Ensure the overall JSON structure remains valid, paying attention to commas (no trailing comma after the last entry in an object or array).

4.  Save the `mcp_settings.json` file.
5.  Restart Roo Code or VS Code for the new MCP server configuration to be loaded.

**Method 2: Use `.env` File (Local Development / Fallback)**

If modifying Roo Code settings is not feasible, you can place credentials in a `.env` file at the project root.

1.  Copy the example file:
    ```bash
    cp .env.example .env
    ```
2.  Edit the newly created `.env` file and add your credentials:
    ```dotenv
    # .env
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
    GOOGLE_CX_ID=YOUR_GOOGLE_CX_ID_HERE
    # MCP_PORT=53011 # Optional: The server defaults to stdio, this port is usually for HTTP mode
    ```
    **⚠️ Security Warning:** The `.env` file is excluded by `.gitignore`. **Never** commit this file or your actual keys to any version control system (like Git).

**Note:** The server code is designed to prioritize environment variables provided by the MCP client (Roo Code). It will only fall back to reading the local `.env` file if the variables are not supplied by the client.

## ▶️ Running the Server

*   **Development Mode:**
    Uses `tsx` for live reloading, convenient for development and debugging.
    ```bash
    pnpm dev
    ```
    The server will start in Stdio mode, listening for connections from an MCP client. Changes to files in the `src` directory will automatically restart the server.

*   **Production Mode:**
    1.  **Build:** Compile the TypeScript code to JavaScript.
        ```bash
        pnpm build
        ```
        (Compiled files are output to the `dist/` directory)
    2.  **Start:** Run the compiled JavaScript code.
        ```bash
        pnpm start
        ```
        (This command executes `node dist/index.js`)

## 🔧 MCP Tool Usage

Once the server is running and connected to an MCP client like Roo Code, you can invoke the following tools:

### 1. `search`

*   **Functionality:** Performs a Google Custom Search.
*   **Description:** "Executes a web search using the Google Custom Search API."
*   **Input Arguments (`arguments`):**
    *   `query` (string, **required**): The search keywords or phrase.
    *   `num` (integer, optional, default 10): The number of results to return (1-10).
    *   `start` (integer, optional, default 1): The starting index of the results (for pagination, e.g., `start=1` for results 1-10, `start=11` for 11-20).
*   **Output:**
    *   Success: A text string containing a formatted list of search results (title, link, snippet).
    *   Failure: A text string describing the error.
*   **Example Invocation (JSON):**
    ```json
    {
      "tool_name": "search",
      "arguments": {
        "query": "TypeScript best practices",
        "num": 5
      }
    }
    ```

### 2. `scrape`

*   **Functionality:** Scrapes content from a specified URL.
*   **Description:** "Uses Playwright to scrape web content, allowing selection of specific elements or waiting for elements to appear. Supports outputting content in Markdown or HTML format."
*   **Input Arguments (`arguments`):**
    *   `url` (string, **required**): The URL of the web page to scrape.
    *   `selector` (string, optional): A CSS selector. If provided, returns the `outerHTML` of the first matching element. If omitted, returns the full page HTML.
    *   `waitForSelector` (string, optional): Waits for an element matching this CSS selector to appear on the page before scraping.
    *   `timeout` (integer, optional, default 60000): Maximum time in milliseconds to wait for page navigation or the selector.
    *   `outputFormat` (string, optional, default "markdown"): The desired output format. Can be `"markdown"` or `"html"`.
*   **Output:**
    *   Success: A text string containing the scraped content in the specified format.
    *   Failure: A text string describing the error (e.g., timeout, selector not found, invalid URL).
*   **Example Invocation (JSON):**
    ```json
    // Scrape the organization name from the GitHub MCP Servers page
    {
      "tool_name": "scrape",
      "arguments": {
        "url": "https://github.com/modelcontextprotocol/servers",
        "selector": "span.author a.url"
      }
    }
    ```
    ```json
    // Scrape example.com after waiting for the element with id #main
    {
      "tool_name": "scrape",
      "arguments": {
        "url": "https://example.com",
        "waitForSelector": "#main"
      }
    }
    ```
    ```json
    // Scrape example.com and get raw HTML output
    {
      "tool_name": "scrape",
      "arguments": {
        "url": "https://example.com",
        "outputFormat": "html"
      }
    }
    ```

### 3. `map`

*   **Functionality:** Parses a Sitemap file and extracts the URLs listed within.
*   **Description:** "Downloads and parses the specified Sitemap (sitemap.xml or Sitemap Index), extracting the list of URLs."
*   **Input Arguments (`arguments`):**
    *   `url` (string, **required**): The URL pointing to the `sitemap.xml` or Sitemap Index file.
*   **Output:**
    *   Success: A text string containing a list of all valid URLs extracted from the Sitemap, one URL per line.
    *   Failure: A text string describing the error (e.g., download failure, XML parsing error, invalid URL).
*   **Current Limitation:** If a Sitemap Index URL is provided, this tool currently only extracts the URLs of the *child Sitemaps* listed in the index. It does **not** recursively fetch and parse those child Sitemaps.
*   **Example Invocation (JSON):**
    ```json
    {
      "tool_name": "map",
      "arguments": {
        "url": "https://developer.mozilla.org/sitemaps/en-us/sitemap.xml"
      }
    }
    ```

## ✅ Testing

The project is configured for testing using Jest and ts-jest.

*   **Run all tests:**
    ```bash
    pnpm test
    ```
*   **Run tests in watch mode:**
    ```bash
    pnpm test:watch
    ```
*   **Generate coverage report:**
    ```bash
    pnpm test:cov
    ```
    (Report located in `coverage/` directory)

**Note:** No actual test cases have been written yet (the `tests/` directory only contains setup). Contributions for unit and integration tests are welcome!

## ✨ Code Style

This project uses ESLint for linting and style enforcement, and Prettier for automatic code formatting. Configurations are included.

*   **Check for lint errors:** `pnpm lint`
*   **Auto-fix lint issues:** `pnpm lint:fix`
*   **Check formatting:** `pnpm format:check`
*   **Auto-format code:** `pnpm format`

## 📄 License

This project is intended to be licensed under the **MIT License**. Please refer to the [LICENSE](LICENSE) file for the full terms.
(Note: The `LICENSE` file needs to be populated with the standard MIT License text.)

## 💡 Known Limitations & Future Work

*   **API Key Security:** Never hardcode your `GOOGLE_API_KEY` or `GOOGLE_CX_ID` directly into the source code or commit them to version control. Always use environment variables (via Roo Code settings or `.env` file).
*   **`map` Tool Recursion:** The `map` tool currently does not recursively parse Sitemap Index files. Implementing this would provide a more complete URL list.
*   **Test Coverage:** The project lacks tests. Writing unit and integration tests for the tool handlers is crucial for ensuring reliability.
*   **Error Handling:** Error handling can be further refined to provide more specific and user-friendly error messages.
*   **API Key Fallback Logic:** While planned, the code currently relies on `dotenv` or system environment variables, and doesn't explicitly implement the logic to read API keys from the MCP client context as a primary source.
*   **Pre-commit Hooks:** Consider integrating Husky and lint-staged to automatically run linters and formatters before `git commit`.
*   **License File:** Populate the `LICENSE` file with the chosen (MIT) license text.