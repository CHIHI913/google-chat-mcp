import { OAuth2Client, Credentials } from "google-auth-library";
import * as fs from "fs";
import * as http from "http";
import * as url from "url";

const SCOPES = [
  "https://www.googleapis.com/auth/chat.spaces.readonly",
  "https://www.googleapis.com/auth/chat.memberships.readonly",
  "https://www.googleapis.com/auth/chat.messages",
];
const REDIRECT_PORT = 8080;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

interface ClientSecretFile {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

let oauth2Client: OAuth2Client | null = null;

function getEnvPath(envName: string): string {
  const value = process.env[envName];
  if (!value) {
    throw new Error(`${envName} が設定されていません`);
  }
  return value;
}

function loadClientSecret(): { clientId: string; clientSecret: string } {
  const secretPath = getEnvPath("CLIENT_SECRET_PATH");

  if (!fs.existsSync(secretPath)) {
    throw new Error(`クライアントシークレットファイルが見つかりません: ${secretPath}`);
  }

  const content = fs.readFileSync(secretPath, "utf-8");
  const parsed: ClientSecretFile = JSON.parse(content);

  const credentials = parsed.installed || parsed.web;
  if (!credentials) {
    throw new Error("クライアントシークレットファイルの形式が不正です");
  }

  return {
    clientId: credentials.client_id,
    clientSecret: credentials.client_secret,
  };
}

function loadToken(): Credentials | null {
  const tokenPath = process.env.TOKEN_PATH;
  if (!tokenPath || !fs.existsSync(tokenPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(tokenPath, "utf-8");
    return JSON.parse(content) as Credentials;
  } catch {
    return null;
  }
}

function saveToken(token: Credentials): void {
  const tokenPath = getEnvPath("TOKEN_PATH");

  // ディレクトリがなければ作成
  const dir = tokenPath.substring(0, tokenPath.lastIndexOf("/"));
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));
  console.error(`トークンを保存しました: ${tokenPath}`);
}

function openBrowser(authUrl: string): void {
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  import("child_process").then(({ exec }) => {
    exec(`${command} "${authUrl}"`);
  });
}

async function getTokenFromWeb(client: OAuth2Client): Promise<Credentials> {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const parsedUrl = url.parse(req.url || "", true);
        if (parsedUrl.pathname !== "/callback") {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }

        const code = parsedUrl.query.code as string;
        if (!code) {
          res.writeHead(400);
          res.end("認証コードがありません");
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1>認証完了</h1>
              <p>このウィンドウを閉じてください。</p>
            </body>
          </html>
        `);

        server.close();

        const { tokens } = await client.getToken(code);
        resolve(tokens);
      } catch (error) {
        res.writeHead(500);
        res.end("認証エラー");
        server.close();
        reject(error);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      console.error(`\n認証が必要です。ブラウザで以下のURLを開いてください:\n`);
      console.error(authUrl);
      console.error(`\n自動でブラウザを開きます...\n`);
      openBrowser(authUrl);
    });

    server.on("error", (err) => {
      reject(new Error(`コールバックサーバーの起動に失敗しました: ${err.message}`));
    });
  });
}

async function refreshToken(client: OAuth2Client): Promise<Credentials> {
  try {
    const { credentials } = await client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error("トークンのリフレッシュに失敗しました。再認証が必要です。");
    throw error;
  }
}

export async function getAuthClient(): Promise<OAuth2Client> {
  if (oauth2Client) {
    return oauth2Client;
  }

  const { clientId, clientSecret } = loadClientSecret();

  oauth2Client = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);

  const token = loadToken();

  if (token) {
    oauth2Client.setCredentials(token);

    // トークンの有効期限を確認
    const expiryDate = token.expiry_date;
    const isExpired = expiryDate ? Date.now() >= expiryDate : false;

    if (isExpired && token.refresh_token) {
      console.error("トークンが期限切れです。リフレッシュ中...");
      try {
        const newToken = await refreshToken(oauth2Client);
        saveToken(newToken);
        oauth2Client.setCredentials(newToken);
      } catch {
        // リフレッシュ失敗時は再認証
        const newToken = await getTokenFromWeb(oauth2Client);
        saveToken(newToken);
        oauth2Client.setCredentials(newToken);
      }
    }
  } else {
    // 初回認証
    const newToken = await getTokenFromWeb(oauth2Client);
    saveToken(newToken);
    oauth2Client.setCredentials(newToken);
  }

  return oauth2Client;
}

export async function validateAuth(): Promise<void> {
  await getAuthClient();
  console.error("認証OK");
}
