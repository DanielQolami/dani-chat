<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {computed, shallowRef, watch} from "vue";
import {useChatStore} from "@/stores/chat.ts";
import { useConversation, useDOM, useWebSocket, useVoice } from "@/composables/useChat.ts";
import { useFile } from "@/composables/useFile.ts";
import { useFileDialog, useDevicesList } from "@vueuse/core";
import {useToast} from "vue-toastification";
import ChatServices from "@/services/chat.ts";
import { useRtl } from "vuetify";
import { useRouter } from "vue-router";
import type { SendMessagePayload } from "@/types/chat.ts";

/*type Props = {
  conversation?: Conversation,
};*/
// const props = defineProps<Props>();

const { t } = useI18n();
const chatStore = useChatStore();
const { computeConversationTitle } = useConversation();
const { humanReadableFileSize, getIconBasedOnFileType, getGeneralTypeFromFile, convertBlobToFile } = useFile();
const toast = useToast();
const { isRtl } = useRtl();
const router = useRouter();
const { appendMessageToDOM, prependPriorMessagesToDOM } = useDOM();
const { sendMessage } = useWebSocket();
const {
  audioBlob, recordingStatus, voiceRecordingDurationSeconds,
  startRecording, stopRecording, restartRecording, createBlobFromAudioChunks,
} = useVoice();

const chaparsEl = shallowRef<HTMLDivElement | null>(null);
const newMsgText = shallowRef("");
const currentConversation = computed(() => {
  return chatStore.currentConversation;
});

function sendMessageToSocket(data: Pick<SendMessagePayload, "type"|"content">) {
  if (!currentConversation.value) return;

  const otherUser = currentConversation.value?.users.find(user => {
    return user.user_id !== chatStore.user.user_id;
  });

  if (!otherUser) return;

  const payload = {
    ...data,
    chatId: currentConversation.value.id,
    sendTo: otherUser.user_id,
  };
  console.log("send message", payload);
  // sendMessage(payload);
}

function sendText() {
  if (!newMsgText.value) return;

  sendMessageToSocket({
    type: "text",
    content: newMsgText.value,
  });

  newMsgText.value = "";
}

// ------------------------------ make message & append to page
const chaparsInnerEl = shallowRef<HTMLDivElement | null>(null);

/**
 * this function, checks if there are messages for the current Chat in RAM:
 * if there is, renders messages to DOM with those,
 * if no messages in Ram, then, it fetches the messages & renders with the received messages.
 * @note call this in currentConversation computed
 * @param currentChatId
 */
async function initiateDOMTree(currentChatId: number) {
  const previousMessages = chatStore.currentConversationMessages(currentChatId);
  clearChaparsInner();
  if (!previousMessages) {
    const lastMessage = currentConversation.value?.message!;
    appendMessageToDOM({ message: lastMessage });
    await fetchMessagesByChatId(currentChatId);
    prependPriorMessagesToDOM({ hideLastMsg: true, ChatId: currentConversation.value!.id });
  }
  else prependPriorMessagesToDOM({ ChatId: currentConversation.value!.id });
}
function clearChaparsInner() {
  if (!chaparsInnerEl.value) return;
  chaparsInnerEl.value.innerHTML = "";
}

async function fetchMessagesByChatId(chatId: number) {
  try {
    await chatStore.fetchMessages(chatId);
  }
  catch (error: any) {
    toast.error(error.body?.data?.msg || error.body?.message || error.message || "fetchMessageListByChatId Error!");
  }
}

// ------------------------------ Send File
const isSendFileModalShown = shallowRef(false);
const { files: selectedFiles, open: openFileSelector, onChange: onFileSelectChange } = useFileDialog({
  // accept: "image/*", // Set to accept only image files
  // directory: true, // Select directories instead of files if set true
  multiple: false,
});
onFileSelectChange((files) => {
  /** do something with files */
  openSendFilesModal();
});
const selectedFilesLength = computed(() => {
  return selectedFiles.value ? selectedFiles.value.length : 0;
});
const sendFilesLoading = shallowRef(false);

function openSendFilesModal() {
  isSendFileModalShown.value = true;
}
function closeSendFilesModal() {
  isSendFileModalShown.value = false;
}

