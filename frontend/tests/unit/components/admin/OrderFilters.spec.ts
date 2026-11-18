import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { afterEach, describe, expect, it, vi } from "vitest";

import OrderFilters from "@/components/admin/OrderFilters.vue";
import type { DeliveryType, OrderStatus, PaymentMethod } from "@/types/order.types";

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

interface FilterValues {
  status: OrderStatus | "";
  delivery: DeliveryType | "";
  paymentMethod: PaymentMethod | "";
}

let wrapper: VueWrapper | undefined;

function mountFilters(values: Partial<FilterValues> = {}) {
  wrapper = mount(OrderFilters, {
    props: { status: "", delivery: "", paymentMethod: "", ...values },
    attachTo: document.body,
    global: { plugins: [PrimeVue] },
  });
  return wrapper;
}

const shownValue = (target: VueWrapper, filter: string) =>
  target.get(`[data-test='filter-${filter}'] [role='combobox']`).text();

async function choose(target: VueWrapper, filter: string, label: string): Promise<void> {
  await target.get(`[data-test='filter-${filter}']`).trigger("click");
  await flushPromises();
  const option = [...document.querySelectorAll<HTMLElement>("[role='option']")].find(
    (element) => element.textContent.trim() === label
  );
  if (!option) {
    throw new Error(`No option "${label}"`);
  }
  option.click();
  await flushPromises();
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("OrderFilters", () => {
  it("shows the 'all' option for every empty filter", () => {
    const filters = mountFilters();

    expect(shownValue(filters, "status")).toBe("All statuses");
    expect(shownValue(filters, "delivery")).toBe("All delivery types");
    expect(shownValue(filters, "payment")).toBe("All payment methods");
  });

  it("shows the chosen filters by their labels", () => {
    const filters = mountFilters({
      status: "ready_for_delivery",
      delivery: "pickup",
      paymentMethod: "card_on_delivery",
    });

    expect(shownValue(filters, "status")).toBe("Ready");
    expect(shownValue(filters, "delivery")).toBe("Pickup");
    expect(shownValue(filters, "payment")).toBe("Card on delivery");
  });

  it("lists every status after the 'all' option", async () => {
    const filters = mountFilters();

    await filters.get("[data-test='filter-status']").trigger("click");
    await flushPromises();

    expect(
      [...document.querySelectorAll("[role='option']")].map((option) => option.textContent.trim())
    ).toEqual([
      "All statuses",
      "Pending",
      "Confirmed",
      "Preparing",
      "Ready",
      "Out for delivery",
      "Completed",
      "Cancelled",
    ]);
  });

  it("emits the chosen value for each filter", async () => {
    const filters = mountFilters();

    await choose(filters, "status", "Preparing");
    await choose(filters, "delivery", "Delivery");
    await choose(filters, "payment", "Cash");

    expect(filters.emitted("update:status")).toEqual([["preparing"]]);
    expect(filters.emitted("update:delivery")).toEqual([["delivery"]]);
    expect(filters.emitted("update:paymentMethod")).toEqual([["cash"]]);
  });

  it("emits an empty value when 'all' is chosen again", async () => {
    const filters = mountFilters({ status: "pending" });

    await choose(filters, "status", "All statuses");

    expect(filters.emitted("update:status")).toEqual([[""]]);
  });
});
