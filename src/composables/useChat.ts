import { useTimeAgo } from "@vueuse/core";
import { useString } from "@/composables/useString.ts";
import { useChatStore } from "@/stores/chat.ts";
import { useNumbers } from "@/composables/useNumbers.ts";
import { shallowRef, computed } from "vue";
import type {
  Conversation,
  ConversationWithMessageList,
  Message,
  MessageToDisplay,
  SendMessagePayload,
} from "@/types/chat.ts";

// useChatDate
type IsInRangeArgs = { value: EpochTimeStamp, sinceTime: EpochTimeStamp, toTime: EpochTimeStamp };
// useDOM
type AvatarImgArgs = { src: string, alt?: string };
type CreateAndAppendMessageArgs = {
  message: Message,
  initialMessage?: boolean,
};
type CreateChaparDateGroupWithChaparArgs = {
  insertWhereInChaparsInner: "afterbegin" | "beforeend",
  msg: Message
};
type VIconArgs = { mdiIcon: string, ariaLabel?: string };

export function useChatDate() {
  const { formatDate, removeDoubleQuotes } = useString();

  function isInToday(time: EpochTimeStamp): boolean {
    const inputDate = new Date(time);
    const today = new Date();

    return today.setHours(0, 0, 0, 0) === inputDate.setHours(0, 0, 0, 0);
  }
  function isInRange({value, sinceTime, toTime}: IsInRangeArgs): boolean {
    return sinceTime < value && value <= toTime;
  }
  function isInTheLastHour(time: EpochTimeStamp) {
    const currentDate = new Date();
    const lastHour = new Date(currentDate.getTime()).setHours(currentDate.getHours() - 1);

    return isInRange({ value: time, sinceTime: lastHour, toTime: currentDate.getTime() });
  }
  function isLessThan1Year(time: EpochTimeStamp) {
    const currentDate = new Date();
    const lastYear = new Date(currentDate.getTime()).setFullYear(currentDate.getFullYear() - 1);

    return isInRange({ value: time, sinceTime: lastYear, toTime: currentDate.getTime() });
  }


  /**
   * returns a human-readable time format based on the given "time".
   * 1) time is in the last Hour: "40 min ago"
   * 2) time is in today:         "HH:mm"
   * 3) time is in the last year: "MMM/DD"
   * 4) time is before last year: "YYYY/MM/DD"
   *
   * @param time {number}
   */
  function getHumanReadableDate(time: EpochTimeStamp) {
    // 1. time is in CURRENT DAY
    if (isInToday(time)) {
      // if in the last hour, show "40 min ago"
      if (isInTheLastHour(time)) {
        return removeDoubleQuotes(useTimeAgo(time).value);
      }
      // else show HH:mm
      return formatDate(time, { dateFormat: "HH:mm" });
    }
    // 2. time is before today
    else {
      // if in the last year, show MMM/DD
      if (isLessThan1Year(time)) {
        return formatDate(time, { dateFormat: "MMM DD" });
      }
      // else show YYYY/MM/DD
      return formatDate(time, { dateFormat: "YYYY/MM/DD" })
    }
  }

  return {
    getHumanReadableDate,
  };
}

export function useConversation() {
  const chatStore = useChatStore();

  /**
   * title to show as the conversation title.
   *
   * @param conversation
   * @returns conversationTitle {string|number|undefined} it returns one of the values, below. if none of them exist, returns undefined.
   * 1) `conversation.title`
   * 2) `otherUser.full_name`
   * 3) `otherUser.mobile`
   */
  function computeConversationTitle(conversation: Conversation | ConversationWithMessageList) {
    if (conversation.title) return conversation.title;

    // NEEDS ATTENTION
    const notMeUser = conversation.users.find((user) => {
      return user.user_id !== chatStore.user.user_id;
    });

    if (notMeUser?.full_name) return notMeUser.full_name;
    else if (notMeUser?.mobile) return notMeUser.mobile;
    else return undefined;
  }

  /**
   * checks if the last_seen_msg_id is lower than the last message_id:
   * if so, returns `true`
   * else returns `false`
   * @param conversation
   */
  const hasUnreadMessage = computed(() => {
      return (conversation: Conversation): boolean => {
        return conversation.last_seen_id < conversation.message.id;
      };
    });

  // ----------------------------------- message observer api
  // Create an observer instance
  let messageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const messageId = entry.target.getAttribute("data-mid");
        const messageChatId = entry.target.getAttribute("data-chat-id");

        const currentChat = chatStore.currentConversation;

        if (currentChat?.id === Number(messageChatId)) {
          if (messageId && currentChat.last_seen_id > Number(messageId)) {
            console.log('Message observed: ', messageId, "chatId ", messageChatId);
          }
        }

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01 });  // threshold: when 0.01 of the div is visible

  // Function to start observing a message div
  function observeMessage(messageDiv: HTMLDivElement) {
    messageObserver.observe(messageDiv);
  }

  return {
    computeConversationTitle, hasUnreadMessage,
    observeMessage,
  };
}

