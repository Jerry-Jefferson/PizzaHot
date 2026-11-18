import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { afterEach, describe, expect, it } from "vitest";

import AdminOrderDetailsModal from "@/components/admin/AdminOrderDetailsModal.vue";
import type { Order } from "@/types/order.types";
import type { User } from "@/types/user.types";

const order = (overrides: Partial<Order> = {}): Order => ({
  id: "1a2b3c4d-0000-0000-0000-000000000000",
  userId: "u1",
  promocodeId: null,
  codeApplied: null,
  address: "12 Baker Street",
  delivery: "delivery",
  paymentMethod: "cash",
  totalPrice: 30,
  discountAmount: null,
  finalPrice: 30,
  status: "pending",
  comment: null,
  orderItems: [
    {
      id: "i1",
      pizzaId: "p1",
      pizzaName: "Margherita",
      priceAtPurchase: 10,
      quantity: 2,
      subtotal: 20,
    },
    {
      id: "i2",
      pizzaId: null,
      pizzaName: "Diavola",
      priceAtPurchase: 10,
      quantity: 1,
      subtotal: 10,
    },
  ],
  createdAt: "2026-11-18T10:30:00.000Z",
  updatedAt: "2026-11-18T10:30:00.000Z",
  ...overrides,
});

const CUSTOMER = { id: "u1", name: "Ada", surname: "Lovelace", email: "ada@example.com" } as User;

let wrapper: VueWrapper | undefined;

async function mountModal(props: { order: Order; customer?: User | null; updating?: boolean }) {
  wrapper = mount(AdminOrderDetailsModal, {
    props: { visible: true, ...props },
    attachTo: document.body,
    global: { plugins: [PrimeVue] },
  });
  await flushPromises();
  return wrapper;
}

const details = () => document.querySelector<HTMLElement>("[data-test='order-details']");
const detail = (test: string) =>
  document.querySelector(`[data-test='${test}']`)?.textContent.trim();

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminOrderDetailsModal", () => {
  it("shows the order number, customer, status, items and totals", async () => {
    await mountModal({ order: order(), customer: CUSTOMER });

    expect(document.body.textContent).toContain("Order #1a2b3c4d");
    expect(detail("order-customer")).toBe("Ada Lovelace · ada@example.com");
    expect(detail("order-status")).toBe("Pending");
    const items = [...document.querySelectorAll("[data-test='order-item']")].map((item) =>
      item.textContent.replace(/\s+/g, " ").trim()
    );
    expect(items).toEqual(["Margherita×2$20.00", "Diavola×1$10.00"]);
    expect(detail("order-total")).toBe("$30.00");
    expect(document.querySelector("[data-test='order-discount']")).toBeNull();
  });

  it("shows the discount with the applied code", async () => {
    await mountModal({
      order: order({ discountAmount: 6, finalPrice: 24, codeApplied: "WELCOME20" }),
      customer: CUSTOMER,
    });

    expect(detail("order-discount")?.replace(/\s+/g, "")).toBe("Discount(WELCOME20)−$6.00");
    expect(detail("order-total")).toBe("$24.00");
  });

  it("shows the address and comment for a delivery order", async () => {
    await mountModal({ order: order({ comment: "Ring twice" }), customer: CUSTOMER });

    expect(detail("order-delivery")).toBe("Delivery");
    expect(detail("order-address")).toBe("12 Baker Street");
    expect(detail("order-comment")).toBe("Ring twice");
    expect(details()?.textContent).toContain("Cash");
  });

  it("hides the address for a pickup order", async () => {
    await mountModal({ order: order({ delivery: "pickup", address: "" }), customer: CUSTOMER });

    expect(detail("order-delivery")).toBe("Pickup");
    expect(document.querySelector("[data-test='order-address']")).toBeNull();
  });

  it("shows only the email for a customer without a name", async () => {
    await mountModal({ order: order(), customer: { ...CUSTOMER, name: null, surname: null } });

    expect(detail("order-customer")).toBe("ada@example.com");
  });

  it("labels an order from a deleted account", async () => {
    await mountModal({ order: order({ userId: null }) });

    expect(detail("order-customer")).toBe("Deleted user");
  });

  it("forwards a status change from the actions", async () => {
    const modal = await mountModal({ order: order(), customer: CUSTOMER });

    document.querySelector<HTMLButtonElement>("[data-test='status-action-confirmed']")?.click();
    await modal.vm.$nextTick();

    expect(modal.emitted("changeStatus")).toEqual([["confirmed"]]);
  });

  it("disables the actions while an update runs", async () => {
    await mountModal({ order: order(), customer: CUSTOMER, updating: true });

    const buttons = document.querySelectorAll<HTMLButtonElement>(
      "[data-test='status-actions'] button"
    );
    expect(buttons).toHaveLength(2);
    expect([...buttons].every((button) => button.disabled)).toBe(true);
  });
});
