import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import DatePicker from "primevue/datepicker";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { routes } from "@/router/routes";
import * as analyticsApi from "@/services/api/analytics";
import type { UserAboveAverageCheck } from "@/types/analytics.types";
import AdminAnalyticsView from "@/views/admin/AdminAnalyticsView.vue";

vi.mock("@/services/api/analytics", () => ({
  getPopularPizza: vi.fn(),
  getHighestChecks: vi.fn(),
}));

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

const NOW = new Date(2026, 10, 18, 12);

const CUSTOMERS: UserAboveAverageCheck[] = [
  {
    userId: "u1",
    email: "ada@example.com",
    name: "Ada",
    orderCount: 6,
    averageCheck: 48,
    globalAverageCheck: 30,
  },
  {
    userId: "u2",
    email: "alan@example.com",
    name: null,
    orderCount: 4,
    averageCheck: 36,
    globalAverageCheck: 30,
  },
];

const POPULAR_BY_MONTH: Record<string, { pizzaName: string; orderCount: number }> = {
  "2026-11": { pizzaName: "Diavola", orderCount: 12 },
  "2026-07": { pizzaName: "Margherita", orderCount: 5 },
};

function servePopularPizza(): void {
  vi.mocked(analyticsApi.getPopularPizza).mockImplementation((month, year) =>
    Promise.resolve(POPULAR_BY_MONTH[`${String(year)}-${String(month).padStart(2, "0")}`] ?? null)
  );
}

let wrapper: VueWrapper | undefined;

async function setup(path = "/admin/analytics") {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  wrapper = mount(AdminAnalyticsView, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { wrapper, router };
}

const text = (target: VueWrapper, test: string) => target.get(`[data-test='${test}']`).text();

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  servePopularPizza();
  vi.mocked(analyticsApi.getHighestChecks).mockResolvedValue(CUSTOMERS);
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminAnalyticsView", () => {
  it("shows the current month's most popular pizza and the top customers", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Analytics");
    expect(text(wrapper, "page-subtitle")).toBe("Monthly performance overview");
    expect(analyticsApi.getPopularPizza).toHaveBeenCalledWith(11, 2026);
    expect(text(wrapper, "popular-pizza-name")).toBe("Diavola");
    expect(text(wrapper, "popular-pizza-orders")).toBe("12 orders in Nov 2026");
    expect(wrapper.findAll("[data-test='customer-name']").map((name) => name.text())).toEqual([
      "Ada",
      "alan@example.com",
    ]);
    expect(wrapper.get("[data-test='global-average']").text()).toContain("$30.00");
  });

  it("shows the selected month in the picker", async () => {
    await setup();

    expect(document.querySelector<HTMLInputElement>("#analytics-month")?.value).toBe(
      "November 2026"
    );
  });

  it("loads the month from the URL", async () => {
    const { wrapper } = await setup("/admin/analytics?month=2026-07");

    expect(analyticsApi.getPopularPizza).toHaveBeenCalledWith(7, 2026);
    expect(analyticsApi.getPopularPizza).not.toHaveBeenCalledWith(11, 2026);
    expect(text(wrapper, "popular-pizza-name")).toBe("Margherita");
    expect(document.querySelector<HTMLInputElement>("#analytics-month")?.value).toBe("July 2026");
  });

  it("switches month through the picker and keeps it in the URL", async () => {
    const { wrapper, router } = await setup();

    wrapper.findComponent(DatePicker).vm.$emit("update:modelValue", new Date(2026, 6, 14));
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ month: "2026-07" });
    expect(analyticsApi.getPopularPizza).toHaveBeenLastCalledWith(7, 2026);
    expect(text(wrapper, "popular-pizza-orders")).toBe("5 orders in Jul 2026");
    expect(analyticsApi.getHighestChecks).toHaveBeenCalledTimes(1);
  });

  it("does not offer months after the current one", async () => {
    const { wrapper } = await setup();

    expect(wrapper.findComponent(DatePicker).props("maxDate")).toEqual(new Date(2026, 10, 1));
  });

  it("says when nothing was ordered in the month", async () => {
    const { wrapper } = await setup("/admin/analytics?month=2026-02");

    expect(wrapper.text()).toContain("Nothing was ordered in Feb 2026.");
  });

  it("offers a retry when the most popular pizza fails to load", async () => {
    vi.mocked(analyticsApi.getPopularPizza).mockRejectedValue(new Error("Network Error"));
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Couldn't load the most popular pizza");

    servePopularPizza();
    const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
    await retry?.trigger("click");
    await flushPromises();

    expect(text(wrapper, "popular-pizza-name")).toBe("Diavola");
  });

  it("offers a retry when the customers fail to load", async () => {
    vi.mocked(analyticsApi.getHighestChecks).mockRejectedValue(new Error("Network Error"));
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Couldn't load customers");

    vi.mocked(analyticsApi.getHighestChecks).mockResolvedValue(CUSTOMERS);
    const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
    await retry?.trigger("click");
    await flushPromises();

    expect(wrapper.findAll("[data-test='customer-name']")).toHaveLength(2);
  });
});
