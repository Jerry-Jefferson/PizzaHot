import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import * as ordersApi from "@/api/orders";
import * as usersApi from "@/api/users";
import BaseConfirmDialog from "@/components/base/BaseConfirmDialog.vue";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { Order } from "@/types/order.types";
import type { User } from "@/types/user.types";
import ProfileView from "@/views/ProfileView.vue";

vi.mock("@/api/users", () => ({ updateMe: vi.fn(), changePassword: vi.fn(), deleteMe: vi.fn() }));
vi.mock("@/api/orders", () => ({ listMyOrders: vi.fn() }));
vi.mock("@/api/auth", () => ({ me: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

const USER: User = {
  id: "u1",
  role: "user",
  email: "mario@x.io",
  name: "Mario",
  surname: "Rossi",
  gender: "male",
  image: null,
  isEmailVerified: true,
  createdAt: "2024-03-15T10:00:00.000Z",
  updatedAt: "2024-03-15T10:00:00.000Z",
};

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
const httpError = (status: number, message = "Failed") =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data: { statusCode: status, message },
    status,
    statusText: "",
    headers: {} as RawAxiosResponseHeaders,
    config,
  });

let wrapper: VueWrapper | undefined;

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
);

async function setup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useAuthStore().setUser(USER);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/profile");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Host = defineComponent({ setup: () => () => [h(ProfileView), h(BaseConfirmDialog)] });
  wrapper = mount(Host, {
    attachTo: document.body,
    global: {
      plugins: [pinia, router, PrimeVue, ConfirmationService, [VueQueryPlugin, { queryClient }]],
    },
  });
  await flushPromises();
  return { wrapper, router, queryClient };
}

const forms = (target: VueWrapper) => target.findAll("form");
const fieldError = (target: VueWrapper, id: string) => target.find(`#${id}-message`);

