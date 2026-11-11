import { flushPromises, mount } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as authApi from "@/api/auth";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";
import SignInView from "@/views/SignInView.vue";

vi.mock("@/api/auth", () => ({ signIn: vi.fn(), signUp: vi.fn(), me: vi.fn(), signOut: vi.fn() }));

const user = (role: User["role"]): User => ({
  id: "u1",
  role,
  email: "mario@x.io",
  name: "Mario",
  surname: "Rossi",
  gender: null,
  image: null,
  isEmailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number, data: unknown = { statusCode: status, message: "Failed" }) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data,
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

async function setup(path = "/sign-in") {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  const wrapper = mount(SignInView, { global: { plugins: [pinia, router, PrimeVue] } });
  return { wrapper, router };
}

async function submitWith(
  wrapper: Awaited<ReturnType<typeof setup>>["wrapper"],
  email: string,
  password: string
) {
  await wrapper.get("#sign-in-email").setValue(email);
  await wrapper.get("#sign-in-password").setValue(password);
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

const fieldError = (wrapper: Awaited<ReturnType<typeof setup>>["wrapper"], id: string) =>
  wrapper.find(`#${id}-message`);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("SignInView", () => {
  it("shows client errors and skips the request for an empty form", async () => {
    const { wrapper } = await setup();

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(fieldError(wrapper, "sign-in-email").text()).toBe("Email is required");
    expect(fieldError(wrapper, "sign-in-password").text()).toBe("Password is required");
    expect(authApi.signIn).not.toHaveBeenCalled();
  });

  it("validates the email format on blur", async () => {
    const { wrapper } = await setup();

    await wrapper.get("#sign-in-email").setValue("not-an-email");
    await wrapper.get("#sign-in-email").trigger("blur");

    expect(fieldError(wrapper, "sign-in-email").text()).toBe("Please enter a valid email");
    expect(fieldError(wrapper, "sign-in-password").exists()).toBe(false);
  });

  it("signs in with a trimmed email and goes to the menu", async () => {
    vi.mocked(authApi.signIn).mockResolvedValue({ accessToken: "t", user: user("user") });
    const { wrapper, router } = await setup();

    await submitWith(wrapper, "  mario@x.io ", "Secret1!");

    expect(authApi.signIn).toHaveBeenCalledWith({ email: "mario@x.io", password: "Secret1!" });
    expect(useAuthStore().user?.email).toBe("mario@x.io");
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("menu");
    });
  });

  it("sends an admin to the dashboard", async () => {
    vi.mocked(authApi.signIn).mockResolvedValue({ accessToken: "t", user: user("admin") });
    const { wrapper, router } = await setup();

    await submitWith(wrapper, "ada@x.io", "Secret1!");

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("admin-dashboard");
    });
  });

  it("returns to a safe redirect query", async () => {
    vi.mocked(authApi.signIn).mockResolvedValue({ accessToken: "t", user: user("user") });
    const { wrapper, router } = await setup("/sign-in?redirect=/my-orders/abc");

    await submitWith(wrapper, "mario@x.io", "Secret1!");

    await vi.waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe("/my-orders/abc");
    });
  });

  it("ignores an external redirect query", async () => {
    vi.mocked(authApi.signIn).mockResolvedValue({ accessToken: "t", user: user("user") });
    const { wrapper, router } = await setup("/sign-in?redirect=//evil.example");

    await submitWith(wrapper, "mario@x.io", "Secret1!");

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("menu");
    });
  });

  it.each([401, 403])("shows a generic credentials alert on %i", async (status) => {
    vi.mocked(authApi.signIn).mockRejectedValue(httpError(status));
    const { wrapper, router } = await setup();

    await submitWith(wrapper, "mario@x.io", "wrong");

    expect(wrapper.get("[data-test='form-error']").text()).toBe("Invalid email or password");
    expect(router.currentRoute.value.name).toBe("sign-in");
  });

  it("shows the throttle message on 429", async () => {
    vi.mocked(authApi.signIn).mockRejectedValue(httpError(429));
    const { wrapper } = await setup();

    await submitWith(wrapper, "mario@x.io", "Secret1!");

    expect(wrapper.get("[data-test='form-error']").text()).toBe(
      "Too many attempts, try again in a minute"
    );
  });

  it("maps server field errors onto the fields and clears them on edit", async () => {
    vi.mocked(authApi.signIn).mockRejectedValue(
      httpError(400, { formErrors: [], fieldErrors: { email: ["Invalid email format"] } })
    );
    const { wrapper } = await setup();

    await submitWith(wrapper, "mario@x.io", "Secret1!");

    expect(fieldError(wrapper, "sign-in-email").text()).toBe("Invalid email format");
    expect(wrapper.find("[data-test='form-error']").exists()).toBe(false);

    await wrapper.get("#sign-in-email").setValue("mario@x.it");

    expect(fieldError(wrapper, "sign-in-email").exists()).toBe(false);
  });

  it("shows the network message when the server is unreachable", async () => {
    vi.mocked(authApi.signIn).mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));
    const { wrapper } = await setup();

    await submitWith(wrapper, "mario@x.io", "Secret1!");

    expect(wrapper.get("[data-test='form-error']").text()).toContain("Unable to reach the server");
  });

  it("clears the alert on the next submit", async () => {
    vi.mocked(authApi.signIn)
      .mockRejectedValueOnce(httpError(401))
      .mockReturnValueOnce(new Promise(() => undefined));
    const { wrapper } = await setup();

    await submitWith(wrapper, "mario@x.io", "wrong");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find("[data-test='form-error']").exists()).toBe(false);
  });

  it("links to sign-up", async () => {
    const { wrapper } = await setup();

    const link = wrapper.get("a[href='/sign-up']");
    expect(link.text()).toBe("Create one");
  });
});
