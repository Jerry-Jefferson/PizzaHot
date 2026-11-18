import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import PromocodeFormModal from "@/components/admin/PromocodeFormModal.vue";
import { routes } from "@/router/routes";
import * as promocodesApi from "@/services/api/promocodes";
import { ApiError } from "@/services/errors";
import type { Promocode } from "@/types/promocode.types";
import {
  ADMIN_PROMOCODES_PAGE_SIZE,
  INACTIVE_PROMOCODE_EDIT_MESSAGE,
  PROMOCODE_CODE_TAKEN_MESSAGE,
} from "@/utils/constants/promocode.constants";
import AdminPromocodesView from "@/views/admin/AdminPromocodesView.vue";

vi.mock("@/services/api/promocodes", () => ({
  listPromocodes: vi.fn(),
  createPromocode: vi.fn(),
  updatePromocode: vi.fn(),
  deletePromocode: vi.fn(),
  restorePromocode: vi.fn(),
}));

const { toastAdd } = vi.hoisted(() => ({
  toastAdd: vi.fn<(toast: { severity?: string; summary?: string }) => void>(),
}));
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

const NOW = new Date(2026, 10, 18, 12);
const DELETED_AT = "2026-11-10T00:00:00.000Z";

const promocode = (code: string, overrides: Partial<Promocode> = {}): Promocode => ({
  id: code.toLowerCase(),
  code,
  discount: 20,
  discountMode: "percentage",
  validTill: new Date(2026, 11, 31, 23, 59, 59, 999).toISOString(),
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

const WELCOME = promocode("WELCOME20", { createdAt: "2026-11-05T00:00:00.000Z" });
const TENOFF = promocode("TENOFF", { discount: 10, discountMode: "fixed_amount" });
const SUMMER = promocode("SUMMER", {
  validTill: new Date(2026, 7, 31, 23, 59).toISOString(),
  createdAt: "2026-06-01T00:00:00.000Z",
});
const RETIRED = promocode("RETIRED", {
  deletedAt: DELETED_AT,
  createdAt: "2026-01-01T00:00:00.000Z",
});

let stored: Promocode[] = [];

function find(id: string): Promocode {
  const found = stored.find((item) => item.id === id);
  if (!found) {
    throw new ApiError("Promocode not found", { status: 404 });
  }
  return found;
}

function replace(id: string, changes: Partial<Promocode>): Promocode {
  const updated = { ...find(id), ...changes };
  stored = stored.map((item) => (item.id === id ? updated : item));
  return updated;
}

function serveApi(): void {
  vi.mocked(promocodesApi.listPromocodes).mockImplementation(() => Promise.resolve([...stored]));
  vi.mocked(promocodesApi.createPromocode).mockImplementation((payload) => {
    if (stored.some((item) => item.code === payload.code)) {
      return Promise.reject(
        new ApiError("Promocode with this code already exists", { status: 409 })
      );
    }
    const created = promocode(payload.code, { ...payload, createdAt: NOW.toISOString() });
    stored = [...stored, created];
    return Promise.resolve(created);
  });
  vi.mocked(promocodesApi.updatePromocode).mockImplementation((id, payload) =>
    find(id).deletedAt
      ? Promise.reject(new ApiError("Promocode not found", { status: 404 }))
      : Promise.resolve(replace(id, payload))
  );
  vi.mocked(promocodesApi.deletePromocode).mockImplementation((id) => {
    replace(id, { deletedAt: DELETED_AT });
    return Promise.resolve();
  });
  vi.mocked(promocodesApi.restorePromocode).mockImplementation((id) =>
    Promise.resolve(replace(id, { deletedAt: null }))
  );
}

let wrapper: VueWrapper | undefined;

async function setup() {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/admin/promocodes");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  wrapper = mount(AdminPromocodesView, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return wrapper;
}

const cells = (target: VueWrapper, test: string) =>
  target.findAll(`[data-test='${test}']`).map((cell) => cell.text());

const toggle = (code: string) =>
  document.querySelector<HTMLInputElement>(`[data-test='promocode-toggle-${code}'] input`);

const modalButton = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("[data-test='promocode-form'] button")].find(
    (button) => button.textContent.trim() === label
  );

const formModal = (target: VueWrapper) => target.findComponent(PromocodeFormModal);

async function clickToggle(code: string): Promise<void> {
  toggle(code)?.click();
  await flushPromises();
}

async function submitForm(): Promise<void> {
  document
    .querySelector("[data-test='promocode-form']")
    ?.dispatchEvent(new Event("submit", { cancelable: true }));
  await flushPromises();
}

async function setCode(value: string): Promise<void> {
  const input = document.querySelector<HTMLInputElement>("#promocode-code");
  if (!input) {
    throw new Error("No code input");
  }
  input.value = value;
  input.dispatchEvent(new Event("input"));
  await flushPromises();
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  stored = [RETIRED, SUMMER, TENOFF, WELCOME];
  serveApi();
});

