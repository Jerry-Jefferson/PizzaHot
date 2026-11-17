import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import RecentOrdersCard from "@/components/admin/RecentOrdersCard.vue";
import type { Order } from "@/types/order.types";
import type { User } from "@/types/user.types";
import { DELETED_USER_LABEL, UNKNOWN_USER_LABEL } from "@/utils/constants/user.constants";

const order = (id: string, userId: string | null, overrides: Partial<Order> = {}): Order =>
  ({ id, userId, finalPrice: 24.5, status: "pending", ...overrides }) as Order;

const MARIO = { id: "u1", name: "Mario", surname: "Rossi", email: "mario@x.io" } as User;

function setup(props: {
  orders?: Order[];
  customers?: Map<string, User | null>;
  loading?: boolean;
  error?: boolean;
}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/admin/orders", name: "admin-orders", component: { template: "<div />" } }],
  });
  return mount(RecentOrdersCard, {
    props: { orders: [], customers: new Map(), ...props },
    global: { plugins: [PrimeVue, router] },
  });
}

describe("RecentOrdersCard", () => {
  it("lists each order with its customer, short id, total and status", () => {
    const wrapper = setup({
      orders: [order("1a2b3c4d-0000-0000-0000-000000000000", "u1")],
      customers: new Map([["u1", MARIO]]),
    });

    const row = wrapper.get("[data-test='recent-order']");
    expect(row.get("[data-test='customer-name']").text()).toBe("Mario Rossi");
    expect(row.text()).toContain("#1a2b3c4d");
    expect(row.text()).toContain("$24.50");
    expect(row.get("[data-test='order-status']").text()).toBe("Pending");
  });

  it.each([
    ["a deleted user", null, new Map<string, User | null>(), DELETED_USER_LABEL],
    ["a user that failed to load", "u9", new Map([["u9", null]]), UNKNOWN_USER_LABEL],
  ])("labels %s", (_label, userId, customers, expected) => {
    const wrapper = setup({ orders: [order("o1", userId)], customers });

    expect(wrapper.get("[data-test='customer-name']").text()).toBe(expected);
  });

  it("shows a placeholder while the customer is loading", () => {
    const wrapper = setup({ orders: [order("o1", "u1")] });

    expect(wrapper.find("[data-test='customer-skeleton']").exists()).toBe(true);
    expect(wrapper.find("[data-test='customer-name']").exists()).toBe(false);
  });

  it("links to all orders", () => {
    expect(setup({}).get("[data-test='view-all-orders']").attributes("href")).toBe("/admin/orders");
  });

  it("shows skeleton rows while loading", () => {
    expect(setup({ loading: true }).find("[data-test='recent-skeleton']").exists()).toBe(true);
  });

  it("shows an empty state when there are no orders", () => {
    expect(setup({}).text()).toContain("No orders yet");
  });

  it("offers a retry after an error", async () => {
    const wrapper = setup({ error: true });

    expect(wrapper.text()).toContain("Couldn't load recent orders");
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });
});