async function sendFiles() {
  // console.log(selectedFiles.value);
  if (!selectedFiles.value) return;

  try {
    sendFilesLoading.value = true;
    closeSendFilesModal();

    const res = await ChatServices.postSendFile({ file: selectedFiles.value[0] });

    const fileType = getGeneralTypeFromFile(selectedFiles.value[0]);
    // console.log(res.url);
    sendMessageToSocket({
      type: fileType,
      content: res.url,
    });
  }
  catch (error: any) {
    toast.error(error.body?.data?.msg || error.body?.message || error.message || "sendFiles Error!");
  }
  finally {
    sendFilesLoading.value = false;
  }
}

// ------------------------------- Send Message / Voice Message
const isSendBtnShown = shallowRef(true);
const isVoiceContainerShown = shallowRef(false);
function switchSendVoiceBtn(event: MouseEvent) {
  event.preventDefault();

  if (!isSendBtnShown.value) hideVoiceContainer();

  isSendBtnShown.value = !isSendBtnShown.value;
}
function toggleVoiceContainerVisibility() {
  isVoiceContainerShown.value = !isVoiceContainerShown.value;
}
function hideVoiceContainer() {
  isVoiceContainerShown.value = false;
}
// Voice Recording
const {
  audioInputs: microphoneList,
} = useDevicesList();
const doesMicExist = computed(() => {
  return microphoneList.value.length > 0;
});

async function sendVoice() {
  try {
    sendFilesLoading.value = true;
    closeSendFilesModal();

    const audioBlobTemp = createBlobFromAudioChunks();
    const fileName = `voice-chatId-${currentConversation.value?.id}-time-${new Date().toISOString()}`;
    const file = convertBlobToFile(audioBlobTemp, fileName);

    const res = await ChatServices.postSendFile({ file: file });

    // console.log(res.url);
    sendMessageToSocket({
      type: "audio",
      content: res.url,
    });

    restartRecording();
    toggleVoiceContainerVisibility();
  }
  catch (error: any) {
    toast.error(error.body?.data?.msg || error.body?.message || error.message || "sendFiles Error!");
  }
  finally {
    sendFilesLoading.value = false;
  }
}

// -------------------------- for mobile view
// header
const backIcon = computed(() => {
  // return isRtl.value ? "mdi-arrow-right" : "mdi-arrow-left";
  return "mdi-arrow-left";
});
function backClickHandler() {
  showChatListColumn();
  router.push({
    hash: undefined,
  });
}
function showChatListColumn() {
  chatStore.setChatListColumnVisibility(true);
}

// ------------------------------ Watchers
// NEEDS ATTENTION: save the scroll position of the "chaparsInner"'s parent for next visits to the Chat

/*watch(
    messages,
    () => {
  // NEEDS ATTENTION: needs to scroll to the msg with the last_seen_msg_id
      // well, we can save the last position of the user in the chat, to send him/her back to where they were
  chaparsEl.value?.scrollTo({
    top: chaparsEl.value?.scrollHeight || 30,
    left: 0,
    behavior: "instant", // or smooth
  });
  /!*console.log({
    top: chaparsEl.value?.scrollHeight || 30,
    left: 0,
    behavior: "instant",
  });*!/
},
    {
  flush: "post",
}
);*/
watch(
    [() => currentConversation.value?.id, chaparsInnerEl],
    ([newId, newChaparsInnerEl]) => {
      newId && newChaparsInnerEl && initiateDOMTree(newId);
    },
);
</script>

<template>
  <div v-if="chatStore.currentConversation" class="chats-container d-flex flex-column h-screen position-relative overflow-y-hidden">
    <header :class="[chatRightColumn['chat__header'], 'px-4 d-flex align-center elevation-1 position-relative']">
      <div class="chat__summary-container d-flex w-100">
        <div class="back-btn d-md-none me-1">
          <v-btn variant="plain" :icon="true" :aria-label="t('glossaries.actions.close')"
                 @click="backClickHandler">
            <v-icon :icon="backIcon"></v-icon>
          </v-btn>
        </div> <!-- .back-btn -->
        <div class="chat__info flex-grow-1 d-flex align-center">
          <v-avatar :image="chatStore.currentConversation?.icon || 'https://surgassociates.com/wp-content/uploads/610-6104451_image-placeholder-png-user-profile-placeholder-image-png-286x300.jpg'"
                    size="42"></v-avatar>
          <div class="ms-4">
            <h5>{{ computeConversationTitle(chatStore.currentConversation) }}</h5>
            <p v-show="false" class="text-xs">online</p>
          </div>
        </div> <!-- .chat__info -->
        <div class="chat__utils d-flex align-center">
