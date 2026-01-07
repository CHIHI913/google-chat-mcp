# Google Chat MCP Server

Google Chat API を利用した MCP (Model Context Protocol) サーバーです。
メッセージの送受信、スペース・メンバー情報の取得が可能です。

## 機能

### スペース関連
- `list_spaces` - 参加中のスペース一覧を取得
- `get_space` - スペースの詳細情報を取得

### メンバー関連
- `list_members` - スペース内のメンバー一覧を取得

### メッセージ関連
- `list_messages` - スペース内のメッセージ一覧を取得
- `get_message` - メッセージの詳細を取得
- `create_message` - メッセージを送信
- `update_message` - メッセージを更新
- `delete_message` - メッセージを削除

## セットアップ

### 1. Google Cloud Project の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から **Google Chat API** を有効化

### 2. OAuth 同意画面の設定

1. 「APIとサービス」→「OAuth 同意画面」
2. ユーザータイプを選択（内部 or 外部）
3. アプリ名、ユーザーサポートメール、デベロッパー連絡先を入力
4. スコープを追加:
   - `https://www.googleapis.com/auth/chat.spaces.readonly`
   - `https://www.googleapis.com/auth/chat.memberships.readonly`
   - `https://www.googleapis.com/auth/chat.messages`

### 3. OAuth クライアント ID の作成

1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前を入力
5. 承認済みのリダイレクトURI: `http://localhost:8080/callback` を追加
6. 作成 → JSON をダウンロード

### 4. クレデンシャルの配置

```bash
mkdir -p credentials
# ダウンロードした JSON を配置
mv ~/Downloads/client_secret_*.json credentials/client_secret.json
```

### 5. 依存関係のインストールとビルド

```bash
pnpm install
pnpm run build
```

## 使用方法

### MCP 設定

`.mcp.json` をプロジェクトルートまたは Claude Code の設定に追加:

```json
{
  "mcpServers": {
    "google-chat": {
      "command": "node",
      "args": ["/path/to/google-chat-mcp/dist/index.js"],
      "env": {
        "CLIENT_SECRET_PATH": "/path/to/google-chat-mcp/credentials/client_secret.json",
        "TOKEN_PATH": "/path/to/google-chat-mcp/credentials/token.json"
      }
    }
  }
}
```

### 初回認証

初回起動時にブラウザが開き、Google アカウントでの認証を求められます。
認証完了後、トークンが `credentials/token.json` に保存されます。

## ツールの使い方

### スペース一覧の取得

```
list_spaces
```

### メッセージの送信

```
create_message
  spaceName: "spaces/AAAA"
  text: "こんにちは！"
```

### メッセージ一覧の取得

```
list_messages
  spaceName: "spaces/AAAA"
  pageSize: 10
```

## 注意事項

- OAuth2 認証を使用するため、個人の Google アカウントでアクセス可能なスペースのみ操作できます
- Chat API のクォータ制限に注意してください
- トークンの有効期限が切れた場合は自動でリフレッシュされます

## ライセンス

MIT
