// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import type { ThemeDefinition } from "vuetify";
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';

import i18n from './i18n';
import { useI18n } from 'vue-i18n';

const myLight: ThemeDefinition = {
  colors: {
    primary: "#ec6dba", // Persian Pink
  },
};

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      light: myLight,
    },
  },
  locale: {
    // @ts-ignore
    adapter: createVueI18nAdapter({ i18n, useI18n })
  },
  defaults: {
    VBtn: {
      // style: 'letter-spacing: normal;',
      style: [{ letterSpacing: "normal" }],
      class: 'text-none',
    },
  },
})