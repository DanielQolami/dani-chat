import type { UserMinified } from "@/types/userList.ts";
import type { GeneralFileType } from "@/types/general.ts";

// type of chatList shown in LeftColumn of the chat page.
export type Conversation = {
  "id": number,
  "owner_id": number,
  "guest_id": null | number,
  "target": string,
  "type": string,
  "title": null | string,
  "icon": null | string,
  "created_at": number,
  "updated_at": number,
  "last_seen_id": number,
  "users": UserMinified[],
  "message": Message,
};
export type ConversationWithMessageList = Omit<Conversation, "message"> & {
  messages: Message[],
};

// type of the information shown inside the RightColumn of the chat page
// type Chat = {};

// type of the message
export type ChatMessageType = "text" | GeneralFileType;
type ChatMessageDetails = {
  file_name: string,
  body: string,
  size: number,
  mime_type: string,
  duration: number,
};
export type Message = {
  id: number,
  chat_id: number,
  user_id: number,
  guest_id: null | number,
  content: string,
  type: ChatMessageType,
  created_at: number,
  details: ChatMessageDetails,
};

export type MessageToDisplay = Message & {
  user: UserMinified,
  // scrollTo: boolean,
};

export type SendMessagePayload = { type: ChatMessageType, content: string, chatId: number, sendTo: number };

// send file service
export type SendFileServicePayload = {
  file: File,
};
export type SendFileServiceResponse = {
  url: string,
  details: null | ChatMessageDetails,
};
