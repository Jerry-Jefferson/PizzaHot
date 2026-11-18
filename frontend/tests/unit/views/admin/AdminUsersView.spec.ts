import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import { SEARCH_DEBOUNCE_MS } from "@/composables/useMenuFilters";
import { routes } from "@/router/routes";
import * as ordersApi from "@/services/api/orders";
import * as usersApi from "@/services/api/users";
import type { Order } from "@/types/order.types";
import type { PaginationQuery } from "@/types/pagination.types";
import type { User, UserListQuery } from "@/types/user.types";
import { CUSTOMER_ORDERS_PAGE_SIZE } from "@/utils/constants/order.constants";
import { ADMIN_USERS_PAGE_SIZE } from "@/utils/constants/user.constants";
import AdminUsersView from "@/views/admin/AdminUsersView.vue";

vi.mock("@/services/api/users", () => ({ listUsers: vi.fn(), getUser: vi.fn() }));

vi.mock("@/services/api/orders", () => ({
  getOrdersByUser: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

const user = (id: string, overrides: Partial<User> = {}): User => ({
  id,
  role: "user",
  email: `${id}@example.com`,
  name: null,
  surname: null,
  gender: null,
  image: null,
  isEmailVerified: true,
  createdAt: "2025-03-14T09:00:00.000Z",
  updatedAt: "2025-03-14T09:00:00.000Z",
  ...overrides,
});

const ADA = user("ada", { name: "Ada", surname: "Lovelace" });
const ALAN = user("alan", { name: "Alan", surname: "Turing", isEmailVerified: false });
const ADMIN = user("root", { role: "admin", name: "Grace", surname: "Hopper" });
const NAMELESS = user("anon");

const order = (index: number, overrides: Partial<Order> = {}): Order => ({
  id: `${String(index).padStart(8, "0")}-0000-0000-0000-000000000000`,
  userId: ADA.id,
  promocodeId: null,
  codeApplied: null,
  address: "12 Baker Street",
  delivery: "delivery",
  paymentMethod: "cash",
  totalPrice: 20,
  discountAmount: null,
  finalPrice: 20,
  status: "completed",
  comment: null,
  orderItems: [
    {
      id: `i${String(index)}`,
      pizzaId: "p1",
      pizzaName: "Margherita",
      priceAtPurchase: 10,
      quantity: 2,
      subtotal: 20,
    },
  ],
  createdAt: "2026-11-18T10:30:00.000Z",
  updatedAt: "2026-11-18T10:30:00.000Z",
  ...overrides,
});

let users: User[] = [];
let customerOrders: Order[] = [];

function serveUsers(): void {
  vi.mocked(usersApi.listUsers).mockImplementation((query: UserListQuery = {}) => {
    const search = query.search?.toLowerCase() ?? "";
    const matches = users.filter((item) =>
      [item.name, item.surname].some((part) => part?.toLowerCase().includes(search))
    );
    const found = search ? matches : users;
    const limit = query.limit ?? ADMIN_USERS_PAGE_SIZE;
    const page = query.page ?? 1;
    return Promise.resolve({
      data: found.slice((page - 1) * limit, page * limit),
      page,
      limit,
      total: found.length,
      totalPages: Math.ceil(found.length / limit),
    });
  });
}

function serveCustomerOrders(): void {
  vi.mocked(ordersApi.getOrdersByUser).mockImplementation(
    (userId: string, query: PaginationQuery = {}) => {
      const owned = customerOrders.filter((item) => item.userId === userId);
      const limit = query.limit ?? CUSTOMER_ORDERS_PAGE_SIZE;
      const page = query.page ?? 1;
      return Promise.resolve({
        data: owned.slice((page - 1) * limit, page * limit),
        page,
        limit,
        total: owned.length,
        totalPages: Math.ceil(owned.length / limit),
      });
    }
  );
}

let wrapper: VueWrapper | undefined;

async function setup(path = "/admin/users") {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Host = defineComponent({
    setup: () => () => [h(AdminUsersView), h(BaseConfirmDialog)],
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

const cells = (target: VueWrapper, test: string) =>
  target.findAll(`[data-test='${test}']`).map((cell) => cell.text());

const profile = () => document.querySelector<HTMLElement>("[data-test='customer-profile']");

const historyIds = () =>
  [...document.querySelectorAll("[data-test='customer-order'] .font-mono")].map((cell) =>
    cell.textContent.trim()
  );

const bodyButton = (label: string, root: ParentNode = document) =>
  [...root.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent.trim() === label
  );

async function openProfile(target: VueWrapper, label: string): Promise<void> {
  await target.get(`[aria-label='View ${label}']`).trigger("click");
  await flushPromises();
}

beforeEach(() => {
  vi.resetAllMocks();
  users = [ADA, ALAN, ADMIN, NAMELESS];
  customerOrders = [];
  serveUsers();
  serveCustomerOrders();
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminUsersView", () => {
  it("lists users with email, role, verification and join date", async () => {
    const { wrapper } = await setup();

    expect(usersApi.listUsers).toHaveBeenCalledWith({ page: 1, limit: ADMIN_USERS_PAGE_SIZE });
    expect(cells(wrapper, "user-name")).toEqual([
      "Ada Lovelace",
      "Alan Turing",
      "Grace Hopper",
      "anon@example.com",
    ]);
    expect(cells(wrapper, "user-email")[0]).toBe("ada@example.com");
    expect(cells(wrapper, "user-role")).toEqual(["Customer", "Customer", "Admin", "Customer"]);
    expect(wrapper.findAll("[data-test='user-role']")[2]?.attributes("data-tone")).toBe("primary");
    expect(cells(wrapper, "user-verified")).toEqual([
      "Verified",
      "Not verified",
      "Verified",
      "Verified",
    ]);
    expect(wrapper.text()).toContain("Mar 14, 2025");
  });

  it("shows how many users are registered", async () => {
    const { wrapper } = await setup("/admin/users?search=ada");

    expect(wrapper.get("[data-test='page-subtitle']").text()).toBe("4 registered customers");
  });

  it("debounces the name search into the URL and resets the page", async () => {
    const { wrapper, router } = await setup("/admin/users?page=2");
    vi.useFakeTimers();

    await wrapper.get("input[type='search']").setValue("tur");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    vi.useRealTimers();
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ search: "tur" });
    expect(usersApi.listUsers).toHaveBeenLastCalledWith({
      page: 1,
      limit: ADMIN_USERS_PAGE_SIZE,
      search: "tur",
    });
    expect(cells(wrapper, "user-name")).toEqual(["Alan Turing"]);
  });

  it("offers to clear a search with no matches", async () => {
    const { wrapper, router } = await setup("/admin/users?search=nobody");

    expect(wrapper.text()).toContain("No users match “nobody”");

    const clear = wrapper.findAll("button").find((button) => button.text() === "Clear search");
    await clear?.trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
    expect(cells(wrapper, "user-name")).toHaveLength(4);
  });

  it("pages through users ten at a time", async () => {
    users = Array.from({ length: ADMIN_USERS_PAGE_SIZE + 1 }, (_, index) =>
      user(`u${String(index)}`, { name: `User ${String(index)}` })
    );
    const { wrapper, router } = await setup();
    expect(cells(wrapper, "user-name")).toHaveLength(ADMIN_USERS_PAGE_SIZE);

    await wrapper.get("[aria-label='Page 2']").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ page: "2" });
    expect(cells(wrapper, "user-name")).toEqual(["User 10"]);
  });

  it("offers a retry when the users fail to load", async () => {
    vi.mocked(usersApi.listUsers).mockRejectedValue(new Error("Network Error"));
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Couldn't load users");

    serveUsers();
    const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
    await retry?.trigger("click");
    await flushPromises();

    expect(cells(wrapper, "user-name")).toHaveLength(4);
  });

  describe("customer profile", () => {
    it("shows the customer with their order count and latest orders", async () => {
      customerOrders = Array.from({ length: 7 }, (_, index) => order(index));
      const { wrapper } = await setup();

      await openProfile(wrapper, "Ada Lovelace");

      expect(ordersApi.getOrdersByUser).toHaveBeenCalledWith("ada", {
        page: 1,
        limit: CUSTOMER_ORDERS_PAGE_SIZE,
      });
      expect(profile()?.querySelector("[data-test='customer-name']")?.textContent.trim()).toBe(
        "Ada Lovelace"
      );
      expect(
        profile()?.querySelector("[data-test='customer-total-orders']")?.textContent
      ).toContain("7");
      expect(historyIds()).toEqual([
        "#00000000",
        "#00000001",
        "#00000002",
        "#00000003",
        "#00000004",
      ]);
    });

    it("loads older orders until every order is shown", async () => {
      customerOrders = Array.from({ length: 7 }, (_, index) => order(index));
      const { wrapper } = await setup();
      await openProfile(wrapper, "Ada Lovelace");

      bodyButton("Load more")?.click();
      await flushPromises();

      expect(ordersApi.getOrdersByUser).toHaveBeenLastCalledWith("ada", {
        page: 2,
        limit: CUSTOMER_ORDERS_PAGE_SIZE,
      });
      expect(historyIds()).toHaveLength(7);
      expect(bodyButton("Load more")).toBeUndefined();
    });

    it("reports a failure to load more orders and keeps the ones shown", async () => {
      customerOrders = Array.from({ length: 7 }, (_, index) => order(index));
      const { wrapper } = await setup();
      await openProfile(wrapper, "Ada Lovelace");
      vi.mocked(ordersApi.getOrdersByUser).mockRejectedValue(new Error("Server error"));

      bodyButton("Load more")?.click();
      await flushPromises();

      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", summary: "Couldn't load more orders" })
      );
      expect(historyIds()).toHaveLength(CUSTOMER_ORDERS_PAGE_SIZE);
    });

    it("says when the customer has no orders", async () => {
      const { wrapper } = await setup();

      await openProfile(wrapper, "Alan Turing");

      expect(profile()?.textContent).toContain("No orders yet");
      expect(
        profile()?.querySelector("[data-test='customer-total-orders']")?.textContent
      ).toContain("0");
    });

    it("opens an order over the profile and refreshes the history after a status change", async () => {
      customerOrders = [order(1, { status: "pending" })];
      vi.mocked(ordersApi.updateOrderStatus).mockImplementation((id, status) => {
        customerOrders = customerOrders.map((item) =>
          item.id === id ? { ...item, status } : item
        );
        const updated = customerOrders.find((item) => item.id === id);
        return updated ? Promise.resolve(updated) : Promise.reject(new Error("Not found"));
      });
      const { wrapper } = await setup();
      await openProfile(wrapper, "Ada Lovelace");

      document.querySelector<HTMLButtonElement>("[data-test='customer-order']")?.click();
      await flushPromises();

      const details = document.querySelector<HTMLElement>("[data-test='order-details']");
      expect(document.body.textContent).toContain("Order #00000001");
      expect(details?.textContent).toContain("Ada Lovelace · ada@example.com");
      expect(profile()).not.toBeNull();

      bodyButton("Mark as confirmed", details ?? document)?.click();
      await flushPromises();

      expect(ordersApi.updateOrderStatus).toHaveBeenCalledWith(customerOrders[0]?.id, "confirmed");
      expect(
        profile()?.querySelector("[data-test='customer-order'] [data-test='order-status']")
          ?.textContent
      ).toBe("Confirmed");
    });
  });
});
