// エラーパターンと日本語メッセージのマッピング
const ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /not found/i, message: "スペースまたはメッセージが見つかりません" },
  { pattern: /permission|403/i, message: "アクセス権限がありません" },
  { pattern: /invalid_grant|401/i, message: "認証エラー: 認証情報が無効です" },
  { pattern: /ENOTFOUND|network/i, message: "ネットワークエラー: インターネット接続を確認してください" },
  { pattern: /quota/i, message: "APIクォータ制限に達しました" },
];

// エラーメッセージを分かりやすく変換
export function formatError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const match = ERROR_PATTERNS.find((e) => e.pattern.test(message));
  return match?.message ?? message;
}

// ツール実行結果の型
export type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

// ツール実行のラッパー
export async function handleToolCall<T>(fn: () => Promise<T>): Promise<ToolResult> {
  try {
    const result = await fn();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `エラー: ${formatError(error)}` }],
      isError: true,
    };
  }
}
