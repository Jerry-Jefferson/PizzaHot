import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

import { useUserById, useUsers, useUsersByIds, useUsersCount } from "@/composables/useUsers";
import * as usersApi from "@/services/api/users";
import type { User } from "@/types/user.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";
import { ADMIN_USERS_PAGE_SIZE } from "@/utils/constants/user.constants";

vi.mock("@/services/api/users", () => ({ getUser: vi.fn(), listUsers: vi.fn() }));

const user = (id: string): User => ({ id, email: `${id}@x.io` }) as User;

function withQuery<T>(
  composable: () => T,
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
): { result: T; queryClient: QueryClient } {
  let result!: T;
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

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(usersApi.getUser).mockImplementation((id) => Promise.resolve(user(id)));
});

describe("useUserById", () => {
  it("loads the user under the users detail key", async () => {
    const { result, queryClient } = withQuery(() => useUserById("u1"));
    await flushPromises();

    expect(result.data.value).toEqual(user("u1"));
    expect(queryClient.getQueryData(QUERY_KEYS.users.detail("u1"))).toEqual(user("u1"));
  });

  it("does not request anything for a deleted user", async () => {
    const { result } = withQuery(() => useUserById(null));
    await flushPromises();

    expect(usersApi.getUser).not.toHaveBeenCalled();
    expect(result.data.value).toBeUndefined();
  });
});

describe("useUsersByIds", () => {
  it("loads each distinct id once and skips deleted users", async () => {
    const { result } = withQuery(() => useUsersByIds(["u1", null, "u2", "u1"]));
    await flushPromises();

    expect(usersApi.getUser).toHaveBeenCalledTimes(2);
    expect([...result.value.entries()]).toEqual([
      ["u1", user("u1")],
      ["u2", user("u2")],
    ]);
  });

  it("marks a user that failed to load as null", async () => {
    vi.mocked(usersApi.getUser).mockRejectedValue(new Error("Not found"));
    const { result } = withQuery(() => useUsersByIds(["u1"]));
    await flushPromises();

    expect(result.value.get("u1")).toBeNull();
  });

  it("leaves users that are still loading out of the map", () => {
    vi.mocked(usersApi.getUser).mockReturnValue(new Promise(() => undefined));
    const { result } = withQuery(() => useUsersByIds(["u1"]));

    expect(result.value.has("u1")).toBe(false);
  });

  it("follows a reactive list of ids", async () => {
    const ids = ref<(string | null)[]>(["u1"]);
    const { result } = withQuery(() => useUsersByIds(ids));
    await flushPromises();

    ids.value = ["u2"];
    await flushPromises();

    expect([...result.value.keys()]).toEqual(["u2"]);
  });

  it("reuses users already cached by useUserById", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    withQuery(() => useUserById("u1"), queryClient);
    await flushPromises();

    const { result } = withQuery(() => useUsersByIds(["u1"]), queryClient);
    await flushPromises();

    expect(usersApi.getUser).toHaveBeenCalledTimes(1);
    expect(result.value.get("u1")).toEqual(user("u1"));
  });
});

describe("useUsersCount", () => {
  it("returns the total number of users from a one-item page", async () => {
    vi.mocked(usersApi.listUsers).mockResolvedValue({
      data: [user("u1")],
      page: 1,
      limit: 1,
      total: 42,
      totalPages: 42,
    });
    const { result } = withQuery(() => useUsersCount());
    await flushPromises();

    expect(usersApi.listUsers).toHaveBeenCalledWith({ page: 1, limit: 1 });
    expect(result.data.value).toBe(42);
  });
});

describe("useUsers", () => {
  const page = (data: User[]) => ({ data, page: 1, limit: 10, total: data.length, totalPages: 1 });

  it("lists the first page of users by default", async () => {
    vi.mocked(usersApi.listUsers).mockResolvedValue(page([user("u1")]));

    const { result } = withQuery(() => useUsers());
    await flushPromises();

    expect(usersApi.listUsers).toHaveBeenCalledWith({ page: 1, limit: ADMIN_USERS_PAGE_SIZE });
    expect(result.data.value?.data).toEqual([user("u1")]);
  });

  it("sends a trimmed search and leaves out a blank one", async () => {
    vi.mocked(usersApi.listUsers).mockResolvedValue(page([]));
    const query = ref({ page: 2, limit: 5, search: "  ada " });

    withQuery(() => useUsers(query));
    await flushPromises();
    expect(usersApi.listUsers).toHaveBeenLastCalledWith({ page: 2, limit: 5, search: "ada" });

    query.value = { page: 1, limit: 5, search: "   " };
    await flushPromises();
    expect(usersApi.listUsers).toHaveBeenLastCalledWith({ page: 1, limit: 5 });
  });

  it("keeps the previous page on screen while the next one loads", async () => {
    vi.mocked(usersApi.listUsers).mockResolvedValueOnce(page([user("u1")]));
    vi.mocked(usersApi.listUsers).mockReturnValueOnce(new Promise(() => undefined));
    const query = ref({ page: 1 });

    const { result } = withQuery(() => useUsers(query));
    await flushPromises();
    query.value = { page: 2 };
    await flushPromises();

    expect(result.data.value?.data).toEqual([user("u1")]);
  });
});
