import { z } from "zod";
import { getChatClient } from "../client.js";

export const listSpacesSchema = {};

export const getSpaceSchema = {
  name: z.string().describe("スペース名（例: 'spaces/AAAA'）"),
};

export async function listSpaces() {
  const chat = await getChatClient();
  const response = await chat.spaces.list({
    pageSize: 100,
  });

  return {
    spaces: response.data.spaces?.map((space) => ({
      name: space.name,
      displayName: space.displayName,
      type: space.type,
      spaceThreadingState: space.spaceThreadingState,
      singleUserBotDm: space.singleUserBotDm,
    })) || [],
    nextPageToken: response.data.nextPageToken,
  };
}

export async function getSpace(name: string) {
  const chat = await getChatClient();
  const response = await chat.spaces.get({
    name,
  });

  return {
    name: response.data.name,
    displayName: response.data.displayName,
    type: response.data.type,
    spaceThreadingState: response.data.spaceThreadingState,
    singleUserBotDm: response.data.singleUserBotDm,
    spaceDetails: response.data.spaceDetails,
  };
}
