import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as analyticsApi from "@/services/api/analytics";
import * as ordersApi from "@/services/api/orders";
import * as usersApi from "@/services/api/users";
import type { Order, OrderSearchQuery } from "@/types/order.types";
import type { Paginated } from "@/types/pagination.types";
import type { User } from "@/types/user.types";
import AdminDashboardView from "@/views/admin/AdminDashboardView.vue";

vi.mock("@/services/api/users", () => ({ listUsers: vi.fn(), getUser: vi.fn() }));
vi.mock("@/services/api/orders", () => ({ searchOrders: vi.fn() }));
vi.mock("@/services/api/analytics", () => ({ getPopularPizza: vi.fn() }));

const pageOf = <T>(data: T[], total = data.length): Paginated<T> => ({
  data,
  page: 1,
  limit: data.length,
  total,
  totalPages: 1,
});

const order = (id: string, userId: string | null): Order =>
  ({ id, userId, finalPrice: 30, status: "confirmed" }) as Order;

const MARIO = { id: "u1", name: "Mario", surname: "Rossi", email: "mario@x.io" } as User;

const RECENT = [order("11111111-aaaa", "u1"), order("22222222-bbbb", null)];

function mockOrderSearch(pendingTotal: number, recent: Order[] = RECENT) {
  vi.mocked(ordersApi.searchOrders).mockImplementation((query: OrderSearchQuery = {}) =>
    Promise.resolve(query.status === "pending" ? pageOf<Order>([], pendingTotal) : pageOf(recent))
  );
}

async function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/admin", name: "admin-dashboard", component: AdminDashboardView },
      { path: "/admin/orders", name: "admin-orders", component: { template: "<div />" } },
    ],
  });
  await router.push("/admin");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = mount(AdminDashboardView, {
    global: { plugins: [router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return wrapper;
}

const kpiValue = (wrapper: Awaited<ReturnType<typeof setup>>, kpi: string) =>
  wrapper.get(`[data-test='kpi-${kpi}'] [data-test='kpi-value']`).text();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(usersApi.listUsers).mockResolvedValue(pageOf([MARIO], 128));
  vi.mocked(usersApi.getUser).mockResolvedValue(MARIO);
  vi.mocked(analyticsApi.getPopularPizza).mockResolvedValue({
    pizzaName: "Diavola",
    orderCount: 14,
  });
  mockOrderSearch(3);
});

describe("AdminDashboardView", () => {
  it("shows the customer and pending order counts", async () => {
    const wrapper = await setup();

    expect(kpiValue(wrapper, "customers")).toBe("128");
    expect(kpiValue(wrapper, "pending")).toBe("3");
    expect(usersApi.listUsers).toHaveBeenCalledWith({ page: 1, limit: 1 });
    expect(ordersApi.searchOrders).toHaveBeenCalledWith({ status: "pending", limit: 1 });
  });

  it("shows the most popular pizza of the current month", async () => {
    const today = new Date();
    const wrapper = await setup();

    expect(analyticsApi.getPopularPizza).toHaveBeenCalledWith(
      today.getMonth() + 1,
      today.getFullYear()
    );
    expect(kpiValue(wrapper, "popular")).toBe("Diavola");
    expect(wrapper.get("[data-test='kpi-popular'] [data-test='kpi-caption']").text()).toBe(
      "14 orders"
    );
  });

  it("says there are no orders yet when the month has no popular pizza", async () => {
    vi.mocked(analyticsApi.getPopularPizza).mockResolvedValue(null);
    const wrapper = await setup();

    expect(kpiValue(wrapper, "popular")).toBe("No orders yet");
    expect(wrapper.find("[data-test='kpi-popular'] [data-test='kpi-caption']").exists()).toBe(
      false
    );
  });

  it("shows a dash for a count that failed to load", async () => {
    vi.mocked(usersApi.listUsers).mockRejectedValue(new Error("Forbidden"));
    const wrapper = await setup();

    expect(kpiValue(wrapper, "customers")).toBe("—");
  });

  it("lists the five most recent orders with their customers", async () => {
    const wrapper = await setup();

    expect(ordersApi.searchOrders).toHaveBeenCalledWith({ limit: 5 });
    expect(usersApi.getUser).toHaveBeenCalledTimes(1);
    expect(usersApi.getUser).toHaveBeenCalledWith("u1");
    expect(wrapper.findAll("[data-test='customer-name']").map((name) => name.text())).toEqual([
      "Mario Rossi",
      "Deleted user",
    ]);
  });

  it("retries loading recent orders after an error", async () => {
    vi.mocked(ordersApi.searchOrders).mockImplementation((query: OrderSearchQuery = {}) =>
      query.status === "pending"
        ? Promise.resolve(pageOf<Order>([], 0))
        : Promise.reject(new Error("Network Error"))
    );
    const wrapper = await setup();
    expect(wrapper.text()).toContain("Couldn't load recent orders");

    mockOrderSearch(0);
    await wrapper.get("button").trigger("click");
    await flushPromises();

    expect(wrapper.findAll("[data-test='recent-order']")).toHaveLength(2);
  });
});
