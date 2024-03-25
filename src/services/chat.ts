import { useError } from "@/composables/useError.ts";
import axios from "@/plugins/axios.ts";
import type { AxiosError } from "axios";
import type {
  Conversation, ConversationWithMessageList,
  SendFileServicePayload, SendFileServiceResponse,
} from "@/types/chat.ts";

const { ApiError } = useError();

const chatEndpoint = "https://somewhereFar.away";

export default {
  async getChatList() {
    try {
      // const res = await axios.get(`${chatEndpoint}/list`);
      // return res.data.data as Conversation[];
      return [
          {
            "id": 1,
            "owner_id": 1,
            "guest_id": null,
            "target": "user",
            "type": "direct",
            "title": null,
            "icon": "https://www.interviewmagazine.com/wp-content/uploads/2020/09/Interview_digital_web_2020_sept_Lana_Del_Rey_3.jpg",
            "created_at": 1709639921,
            "updated_at": 1711347997,
            "last_seen_id": 2,
            "users": [
              {
                "user_id": 2,
                "mobile": 8585858585,
                "country_code": 98,
                "full_name": "Lana Del Rey",
                "icon": "https://www.interviewmagazine.com/wp-content/uploads/2020/09/Interview_digital_web_2020_sept_Lana_Del_Rey_3.jpg"
              },
              {
                "user_id": 1,
                "mobile": 9031827413,
                "country_code": 98,
                "full_name": "دانیال غلامی",
                "icon": "https://avatars.githubusercontent.com/u/111076883?v=4"
              }
            ],
            "message": {
              "id": 2,
              "chat_id": 1,
              "message_id": 2,
              "user_id": 2,
              "guest_id": null,
              "content": "Diet mountain dew, baby, New York City\n" +
                "Never was there ever a girl so pretty",
              "details": "",
              "type": "text",
              "created_at": 1711347997
            }
          },
          {
            "id": 2,
            "owner_id": 1,
            "guest_id": null,
            "target": "user",
            "type": "direct",
            "title": null,
            "icon": "https://upload.wikimedia.org/wikipedia/commons/5/52/Adele_for_Vogue_in_2021.png",
            "created_at": 1709735599,
            "updated_at": 1710599647,
            "last_seen_id": 3,
            "users": [
              {
                "user_id": 3,
                "mobile": 9090909090,
                "country_code": 98,
                "full_name": "Adele",
                "icon": "https://upload.wikimedia.org/wikipedia/commons/5/52/Adele_for_Vogue_in_2021.png"
              },
              {
                "user_id": 1,
                "mobile": 9031827413,
                "country_code": 98,
                "full_name": "دانیال غلامی",
                "icon": "https://avatars.githubusercontent.com/u/111076883?v=4"
              }
            ],
            "message": {
              "id": 4,
              "chat_id": 2,
              "message_id": 4,
              "user_id": 3,
              "guest_id": null,
              "content": "But I set fire to the rain\n" +
                "Watched it pour as I touched your face",
              "details": "",
              "type": "text",
              "created_at": 1710599647
            }
          },
          {
            "id": 3,
            "owner_id": 4,
            "guest_id": null,
            "target": "user",
            "type": "direct",
            "title": null,
            "icon": "https://media.vanityfair.com/photos/60074829b8542426d4f095b4/master/w_1600,c_limit/a-VF0321_Billie_Eilish_embed-01.jpg",
            "created_at": 1710318438,
            "updated_at": 1710599491,
            "last_seen_id": 2,
            "users": [
              {
                "user_id": 4,
                "mobile": 9595959595,
                "country_code": 98,
                "full_name": "Billie Eilish",
                "icon": "https://media.vanityfair.com/photos/60074829b8542426d4f095b4/master/w_1600,c_limit/a-VF0321_Billie_Eilish_embed-01.jpg"
              },
              {
                "user_id": 1,
                "mobile": 9031827413,
                "country_code": 98,
                "full_name": "دانیال غلامی",
                "icon": "https://avatars.githubusercontent.com/u/111076883?v=4"
              }
            ],
            "message": {
              "id": 3,
              "chat_id": 3,
              "message_id": 3,
              "user_id": 1,
              "guest_id": null,
              "content": "No!",
              "details": "",
              "type": "text",
              "created_at": 1710599499
            }
          }
        ] satisfies Conversation[];
    }
    catch (err) {
      const error = err as AxiosError;
      throw new ApiError(error.response?.status, error.response?.data, error.message);
    }
  },
  async getChatMessages(chatId: number) {
    try {
      // const res = await axios.get(`${chatEndpoint}/show/${chatId}`);
      // return res.data.data as ConversationWithMessageList;
      function dummyFn() {
        return new Promise((resolve, reject) => {
          if (false) {
            reject('The input must be numbers');
          } else {
            setTimeout(() => {
              resolve(messageList[chatId]);
            }, 1_000);
          }
        })
      }

      const messageList: Record<number, ConversationWithMessageList> = {
        1: {
          "id": 1,
          "owner_id": 1,
          "guest_id": null,
          "target": "user",
          "type": "direct",
          "title": null,
          "icon": null,
          "created_at": 1709639921,
          "updated_at": 1711347997,
          "last_seen_id": 2,
          "users": [
            {
              "user_id": 2,
              "mobile": 8585858585,
              "country_code": 98,
              "full_name": "Lana Del Rey",
              "icon": "https://www.interviewmagazine.com/wp-content/uploads/2020/09/Interview_digital_web_2020_sept_Lana_Del_Rey_3.jpg"
            },
            {
              "user_id": 1,
              "mobile": 9031827413,
              "country_code": 98,
              "full_name": "دانیال غلامی",
              "icon": "https://avatars.githubusercontent.com/u/111076883?v=4"
            }
          ],
          "messages": [
            {
              "id": 2,
              "chat_id": 1,
              "message_id": 2,
              "user_id": 2,
              "guest_id": null,
              "content": "Diet mountain dew, baby, New York City\n" +
                "Never was there ever a girl so pretty",
              "details": "",
              "type": "text",
              "created_at": 1711347997
            },
            {
              "id": 1,
              "chat_id": 1,
              "message_id": 1,
              "user_id": 2,
              "guest_id": null,
              "content": "https://i.pinimg.com/736x/57/44/c8/5744c856d909351c49e87b9b57584a62.jpg",
              "details": "",
              "type": "image",
              "created_at": 1711347000
            },
          ],
        },
        2: {
          "id": 2,
          "owner_id": 1,
          "guest_id": null,
          "target": "user",
          "type": "direct",
          "title": null,
          "icon": null,
          "created_at": 1709735599,
          "updated_at": 1710599647,
          "last_seen_id": 3,
          "users": [
            {
              "user_id": 1,
              "mobile": 9031827413,
              "country_code": 98,
              "full_name": "دانیال غلامی",
              "icon": "https://avatars.githubusercontent.com/u/111076883?v=4"
            },
            {
              "user_id": 3,
              "mobile": 9090909090,
              "country_code": 98,
              "full_name": "Adele",
              "icon": "https://upload.wikimedia.org/wikipedia/commons/5/52/Adele_for_Vogue_in_2021.png"
            }
          ],
          "messages": [
            {
              "id": 4,
              "chat_id": 2,
              "message_id": 4,
              "user_id": 3,
              "guest_id": null,
              "content": "But I set fire to the rain\n" +
                "Watched it pour as I touched your face",
              "details": "",
              "type": "text",
              "created_at": 1710599647
            },
            {
              "id": 2,
              "chat_id": 2,
              "message_id": 2,
              "user_id": 3,
              "guest_id": null,
              "content": "Hello, it's me\n" +
                "I was wondering if after all these years you'd like to meet",
              "details": "",
              "type": "text",
              "created_at": 1710599000
            },
          ]
        },
        3: {
          "id": 3,
          "owner_id": 4,
          "guest_id": null,
          "target": "user",
          "type": "direct",
          "title": null,
          "icon": null,
          "created_at": 1710318438,
          "updated_at": 1710599491,
          "last_seen_id": 2,
          "users": [
            {
              "user_id": 4,
              "mobile": 9595959595,
              "country_code": 98,
              "full_name": "Billie Eilish",
              "icon": "https://media.vanityfair.com/photos/60074829b8542426d4f095b4/master/w_1600,c_limit/a-VF0321_Billie_Eilish_embed-01.jpg"
            },
            {
              "user_id": 1,
              "mobile": 9031827413,
              "country_code": 98,
              "full_name": "دانیال غلامی",
              "icon": "https://avatars.githubusercontent.com/u/111076883?v=4"
            }
          ],
          "messages": [
            {
              "id": 3,
              "chat_id": 3,
              "message_id": 3,
              "user_id": 1,
              "guest_id": null,
              "content": "No!",
              "details": "",
              "type": "text",
              "created_at": 1710599499
            },
            {
              "id": 2,
              "chat_id": 3,
              "message_id": 2,
              "user_id": 4,
              "guest_id": null,
              "content": "If I knew it all then would I do it again?\n" +
                "Would I do it again?",
              "details": "",
              "type": "text",
              "created_at": 1710599491
            },
            {
              "id": 1,
              "chat_id": 3,
              "message_id": 1,
              "user_id": 4,
              "guest_id": null,
              "content": "https://ts4.tarafdari.com/contents/user229795/content-sound/billie_eilish_-_everything_i_wanted.mp3",
              "details": "",
              "type": "audio",
              "created_at": 1710599000
            },
          ]
        },
      };

      await dummyFn();
      return messageList[chatId];
    }
    catch (err) {
      const error = err as AxiosError;
      throw new ApiError(error.response?.status, error.response?.data, error.message);
    }
  },
  async postSendFile(payload: SendFileServicePayload) {
    try {
      const form = new FormData();
      form.append("file", payload.file);

      // const res = await axios.post(`${chatEndpoint}/send-file`, form);
      // return res.data.data as SendFileServiceResponse;
      return { url: "👍🏼" };
    }
    catch (err) {
      const error = err as AxiosError;
      throw new ApiError(error.response?.status, error.response?.data, error.message);
    }
  },
};
