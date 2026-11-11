import { createRouter, createWebHistory } from "vue-router";

import { installAuthGuards } from "./guards";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

installAuthGuards(router);

export default router;
