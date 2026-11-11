import { flushPromises, mount } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import * as authApi from "@/api/auth";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";
import SignUpView from "@/views/SignUpView.vue";

vi.mock("@/api/auth", () => ({ signIn: vi.fn(), signUp: vi.fn(), me: vi.fn(), signOut: vi.fn() }));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

const USER = { id: "u1", role: "user", email: "mario@x.io", isEmailVerified: false } as User;

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data: { statusCode: status, message: "User with this email already exists" },
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

let wrapper: Awaited<ReturnType<typeof setup>>["wrapper"] | undefined;

async function setup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/sign-up");
  const mounted = mount(SignUpView, {
    attachTo: document.body,
    global: { plugins: [pinia, router, PrimeVue] },
  });
  wrapper = mounted;
  return { wrapper: mounted, router };
}

async function fill(target: NonNullable<typeof wrapper>, values: Record<string, string>) {
  for (const [id, value] of Object.entries(values)) {
    await target.get(`#sign-up-${id}`).setValue(value);
  }
}

const VALID = {
  name: " Mario ",
  surname: "Rossi",
  email: "mario@x.io",
  password: "Secret1!",
  "confirm-password": "Secret1!",
};

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe("SignUpView", () => {
  it("shows required errors, focuses the first field and skips the request", async () => {
    const { wrapper } = await setup();

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get("#sign-up-name-message").text()).toBe("First name is required");
    expect(wrapper.get("#sign-up-surname-message").text()).toBe("Last name is required");
    expect(wrapper.get("#sign-up-email-message").text()).toBe("Email is required");
    expect(document.activeElement?.id).toBe("sign-up-name");
    expect(authApi.signUp).not.toHaveBeenCalled();
  });

  it("does not flag untouched fields while typing", async () => {
    const { wrapper } = await setup();

    await wrapper.get("#sign-up-password").setValue("abc");

    expect(wrapper.find("#sign-up-password-message").exists()).toBe(false);
  });

  it("validates a field after its first blur", async () => {
    const { wrapper } = await setup();

    await wrapper.get("#sign-up-email").setValue("mario");
    await wrapper.get("#sign-up-email").trigger("blur");

    expect(wrapper.get("#sign-up-email-message").text()).toBe("Please enter a valid email");
  });

  it("flags mismatched passwords", async () => {
    const { wrapper } = await setup();

    await fill(wrapper, { ...VALID, "confirm-password": "Secret2!" });
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get("#sign-up-confirm-password-message").text()).toBe("Passwords do not match");
    expect(document.activeElement?.id).toBe("sign-up-confirm-password");
  });

  it("creates the account, toasts and goes to the menu", async () => {
    vi.mocked(authApi.signUp).mockResolvedValue({ accessToken: "t", user: USER });
    const { wrapper, router } = await setup();

    await fill(wrapper, VALID);
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(authApi.signUp).toHaveBeenCalledWith({
      name: "Mario",
      surname: "Rossi",
      email: "mario@x.io",
      password: "Secret1!",
      confirmPassword: "Secret1!",
    });
    expect(useAuthStore().user).toEqual(USER);
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        detail: "Check your inbox to verify your email",
      })
    );
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe("menu");
    });
  });

  it("maps a taken email onto the email field and focuses it", async () => {
    vi.mocked(authApi.signUp).mockRejectedValue(httpError(409));
    const { wrapper, router } = await setup();

    await fill(wrapper, VALID);
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get("#sign-up-email-message").text()).toBe(
      "An account with this email already exists"
    );
    expect(document.activeElement?.id).toBe("sign-up-email");
    expect(router.currentRoute.value.name).toBe("sign-up");
  });

  it("shows the throttle message on 429", async () => {
    vi.mocked(authApi.signUp).mockRejectedValue(httpError(429));
    const { wrapper } = await setup();

    await fill(wrapper, VALID);
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.get("[data-test='form-error']").text()).toBe(
      "Too many attempts, try again in a minute"
    );
  });

  it("links to sign-in", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("a[href='/sign-in']").text()).toBe("Sign in");
  });
});
