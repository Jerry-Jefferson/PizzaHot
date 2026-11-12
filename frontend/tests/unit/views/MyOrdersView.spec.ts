import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as ordersApi from "@/api/orders";
import { MY_ORDERS_PAGE_SIZE, ORDER_POLL_INTERVAL_MS } from "@/composables/useMyOrders";
import { routes } from "@/router/routes";
import type { Paginated } from "@/types/api.types";
import type { Order, OrderStatus } from "@/types/order.types";
import MyOrdersView from "@/views/MyOrdersView.vue";

vi.mock("@/api/orders", () => ({ listMyOrders: vi.fn(), getMyOrder: vi.fn() }));

const order = (id: string, status: OrderStatus): Order =>
  ({
    id: `${id}0000000-0000-4000-8000-000000000000`,
    status,
    finalPrice: 20,
    createdAt: "2025-09-20T18:32:00.000Z",
    orderItems: [
      { id: "i1", pizzaId: null, pizzaName: "Margherita", priceAtPurchase: 10, quantity: 2 },
    ],
  }) as Order;

const pageOf = (orders: Order[], totalPages = 1): Paginated<Order> => ({
  data: orders,
  page: 1,
  limit: MY_ORDERS_PAGE_SIZE,
  total: orders.length,
  totalPages,
});

let wrapper: VueWrapper | undefined;

async function setup(path = "/my-orders") {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  wrapper = mount(MyOrdersView, {
    global: { plugins: [pinia, router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { wrapper, router };
}

const orderNumbers = (target: VueWrapper) =>
  target.findAll("[data-test='order-number']").map((number) => number.text());

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
});

describe("MyOrdersView", () => {
  it("lists my orders as cards linking to the details", async () => {
    vi.mocked(ordersApi.listMyOrders).mockResolvedValue(
      pageOf([order("a", "preparing"), order("b", "completed")])
    );
    const { wrapper } = await setup();

    expect(wrapper.get("h1").text()).toBe("My Orders");
    expect(ordersApi.listMyOrders).toHaveBeenCalledWith({ page: 1, limit: MY_ORDERS_PAGE_SIZE });
    expect(orderNumbers(wrapper)).toEqual(["#a0000000", "#b0000000"]);
    expect(wrapper.findAll("a")[0]?.attributes("href")).toBe(
      "/my-orders/a0000000-0000-4000-8000-000000000000"
    );
  });

  it("shows a skeleton while loading", async () => {
    vi.mocked(ordersApi.listMyOrders).mockReturnValue(new Promise(() => undefined));
    const { wrapper } = await setup();

    expect(wrapper.find("[data-test='orders-skeleton']").exists()).toBe(true);
  });

  it("shows the empty state with a link to the menu", async () => {
    vi.mocked(ordersApi.listMyOrders).mockResolvedValue(pageOf([]));
    const { wrapper } = await setup();

    const empty = wrapper.get("[data-test='orders-empty']");
    expect(empty.text()).toContain("No orders yet");
    expect(empty.get("a").text()).toBe("Browse menu");
    expect(empty.get("a").attributes("href")).toBe("/");
  });

  it("paginates through the page query", async () => {
    vi.mocked(ordersApi.listMyOrders).mockResolvedValue(pageOf([order("a", "completed")], 3));
    const { wrapper, router } = await setup();

    await wrapper.get("button[aria-label='Page 2']").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ page: "2" });
    expect(ordersApi.listMyOrders).toHaveBeenLastCalledWith({
      page: 2,
      limit: MY_ORDERS_PAGE_SIZE,
    });
  });

  it("polls every 30 s while an order is still in progress", async () => {
    vi.useFakeTimers();
    vi.mocked(ordersApi.listMyOrders).mockResolvedValue(
      pageOf([order("a", "delivering"), order("b", "completed")])
    );
    await setup();
    expect(ordersApi.listMyOrders).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(ORDER_POLL_INTERVAL_MS);

    expect(ordersApi.listMyOrders).toHaveBeenCalledTimes(2);
  });

  it("stops polling once every order is final", async () => {
    vi.useFakeTimers();
    vi.mocked(ordersApi.listMyOrders).mockResolvedValue(
      pageOf([order("a", "completed"), order("b", "cancelled")])
    );
    await setup();

    await vi.advanceTimersByTimeAsync(ORDER_POLL_INTERVAL_MS * 2);

    expect(ordersApi.listMyOrders).toHaveBeenCalledTimes(1);
  });
});
