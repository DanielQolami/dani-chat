import { createI18n } from 'vue-i18n';
import parsi from "@/locales/fa.ts";

const instance = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  // legacy: false ---> to switch from legacy mode (options api) to composition api mode
  // reference https://vue-i18n.intlify.dev/guide/advanced/composition.html
  locale: "fa",
  fallbackLocale: "fa",
  messages: {
    "fa": parsi,
  },
});

export default instance;

/* used this code below, because we can't call `const { t } = useI18n();` outside of `setup` lifecycle.
   and it was a pain in the ass but after research, found this trick.
   it works well, but I'm worried about future when we MIGHT need to dynamically load 'locale' files. */
export const i18n = instance.global;
