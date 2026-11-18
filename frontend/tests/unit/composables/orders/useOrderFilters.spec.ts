import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { useOrderFilters } from "@/composables/orders/useOrderFilters";
import { ADMIN_ORDERS_PAGE_SIZE } from "@/utils/constants/order.constants";

async function setup(path = "/admin/orders") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/admin/orders", component: { render: () => null } }],
  });
  await router.push(path);
  let filters!: ReturnType<typeof useOrderFilters>;
  mount(
    defineComponent({
      setup: () => {
        filters = useOrderFilters();
        return () => null;
      },
    }),
    { global: { plugins: [router] } }
  );
  return { filters, router };
}

describe("useOrderFilters", () => {
  it("searches the first page of all orders by default", async () => {
    const { filters } = await setup();

    expect(filters.hasFilters.value).toBe(false);
    expect(filters.searchQuery.value).toEqual({ page: 1, limit: ADMIN_ORDERS_PAGE_SIZE });
  });

  it("reads the filters and page from the URL", async () => {
    const { filters } = await setup(
      "/admin/orders?status=preparing&delivery=pickup&payment=cash&page=3"
    );

    expect(filters.status.value).toBe("preparing");
    expect(filters.delivery.value).toBe("pickup");
    expect(filters.paymentMethod.value).toBe("cash");
    expect(filters.hasFilters.value).toBe(true);
    expect(filters.searchQuery.value).toEqual({
      page: 3,
      limit: ADMIN_ORDERS_PAGE_SIZE,
      status: "preparing",
      delivery: "pickup",
      paymentMethod: "cash",
    });
  });

  it("ignores unknown filter values in the URL", async () => {
    const { filters } = await setup("/admin/orders?status=lost&delivery=drone&payment=crypto");

    expect(filters.hasFilters.value).toBe(false);
    expect(filters.searchQuery.value).toEqual({ page: 1, limit: ADMIN_ORDERS_PAGE_SIZE });
  });

  it("writes a changed filter to the URL and goes back to the first page", async () => {
    const { filters, router } = await setup("/admin/orders?delivery=pickup&page=2");

    filters.status.value = "confirmed";
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ delivery: "pickup", status: "confirmed" });
  });

  it("removes a filter set back to all", async () => {
    const { filters, router } = await setup("/admin/orders?payment=cash");

    filters.paymentMethod.value = "";
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
  });

  it("pages through the results", async () => {
    const { filters, router } = await setup("/admin/orders?status=pending");

    filters.page.value = 2;
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({ status: "pending", page: "2" });

    filters.page.value = 1;
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({ status: "pending" });
  });

  it("clears every filter and the page", async () => {
    const { filters, router } = await setup(
      "/admin/orders?status=pending&delivery=delivery&payment=cash&page=4"
    );

    filters.clearFilters();
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
    expect(filters.hasFilters.value).toBe(false);
  });
});
