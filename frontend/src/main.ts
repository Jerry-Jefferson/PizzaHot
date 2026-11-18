import "./assets/styles/main.css";
import "primeicons/primeicons.css";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";

import App from "./App.vue";
import { errorHandlerPlugin } from "./plugins/error-handler";
import { primeVueOptions } from "./plugins/primevue";
import { vueQueryOptions } from "./plugins/vue-query";
import router from "./router";

createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue, primeVueOptions)
  .use(ToastService)
  .use(errorHandlerPlugin)
  .use(ConfirmationService)
  .use(VueQueryPlugin, vueQueryOptions)
  .mount("#app");
