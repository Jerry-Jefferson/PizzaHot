import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { routes } from "@/router/routes";
import * as ordersApi from "@/services/api/orders";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

vi.mock("@/services/api/orders", () => ({ searchOrders: vi.fn() }));

const ADMIN = { id: "a1", role: "admin", email: "admin@x.io", name: "Ada" } as User;

async function setup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useAuthStore().setUser(ADMIN);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/admin");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = mount(AdminLayout, {
    slots: { default: "<p>Page</p>" },
    global: { plugins: [pinia, router, PrimeVue, ToastService, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return wrapper;
}

const pendingPage = (total: number) => ({ data: [], page: 1, limit: 1, total, totalPages: total });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("AdminLayout", () => {
  it("renders the page in the main area", async () => {
    vi.mocked(ordersApi.searchOrders).mockResolvedValue(pendingPage(0));

    expect((await setup()).get("main").text()).toBe("Page");
  });

  it("shows the pending order count in the sidebar and the top bar", async () => {
    vi.mocked(ordersApi.searchOrders).mockResolvedValue(pendingPage(4));
    const wrapper = await setup();

    expect(ordersApi.searchOrders).toHaveBeenCalledWith({ status: "pending", limit: 1 });
    expect(wrapper.get("[data-test='pending-count']").text()).toBe("4");
    expect(wrapper.get("[data-test='pending-pill']").text()).toContain("4 pending");
  });

  it("hides the pending indicators when the count cannot be loaded", async () => {
    vi.mocked(ordersApi.searchOrders).mockRejectedValue(new Error("Network Error"));
    const wrapper = await setup();

    expect(wrapper.find("[data-test='pending-count']").exists()).toBe(false);
    expect(wrapper.find("[data-test='pending-pill']").exists()).toBe(false);
  });
});
