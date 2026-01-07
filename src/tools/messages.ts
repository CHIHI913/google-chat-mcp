import { z } from "zod";
import { getChatClient } from "../client.js";

export const listMessagesSchema = {
  spaceName: z.string().describe("スペース名（例: 'spaces/AAAA'）"),
  pageSize: z.number().optional().describe("取得件数（最大100）"),
  pageToken: z.string().optional().describe("ページネーショントークン"),
  filter: z.string().optional().describe("フィルタ条件"),
};

export const getMessageSchema = {
  name: z.string().describe("メッセージ名（例: 'spaces/AAAA/messages/BBBB'）"),
};

export const createMessageSchema = {
  spaceName: z.string().describe("スペース名（例: 'spaces/AAAA'）"),
  text: z.string().describe("メッセージ本文"),
};

export const updateMessageSchema = {
  name: z.string().describe("メッセージ名（例: 'spaces/AAAA/messages/BBBB'）"),
  text: z.string().describe("新しいメッセージ本文"),
};

export const deleteMessageSchema = {
  name: z.string().describe("メッセージ名（例: 'spaces/AAAA/messages/BBBB'）"),
};

export async function listMessages(
  spaceName: string,
  pageSize?: number,
  pageToken?: string,
  filter?: string
) {
  const chat = await getChatClient();
  const response = await chat.spaces.messages.list({
    parent: spaceName,
    pageSize: pageSize || 100,
    pageToken: pageToken,
    filter: filter,
  });

  return {
    messages: response.data.messages?.map((msg) => ({
      name: msg.name,
      sender: msg.sender,
      createTime: msg.createTime,
      text: msg.text,
      thread: msg.thread,
    })) || [],
    nextPageToken: response.data.nextPageToken,
  };
}

export async function getMessage(name: string) {
  const chat = await getChatClient();
  const response = await chat.spaces.messages.get({
    name,
  });

  return {
    name: response.data.name,
    sender: response.data.sender,
    createTime: response.data.createTime,
    lastUpdateTime: response.data.lastUpdateTime,
    text: response.data.text,
    thread: response.data.thread,
    space: response.data.space,
  };
}

export async function createMessage(spaceName: string, text: string) {
  const chat = await getChatClient();
  const response = await chat.spaces.messages.create({
    parent: spaceName,
    requestBody: {
      text,
    },
  });

  return {
    name: response.data.name,
    sender: response.data.sender,
    createTime: response.data.createTime,
    text: response.data.text,
    thread: response.data.thread,
  };
}

export async function updateMessage(name: string, text: string) {
  const chat = await getChatClient();
  const response = await chat.spaces.messages.update({
    name,
    updateMask: "text",
    requestBody: {
      text,
    },
  });

  return {
    name: response.data.name,
    sender: response.data.sender,
    createTime: response.data.createTime,
    lastUpdateTime: response.data.lastUpdateTime,
    text: response.data.text,
  };
}

export async function deleteMessage(name: string) {
  const chat = await getChatClient();
  await chat.spaces.messages.delete({
    name,
  });

  return {
    success: true,
    deletedMessage: name,
  };
}
