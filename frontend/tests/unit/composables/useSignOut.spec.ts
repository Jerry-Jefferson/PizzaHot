import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import * as authApi from "@/api/auth";
import { useSignOut } from "@/composables/useSignOut";
import { routes } from "@/router/routes";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/user.types";

vi.mock("@/api/auth", () => ({ signOut: vi.fn(), me: vi.fn(), signIn: vi.fn(), signUp: vi.fn() }));

const USER = { id: "u1", role: "user", email: "mario@x.io" } as User;

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("primevue/usetoast", () => ({ useToast: () => ({ add: toastAdd }) }));

async function setup() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useAuthStore().setUser(USER);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/profile");

  let result!: ReturnType<typeof useSignOut>;
  mount(
    defineComponent({
      setup: () => {
        result = useSignOut();
        return () => null;
      },
    }),
    { global: { plugins: [pinia, router, PrimeVue, ToastService] } }
  );
  return { router, signOut: result.signOut };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useSignOut", () => {
  it("signs out and goes to sign-in", async () => {
    vi.mocked(authApi.signOut).mockResolvedValue();
    const { router, signOut } = await setup();

    await signOut();
    await flushPromises();

    expect(useAuthStore().user).toBeNull();
    expect(router.currentRoute.value.name).toBe("sign-in");
    expect(toastAdd).not.toHaveBeenCalled();
  });

  it("shows an error toast but still leaves when the request fails", async () => {
    vi.mocked(authApi.signOut).mockRejectedValue(new Error("Boom"));
    const { router, signOut } = await setup();

    await signOut();
    await flushPromises();

    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", summary: "Sign-out failed" })
    );
    expect(useAuthStore().user).toBeNull();
    expect(router.currentRoute.value.name).toBe("sign-in");
  });
});
