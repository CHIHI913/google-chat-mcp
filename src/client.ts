import { google, chat_v1 } from "googleapis";
import { getAuthClient } from "./auth.js";

let chatClient: chat_v1.Chat | null = null;

export async function getChatClient(): Promise<chat_v1.Chat> {
  if (!chatClient) {
    const auth = await getAuthClient();
    chatClient = google.chat({ version: "v1", auth });
  }
  return chatClient;
}
