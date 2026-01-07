import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "./handler.js";
import {
  listSpaces,
  listSpacesSchema,
  getSpace,
  getSpaceSchema,
  listMembers,
  listMembersSchema,
  listMessages,
  listMessagesSchema,
  getMessage,
  getMessageSchema,
  createMessage,
  createMessageSchema,
  updateMessage,
  updateMessageSchema,
  deleteMessage,
  deleteMessageSchema,
} from "./tools/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "google-chat-mcp",
    version: "1.0.0",
    description: "Google Chatのメッセージ送受信・スペース管理を行う",
  });

  registerTools(server);

  return server;
}

function registerTools(server: McpServer): void {
  // スペース関連
  server.registerTool(
    "list_spaces",
    {
      description: "参加中のスペース一覧を取得",
      inputSchema: listSpacesSchema,
    },
    async () => handleToolCall(() => listSpaces())
  );

  server.registerTool(
    "get_space",
    {
      description: "スペースの詳細情報を取得",
      inputSchema: getSpaceSchema,
    },
    async ({ name }) => handleToolCall(() => getSpace(name))
  );

  // メンバー関連
  server.registerTool(
    "list_members",
    {
      description: "スペース内のメンバー一覧を取得",
      inputSchema: listMembersSchema,
    },
    async ({ spaceName, pageSize, pageToken }) =>
      handleToolCall(() => listMembers(spaceName, pageSize, pageToken))
  );

  // メッセージ関連
  server.registerTool(
    "list_messages",
    {
      description: "スペース内のメッセージ一覧を取得",
      inputSchema: listMessagesSchema,
    },
    async ({ spaceName, pageSize, pageToken, filter }) =>
      handleToolCall(() => listMessages(spaceName, pageSize, pageToken, filter))
  );

  server.registerTool(
    "get_message",
    {
      description: "メッセージの詳細を取得",
      inputSchema: getMessageSchema,
    },
    async ({ name }) => handleToolCall(() => getMessage(name))
  );

  server.registerTool(
    "create_message",
    {
      description: "メッセージを送信",
      inputSchema: createMessageSchema,
    },
    async ({ spaceName, text }) => handleToolCall(() => createMessage(spaceName, text))
  );

  server.registerTool(
    "update_message",
    {
      description: "メッセージを更新",
      inputSchema: updateMessageSchema,
    },
    async ({ name, text }) => handleToolCall(() => updateMessage(name, text))
  );

  server.registerTool(
    "delete_message",
    {
      description: "メッセージを削除",
      inputSchema: deleteMessageSchema,
    },
    async ({ name }) => handleToolCall(() => deleteMessage(name))
  );
}
