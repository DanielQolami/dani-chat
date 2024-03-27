<script setup lang="ts">
import ChatListContainer from "@/components/ChatListContainer.vue";
import ChatConversationContainer from "@/components/ChatConversationContainer.vue";
import { useToast } from "vue-toastification";
import { useChatStore } from "@/stores/chat.ts";
import { useRoute, useRouter } from "vue-router";
import { watch, useCssModule, computed, onMounted } from "vue";
import { useDisplay } from "vuetify";
import { useWebSocket } from "@/composables/useChat.ts";

const toast = useToast();
const chatStore = useChatStore();
const route = useRoute();
const router = useRouter();
const { mdAndUp, smAndUp } = useDisplay();
const chatPageCss = useCssModule("chatPage");
const { connectWebsocket } = useWebSocket();

// mobile view
const mainLayoutCss = computed(() => {
  return {
    [chatPageCss["chat-page-main-layout--mobile"]]: !smAndUp.value,
    [chatPageCss["chat-page-main-layout--tablet"]]: !mdAndUp.value,
  };
});
const rightColumnClass = computed(() => {
  return {
    [chatPageCss["row-and-column-span-full"]]: !smAndUp.value,
    [chatPageCss["right-column--translate-x"]]: !mdAndUp.value && !chatStore.isChatListColumnShown,
  };
});

async function fetchChatList() {
  try {
    await chatStore.fetchChatList();

    checkUrlHashAndFetchMessages();
  }
  catch (error: any) {
    toast.error(error.body?.data?.msg || error.body?.message || error.message || "fetchChatList Error!");
  }
}
async function setCurrentConversation(conversationId?: number) {
  chatStore.setCurrentConversation(conversationId);
}
function checkUrlHashAndFetchMessages() {
  const routeHash = route.hash;
  if (!routeHash?.startsWith('#')) {
    router.push({
      hash: undefined,
    });
    setCurrentConversation();
    return;
  }

  const id = routeHash.slice(1);
  setCurrentConversation(Number(id));
}

// connectWebsocket();
fetchChatList();

watch(
    () => route.hash,
    (newHash) => {
      checkUrlHashAndFetchMessages();
    },
    {
      // set "immediate" to false, because if the chatMessages were fetched before the chatList, the messages wouldn't appear in the chat.
      immediate: false,
    }
);

onMounted(() => {
  const appDiv = document.getElementById("app");
  appDiv!.classList.remove("overflow-y-auto");
});

// right column: chat__chapar-section
// left column: chat__chat-list
</script>

<template>
  <div :class="[chatPage['chat-page-main-layout'], 'grid w-100 h-screen',
        mainLayoutCss]"
  >
    <div :class="['chat-page__left-column bg-teal-lighten-5',
          { [chatPage['row-and-column-span-full']]: !smAndUp }]">
      <ChatListContainer></ChatListContainer>
    </div>
    <div :class="[rightColumnClass, chatPage['chat-page__right-column'], 'chat-page__right-column bg-teal-lighten-4']">
      <ChatConversationContainer></ChatConversationContainer>
    </div>
  </div>
</template>

<style module="chatPage">
[dir="rtl"] {
  --need-rtl-multiplier: 1;
}
.chat-page-main-layout {
  --dropdown-offset: 0.5rem;
  --is-online-color: #9CCC65; /* light-green-lighten-1 in vuetify */
  --chat-topbar-height: 3.5rem;
  --chat-inputs-container-width: 45.5rem; /* 728px */
  --chat-input-container-padding-inline: 0.75rem;
  --chat-avatar-container-margin: 0rem;
  --chat-avatar-container-width: 2.5rem;
}
.chat-page-main-layout {
  /*--left-column-width: minmax(min(26.5rem, 100%), min(30vw, 40%));*/
  --left-column-width: min(26.5rem, 100%);
  --right-column-width: minmax(min(25rem, 100%), 1fr);

  grid-template-columns: minmax(var(--left-column-width), 30vw) var(--right-column-width);
  overflow-x: clip;
}
.chat-page-main-layout--tablet {
  --right-column-width: 100%;
}
.chat-page-main-layout--mobile {
  --left-column-width: 100%;

  grid-template-columns: 100%;
  grid-template-rows: 100%;
}
.right-column--translate-x {
  transform: translateX(calc(var(--left-column-width, 100%) * var(--need-rtl-multiplier, -1)));
}
.chat-page__right-column {
  transition: transform 0.2s ease-in-out;
}
.chat-page-main-layout--mobile .chat-page__right-column {
  transform: translateX(-100%);
}
.chat-page-main-layout--mobile .right-column--translate-x {
  transform: translateX(0);
}
.row-and-column-span-full {
  grid-row: 1 / -1;
  grid-column: 1 / -1;
}
</style>
