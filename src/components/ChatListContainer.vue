<script setup lang="ts">
// import { useRtl } from "vuetify";
import { shallowRef, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useChatDate, useConversation } from "@/composables/useChat.ts";
import { useNumbers } from "@/composables/useNumbers.ts";
import { useChatStore } from "@/stores/chat.ts";
// import userAvatarPlaceholder from "@/assets/images/user-profile-placeholder.png";

/*type Props = {
  chatList: Conversation[],
};*/
/*type Emits = {
  (e: "selectChat", chatId: number): void,
};*/

// const props = defineProps<Props>();
// const emit = defineEmits<Emits>();

// const { isRtl } = useRtl();
const { t } = useI18n();
const { checkIfTimestampIsMilliseconds } = useNumbers();
const { getHumanReadableDate } = useChatDate();
const { computeConversationTitle, hasUnreadMessage } = useConversation();
const chatStore = useChatStore();

const isSearching = shallowRef(false);

const humanReadableDate = computed(() => {
  return (timestamp: number) => {
    // console.log(getHumanReadableDate(checkIfTimestampIsMilliseconds(timestamp), timestamp));
    return getHumanReadableDate(checkIfTimestampIsMilliseconds(timestamp));
  }
});

function hideChatListColumn() {
  chatStore.setChatListColumnVisibility(false);
}
</script>

<template>
  <div :class="[chatLeftColumn.sidebar, 'position-relative grid h-100']">
    <section :class="[chatLeftColumn['dialog-list-container'], 'h-100 d-flex flex-column']">
      <header class="dialog-list__header px-4 d-flex align-center gap-2 py-2">
        <div class="dialog-list__header__btn">
          <v-btn id="chat-app-menu" :aria-label="t('glossaries.document.thing_menu')"
                 variant="text" size="small" :icon="true"> <!--  v-if="!isSearching" -->
            <v-icon icon="mdi-menu"></v-icon>
          </v-btn>
<!--          <v-btn v-else variant="text" size="small" :icon="true" :aria-label="t('glossaries.actions.close')">
            <v-icon :icon="isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left'"></v-icon>
          </v-btn>-->

          <v-menu activator="#chat-app-menu">
            <!--            <v-list>
                          <v-list-item
                              v-for="(item, index) in items"
                              :key="index"
                              :value="index"
                          >
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                          </v-list-item>
                        </v-list>-->
          </v-menu>
        </div> <!-- .dialog-list__header__btn -->

        <div class="flex-grow-1 position-relative">
          <v-text-field density="compact" rounded="pill" variant="outlined"
                        placeholder="Search"
                        :hide-details="true" append-inner-icon="mdi-magnify"
                        id="dialog__search-result"></v-text-field> <!-- update "isSearching" when at-least 3 characters has been inserted -->

          <v-card v-show="isSearching" :class="[chatLeftColumn['search-results--position'], 'pa-3 position-absolute w-100']">
            <p class="mb-2">list of results</p>
            <ul>
              <li>hey</li>
            </ul>
          </v-card>