<!--          <v-btn variant="text" :icon="true" size="small"
                 aria-label="call">
            <v-icon icon="mdi-phone-outline"></v-icon>
          </v-btn>-->

          <v-menu offset="4px">
            <template v-slot:activator="{ props }">
              <v-btn variant="text" :icon="true" size="small" v-bind="props"
                     :aria-label="t('glossaries.document.thing_menu')">
                <v-icon icon="mdi-dots-vertical"></v-icon>
              </v-btn>
            </template>
            <v-list density="compact" elevation="1" class="py-1">
              <v-list-item min-height="2rem" @click="console.log('clicked menu item')">
                <v-list-item-title class="text-sm">Mute</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

        </div> <!-- .chat__utils -->
      </div> <!-- .chat__summary-container -->
    </header> <!-- .chat__header -->

    <div class="chapars flex-grow-1 overflow-y-auto"
         ref="chaparsEl">
      <!-- when scrolling, add "is-scrolling" to 'chapars-inner' -->
      <div ref="chaparsInnerEl" id="chapars-inner"
           class="chapars-inner chapars--has-avatars is-scrolling d-flex flex-column justify-end pt-2 mx-auto w-100">

      </div> <!-- .chapars-inner -->
    </div> <!-- .chapars -->

    <div :class="[chatRightColumn['chat__inputs'], 'mx-auto w-100 position-relative']">
      <!-- Voice container -->
      <div :class="[chatRightColumn['voice-container'], 'position-absolute w-100',
            isVoiceContainerShown ? chatRightColumn['voice-container--show'] : '']">
        <div :class="[chatRightColumn['voice-wrapper-outer'], 'me-auto ms-2 bg-surface rounded-lg shadow']">
          <div v-if="doesMicExist" :class="[chatRightColumn['voice-wrapper'], 'd-flex align-center gap-2 px-1']"
               dir="ltr">
            <v-btn v-if="recordingStatus === 'start'" color="secondary" variant="flat" :icon="true"
                   :title="t('glossaries.actions.record_thing')"
                   @click="startRecording">
              <v-icon icon="mdi-record-rec"></v-icon>
            </v-btn>
            <v-btn v-else-if="recordingStatus === 'recording'" color="secondary" variant="flat" :icon="true"
                   :title="t('glossaries.actions.stop_thing', { thing: t('glossaries.phrases.recording', { n: 2 }) })"
                   @click="stopRecording">
              <v-icon icon="mdi-stop"></v-icon>
            </v-btn>
            <v-btn v-else color="secondary" variant="flat" :icon="true"
                   :title="t('glossaries.actions.restart_thing', { thing: t('glossaries.phrases.recording', { n: 2 }) })"
                   @click="restartRecording">
              <v-icon icon="mdi-restart"></v-icon>
            </v-btn>
            <div class="flex-grow-1" dir="auto">
              <p  v-if="recordingStatus === 'recording'">
                {{ t("glossaries.phrases.recording") }}: {{ `${voiceRecordingDurationSeconds}s` }}
              </p>
              <audio v-else-if="recordingStatus === 'stopped'"
                     controls :src="audioBlob" class="d-block w-100">
              </audio>
            </div>
            <v-btn color="primary" variant="flat" :icon="true"
                   :title="t('glossaries.actions.send_thing', { thing: t('glossaries.socialMedia.voice') })"
                   :disabled="!audioBlob" @click="sendVoice">
              <v-icon icon="mdi-file-send"></v-icon>
            </v-btn>
          </div>
          <div v-else>
            <p class="pa-3">{{ t("messages.no_thing_available", { thing: t("glossaries.communications.microphone") }) }}</p>
          </div>
        </div>
      </div>
      <!-- textarea & send btns -->
      <div :class="[chatRightColumn['chat__input-container'], 'pb-5 d-flex gap-2 align-end']" dir="ltr">
        <div class="chat__input-wrapper flex-grow-1 position-relative">
          <span :class="[chatRightColumn['new-chapar__tail'], 'new-chapar__tail bg-surface']"></span>
          <div :class="[chatRightColumn['new-message-wrapper'], 'd-flex align-end bg-surface shadow']">
            <div class="d-none">
              <v-btn variant="plain" :icon="true" aria-label="emoji">
                <v-icon icon="mdi-emoticon-outline"></v-icon>
              </v-btn>
            </div>
            <div class="flex-grow-1 mb-3 ms-2">
              <v-textarea placeholder="message..."
                variant="plain" dir="auto"
                rows="1" max-rows="10" auto-grow :no-resize="true" density="compact"
                :hide-details="true"
                v-model="newMsgText"
                @keydown.ctrl.enter.exact="sendText"
              ></v-textarea>
            </div>
            <div>
              <v-btn variant="plain" :icon="true" aria-label="attachment" @click="openFileSelector">
                <v-icon icon="mdi-attachment"></v-icon>
              </v-btn>
            </div>
          </div> <!-- .new-message-wrapper -->
        </div>
        <!-- Send btn & Voice btn -->
        <div class="btn-send-container">
          <v-btn v-if="isSendBtnShown"
                 variant="flat" color="primary" :icon="true" @click="sendText"
                 @click.right="switchSendVoiceBtn"
                 :title="t('glossaries.actions.send_thing', { thing: t('glossaries.document.message') })">
            <v-icon icon="mdi-send"></v-icon>
          </v-btn>
          <v-btn v-else
                 variant="flat" color="primary" :icon="true" @click="toggleVoiceContainerVisibility"
                 @click.right="switchSendVoiceBtn"
                 :title="t('glossaries.socialMedia.voice')">
            <v-icon icon="mdi-microphone"></v-icon>
          </v-btn>
        </div>
      </div> <!-- .chat__input-container -->
    </div> <!-- .chat__inputs -->

    <!-- Dialogs -->
    <!-- upload file dialog -->
    <v-dialog v-model="isSendFileModalShown" max-width="500" :close-on-content-click="false" :retain-focus="true">
      <v-card>
        <section>
          <div class="d-flex gap-2 align-center pt-2 px-2 mb-2">
            <v-btn :icon="true" variant="text" size="small" :aria-label="t('glossaries.actions.close')" @click="closeSendFilesModal">
              <v-icon icon="mdi-close"></v-icon>
            </v-btn>
            <h4 class="flex-grow-1 text-xl">{{ t("glossaries.actions.send_thing", { thing: t("glossaries.document.file", { count: selectedFilesLength }) }) }}</h4>
          </div>
          <div dir="ltr" class="px-2">
            <v-list>
              <v-list-item v-for="(file, fileIndex) in selectedFiles" :key="`${fileIndex}-${file.name}`"
                           :class="[chatRightColumn['selected-file--hover'], 'py-2']" rounded="lg">
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    <v-icon color="background" :icon="getIconBasedOnFileType(file)"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ file.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ humanReadableFileSize(file.size) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
          <div>
            <div class="pa-2 d-flex align-center justify-end">
              <v-btn color="primary" variant="flat" @click="sendFiles">{{ t("glossaries.actions.send_thing") }}</v-btn>
            </div>
          </div>
        </section>
      </v-card>
    </v-dialog>

    <!-- send File loading -->
    <div :class="[chatRightColumn['send-files-container--loading'], 'position-absolute bg-background rounded-lg pa-2', sendFilesLoading ? chatRightColumn['loading--show'] : '']">
      <v-icon icon="mdi-upload" :aria-label="t('glossaries.actions.sending_thing')" :class="chatRightColumn['send_files']"></v-icon>
    </div>
  </div> <!-- chats-container -->