export function useDOM() {
  const chatStore = useChatStore();
  const { formatDate } = useString();
  const { checkIfTimestampIsMilliseconds } = useNumbers();
  const { observeMessage } = useConversation();

  // functions

  // NEEDS ATTENTION: this function can be shortened
  // multiple functions WITHIN this function can exist.
  function createChaparContentWrapper(msg: MessageToDisplay) {
    function createVIcon(args: VIconArgs) {
      const vIcon = document.createElement("i");
      vIcon.classList.add(
        "mdi", "v-icon", "notranslate", "v-theme--light", "v-icon--size-x-small",
        "chapar__msg__status-indicator", "chapar__msg__status-outgoing",
      );
      vIcon.classList.add(args.mdiIcon);
      vIcon.ariaHidden = args.ariaLabel ? "false" : "true";
      if (args.ariaLabel) vIcon.ariaLabel = args.ariaLabel;

      return vIcon;
    }

    // .chapar-content-wrapper
    const chaparContentWrapperDiv = document.createElement("div");
    chaparContentWrapperDiv.classList.add("chapar-content-wrapper");

    // .chapar-content
    const chaparContentDiv = document.createElement("div");
    chaparContentDiv.classList.add(
      "chapar-content", "bg-surface", "shadow", "overflow-hidden",
    );
    // ------ start .chapar-content
    // .tail
    const tailSpan = document.createElement("span");
    tailSpan.classList.add("new-chapar__tail", "bg-surface");
    chaparContentDiv.appendChild(tailSpan);
    // if user is not ME, then add username & 'is-in' class to the div
    if (true) {
      // .chapar-content__name
      const chaparContentNameDiv = document.createElement("div");
      chaparContentNameDiv.classList.add(
        "chapar-content__name", "pt-1", "px-2", "text-primary", "truncate", "text-sm",
      );
      chaparContentNameDiv.dir = "auto";
      const chaparNameSpan = document.createElement("span");
      chaparNameSpan.textContent = msg.user.full_name || String(msg.user.mobile);
      chaparContentNameDiv.appendChild(chaparNameSpan);

      chaparContentDiv.appendChild(chaparContentNameDiv);
    }

    // attachment: if type is video/audio/image/file
    if (msg.type !== "text") {
      const attachmentDiv = document.createElement("div");
      attachmentDiv.classList.add(
        "gap-[0.1rem]", "d-flex", "flex-wrap", "w-100", "mb-1",
      );

      // this can be a "for" loop, on every sent media.
      const chaparMediaContainerDiv = document.createElement("div");
      chaparMediaContainerDiv.classList.add("chapar__media-container", "max-h-[21rem]", "overflow-hidden"); // if multiple & more than 3 columns, "max-h-[10rem]"

      if (msg.type !== "audio") chaparMediaContainerDiv.classList.add("grid-rows-1--full", "grid");

      /*if (msg.type === "video") {
        // video duration span

        // video
        const video = document.createElement("video");
        video.classList.add("max-w-full", "max-h-full", "d-block");
        video.controls = true;
        video.preload = "metadata";
        video.src = msg.content;

        chaparMediaContainerDiv.appendChild(video);
      }
      else*/ if (msg.type === "image") {
        const image = document.createElement("img");
        image.classList.add("w-100", "max-h-full", "object-cover", "d-inline-block");
        image.alt = "PHOTO";
        image.src = msg.content;

        chaparMediaContainerDiv.appendChild(image);
      }
      else if (msg.type === "audio") {
        // audio
        const audio = document.createElement("audio");
        audio.classList.add("w-100", "d-block", "chapar__media__audio");
        audio.controls = true;
        audio.preload = "metadata";
        audio.src = msg.content;

        chaparMediaContainerDiv.appendChild(audio);
      }
      else {
        // for file
        const aEl = document.createElement("a");
        aEl.classList.add("max-w-full", "d-block", "px-2", "break-words");
        aEl.dir = "ltr";
        aEl.href = msg.content;
        const fileName = msg.details.file_name || msg.content;
        aEl.textContent = fileName;
        aEl.download = fileName;

        chaparMediaContainerDiv.appendChild(aEl);
      }

      attachmentDiv.appendChild(chaparMediaContainerDiv);
      chaparContentDiv.appendChild(attachmentDiv);
    }
    // message
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chapar__message", "px-3");
    // start message
    const contentPre = document.createElement("pre");
    contentPre.classList.add("text-pre-line");
    if (msg.type !== "text") contentPre.classList.add("d-none");
    contentPre.dir = "auto";
    contentPre.textContent = msg.content;
    // time & read/unread status container
    const timeContainerDiv = document.createElement("div");
    timeContainerDiv.classList.add("d-flex", "justify-end", "align-center", "text-xs");
    // start timeContainer
    // .message__time
    const timeEl = document.createElement("time");
    timeEl.classList.add("chapar__message__time");
    timeEl.dateTime = formatDate(checkIfTimestampIsMilliseconds(msg.created_at), { dateFormat: 'YYYY-MM-DD HH:mm' });
    timeEl.textContent = formatDate(checkIfTimestampIsMilliseconds(msg.created_at), { dateFormat: "HH:mm" });
    // icons: is-going, sent, read
    const outgoingIcon = createVIcon({ mdiIcon: "mdi-clock-outline", ariaLabel: "sending message" });
    const sentIcon = createVIcon({ mdiIcon: "mdi-check", ariaLabel: "message sent" });
    const readIcon = createVIcon({ mdiIcon: "mdi-check-all", ariaLabel: "message read" });

    timeContainerDiv.append(timeEl, outgoingIcon, sentIcon, readIcon);
    // end timeContainer
    messageDiv.insertAdjacentElement("beforeend", contentPre);
    messageDiv.insertAdjacentElement("beforeend", timeContainerDiv);

    chaparContentDiv.insertAdjacentElement("beforeend", messageDiv);
    // end message
    /*// .chapar-hover-reaction
    const hoverReactionDiv = document.createElement("div");
    hoverReactionDiv.classList.add("chapar-hover-reaction", "d-none");
    chaparContentDiv.insertAdjacentElement("beforeend", hoverReactionDiv);*/
    // ------ end .chapar-content

    // append to .chapar-content-wrapper
    chaparContentWrapperDiv.insertAdjacentElement("beforeend", chaparContentDiv);

    // return
    return chaparContentWrapperDiv;
  }

  function createChaparDiv(message: Message) {
    const msg = {
      ...message,
      user: chatStore.getUserInfoFromChatUsers(message.user_id)!,
    } satisfies MessageToDisplay;

    // chapar
    const chaparDiv = document.createElement("div");
    // can be added: is-read is-sent is-outgoing has-webpage
    chaparDiv.classList.add(
      "chapar", "can-have-tail",
      "position-relative", "d-flex", "flex-wrap", "gap-1", "mb-1",
      msg.user_id === chatStore.user.user_id ? "is-out" : "is-in",
    );
    chaparDiv.dataset.mid = msg.id+"";
    chaparDiv.dataset.userid = msg.user_id+"";
    chaparDiv.dataset.timestamp = msg.created_at+"";
    chaparDiv.dataset.chatId = msg.chat_id+"";

    const chaparContentWrapper = createChaparContentWrapper(msg);

    chaparDiv.insertAdjacentElement("beforeend", chaparContentWrapper);

    observeMessage(chaparDiv);
    return chaparDiv;
  }

  /**
   * creates "chapars-group" based on an array of messages with the SAME `user_id`.
   * @note if messageList is empty, then it returns "chapars-group" without messageDiv & avatar inside of it.
   * so, you have to create the "avatar", yourself, and append to it.
   * @param messageList
   * @returns {HTMLDivElement} returns a "chapars-group" div, with chapars inside it.
   */
  function createChaparsGroupBasedOnUser(messageList: Message[]) {
    const chaparsGroupDiv = document.createElement("div");
    chaparsGroupDiv.classList.add(
      "chapars-group", "mb-2", "position-relative",
    );

    // ---------- children of chaparsGroupDiv
    if (messageList.length > 0) {
      // avatar
      if (messageList[0].user_id !== chatStore.user.user_id) {
        const user = chatStore.getUserInfoFromChatUsers(messageList[0].user_id);

        const avatarContainerDiv = createChaparsGroupAvatarContainer({
          src: user?.icon || "https://surgassociates.com/wp-content/uploads/610-6104451_image-placeholder-png-user-profile-placeholder-image-png-286x300.jpg"
        });

        chaparsGroupDiv.insertAdjacentElement("afterbegin", avatarContainerDiv);
      }
      // chapar (for loop)
      const messageListLength = messageList.length;
      for (let i = 0; i < messageListLength; i++) {
        const chaparEl = createChaparDiv(messageList[i]);
        chaparsGroupDiv.insertAdjacentElement("beforeend", chaparEl);
      }
    }

    // return chaparsGroupDiv
    return chaparsGroupDiv;
  }
  function createVAvatar(imgArgs: AvatarImgArgs) {
    const avatarWrapperEl = document.createElement("div");
    avatarWrapperEl.classList.add(
      "v-avatar", "v-theme--light", "v-avatar--density-default", "v-avatar--variant-flat", "position-sticky",
      "chapars-group__avatar",
    );
    // Maybe we need to specificly set width and height (better not do it)
    // avatarWrapperEl.style.width = "2.25rem";
    // avatarWrapperEl.style.height = "2.25rem";

    const vResponsiveEl = document.createElement("div");
    vResponsiveEl.classList.add("v-responsive", "v-img");
    vResponsiveEl.ariaLabel = "";

    const vResponsiveSizerEl = document.createElement("div");
    vResponsiveSizerEl.classList.add("v-responsive__sizer");
    vResponsiveSizerEl.style.paddingBottom = "121.364%";
    const vImgCoverEl = document.createElement("img");
    vImgCoverEl.classList.add("v-img__img", "v-img__img--cover");
    vImgCoverEl.alt = imgArgs.alt || "";
    vImgCoverEl.src = imgArgs.src;

    vResponsiveEl.insertAdjacentElement("beforeend", vResponsiveSizerEl);
    vResponsiveEl.insertAdjacentElement("beforeend", vImgCoverEl);

    const vAvatarUnderlayEl = document.createElement("span");

    avatarWrapperEl.insertAdjacentElement("beforeend", vResponsiveEl);
    avatarWrapperEl.insertAdjacentElement("beforeend", vAvatarUnderlayEl);

    return avatarWrapperEl;
  }
  function createChaparsGroupAvatarContainer(imgArgs: AvatarImgArgs) {
    const avatarContainerDiv = document.createElement("div");
    avatarContainerDiv.classList.add(
      "chapars-group__avatar-container", "flex-column-reverse", "position-absolute",
    );
    // v-avatar
    const avatarWrapperEl = createVAvatar(imgArgs);

    avatarContainerDiv.insertAdjacentElement("beforeend", avatarWrapperEl);

    return avatarContainerDiv;
  }

  /**
   * creates "chapars-date-group" div, with "date" sticky div inside it, WITHOUT "chapars-group"s inside it.
   * @param args
   * @returns {HTMLDivElement} returns "chapars-date-group" div.
   */
  function createChaparsDateGroup(args: { date: string }) {
    function createDateEl(date: string) {
      function createVChip(text: string) {
        const vChipEl = document.createElement("span");
        vChipEl.classList.add(
          "v-chip", "v-theme--light", "text-primary", "v-chip--density-comfortable",
          "v-chip--size-default", "v-chip--variant-tonal", "font-weight-bold"
        );
        vChipEl.draggable = false;

        const vChipUnderlayEl = document.createElement("span");
        vChipUnderlayEl.classList.add("v-chip__underlay");
        const vChipContentEl = document.createElement("div");
        vChipContentEl.classList.add("v-chip__content");
        vChipContentEl.textContent = text;

        vChipEl.insertAdjacentElement("beforeend", vChipUnderlayEl);
        vChipEl.insertAdjacentElement("beforeend", vChipContentEl);
        return vChipEl;
      }

      const dateDiv = document.createElement("div");
      dateDiv.classList.add("is-date", "is-sticky", "mb-1", "pb-1");

      const dateChipContainerEl = document.createElement("div");
      dateChipContainerEl.classList.add("d-flex", "justify-center");

      const dateChipEl = createVChip(date);

      dateChipContainerEl.insertAdjacentElement("beforeend", dateChipEl);

      dateDiv.insertAdjacentElement("beforeend", dateChipContainerEl);
      return dateDiv;
    }

    const chaparsDateGroup = document.createElement("div");
    chaparsDateGroup.classList.add("chapars-date-group", "position-relative");
    chaparsDateGroup.dataset.groupDate = args.date;

    // sticky date
    // add "is-sticky" when "is-date" is not visible on the screen
    const dateEl = createDateEl(args.date);

    chaparsDateGroup.insertAdjacentElement("beforeend", dateEl);
    // return .chapars-date-group
    return chaparsDateGroup;
  }

  // DOM manipulations
  function appendMessageToDOM(options: CreateAndAppendMessageArgs) {
    const configuration = { initialMessage: options.initialMessage ?? false };

    // if "options.initial" === true, create a "chapar-date-group" and then append to chaparInnerEl
    const chaparsInnerEl = document.getElementById("chapars-inner");

    const lastChaparsDateGroupEl = chaparsInnerEl?.querySelector('.chapars-date-group:last-child');
    if (lastChaparsDateGroupEl) {
      // NEEDS ATTENTION: DRY code. REFER TO prependPriorMessagesToDOM
      const dateOfDateGroup = lastChaparsDateGroupEl.getAttribute("data-group-date");
      const msgDate = formatDate(checkIfTimestampIsMilliseconds(options.message.created_at));

      if (dateOfDateGroup === msgDate) {
        const lastChaparsGroup = lastChaparsDateGroupEl.querySelector(".chapars-group:last-child");
        // @ts-ignore
        const lastChapar = lastChaparsGroup.querySelector(".chapar:last-child");
        // @ts-ignore
        const lastChaparUserId = lastChapar.getAttribute("data-userid");

        if (options.message.user_id === Number(lastChaparUserId)) {
          const chaparDiv = createChaparDiv(options.message);
          // @ts-ignore
          lastChapar.insertAdjacentElement("afterend", chaparDiv);
        }
        else {
          const newChaparsGroupDiv = createChaparsGroupBasedOnUser([options.message]);
          // @ts-ignore
          lastChaparsGroup.insertAdjacentElement("afterend", newChaparsGroupDiv);
        }

        // check if the sender is MYSELF, scroll smoothly
        if (options.message.user_id === chatStore.user.user_id)
          scrollToMessage({ messageId: options.message.id, smoothBehavior: true });

        return;
      }
    }

    // if "chapars-date-group" doesn't exist
    // || the date of the "chapars-date-group" !== msg.created_at.toISOString().slice(0, 10)
    createAndAppendChaparDateGroupToChaparInner({ insertWhereInChaparsInner: "beforeend", msg: options.message });

    // check if the sender is MYSELF, scroll smoothly
    if (options.message.user_id === chatStore.user.user_id)
      scrollToMessage({ messageId: options.message.id, smoothBehavior: true });
  }
  function scrollToMessage(args: { messageId: number, smoothBehavior: boolean }) {
    const chaparDiv = document.querySelector(`[data-mid="${args.messageId}"]`);
    if (!chaparDiv) return;
    chaparDiv.scrollIntoView({ block: "end", behavior: args.smoothBehavior ? "smooth" : "instant" });
  }
  async function createAndAppendChaparDateGroupToChaparInner({ msg, insertWhereInChaparsInner }: CreateChaparDateGroupWithChaparArgs) {
    try {
      const date = formatDate(checkIfTimestampIsMilliseconds(msg.created_at));

      const dateGroupDiv = createChaparsDateGroup({ date });
      const chaparsGroupDiv = createChaparsGroupBasedOnUser([msg]);

      dateGroupDiv.insertAdjacentElement("beforeend", chaparsGroupDiv);

      const chaparsInnerEl = document.getElementById("chapars-inner");
      chaparsInnerEl?.insertAdjacentElement(insertWhereInChaparsInner, dateGroupDiv);

      return dateGroupDiv;
    }
    catch (error) {
      throw error;
    }
  }

  /**
   * 1) gets the messageList of the Chat.
   * 2) creates "chapar" divs from the messages
   * 3) prepends the divs to "chapars-inner" element.
   * @param config
   */
  async function prependPriorMessagesToDOM(config: { hideLastMsg?: boolean, ChatId: number }) {
    const configuration = {
      // if we have attached the last message
      hideLastMessage: config?.hideLastMsg ?? false,
    };

    // @ts-ignore
    const prevMessageList = chatStore.currentConversationMessages(config.ChatId);
    if (!prevMessageList) return;

    let prevDateGroupEl: HTMLDivElement | undefined;
    // let lastChaparGroupEl: HTMLDivElement | undefined;

    const chaparsInnerEl = document.getElementById("chapars-inner");
    prevDateGroupEl = chaparsInnerEl?.querySelector(".chapars-date-group") || undefined;

    // for loop: prepend to chapars-inner (one by one)
    const prevMessagesLength = prevMessageList.length;
    for (let i = 0; i < prevMessagesLength; i++) {
      if (configuration.hideLastMessage && i === 0) {
        continue;
      }

      const msg = prevMessageList[i];
      if (!prevDateGroupEl) {
        /*const dateGroupDiv = createChaparsDateGroup({ date });
        const chaparsGroupDiv = createChaparsGroupBasedOnUser([msg]);

        dateGroupDiv.insertAdjacentElement("beforeend", chaparsGroupDiv);
        chaparsInnerEl.value?.insertAdjacentElement("afterbegin", dateGroupDiv);

        // lastChaparGroupEl = chaparsGroupDiv;
        prevDateGroupEl = dateGroupDiv;*/
        prevDateGroupEl = await createAndAppendChaparDateGroupToChaparInner({msg, insertWhereInChaparsInner: "afterbegin"} );
      }
      else {
        // NEEDS ATTENTION: DRY code. REFER TO appendMessageToDOM
        const msgDate = formatDate(checkIfTimestampIsMilliseconds(msg.created_at));
        const dateOfDateGroup = prevDateGroupEl.dataset.groupDate;

        // if date is not the same, we add a NEW dateGroup & NEW chaparsGroup
        if (msgDate !== dateOfDateGroup) {
          prevDateGroupEl = await createAndAppendChaparDateGroupToChaparInner({msg, insertWhereInChaparsInner: "afterbegin"});
        }
        // if msgDate === DATE of lastDateGroup,
        else {
          const firstChaparsGroup = prevDateGroupEl.querySelector(".chapars-group");
          // @ts-ignore
          const firstChapar = firstChaparsGroup.querySelector(".chapar");
          // @ts-ignore
          const firstChaparUserId = firstChapar.getAttribute("data-userid");

          if (msg.user_id === Number(firstChaparUserId)) {
            const chaparDiv = createChaparDiv(msg);
            // @ts-ignore
            firstChapar.insertAdjacentElement("beforebegin", chaparDiv);
          }
          else {
            const newChaparsGroupDiv = createChaparsGroupBasedOnUser([msg]);
            // @ts-ignore
            firstChaparsGroup.insertAdjacentElement("beforebegin", newChaparsGroupDiv);
          }
        }
      }

    }

    // scroll to latest message or last_seen_msg
    // scrollToMessage({ smoothBehavior: false, messageId: prevMessageList[0].id });
    const chaparsGroupElementsOnPage = document.querySelectorAll(".chapars-group");
    const lastChaparsGroupEl = chaparsGroupElementsOnPage[chaparsGroupElementsOnPage.length - 1];
    lastChaparsGroupEl?.scrollIntoView({ behavior: "instant", block: "end" });
  }

  // return
  return {
    appendMessageToDOM,
    prependPriorMessagesToDOM,
  };
}

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let userDisconnected = false; // Flag to track user-initiated disconnection
export function useWebSocket() {
  const chatStore = useChatStore();
  const { appendMessageToDOM } = useDOM();

  const connectWebsocket = () => {
    ws = new WebSocket("YOUR_WEBSOCKET");

    ws.onopen = () => {
      console.log('WebSocket connection established.');
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    ws.onmessage = (event) => {
      // console.log('Received message:', event.data);
      console.log('Received event:', event);
      const res = JSON.parse(event.data);
      switch (res.event) {
        case "message": {
          console.log("message", res.data);
          break;
        }
        case "exception": {
          console.log("exception", res.data);
          break;
        }
        case "new_message": {
          // console.log("message", res.data);
          appendToActiveChat(res.data.message);
          chatStore.addMessageToChat(res.data.message);
          break;
        }
        case "send_message": {
          // console.log("send_message", res.data);
          appendToActiveChat(res.data.message);
          chatStore.addMessageToChat(res.data.message);
          break;
        }
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed with code: ' + event.code);
      // Clean up resources or perform other actions here
      if (!userDisconnected) {
        handleWSReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Handle the error (e.g., log it, show an alert, etc.)
    };
  };
  function handleWSReconnect() {
    const maxReconnectAttempts = 5;
    const reconnectDelay = Math.min(1000 * 2 ** reconnectAttempts, 10000); // Exponential backoff

    if (reconnectAttempts < maxReconnectAttempts) {
      console.log(`Reconnecting in ${reconnectDelay} ms...`);
      setTimeout(connectWebsocket, reconnectDelay);
      reconnectAttempts++;
    } else {
      console.log('Max reconnect attempts reached. Giving up.');
    }
  }
// Call this function when you want to disconnect gracefully (like logOut)
  function disconnectWebSocket() {
    userDisconnected = true;
    if (ws) {
      ws.close(1000, 'User-initiated disconnect'); // 1000: Normal closure
    }
  }


  /**
   * creates the message div, and appends it to the DOM. to show the new message to the user.
   * (checks if the chat_id of the message === the currentConversation)
   * @param responseMessage
   */
  function appendToActiveChat(responseMessage: Message) {
    // console.log(responseMessage.chat_id !== chatStore.currentConversation?.id, responseMessage.chat_id, chatStore.currentConversation?.id);
    if (responseMessage.chat_id !== chatStore.currentConversation?.id) return;

    appendMessageToDOM({ message: responseMessage });
  }

  function sendMessage({ sendTo, chatId, type, content }: SendMessagePayload) {
    if (!ws) return;

    ws.send(JSON.stringify({
      "event": "send_message",
      "data": {
        "send_to": sendTo,
        "message": {
          "chat_id": chatId,
          "type": type,
          "content": content,
          "details": null
        },
      }
    }));
  }

  return {
    connectWebsocket, disconnectWebSocket, sendMessage,
  };
}

export function useVoice() {
  let mediaRecorder: MediaRecorder;
  let audioChunks: Blob[] = [];
  let durationInterval: number | undefined;

  const audioBlob = shallowRef<string | undefined>(undefined);
  const voiceRecordingDurationSeconds = shallowRef<number>(0);
  const recordingStatus = shallowRef<"start" | "recording" | "stopped">("start");

  function startDurationCounter() {
    let seconds = voiceRecordingDurationSeconds.value = 0;
    durationInterval = setInterval(() => {
      seconds++;
      voiceRecordingDurationSeconds.value = seconds;
    }, 1_000);
  }
  function createBlobFromAudioChunks() {
    return new Blob(audioChunks, { type: 'audio/wav' });
  }
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlobTemp = createBlobFromAudioChunks();
        audioBlob.value = URL.createObjectURL(audioBlobTemp);
      };

      mediaRecorder.start();
      startDurationCounter();
      recordingStatus.value = "recording";
    }
    catch (error) {
      throw error;
    }
  }
  function stopRecording() {
    mediaRecorder.stop();
    clearInterval(durationInterval);
    // const audioBlobTemp = new Blob(audioChunks, { type: 'audio/wav' });
    // audioBlob.value = URL.createObjectURL(audioBlobTemp);
    recordingStatus.value = "stopped";
  }
  function restartRecording() {
    audioBlob.value = undefined;
    audioChunks = [];
    recordingStatus.value = "start";
  }

  return {
    audioBlob, voiceRecordingDurationSeconds, recordingStatus,
    startRecording, stopRecording, restartRecording,
    createBlobFromAudioChunks,
  };
}
