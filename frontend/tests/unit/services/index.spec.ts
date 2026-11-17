import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { apiClient } from "@/services";
import { handleUnauthorized, normalizeError } from "@/services/interceptors";

vi.mock("@/services/interceptors", () => ({
  handleUnauthorized: vi.fn((error: Error) => Promise.reject(error)),
  normalizeError: vi.fn((error: Error) => Promise.reject(error)),
}));

type Adapter = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;

const response = (
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown
): AxiosResponse => ({
  data,
  status,
  statusText: "",
  headers: {},
  config,
});

const respondWith =
  (status: number, data: unknown = {}): Adapter =>
  (config) => {
    const result = response(config, status, data);
    return status < 400
      ? Promise.resolve(result)
      : Promise.reject(new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, result));
  };

const originalAdapter = apiClient.defaults.adapter;
let adapter: Mock<Adapter>;

function lastConfig(): InternalAxiosRequestConfig {
  const call = adapter.mock.lastCall;
  if (!call) {
    throw new Error("No request was sent");
  }
  return call[0];
}

beforeEach(() => {
  adapter = vi.fn<Adapter>(respondWith(200));
  apiClient.defaults.adapter = adapter;
});

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
  vi.clearAllMocks();
});

describe("apiClient", () => {
  it("sends cookies to the /api base URL and accepts JSON", async () => {
    await apiClient.get("/pizzas", { params: { page: 2 } });

    const config = lastConfig();
    expect(config.baseURL).toBe("/api");
    expect(config.url).toBe("/pizzas");
    expect(config.withCredentials).toBe(true);
    expect(config.headers.Accept).toBe("application/json");
    expect(config.params).toEqual({ page: 2 });
  });

  it("serializes a plain object body as JSON", async () => {
    await apiClient.post("/carts/items", { pizzaId: "p1", quantity: 2 });

    const config = lastConfig();
    expect(config.data).toBe(JSON.stringify({ pizzaId: "p1", quantity: 2 }));
    expect(config.headers["Content-Type"]).toBe("application/json");
  });

  it("passes FormData through without a JSON content type", async () => {
    const formData = new FormData();
    formData.append("image", new Blob(["x"], { type: "image/png" }), "pizza.png");

    await apiClient.patch("/pizzas/p1/image", formData);

    const config = lastConfig();
    expect(config.data).toBe(formData);
    expect(config.headers["Content-Type"]).not.toBe("application/json");
  });

  it("resolves a 204 with empty data", async () => {
    adapter.mockImplementation(respondWith(204, ""));

    const { status, data } = await apiClient.delete<string>("/carts");

    expect(status).toBe(204);
    expect(data).toBe("");
  });
});

describe("response interceptor", () => {
  it("passes failed responses to handleUnauthorized", async () => {
    adapter.mockImplementation(respondWith(401));

    await expect(apiClient.get("/orders/my")).rejects.toBeInstanceOf(AxiosError);
    expect(handleUnauthorized).toHaveBeenCalledOnce();
  });

  it("normalizes the error after the 401 handler has seen it", async () => {
    adapter.mockImplementation(respondWith(422));

    await expect(apiClient.get("/orders/my")).rejects.toBeInstanceOf(AxiosError);
    expect(normalizeError).toHaveBeenCalledOnce();
    expect(vi.mocked(handleUnauthorized).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(normalizeError).mock.invocationCallOrder[0] ?? 0
    );
  });

  it("does not call handleUnauthorized for successful responses", async () => {
    await apiClient.get("/pizzas");

    expect(handleUnauthorized).not.toHaveBeenCalled();
    expect(normalizeError).not.toHaveBeenCalled();
  });
});
