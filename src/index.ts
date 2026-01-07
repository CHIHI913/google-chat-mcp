import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateAuth } from "./auth.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  try {
    // 認証を確認
    await validateAuth();

    // サーバーを作成
    const server = createServer();

    // stdio転送層でサーバーを起動
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Google Chat MCP Server が起動しました");
  } catch (error) {
    console.error("起動エラー:", error);
    process.exit(1);
  }
}

// グレースフルシャットダウン
process.on("SIGINT", () => {
  console.error("シャットダウン中...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("シャットダウン中...");
  process.exit(0);
});

main();
