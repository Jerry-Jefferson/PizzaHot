import "./assets/styles/main.css";
import "primeicons/primeicons.css";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";

import App from "./App.vue";
import { primeVueOptions } from "./plugins/primevue";
import { vueQueryOptions } from "./plugins/vue-query";
import router from "./router";
import { useAuthStore } from "./stores/auth";

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  app.use(createPinia());

  try {
    await useAuthStore().restoreSession();
  } catch {
    // The app still starts as a guest when the server is unreachable.
  }

  app
    .use(router)
    .use(PrimeVue, primeVueOptions)
    .use(ToastService)
    .use(ConfirmationService)
    .use(VueQueryPlugin, vueQueryOptions)
    .mount("#app");
}

void bootstrap();
