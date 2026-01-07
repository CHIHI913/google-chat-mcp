import { z } from "zod";
import { getChatClient } from "../client.js";

export const listMembersSchema = {
  spaceName: z.string().describe("スペース名（例: 'spaces/AAAA'）"),
  pageSize: z.number().optional().describe("取得件数（最大100）"),
  pageToken: z.string().optional().describe("ページネーショントークン"),
};

export async function listMembers(
  spaceName: string,
  pageSize?: number,
  pageToken?: string
) {
  const chat = await getChatClient();
  const response = await chat.spaces.members.list({
    parent: spaceName,
    pageSize: pageSize || 100,
    pageToken: pageToken,
  });

  return {
    memberships: response.data.memberships?.map((member) => ({
      name: member.name,
      state: member.state,
      role: member.role,
      member: member.member,
      createTime: member.createTime,
    })) || [],
    nextPageToken: response.data.nextPageToken,
  };
}
