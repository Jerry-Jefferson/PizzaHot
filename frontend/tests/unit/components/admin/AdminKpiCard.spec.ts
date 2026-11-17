import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";

import AdminKpiCard from "@/components/admin/AdminKpiCard.vue";

const BASE_PROPS = { label: "Customers", icon: "pi pi-users", tone: "info" } as const;

function setup(props: Partial<InstanceType<typeof AdminKpiCard>["$props"]> = {}) {
  return mount(AdminKpiCard, {
    props: { ...BASE_PROPS, ...props },
    global: { plugins: [PrimeVue] },
  });
}

describe("AdminKpiCard", () => {
  it("shows the label, value and caption", () => {
    const wrapper = setup({ value: "Diavola", caption: "7 orders" });

    expect(wrapper.text()).toContain("Customers");
    expect(wrapper.get("[data-test='kpi-value']").text()).toBe("Diavola");
    expect(wrapper.get("[data-test='kpi-caption']").text()).toBe("7 orders");
  });

  it("shows a dash when there is no value", () => {
    expect(setup().get("[data-test='kpi-value']").text()).toBe("—");
  });

  it("shows a zero value as-is", () => {
    expect(setup({ value: 0 }).get("[data-test='kpi-value']").text()).toBe("0");
  });

  it("shows a skeleton instead of the value while loading", () => {
    const wrapper = setup({ value: 12, loading: true });

    expect(wrapper.find("[data-test='kpi-skeleton']").exists()).toBe(true);
    expect(wrapper.find("[data-test='kpi-value']").exists()).toBe(false);
  });

  it("colours the icon chip by tone", () => {
    const wrapper = setup({ tone: "warning" });

    expect(wrapper.get("[data-test='kpi-icon']").classes()).toContain("bg-status-warning-bg");
  });
});