afterEach(() => {
  vi.useRealTimers();
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminPromocodesView", () => {
  it("lists codes newest first with discount, expiry, status and Active switch", async () => {
    const view = await setup();

    expect(cells(view, "promocode-code")).toEqual(["WELCOME20", "TENOFF", "SUMMER", "RETIRED"]);
    expect(cells(view, "promocode-discount")).toEqual(["20% off", "$10 off", "20% off", "20% off"]);
    expect(cells(view, "promocode-status")).toEqual(["Active", "Active", "Expired", "Inactive"]);
    expect(cells(view, "promocode-expires")[2]).toBe("Aug 31, 2026");
    expect(view.findAll("[data-test='promocode-expires']")[2]?.classes()).toContain("text-primary");
    expect(view.findAll("[data-test='promocode-expires']")[0]?.classes()).not.toContain(
      "text-primary"
    );
    expect(toggle("WELCOME20")?.checked).toBe(true);
    expect(toggle("RETIRED")?.checked).toBe(false);
    expect(view.find("[aria-label='Delete WELCOME20']").exists()).toBe(false);
  });

  it("counts only active codes in the subtitle", async () => {
    const view = await setup();

    expect(view.get("[data-test='page-subtitle']").text()).toBe("2 active codes");
  });

  it("pages through codes ten at a time on the client", async () => {
    stored = Array.from({ length: ADMIN_PROMOCODES_PAGE_SIZE + 2 }, (_, index) =>
      promocode(`CODE${String(index).padStart(2, "0")}`, {
        createdAt: new Date(2026, 0, index + 1).toISOString(),
      })
    );
    const view = await setup();
    expect(cells(view, "promocode-code")).toHaveLength(ADMIN_PROMOCODES_PAGE_SIZE);

    await view.get("[aria-label='Page 2']").trigger("click");
    await flushPromises();

    expect(cells(view, "promocode-code")).toEqual(["CODE01", "CODE00"]);
    expect(promocodesApi.listPromocodes).toHaveBeenCalledTimes(1);
  });

  describe("Active switch", () => {
    it("switching a code off deactivates it", async () => {
      const view = await setup();

      await clickToggle("WELCOME20");

      expect(promocodesApi.deletePromocode).toHaveBeenCalledWith("welcome20");
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: "Promo code updated" })
      );
      expect(toggle("WELCOME20")?.checked).toBe(false);
      expect(cells(view, "promocode-status")[0]).toBe("Inactive");
      expect(view.get("[data-test='page-subtitle']").text()).toBe("1 active code");
    });

    it("switching a code on restores it", async () => {
      const view = await setup();

      await clickToggle("RETIRED");

      expect(promocodesApi.restorePromocode).toHaveBeenCalledWith("retired");
      expect(toggle("RETIRED")?.checked).toBe(true);
      expect(cells(view, "promocode-status")[3]).toBe("Active");
    });

    it("flips the switch before the server answers", async () => {
      vi.mocked(promocodesApi.deletePromocode).mockReturnValue(new Promise(() => undefined));
      await setup();

      await clickToggle("WELCOME20");

      expect(toggle("WELCOME20")?.checked).toBe(false);
      expect(toggle("WELCOME20")?.disabled).toBe(true);
    });

    it("rolls the switch back and reports the error when the server refuses", async () => {
      vi.mocked(promocodesApi.deletePromocode).mockRejectedValue(new Error("Server error"));
      const view = await setup();

      await clickToggle("WELCOME20");

      expect(toggle("WELCOME20")?.checked).toBe(true);
      expect(cells(view, "promocode-status")[0]).toBe("Active");
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", summary: "Couldn't update the promo code" })
      );
    });
  });

  describe("create", () => {
    async function openCreate(view: VueWrapper): Promise<void> {
      const button = view.findAll("button").find((item) => item.text().includes("New Promo Code"));
      await button?.trigger("click");
      await flushPromises();
    }

    it("creates an upper-case code that expires at the end of the chosen day", async () => {
      const view = await setup();
      await openCreate(view);

      expect(document.querySelector("[data-test='promocode-active']")).toBeNull();
      await setCode("spring15");
      formModal(view).vm.$emit("update:discount", 15);
      formModal(view).vm.$emit("update:validTill", new Date(2027, 2, 31));
      await flushPromises();
      await submitForm();

      expect(promocodesApi.createPromocode).toHaveBeenCalledWith({
        code: "SPRING15",
        discount: 15,
        discountMode: "percentage",
        validTill: new Date(2027, 2, 31, 23, 59, 59, 999).toISOString(),
      });
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: "Promo code created" })
      );
      expect(formModal(view).props("visible")).toBe(false);
      expect(cells(view, "promocode-code")[0]).toBe("SPRING15");
    });

    it("validates before sending anything", async () => {
      const view = await setup();
      await openCreate(view);

      await setCode("PCT");
      formModal(view).vm.$emit("update:discount", 150);
      formModal(view).vm.$emit("update:validTill", new Date(2026, 10, 18));
      await flushPromises();
      await submitForm();

      expect(promocodesApi.createPromocode).not.toHaveBeenCalled();
      expect(document.body.textContent).toContain("Percentage discount cannot exceed 100");
      expect(document.body.textContent).toContain("Expiry date must be in the future");
    });

    it("shows a taken code on the code field", async () => {
      const view = await setup();
      await openCreate(view);

      await setCode("welcome20");
      formModal(view).vm.$emit("update:discount", 5);
      formModal(view).vm.$emit("update:validTill", new Date(2027, 0, 1));
      await flushPromises();
      await submitForm();

      expect(document.body.textContent).toContain(PROMOCODE_CODE_TAKEN_MESSAGE);
      expect(formModal(view).props("visible")).toBe(true);
    });

    it("starts empty again after editing another code", async () => {
      const view = await setup();
      await view.get("[aria-label='Edit TENOFF']").trigger("click");
      await flushPromises();
      modalButton("Cancel")?.click();
      await flushPromises();

      await openCreate(view);

      expect(document.querySelector<HTMLInputElement>("#promocode-code")?.value).toBe("");
    });
  });

  describe("edit", () => {
    async function openEdit(view: VueWrapper, code: string): Promise<void> {
      await view.get(`[aria-label='Edit ${code}']`).trigger("click");
      await flushPromises();
    }

    it("prefills the code and saves all four fields with PUT", async () => {
      const view = await setup();
      await openEdit(view, "TENOFF");

      expect(document.querySelector<HTMLInputElement>("#promocode-code")?.value).toBe("TENOFF");
      expect(document.querySelector<HTMLInputElement>("#promocode-discount")?.value).toBe("$10");
      expect(document.querySelector<HTMLInputElement>("#promocode-active")?.checked).toBe(true);

      formModal(view).vm.$emit("update:discount", 12);
      await flushPromises();
      await submitForm();

      expect(promocodesApi.updatePromocode).toHaveBeenCalledWith("tenoff", {
        code: "TENOFF",
        discount: 12,
        discountMode: "fixed_amount",
        validTill: new Date(2026, 11, 31, 23, 59, 59, 999).toISOString(),
      });
      expect(promocodesApi.deletePromocode).not.toHaveBeenCalled();
      expect(cells(view, "promocode-discount")[1]).toBe("$12 off");
    });

    it("sends PUT then DELETE when the Active switch is turned off", async () => {
      const view = await setup();
      await openEdit(view, "WELCOME20");

      document.querySelector<HTMLInputElement>("#promocode-active")?.click();
      await flushPromises();
      await submitForm();

      const putOrder = vi.mocked(promocodesApi.updatePromocode).mock.invocationCallOrder[0] ?? 0;
      const deleteOrder = vi.mocked(promocodesApi.deletePromocode).mock.invocationCallOrder[0] ?? 0;
      expect(putOrder).toBeGreaterThan(0);
      expect(deleteOrder).toBeGreaterThan(putOrder);
      expect(
        toastAdd.mock.calls.filter(([toast]) => toast.summary === "Promo code updated")
      ).toHaveLength(1);
      expect(cells(view, "promocode-status")[0]).toBe("Inactive");
    });

    it("restores an inactive code and retries when it is switched on", async () => {
      const view = await setup();
      await openEdit(view, "RETIRED");

      expect(document.querySelector<HTMLInputElement>("#promocode-active")?.checked).toBe(false);
      document.querySelector<HTMLInputElement>("#promocode-active")?.click();
      formModal(view).vm.$emit("update:discount", 30);
      await flushPromises();
      await submitForm();

      expect(promocodesApi.restorePromocode).toHaveBeenCalledWith("retired");
      expect(promocodesApi.updatePromocode).toHaveBeenCalledTimes(2);
      expect(formModal(view).props("visible")).toBe(false);
      expect(cells(view, "promocode-status")[3]).toBe("Active");
      expect(cells(view, "promocode-discount")[3]).toBe("30% off");
    });

    it("asks to switch an inactive code on before editing it", async () => {
      const view = await setup();
      await openEdit(view, "RETIRED");

      formModal(view).vm.$emit("update:discount", 30);
      await flushPromises();
      await submitForm();

      expect(document.querySelector("[data-test='form-error']")?.textContent).toContain(
        INACTIVE_PROMOCODE_EDIT_MESSAGE
      );
      expect(promocodesApi.restorePromocode).not.toHaveBeenCalled();
      expect(formModal(view).props("visible")).toBe(true);
    });

    it("allows saving an expired code with its past date", async () => {
      const view = await setup();
      await openEdit(view, "SUMMER");

      await submitForm();

      expect(promocodesApi.updatePromocode).toHaveBeenCalledWith(
        "summer",
        expect.objectContaining({ validTill: new Date(2026, 7, 31, 23, 59, 59, 999).toISOString() })
      );
    });
  });

  it("offers a retry when the codes fail to load", async () => {
    vi.mocked(promocodesApi.listPromocodes).mockRejectedValue(new Error("Network Error"));
    const view = await setup();

    expect(view.text()).toContain("Couldn't load promo codes");

    serveApi();
    const retry = view.findAll("button").find((button) => button.text() === "Try again");
    await retry?.trigger("click");
    await flushPromises();

    expect(cells(view, "promocode-code")).toHaveLength(4);
  });
});