async function fillPassword(target: VueWrapper, values: [string, string, string]) {
  await target.get("#current-password").setValue(values[0]);
  await target.get("#new-password").setValue(values[1]);
  await target.get("#confirm-new-password").setValue(values[2]);
  await forms(target)[1]?.trigger("submit");
  await flushPromises();
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(ordersApi.listMyOrders).mockResolvedValue({
    data: [{ id: "o1" } as Order],
    page: 1,
    limit: 1,
    total: 7,
    totalPages: 7,
  });
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("ProfileView", () => {
  it("shows the user, prefilled personal info and the read-only email", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("h1").text()).toBe("My Profile");
    expect(wrapper.text()).toContain("Mario Rossi");
    expect(wrapper.get<HTMLInputElement>("#profile-name").element.value).toBe("Mario");
    expect(wrapper.get<HTMLInputElement>("#profile-surname").element.value).toBe("Rossi");
    expect(wrapper.text()).toContain("Male");
    const email = wrapper.get<HTMLInputElement>("#profile-email");
    expect(email.element.value).toBe("mario@x.io");
    expect(email.attributes()).toHaveProperty("disabled");
    expect(wrapper.text()).toContain("Email cannot be changed");
  });

  it("shows the total orders and the member-since month", async () => {
    const { wrapper } = await setup();

    expect(ordersApi.listMyOrders).toHaveBeenCalledWith({ page: 1, limit: 1 });
    expect(wrapper.get("[data-test='total-orders']").text()).toContain("7");
    expect(wrapper.get("[data-test='member-since']").text()).toContain("Mar 2024");
  });

  describe("personal info", () => {
    it("sends all three fields, with empty values as null", async () => {
      vi.mocked(usersApi.updateMe).mockResolvedValue({ ...USER, surname: null, name: "Luigi" });
      const { wrapper } = await setup();

      await wrapper.get("#profile-name").setValue("  Luigi ");
      await wrapper.get("#profile-surname").setValue("   ");
      await forms(wrapper)[0]?.trigger("submit");
      await flushPromises();

      expect(usersApi.updateMe).toHaveBeenCalledWith({
        name: "Luigi",
        surname: null,
        gender: "male",
      });
      expect(useAuthStore().user?.name).toBe("Luigi");
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success", summary: "Profile updated" })
      );
    });

    it("rejects a name longer than 100 characters", async () => {
      const { wrapper } = await setup();

      await wrapper.get("#profile-name").setValue("a".repeat(101));
      await forms(wrapper)[0]?.trigger("submit");
      await flushPromises();

      expect(fieldError(wrapper, "profile-name").text()).toBe(
        "First name must be at most 100 characters"
      );
      expect(usersApi.updateMe).not.toHaveBeenCalled();
    });

    it("maps server field errors onto the fields", async () => {
      vi.mocked(usersApi.updateMe).mockRejectedValue(
        new AxiosError("Bad", "ERR_BAD_REQUEST", config, null, {
          data: { formErrors: [], fieldErrors: { surname: ["Surname must not be empty"] } },
          status: 400,
          statusText: "",
          headers: {} as RawAxiosResponseHeaders,
          config,
        })
      );
      const { wrapper } = await setup();

      await forms(wrapper)[0]?.trigger("submit");
      await flushPromises();

      expect(fieldError(wrapper, "profile-surname").text()).toBe("Surname must not be empty");
    });
  });

  describe("change password", () => {
    it("updates the password, clears the form and toasts", async () => {
      vi.mocked(usersApi.changePassword).mockResolvedValue();
      const { wrapper } = await setup();

      await fillPassword(wrapper, ["OldSecret1!", "NewSecret1!", "NewSecret1!"]);

      expect(usersApi.changePassword).toHaveBeenCalledWith({
        currentPassword: "OldSecret1!",
        newPassword: "NewSecret1!",
      });
      expect(wrapper.get<HTMLInputElement>("#current-password").element.value).toBe("");
      expect(wrapper.get<HTMLInputElement>("#new-password").element.value).toBe("");
      expect(fieldError(wrapper, "current-password").exists()).toBe(false);
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success", summary: "Password updated" })
      );
    });

    it("validates lengths, difference and confirmation on the client", async () => {
      const { wrapper } = await setup();

      await fillPassword(wrapper, ["short", "short", "other"]);

      expect(fieldError(wrapper, "current-password").text()).toBe(
        "Current password must be at least 8 characters"
      );
      expect(fieldError(wrapper, "new-password").text()).toBe(
        "New password must be at least 8 characters"
      );
      expect(fieldError(wrapper, "confirm-new-password").text()).toBe("Passwords do not match");
      expect(usersApi.changePassword).not.toHaveBeenCalled();
    });

    it("requires the new password to differ from the current one", async () => {
      const { wrapper } = await setup();

      await fillPassword(wrapper, ["SamePass1!", "SamePass1!", "SamePass1!"]);

      expect(fieldError(wrapper, "new-password").text()).toBe(
        "New password must be different from the current password"
      );
    });

    it("shows a wrong current password on its field and keeps the session", async () => {
      vi.mocked(usersApi.changePassword).mockRejectedValue(
        httpError(401, "Current password is incorrect")
      );
      const { wrapper, router } = await setup();

      await fillPassword(wrapper, ["WrongPass1!", "NewSecret1!", "NewSecret1!"]);

      expect(fieldError(wrapper, "current-password").text()).toBe("Current password is incorrect");
      expect(useAuthStore().user).toEqual(USER);
      expect(router.currentRoute.value.name).toBe("profile");
    });
  });

  describe("delete account", () => {
    async function openConfirm(target: VueWrapper) {
      const trigger = target.findAll("button").find((b) => b.text() === "Delete my account");
      await trigger?.trigger("click");
      await flushPromises();
      return [...document.querySelectorAll<HTMLButtonElement>("[role='alertdialog'] button")];
    }

    it("asks for confirmation before deleting", async () => {
      const { wrapper } = await setup();

      const buttons = await openConfirm(wrapper);

      expect(document.body.textContent).toContain("Delete account?");
      expect(buttons.map((button) => button.textContent.trim())).toEqual([
        "Cancel",
        "Delete account",
      ]);
      expect(usersApi.deleteMe).not.toHaveBeenCalled();
    });

    it("deletes the account, signs out, clears the cache and goes to sign-in", async () => {
      vi.mocked(usersApi.deleteMe).mockResolvedValue();
      const { wrapper, router, queryClient } = await setup();
      const clear = vi.spyOn(queryClient, "clear");

      const buttons = await openConfirm(wrapper);
      buttons[1]?.click();
      await flushPromises();

      expect(usersApi.deleteMe).toHaveBeenCalledOnce();
      expect(useAuthStore().user).toBeNull();
      await vi.waitFor(() => {
        expect(router.currentRoute.value.name).toBe("sign-in");
      });
      await flushPromises();
      expect(clear).toHaveBeenCalledOnce();
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success", summary: "Account deleted" })
      );
    });

    it("keeps the user signed in when deletion fails", async () => {
      vi.mocked(usersApi.deleteMe).mockRejectedValue(httpError(500, "Boom"));
      const { wrapper, router } = await setup();

      const buttons = await openConfirm(wrapper);
      buttons[1]?.click();
      await flushPromises();

      expect(useAuthStore().user).toEqual(USER);
      expect(router.currentRoute.value.name).toBe("profile");
      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error", detail: "Boom" })
      );
    });
  });
});
