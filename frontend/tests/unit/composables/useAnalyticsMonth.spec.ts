import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { useAnalyticsMonth } from "@/composables/useAnalyticsMonth";

const NOW = new Date(2026, 10, 18, 15, 30);

async function setup(path = "/admin/analytics") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/admin/analytics", component: { render: () => null } }],
  });
  await router.push(path);
  let analyticsMonth!: ReturnType<typeof useAnalyticsMonth>;
  mount(
    defineComponent({
      setup: () => {
        analyticsMonth = useAnalyticsMonth();
        return () => null;
      },
    }),
    { global: { plugins: [router] } }
  );
  return { analyticsMonth, router };
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAnalyticsMonth", () => {
  it("defaults to the current month", async () => {
    const { analyticsMonth } = await setup();

    expect(analyticsMonth.month.value).toEqual(new Date(2026, 10, 1));
    expect(analyticsMonth.monthNumber.value).toBe(11);
    expect(analyticsMonth.year.value).toBe(2026);
    expect(analyticsMonth.latestMonth.value).toEqual(new Date(2026, 10, 1));
  });

  it("reads the month from the URL", async () => {
    const { analyticsMonth } = await setup("/admin/analytics?month=2025-02");

    expect(analyticsMonth.monthNumber.value).toBe(2);
    expect(analyticsMonth.year.value).toBe(2025);
  });

  it("writes a chosen month to the URL, keeping other params", async () => {
    const { analyticsMonth, router } = await setup("/admin/analytics?tab=x");

    analyticsMonth.month.value = new Date(2026, 6, 1);
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ tab: "x", month: "2026-07" });
    expect(analyticsMonth.monthNumber.value).toBe(7);
  });

  it("drops the param when the current month is chosen again", async () => {
    const { analyticsMonth, router } = await setup("/admin/analytics?month=2026-01");

    analyticsMonth.month.value = new Date(2026, 10, 1);
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
  });
});
