import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import ChatServices from "@/services/chat.ts";
import type { Conversation, ConversationWithMessageList, Message } from "@/types/chat.ts";

export const useChatStore = defineStore("chat", () => {
  // State
  /**
   * Logged-in user information
   */
  const user = shallowRef({
    user_id: 1,
  });
  /**
   * Array of conversation objects
   */
  const chatList = ref<Conversation[]>([]);
  /**
   * Currently selected conversation
   */
  const currentConversation = shallowRef<Conversation | undefined>(undefined);
  // const messageList: WeakMap<Object, Message[]> = new WeakMap();
  /**
   * WeakMap of messages. key: Conversation, value: Array of Message
   */
  const messageList = ref<WeakMap<Conversation, Message[]>>(new WeakMap());
  /**
   * for mobile view
   */
  const isChatListColumnShown = shallowRef(true);

  // Getters
  /**
   * @param conversationId {number} the id of the wanted conversation
   * @returns {object} conversation or undefined
   */
  const currentConversationMessages = computed(() => {
    return (conversationId: number) => {
      if (chatList.value.length <= 0) return undefined;

      const conversation = findConversationById(conversationId);
      // return conversation ? messageList.get(conversation) : undefined;
      return conversation ? messageList.value.get(conversation) : undefined;
    };
  });

  // Actions
  async function fetchChatList() {
    try {
      chatList.value = await ChatServices.getChatList();
    }
    catch (error: any) {
      throw error;
    }
  }
  function setCurrentConversation(conversationId?: number) {
    if (!conversationId) {
      currentConversation.value = undefined;

      setChatListColumnVisibility(true);
    }
    else {
      currentConversation.value = chatList.value.find((chat) => {
        return chat.id === conversationId;
      });

      setChatListColumnVisibility(false);
    }
  }

  /**
   * fetches messages by the chat ID.
   * if chat with the given ID doesn't exist in our "chatList",
   * then, it creates a chat object and assigns the fetched messages to it.
   * @param conversationId
   */
  async function fetchMessages(conversationId: number) {
    try {
      const res = await ChatServices.getChatMessages(conversationId);

      const conversation = findConversationById(conversationId);
      // if (conversation) messageList.set(conversation, res.messages);
      if (conversation) messageList.value.set(conversation, res.messages);
      else { // when the conversation doesn't exist in the "chatList"
        const newConversation = createConversationAndPushToChatlist(res);

        // messageList.set(newConversation, res.messages);
        messageList.value.set(newConversation, res.messages);
      }
    }
    catch (error: any) {
      throw error;
    }
  }

  /**
   * searches in "chatList.value"
   * @param conversationId {Number} id of the conversation
   * @returns the chat object or undefined
   */
  function findConversationById(conversationId: number): Conversation | undefined {
    return chatList.value.find((chat) => chat.id === conversationId);
  }

  /**
   * sorts chatList by their "updated_at" property
   */
  function sortChatListByTimestamp() {
    chatList.value = chatList.value.sort((a, b) => {
      return b.updated_at - a.updated_at;
    });
  }
  function createConversationObjBasedOnConversationWithMessages(conversationWithMessage: ConversationWithMessageList): Conversation {
    const conversation = {
      ...conversationWithMessage,
      message: conversationWithMessage.messages.pop()!,
    };
    // @ts-expect-error
    delete conversation.messages;

    return conversation;
  }

  /**
   * creates a new chat object
   * and pushes it into chatList
   * and sorts chatList
   * @param conversationWithMessages
   * @returns {object} the created chat object
   */
  function createConversationAndPushToChatlist(conversationWithMessages: ConversationWithMessageList) {
    const newConversation = createConversationObjBasedOnConversationWithMessages(conversationWithMessages);
    chatList.value.push(newConversation);
    sortChatListByTimestamp();
    return newConversation;
  }

  /**
   * adds message to previous messages.
   * 1) checks if there is a conversation with "message.chat_id"
   * 2) checks if there is a previously saved messageList of this conversation
   * 3) unshifts the received "message" to the previous messageList
   * @param message
   */
  function unshiftToExistingMessages(message: Message) {
    const conversation = findConversationById(message.chat_id);
    if (!conversation) return;

    const doesMessagesExist = messageList.value.has(conversation);
    if (!doesMessagesExist) return;

    const previousMessages = messageList.value.get(conversation);
    previousMessages!.unshift(message);
  }

  /**
   * changes last message of a chat object.
   * 1) checks if chat exists
   * 2) if exists, changes "last message" & "updated_at"
   * 3) else doesn't exist, fetches messageList
   * @param message
   */
  async function changeLastMessageOfChatObject(message: Message) {
    const conversation = findConversationById(message.chat_id);
    // if conversation doesn't exist in ChatList, then we create a new one
    if (!conversation) {
      await fetchMessages(message.chat_id);
    }
    // if it exists, we only change the last message of it
    else {
      conversation.message = message;
      conversation.updated_at = message.created_at;
      sortChatListByTimestamp();
    }
  }

  /**
   * consisting of "unshiftToExistingMessages" & "changeLastMessageOfChatObject" functions.
   *
   * adds the message to messageList for that chat_id
   * also, changes the "last_message" of the chat object.
   * @param message
   */
  async function addMessageToChat(message: Message) {
    unshiftToExistingMessages(message);
    await changeLastMessageOfChatObject(message);
  }

  /**
   * searches inside current Chat's users
   * @param userId {Number} the user ID
   * @returns user or undefined
   */
  function getUserInfoFromChatUsers(userId: number) {
    return currentConversation.value?.users.find((user) => {
      return user.user_id === userId;
    });
  }

  // for mobile view
  function setChatListColumnVisibility(value: boolean) {
    isChatListColumnShown.value = value;
  }

  // Returns
  return {
    user, chatList, currentConversation, messageList,
    currentConversationMessages,
    isChatListColumnShown,
    fetchChatList, setCurrentConversation, fetchMessages,
    addMessageToChat,
    setChatListColumnVisibility,
    getUserInfoFromChatUsers,
  };
});
