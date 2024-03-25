import "./assets/css/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import i18n from "./plugins/i18n.ts";
import vuetify from "./plugins/vuetify.ts";
import axios from "./plugins/axios";
import Toast, { options } from "./plugins/vue-toastification.ts";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(vuetify);
app.provide("axios", axios);
app.use(Toast, options);

app.mount("#app");
