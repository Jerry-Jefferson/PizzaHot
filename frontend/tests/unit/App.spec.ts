import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "@/App.vue";
import { routes } from "@/router/routes";

let wrapper: VueWrapper | undefined;

async function mountAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createPinia(), PrimeVue, ToastService, ConfirmationService, router] },
  });
  await flushPromises();
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("App layout selection", () => {
  it("uses the customer layout with header and footer", async () => {
    const app = await mountAt("/");

    expect(app.find("header nav[aria-label='Main']").exists()).toBe(true);
    expect(app.find("footer").text()).toContain("Pizzeria. All rights reserved.");
    expect(app.find("h1").text()).toBe("Our Menu");
  });

  it("uses the auth layout without the customer header", async () => {
    const app = await mountAt("/sign-in");

    expect(app.find("aside.theme-sidebar").exists()).toBe(true);
    expect(app.find("nav[aria-label='Main']").exists()).toBe(false);
    expect(app.find("footer").exists()).toBe(false);
  });

  it("uses the admin layout with the route title in the top bar", async () => {
    const app = await mountAt("/admin/promocodes");

    expect(app.find("nav[aria-label='Admin']").exists()).toBe(true);
    expect(app.find("header h1").text()).toBe("Promo codes");
  });

  it("shows the not-found page inside the customer layout", async () => {
    const app = await mountAt("/nowhere");

    expect(app.text()).toContain("Page not found");
    expect(app.find("nav[aria-label='Main']").exists()).toBe(true);
  });
});
