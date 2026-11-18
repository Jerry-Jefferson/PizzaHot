import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { afterEach, describe, expect, it } from "vitest";

import CustomerProfileModal from "@/components/admin/CustomerProfileModal.vue";
import type { Order } from "@/types/order.types";
import type { User } from "@/types/user.types";

const ADA = {
  id: "u1",
  role: "user",
  name: "Ada",
  surname: "Lovelace",
  email: "ada@example.com",
  image: null,
  isEmailVerified: true,
  createdAt: "2025-03-14T09:00:00.000Z",
} as User;

const order = (id: string, quantities: number[] = [1]): Order =>
  ({
    id: `${id}000000-0000-0000-0000-000000000000`,
    finalPrice: 24.5,
    status: "completed",
    createdAt: "2026-11-18T10:30:00.000Z",
    orderItems: quantities.map((quantity, index) => ({
      id: `${id}-${String(index)}`,
      pizzaName: "Margherita",
      quantity,
    })),
  }) as Order;

interface ModalProps {
  user?: User;
  orders?: Order[];
  totalOrders?: number;
  loading?: boolean;
  error?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
}

let wrapper: VueWrapper | undefined;

async function mountModal(props: ModalProps = {}) {
  wrapper = mount(CustomerProfileModal, {
    props: { visible: true, user: ADA, orders: [], ...props },
    attachTo: document.body,
    global: { plugins: [PrimeVue] },
  });
  await flushPromises();
  return wrapper;
}

const text = (test: string) => document.querySelector(`[data-test='${test}']`)?.textContent.trim();

const orderRows = () => [
  ...document.querySelectorAll<HTMLButtonElement>("[data-test='customer-order']"),
];

const button = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (element) => element.textContent.trim() === label
  );

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("CustomerProfileModal", () => {
  it("shows the customer's name, email, order count and join date", async () => {
    await mountModal({ totalOrders: 7 });

    expect(document.body.textContent).toContain("Customer profile");
    expect(text("customer-name")).toBe("Ada Lovelace");
    expect(text("customer-email")).toBe("ada@example.com");
    expect(text("customer-total-orders")).toContain("7");
    expect(text("customer-total-orders")).toContain("Total orders");
    expect(text("customer-member-since")).toContain("Mar 2025");
  });

  it("falls back to the email for a customer without a name", async () => {
    await mountModal({ user: { ...ADA, name: null, surname: null } });

    expect(text("customer-name")).toBe("ada@example.com");
  });

  it("shows a dash until the order count is known", async () => {
    await mountModal({ loading: true });

    expect(text("customer-total-orders")).toContain("—");
    expect(orderRows()).toHaveLength(0);
  });

  it("lists the order history with id, date, item count, amount and status", async () => {
    await mountModal({ orders: [order("aaaaaaaa", [2, 1]), order("bbbbbbbb")], totalOrders: 2 });

    const rows = orderRows().map((row) => row.textContent.replace(/\s+/g, " ").trim());
    expect(rows).toEqual([
      "#aaaaaaaaNov 18, 2026 · 3 items$24.50Completed",
      "#bbbbbbbbNov 18, 2026 · 1 item$24.50Completed",
    ]);
  });

  it("opens an order from the history", async () => {
    const modal = await mountModal({ orders: [order("aaaaaaaa")] });

    orderRows()[0]?.click();

    expect(modal.emitted("openOrder")).toEqual([[order("aaaaaaaa")]]);
  });

  it("pages through older orders with Load more", async () => {
    const modal = await mountModal({ orders: [order("aaaaaaaa")], hasMore: true });

    button("Load more")?.click();

    expect(modal.emitted("loadMore")).toHaveLength(1);
  });

  it("hides Load more once every order is shown", async () => {
    await mountModal({ orders: [order("aaaaaaaa")], hasMore: false });

    expect(button("Load more")).toBeUndefined();
  });

  it("disables Load more while the next page loads", async () => {
    await mountModal({ orders: [order("aaaaaaaa")], hasMore: true, loadingMore: true });

    expect(
      document.querySelector<HTMLButtonElement>("[data-test='load-more-orders']")?.disabled
    ).toBe(true);
  });

  it("says when the customer has no orders", async () => {
    await mountModal({ totalOrders: 0 });

    expect(document.body.textContent).toContain("No orders yet");
  });

  it("offers a retry when the orders fail to load", async () => {
    const modal = await mountModal({ error: true });

    expect(document.body.textContent).toContain("Couldn't load orders");
    button("Try again")?.click();

    expect(modal.emitted("retry")).toHaveLength(1);
  });
});
