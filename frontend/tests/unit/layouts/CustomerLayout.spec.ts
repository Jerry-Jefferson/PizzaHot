import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as authApi from "@/api/auth";
import CustomerLayout from "@/layouts/CustomerLayout.vue";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));

const user = (isEmailVerified: boolean) =>
  ({ id: "u1", role: "user", email: "mario@x.io", name: "Mario", isEmailVerified }) as User;

async function setup(signedIn: User | null) {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (signedIn) {
    useAuthStore().setUser(signedIn);
  }
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/");
  return mount(CustomerLayout, {
    slots: { default: "<p>Page</p>" },
    global: { plugins: [pinia, router, PrimeVue, ToastService] },
  });
}

const banner = "[data-test='email-verification-banner']";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("CustomerLayout", () => {
  it("renders the page inside the header and footer", async () => {
    const wrapper = await setup(null);

    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.get("main").text()).toBe("Page");
    expect(wrapper.find("footer").exists()).toBe(true);
  });

  it.each([
    ["a guest", null],
    ["a verified user", user(true)],
  ])("hides the verification banner for %s", async (_label, signedIn) => {
    expect((await setup(signedIn)).find(banner).exists()).toBe(false);
  });

  it("shows the banner to an unverified user and hides it once verified", async () => {
    vi.mocked(authApi.me).mockResolvedValue(user(true));
    const wrapper = await setup(user(false));

    await wrapper.get(`${banner} button`).trigger("click");
    await flushPromises();

    expect(authApi.me).toHaveBeenCalledOnce();
    expect(wrapper.find(banner).exists()).toBe(false);
  });

  it("shows the signed-in user in the header", async () => {
    const wrapper = await setup(user(true));

    expect(wrapper.find("[aria-label='Sign out']").exists()).toBe(true);
  });
});
