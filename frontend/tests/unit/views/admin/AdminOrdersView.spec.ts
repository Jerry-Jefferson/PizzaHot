import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import OrderFilters from "@/components/admin/OrderFilters.vue";
import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import { routes } from "@/router/routes";
import * as ordersApi from "@/services/api/orders";
import * as usersApi from "@/services/api/users";
import type { Order, OrderSearchQuery } from "@/types/order.types";
import type { User } from "@/types/user.types";
import { ADMIN_ORDERS_PAGE_SIZE } from "@/utils/constants/order.constants";
import AdminOrdersView from "@/views/admin/AdminOrdersView.vue";

vi.mock("@/services/api/orders", () => ({
  searchOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

vi.mock("@/services/api/users", () => ({ getUser: vi.fn() }));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

const ADA = { id: "u1", name: "Ada", surname: "Lovelace", email: "ada@example.com" } as User;

const order = (id: string, overrides: Partial<Order> = {}): Order => ({
  id: `${id}000000-0000-0000-0000-000000000000`,
  userId: ADA.id,
  promocodeId: null,
  codeApplied: null,
  address: "12 Baker Street",
  delivery: "delivery",
  paymentMethod: "cash",
  totalPrice: 25,
  discountAmount: null,
  finalPrice: 25,
  status: "pending",
  comment: null,
  orderItems: [
    {
      id: `${id}-item`,
      pizzaId: "p1",
      pizzaName: "Margherita",
      priceAtPurchase: 12.5,
      quantity: 2,
      subtotal: 25,
    },
  ],
  createdAt: "2026-11-18T10:30:00.000Z",
  updatedAt: "2026-11-18T10:30:00.000Z",
  ...overrides,
});

let orders: Order[] = [];

function serveOrders(): void {
  vi.mocked(ordersApi.searchOrders).mockImplementation((query: OrderSearchQuery = {}) => {
    const matches = orders.filter(
      (item) =>
        (!query.status || item.status === query.status) &&
        (!query.delivery || item.delivery === query.delivery) &&
        (!query.paymentMethod || item.paymentMethod === query.paymentMethod)
    );
    const limit = query.limit ?? ADMIN_ORDERS_PAGE_SIZE;
    const page = query.page ?? 1;
    return Promise.resolve({
      data: matches.slice((page - 1) * limit, page * limit),
      page,
      limit,
      total: matches.length,
      totalPages: Math.ceil(matches.length / limit),
    });
  });
}

function serveStatusUpdates(): void {
  vi.mocked(ordersApi.updateOrderStatus).mockImplementation((id, status) => {
    orders = orders.map((item) => (item.id === id ? { ...item, status } : item));
    const updated = orders.find((item) => item.id === id);
    return updated ? Promise.resolve(updated) : Promise.reject(new Error("Not found"));
  });
}

let wrapper: VueWrapper | undefined;

async function setup(path = "/admin/orders") {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Host = defineComponent({
    setup: () => () => [h(AdminOrdersView), h(BaseConfirmDialog)],
  });
  wrapper = mount(Host, {
    attachTo: document.body,
    global: {
      plugins: [
        createPinia(),
        router,
        PrimeVue,
        ConfirmationService,
        [VueQueryPlugin, { queryClient }],
      ],
    },
  });
  await flushPromises();
  return { wrapper, router };
}

const rowIds = (target: VueWrapper) =>
  target.findAll("[data-test='order-id']").map((cell) => cell.text());

const lastSearch = () => vi.mocked(ordersApi.searchOrders).mock.lastCall?.[0];

const modal = () => document.querySelector<HTMLElement>("[data-test='order-details']");

const modalStatus = () =>
  modal()?.parentElement?.parentElement?.querySelector("[data-test='order-status']")?.textContent;

const buttonIn = (root: ParentNode | null | undefined, label: string) =>
  [...(root?.querySelectorAll<HTMLButtonElement>("button") ?? [])].find(
    (button) => button.textContent.trim() === label
  );

async function openOrder(target: VueWrapper, shortId: string): Promise<void> {
  await target.get(`[aria-label='View order ${shortId}']`).trigger("click");
  await flushPromises();
}

async function clickStatusAction(label: string): Promise<void> {
  const button = buttonIn(modal(), label);
  if (!button) {
    throw new Error(`No status action "${label}"`);
  }
  button.click();
  await flushPromises();
}

beforeEach(() => {
  vi.resetAllMocks();
  orders = [
    order("aaaaaaaa"),
    order("bbbbbbbb", {
      userId: null,
      delivery: "pickup",
      paymentMethod: "card_online",
      status: "preparing",
      finalPrice: 18.4,
    }),
    order("cccccccc", { status: "completed" }),
  ];
  serveOrders();
  serveStatusUpdates();
  vi.mocked(usersApi.getUser).mockResolvedValue(ADA);
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminOrdersView", () => {
  it("lists orders with customer, total, payment, delivery and status", async () => {
    const { wrapper } = await setup();

    expect(ordersApi.searchOrders).toHaveBeenCalledWith({ page: 1, limit: ADMIN_ORDERS_PAGE_SIZE });
    expect(rowIds(wrapper)).toEqual(["#aaaaaaaa", "#bbbbbbbb", "#cccccccc"]);
    expect(wrapper.findAll("[data-test='order-customer-name']").map((cell) => cell.text())).toEqual(
      ["Ada Lovelace", "Deleted user", "Ada Lovelace"]
    );
    expect(usersApi.getUser).toHaveBeenCalledTimes(1);

    const rows = wrapper.findAll("tbody tr");
    expect(rows[0]?.text()).toContain("ada@example.com");
    expect(rows[0]?.text()).toContain("$25.00");
    expect(rows[0]?.text()).toContain("Cash");
    expect(rows[0]?.text()).toContain("Delivery");
    expect(rows[1]?.text()).toContain("$18.40");
    expect(rows[1]?.text()).toContain("Card online");
    expect(rows[1]?.text()).toContain("Pickup");
    expect(rows.map((row) => row.get("[data-test='order-status']").text())).toEqual([
      "Pending",
      "Preparing",
      "Completed",
    ]);
  });

  it("shows how many orders there are in total", async () => {
    const { wrapper } = await setup("/admin/orders?status=pending");

    expect(wrapper.get("[data-test='page-subtitle']").text()).toBe("3 total orders");
  });

  it("searches with the filters from the URL", async () => {
    const { wrapper } = await setup("/admin/orders?status=preparing&delivery=pickup&page=1");

    expect(ordersApi.searchOrders).toHaveBeenCalledWith({
      page: 1,
      limit: ADMIN_ORDERS_PAGE_SIZE,
      status: "preparing",
      delivery: "pickup",
    });
    expect(rowIds(wrapper)).toEqual(["#bbbbbbbb"]);
  });

  it("sends a changed filter in the search body and resets the page", async () => {
    const { wrapper, router } = await setup("/admin/orders?page=2");

    wrapper.findComponent(OrderFilters).vm.$emit("update:paymentMethod", "card_online");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ payment: "card_online" });
    expect(lastSearch()).toEqual({
      page: 1,
      limit: ADMIN_ORDERS_PAGE_SIZE,
      paymentMethod: "card_online",
    });
    expect(rowIds(wrapper)).toEqual(["#bbbbbbbb"]);
  });

  it("offers to clear filters that match nothing", async () => {
    const { wrapper, router } = await setup("/admin/orders?status=cancelled");

    expect(wrapper.text()).toContain("No orders match these filters");

    const clear = wrapper.findAll("button").find((button) => button.text() === "Clear filters");
    await clear?.trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
    expect(rowIds(wrapper)).toHaveLength(3);
  });

  it("says when there are no orders at all", async () => {
    orders = [];
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("No orders yet");
    expect(wrapper.text()).not.toContain("Clear filters");
  });

  it("pages through orders ten at a time", async () => {
    orders = Array.from({ length: ADMIN_ORDERS_PAGE_SIZE + 2 }, (_, index) =>
      order(String(index).padStart(8, "0"))
    );
    const { wrapper, router } = await setup();
    expect(rowIds(wrapper)).toHaveLength(ADMIN_ORDERS_PAGE_SIZE);

    await wrapper.get("[aria-label='Page 2']").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ page: "2" });
    expect(lastSearch()).toEqual({ page: 2, limit: ADMIN_ORDERS_PAGE_SIZE });
    expect(rowIds(wrapper)).toEqual(["#00000010", "#00000011"]);
  });

  it("opens the order details", async () => {
    const { wrapper } = await setup();

    await openOrder(wrapper, "#aaaaaaaa");

    expect(document.body.textContent).toContain("Order #aaaaaaaa");
    expect(modal()?.textContent).toContain("Ada Lovelace · ada@example.com");
    expect(modal()?.textContent).toContain("Margherita");
    expect(buttonIn(modal(), "Mark as confirmed")).toBeDefined();
  });

  describe("status changes", () => {
    it("applies a next step immediately and refreshes the orders", async () => {
      const { wrapper } = await setup();
      await openOrder(wrapper, "#aaaaaaaa");
      const searchesBefore = vi.mocked(ordersApi.searchOrders).mock.calls.length;

      await clickStatusAction("Mark as confirmed");

      expect(ordersApi.updateOrderStatus).toHaveBeenCalledWith(orders[0]?.id, "confirmed");
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: "Order status updated" })
      );
      expect(modalStatus()).toBe("Confirmed");
      expect(buttonIn(modal(), "Mark as preparing")).toBeDefined();
      expect(vi.mocked(ordersApi.searchOrders).mock.calls.length).toBeGreaterThan(searchesBefore);
      expect(wrapper.findAll("tbody tr")[0]?.get("[data-test='order-status']").text()).toBe(
        "Confirmed"
      );
    });

    it("uses the pickup wording for pickup orders", async () => {
      orders = [order("dddddddd", { delivery: "pickup", status: "ready_for_delivery" })];
      const { wrapper } = await setup();
      await openOrder(wrapper, "#dddddddd");

      await clickStatusAction("Mark as picked up");

      expect(ordersApi.updateOrderStatus).toHaveBeenCalledWith(orders[0]?.id, "completed");
      expect(modal()?.textContent).toContain("This order is closed.");
    });

    it("asks before cancelling and keeps the order when told to", async () => {
      const { wrapper } = await setup();
      await openOrder(wrapper, "#aaaaaaaa");

      await clickStatusAction("Mark as cancelled");

      const dialog = document.querySelector("[role='alertdialog']");
      expect(dialog?.textContent).toContain("Cancel this order?");
      expect(ordersApi.updateOrderStatus).not.toHaveBeenCalled();

      buttonIn(dialog, "Keep order")?.click();
      await flushPromises();

      expect(ordersApi.updateOrderStatus).not.toHaveBeenCalled();
      expect(modalStatus()).toBe("Pending");
    });

    it("cancels the order once confirmed", async () => {
      const { wrapper } = await setup();
      await openOrder(wrapper, "#aaaaaaaa");

      await clickStatusAction("Mark as cancelled");
      buttonIn(document.querySelector("[role='alertdialog']"), "Cancel order")?.click();
      await flushPromises();

      expect(ordersApi.updateOrderStatus).toHaveBeenCalledWith(orders[0]?.id, "cancelled");
      expect(modalStatus()).toBe("Cancelled");
      expect(modal()?.textContent).toContain("This order is closed.");
    });

    it("reports a failed update and keeps the current status", async () => {
      vi.mocked(ordersApi.updateOrderStatus).mockRejectedValue(new Error("Server error"));
      const { wrapper } = await setup();
      await openOrder(wrapper, "#aaaaaaaa");

      await clickStatusAction("Mark as confirmed");

      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          summary: "Couldn't update the order status",
        })
      );
      expect(modalStatus()).toBe("Pending");
    });
  });

  it("offers a retry when the orders fail to load", async () => {
    vi.mocked(ordersApi.searchOrders).mockRejectedValue(new Error("Network Error"));
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Couldn't load orders");

    serveOrders();
    const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
    await retry?.trigger("click");
    await flushPromises();

    expect(rowIds(wrapper)).toHaveLength(3);
  });
});