<!--          <v-menu :model-value="isSearching" activator="#dialog__search-result" offset="8px">
            <v-card class="pa-3">
              <p class="mb-2">list of results</p>
              <ul>
                <li>hey</li>
              </ul>
            </v-card>
          </v-menu>--> <!-- Search Results -->
        </div> <!-- Search -->
      </header> <!-- .dialog-list__header -->

      <!-- content: conversation-list, search-results, ... -->
      <div class="dialog-list__content position-relative flex-grow-1">
        <!-- conversations-list -->
        <div class="h-100" id="conversation-list-container">
          <div class="d-flex flex-column h-100">
            <!-- folders--tabs -->
            <div class="folders--tabs">

            </div> <!-- .folders--tabs -->
            <!-- conversation list (v-windows) -->
            <div class="flex-grow-1" id="folders-container">
              <!-- this is 1 of the folders (v-window) -->
              <div class="window--conversation-list h-100 pt-2">
                <ul class="chatlist px-2 d-flex flex-column">
                  <li v-for="conversation in chatStore.chatList" :key="`conversation-${conversation.id}`">
                    <v-btn :class="[chatLeftColumn['btn--chat-container--custom-grid'], 'h-100 px-2 w-100']"
                           elevation="0" :flat="true" density="compact" variant="text"
                           :href="`#${conversation.id}`" :active="conversation.id === chatStore.currentConversation?.id"
                           @click="hideChatListColumn">
                      <div :class="[chatLeftColumn['btn--chat'], 'grid align-center w-100 text-pretty']">
                        <!-- NEEDS ATTENTION: chatLeftColumn['user-is-online'] for online-users -->
                        <div :class="[chatLeftColumn['chat__avatar-container'],
                              'justify-self-center d-flex pointer-events-none rounded-circle position-relative']">
                          <img class="w-100 h-100 aspect-square object-cover rounded-circle" alt="chat avatar"
                               :src="conversation.icon || 'https://surgassociates.com/wp-content/uploads/610-6104451_image-placeholder-png-user-profile-placeholder-image-png-286x300.jpg'" />
                        </div> <!-- .chat__avatar-container -->
                        <div>
                          <div class="chat__title d-flex align-start justify-space-between mb-1">
                            <p class="line-clamp-1">{{ computeConversationTitle(conversation) }}</p>
                            <!-- FYI: datetime attribute can be removed, because of performance reasons -->
                            <time class="text-xs ms-1 flex-grow-0 opacity-75" dir="auto"
                                  :datetime="new Date(checkIfTimestampIsMilliseconds(conversation.updated_at)).toISOString()">
                              {{ humanReadableDate(conversation.updated_at) }}
                            </time>
                          </div>
                          <div :class="[chatLeftColumn['chat__last-msg'], 'grid gap-2']">
                            <p v-if="conversation.message.type === 'text'" class="text-start opacity-75 line-clamp-1" dir="auto">{{ conversation.message.content }}</p>
                            <p v-else class="text-start opacity-75 line-clamp-1" dir="auto">{{ conversation.message.type }}</p>
                            <div :class="['d-flex align-center justify-end', chatLeftColumn['chat__last-msg__badge-container']]">
                              <v-badge v-show="hasUnreadMessage(conversation)" color="info" max="99" inline dir="ltr"></v-badge>
                            </div>
                          </div>
                        </div> <!-- end of chat content -->
                      </div>
                    </v-btn>
                  </li>
                </ul>
              </div>
            </div> <!-- #folders-container -->
          </div>
        </div> <!-- #conversation-list-container -->

        <div id="search-result-container"> <!-- the search results can be shown, here, in full-screen, like Telegram --></div> <!-- #search-result-container -->
      </div> <!-- .dialog-list__content -->
    </section> <!-- .dialog-list-container -->

    <!-- settings of the CHAT -->
    <section class="settings">
      <!-- when implementing "settings", make it appear from the left side. -->
    </section> <!-- .settings -->
  </div> <!-- .sidebar -->
</template>

<style module="chatLeftColumn">
.sidebar {
  margin-inline-end: 1px;

  grid-template-columns: 100%;
  grid-template-rows: 100%;
}
.sidebar::after {
  content: " ";
  width: 1px;
  height: 100vh;
  position: absolute;
  top: 0;
  inset-inline-end: -1px;
  background-color: var(--v-theme-background);
}

.dialog-list-container {
  grid-row: 1/-1;
}

.search-results--position {
  top: calc(100% + var(--dropdown-offset));
  inset-inline-start: 0;
}

.btn--chat {
  grid-template-columns: 4.5rem 1fr;
  min-height: 4.5rem;
  white-space: normal;
}
.btn--chat-container--custom-grid {
  grid-template-columns: 0 1fr 0 !important;
  border-radius: 0.75rem; /* 10px */
}
.chat__avatar-container {
  width: 3.375rem; /* 54px */
  height: 3.375rem; /* 54px */
}
.user-is-online::after {
  position: absolute;
  content: " ";
  display: inline-block;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-surface));
  background-color: var(--is-online-color);
  width: 0.875rem; /* 14px */
  height: 0.875rem; /* 14px */
  bottom: 0.025rem;
  inset-inline-end: 0.025rem;
}

.chat__last-msg {
  --chat-list-badge-container-size: 1.5rem;
  grid-template-columns: 1fr var(--chat-list-badge-container-size);
}
.chat__last-msg__badge-container {
  width: var(--chat-list-badge-container-size);
}
</style>