</template>

<style src="@/assets/css/chat.css"></style>
<style module="chatRightColumn">
.chat__header {
  min-height: var(--chat-topbar-height);
  z-index: 2;
}
.chat__inputs {
  max-width: var(--chat-inputs-container-width);
  padding-top: 0.1rem;
}

.chat__input-container {
  padding-inline: var(--chat-input-container-padding-inline);
}
.new-message-wrapper {
  border-radius: 1rem 1rem 0;
}
.chat__input-container .new-chapar__tail {
  inset-inline-start: 100%;
}

.selected-file--hover:hover {
  background-color: rgba(var(--v-theme-on-background), 0.1);
}

.send-files-container--loading {
  bottom: 1rem;
  inset-inline-end: 1rem;

  transform: translateY(100%);
  opacity: 0;
  transition: all 1s ease;
  visibility: hidden;
}
.send-files-container--loading.loading--show {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}
.send_files {
  animation: pulse 2s infinite linear;
}

.voice-container {
  bottom: 50%;
  left: 0;
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  transition: bottom 0.5s ease-in, visibility 0.5s ease-in, opacity 0.5s ease-out;
}
.voice-container.voice-container--show {
  bottom: calc(100% + 0.25rem);
  visibility: visible;
  opacity: 1;

  pointer-events: none;
}
.voice-wrapper-outer {
  max-width: calc(100% - 2rem);
}
.voice-wrapper {
  height: 4rem;

  pointer-events: all;
  user-select: none;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}
</style>
