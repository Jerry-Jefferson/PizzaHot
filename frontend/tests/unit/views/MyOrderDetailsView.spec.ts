import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as ordersApi from "@/api/orders";
import { ORDER_POLL_INTERVAL_MS } from "@/composables/useMyOrders";
import { routes } from "@/router/routes";
import type { Order } from "@/types/order.types";
import MyOrderDetailsView from "@/views/MyOrderDetailsView.vue";

vi.mock("@/api/orders", () => ({ listMyOrders: vi.fn(), getMyOrder: vi.fn() }));

const ORDER_ID = "3f2a9c1e-7b4d-4e8a-9c2f-1a2b3c4d5e6f";

const order = (overrides: Partial<Order> = {}): Order => ({
  id: ORDER_ID,
  userId: "u1",
  promocodeId: null,
  codeApplied: null,
  address: "1 Pizza Street",
  delivery: "delivery",
  paymentMethod: "cash",
  totalPrice: 25,
  discountAmount: 0,
  finalPrice: 25,
  status: "preparing",
  comment: null,
  orderItems: [
    {
      id: "i1",
      pizzaId: "p1",
      pizzaName: "Margherita",
      priceAtPurchase: 12.5,
      quantity: 2,
      subtotal: 25,
    },
  ],
  createdAt: new Date(2025, 8, 20, 18, 32).toISOString(),
  updatedAt: "",
  ...overrides,
});

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data: { statusCode: status, message: "Order not found" },
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

let wrapper: VueWrapper | undefined;

async function setup(query = "") {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(`/my-orders/${ORDER_ID}${query}`);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  wrapper = mount(MyOrderDetailsView, {
    global: { plugins: [pinia, router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { wrapper, router };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(ordersApi.getMyOrder).mockResolvedValue(order());
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
});

describe("MyOrderDetailsView", () => {
  it("shows the order header, progress, items and delivery details", async () => {
    const { wrapper } = await setup();

    expect(ordersApi.getMyOrder).toHaveBeenCalledWith(ORDER_ID);
    expect(wrapper.get("h1").text()).toBe("Order #3f2a9c1e");
    expect(wrapper.get("[data-test='order-status']").text()).toBe("Preparing");
    expect(wrapper.get("time").text()).toBe("Saturday, September 20, 2025");
    expect(wrapper.get("[aria-current='step']").text()).toBe("Preparing");
    expect(wrapper.get("[data-test='order-item']").text()).toContain("Margherita");
    expect(wrapper.get("[data-test='delivery-address']").text()).toBe("1 Pizza Street");
    expect(wrapper.get("a").attributes("href")).toBe("/my-orders");
    expect(wrapper.find("[data-test='order-placed-banner']").exists()).toBe(false);
  });

  it("shows the placed banner right after checkout", async () => {
    const { wrapper } = await setup("?placed=1");

    expect(wrapper.get("[data-test='order-placed-banner']").text()).toContain("Order placed!");
  });

  it("shows a skeleton while loading", async () => {
    vi.mocked(ordersApi.getMyOrder).mockReturnValue(new Promise(() => undefined));
    const { wrapper } = await setup();

    expect(wrapper.find("[data-test='order-skeleton']").exists()).toBe(true);
  });

  it("explains that a pending order awaits confirmation", async () => {
    vi.mocked(ordersApi.getMyOrder).mockResolvedValue(order({ status: "pending" }));
    const { wrapper } = await setup();

    expect(wrapper.get("[data-test='order-pending']").text()).toBe(
      "Waiting for the restaurant to confirm your order"
    );
    expect(wrapper.findAll("[data-state='upcoming']")).toHaveLength(5);
  });

  it("replaces the stepper with a notice for a cancelled order", async () => {
    vi.mocked(ordersApi.getMyOrder).mockResolvedValue(order({ status: "cancelled" }));
    const { wrapper } = await setup();

    expect(wrapper.get("[data-test='order-cancelled']").text()).toBe("This order was cancelled");
    expect(wrapper.find("ol").exists()).toBe(false);
  });

  it.each([404, 400])("shows the not-found state for a %i", async (status) => {
    vi.mocked(ordersApi.getMyOrder).mockRejectedValue(httpError(status));
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Order not found");
    expect(wrapper.find("h1").exists()).toBe(false);
  });

  it("polls every 30 s until the order is final", async () => {
    vi.useFakeTimers();
    vi.mocked(ordersApi.getMyOrder)
      .mockResolvedValueOnce(order({ status: "delivering" }))
      .mockResolvedValue(order({ status: "completed" }));
    const { wrapper } = await setup();

    await vi.advanceTimersByTimeAsync(ORDER_POLL_INTERVAL_MS);

    expect(ordersApi.getMyOrder).toHaveBeenCalledTimes(2);
    expect(wrapper.get("[data-test='order-status']").text()).toBe("Completed");

    await vi.advanceTimersByTimeAsync(ORDER_POLL_INTERVAL_MS * 2);

    expect(ordersApi.getMyOrder).toHaveBeenCalledTimes(2);
  });
});
