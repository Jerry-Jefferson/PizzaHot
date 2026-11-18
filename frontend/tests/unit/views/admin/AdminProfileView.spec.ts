import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { routes } from "@/router/routes";
import * as usersApi from "@/services/api/users";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";
import AdminProfileView from "@/views/admin/AdminProfileView.vue";

vi.mock("@/services/api/users", () => ({
  updateMe: vi.fn(),
  changePassword: vi.fn(),
  deleteMe: vi.fn(),
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

const ADMIN: User = {
  id: "a1",
  role: "admin",
  email: "admin@pizzahot.io",
  name: "Sofia",
  surname: "Bianchi",
  gender: "female",
  image: null,
  isEmailVerified: true,
  createdAt: "2024-01-10T10:00:00.000Z",
  updatedAt: "2024-01-10T10:00:00.000Z",
};

let wrapper: VueWrapper | undefined;

async function setup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useAuthStore().setUser(ADMIN);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/admin/profile");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  wrapper = mount(AdminProfileView, {
    attachTo: document.body,
    global: { plugins: [pinia, router, PrimeVue, [VueQueryPlugin, { queryClient }]] },
  });
  await flushPromises();
  return { wrapper };
}

const forms = (target: VueWrapper) => target.findAll("form");

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
});

describe("AdminProfileView", () => {
  it("shows the admin with an Administrator badge", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).toContain("Profile");
    expect(wrapper.get("[data-test='admin-name']").text()).toBe("Sofia Bianchi");
    expect(wrapper.get("[data-test='admin-email']").text()).toBe("admin@pizzahot.io");
    expect(wrapper.get("[data-test='admin-badge']").text()).toBe("Administrator");
  });

  it("prefills personal info and points to support for email changes", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get<HTMLInputElement>("#profile-name").element.value).toBe("Sofia");
    expect(wrapper.get<HTMLInputElement>("#profile-surname").element.value).toBe("Bianchi");
    const email = wrapper.get<HTMLInputElement>("#profile-email");
    expect(email.element.value).toBe("admin@pizzahot.io");
    expect(email.attributes()).toHaveProperty("disabled");
    expect(wrapper.text()).toContain("Contact technical support to change the admin email.");
    expect(wrapper.text()).not.toContain("Email cannot be changed");
  });

  it("has no danger zone", async () => {
    const { wrapper } = await setup();

    expect(wrapper.text()).not.toContain("Delete my account");
    expect(wrapper.text()).not.toContain("Danger zone");
  });

  it("saves personal info", async () => {
    vi.mocked(usersApi.updateMe).mockResolvedValue({ ...ADMIN, name: "Sara" });
    const { wrapper } = await setup();

    await wrapper.get("#profile-name").setValue("Sara");
    await forms(wrapper)[0]?.trigger("submit");
    await flushPromises();

    expect(usersApi.updateMe).toHaveBeenCalledWith({
      name: "Sara",
      surname: "Bianchi",
      gender: "female",
    });
    expect(wrapper.get("[data-test='admin-name']").text()).toBe("Sara Bianchi");
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Profile updated" })
    );
  });

  it("changes the password and clears the form", async () => {
    vi.mocked(usersApi.changePassword).mockResolvedValue();
    const { wrapper } = await setup();

    await wrapper.get("#current-password").setValue("OldSecret1!");
    await wrapper.get("#new-password").setValue("NewSecret1!");
    await wrapper.get("#confirm-new-password").setValue("NewSecret1!");
    await forms(wrapper)[1]?.trigger("submit");
    await flushPromises();

    expect(usersApi.changePassword).toHaveBeenCalledWith({
      currentPassword: "OldSecret1!",
      newPassword: "NewSecret1!",
    });
    expect(wrapper.get<HTMLInputElement>("#current-password").element.value).toBe("");
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success", summary: "Password updated" })
    );
  });
});
