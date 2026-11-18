import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

import {
  usePromocodes,
  useSavePromocode,
  useSetPromocodeActive,
} from "@/composables/usePromocodes";
import * as promocodesApi from "@/services/api/promocodes";
import { ApiError } from "@/services/errors";
import type { Promocode, PromocodePayload } from "@/types/promocode.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";

vi.mock("@/services/api/promocodes", () => ({
  listPromocodes: vi.fn(),
  createPromocode: vi.fn(),
  updatePromocode: vi.fn(),
  deletePromocode: vi.fn(),
  restorePromocode: vi.fn(),
}));

const promocode = (id: string, overrides: Partial<Promocode> = {}): Promocode => ({
  id,
  code: id.toUpperCase(),
  discount: 20,
  discountMode: "percentage",
  validTill: "2026-12-31T23:59:59.999Z",
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

const PAYLOAD: PromocodePayload = {
  code: "WELCOME25",
  discount: 25,
  discountMode: "percentage",
  validTill: "2027-01-31T23:59:59.999Z",
};

const DELETED_AT = "2026-11-10T00:00:00.000Z";

function withQuery<T>(composable: () => T) {
  let result!: T;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mount(
    defineComponent({
      setup: () => {
        result = composable();
        return () => null;
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
  );
  return { result, queryClient };
}

const apiCalls = () =>
  (
    [
      ["update", promocodesApi.updatePromocode],
      ["delete", promocodesApi.deletePromocode],
      ["restore", promocodesApi.restorePromocode],
      ["create", promocodesApi.createPromocode],
    ] as const
  )
    .flatMap(([name, fn]) =>
      vi.mocked(fn).mock.invocationCallOrder.map((order) => ({ name, order }))
    )
    .sort((left, right) => left.order - right.order)
    .map(({ name }) => name);

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(promocodesApi.listPromocodes).mockResolvedValue([]);
  vi.mocked(promocodesApi.updatePromocode).mockImplementation((id) =>
    Promise.resolve(promocode(id))
  );
  vi.mocked(promocodesApi.restorePromocode).mockImplementation((id) =>
    Promise.resolve(promocode(id))
  );
  vi.mocked(promocodesApi.deletePromocode).mockResolvedValue();
  vi.mocked(promocodesApi.createPromocode).mockResolvedValue(promocode("new"));
});

describe("usePromocodes", () => {
  it("loads every promo code under the promocodes key", async () => {
    vi.mocked(promocodesApi.listPromocodes).mockResolvedValue([promocode("c1")]);

    const { result, queryClient } = withQuery(() => usePromocodes());
    await flushPromises();

    expect(result.data.value).toEqual([promocode("c1")]);
    expect(queryClient.getQueryData(QUERY_KEYS.promocodes)).toEqual([promocode("c1")]);
  });
});

describe("useSetPromocodeActive", () => {
  it.each([
    [false, "deletePromocode"],
    [true, "restorePromocode"],
  ] as const)("switching active to %s calls %s", async (active, apiName) => {
    const { result } = withQuery(() => useSetPromocodeActive());

    await result.mutateAsync({ id: "c1", active });

    expect(promocodesApi[apiName]).toHaveBeenCalledWith("c1");
  });

  it("updates the list before the server answers", async () => {
    vi.mocked(promocodesApi.deletePromocode).mockReturnValue(new Promise(() => undefined));
    const { result, queryClient } = withQuery(() => useSetPromocodeActive());
    queryClient.setQueryData(QUERY_KEYS.promocodes, [promocode("c1"), promocode("c2")]);

    result.mutate({ id: "c1", active: false });
    await flushPromises();

    const cached = queryClient.getQueryData<Promocode[]>(QUERY_KEYS.promocodes);
    expect(cached?.[0]?.deletedAt).not.toBeNull();
    expect(cached?.[1]?.deletedAt).toBeNull();
  });

  it("rolls the list back when the server refuses", async () => {
    vi.mocked(promocodesApi.restorePromocode).mockRejectedValue(new Error("Server error"));
    vi.mocked(promocodesApi.listPromocodes).mockReturnValue(new Promise(() => undefined));
    const { result, queryClient } = withQuery(() => useSetPromocodeActive());
    const before = [promocode("c1", { deletedAt: DELETED_AT })];
    queryClient.setQueryData(QUERY_KEYS.promocodes, before);

    await expect(result.mutateAsync({ id: "c1", active: true })).rejects.toThrow("Server error");

    expect(queryClient.getQueryData(QUERY_KEYS.promocodes)).toEqual(before);
  });

  it("refetches the list once settled", async () => {
    const { result, queryClient } = withQuery(() => useSetPromocodeActive());
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await result.mutateAsync({ id: "c1", active: false });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.promocodes });
  });
});

describe("useSavePromocode", () => {
  it("creates a new promo code", async () => {
    const { result } = withQuery(() => useSavePromocode());

    await result.mutateAsync({ payload: PAYLOAD });

    expect(promocodesApi.createPromocode).toHaveBeenCalledWith(PAYLOAD);
    expect(apiCalls()).toEqual(["create"]);
  });

  it("only sends PUT when the Active switch is unchanged", async () => {
    const { result } = withQuery(() => useSavePromocode());

    await result.mutateAsync({ payload: PAYLOAD, existing: promocode("c1"), active: true });

    expect(promocodesApi.updatePromocode).toHaveBeenCalledWith("c1", PAYLOAD);
    expect(apiCalls()).toEqual(["update"]);
  });

  it("sends PUT then DELETE when an active code is switched off", async () => {
    const { result } = withQuery(() => useSavePromocode());

    await result.mutateAsync({ payload: PAYLOAD, existing: promocode("c1"), active: false });

    expect(promocodesApi.deletePromocode).toHaveBeenCalledWith("c1");
    expect(apiCalls()).toEqual(["update", "delete"]);
  });

  it("restores and retries once when an inactive code is switched on", async () => {
    vi.mocked(promocodesApi.updatePromocode)
      .mockRejectedValueOnce(new ApiError("Promocode not found", { status: 404 }))
      .mockResolvedValueOnce(promocode("c1"));
    const { result } = withQuery(() => useSavePromocode());

    await result.mutateAsync({
      payload: PAYLOAD,
      existing: promocode("c1", { deletedAt: DELETED_AT }),
      active: true,
    });

    expect(apiCalls()).toEqual(["update", "restore", "update"]);
  });

  it("does not restore an inactive code that stays switched off", async () => {
    const notFound = new ApiError("Promocode not found", { status: 404 });
    vi.mocked(promocodesApi.updatePromocode).mockRejectedValue(notFound);
    const { result } = withQuery(() => useSavePromocode());

    await expect(
      result.mutateAsync({
        payload: PAYLOAD,
        existing: promocode("c1", { deletedAt: DELETED_AT }),
        active: false,
      })
    ).rejects.toBe(notFound);

    expect(apiCalls()).toEqual(["update"]);
  });

  it("does not switch the code when the PUT fails", async () => {
    const taken = new ApiError("Promocode with this code already exists", { status: 409 });
    vi.mocked(promocodesApi.updatePromocode).mockRejectedValue(taken);
    const { result } = withQuery(() => useSavePromocode());

    await expect(
      result.mutateAsync({ payload: PAYLOAD, existing: promocode("c1"), active: false })
    ).rejects.toBe(taken);

    expect(apiCalls()).toEqual(["update"]);
  });

  it("refetches the list even when a later step fails", async () => {
    vi.mocked(promocodesApi.deletePromocode).mockRejectedValue(new Error("Server error"));
    const { result, queryClient } = withQuery(() => useSavePromocode());
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await expect(
      result.mutateAsync({ payload: PAYLOAD, existing: promocode("c1"), active: false })
    ).rejects.toThrow("Server error");

    expect(invalidate).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.promocodes });
  });
});
