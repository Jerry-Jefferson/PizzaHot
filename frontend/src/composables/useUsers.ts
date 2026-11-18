import {
  keepPreviousData,
  useQueries,
  useQuery,
  type UseQueryReturnType,
} from "@tanstack/vue-query";
import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from "vue";

import { getUser, listUsers } from "@/services/api/users";
import type { Paginated } from "@/types/pagination.types";
import type { User, UserListQuery } from "@/types/user.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";
import { ADMIN_USERS_PAGE_SIZE, USER_DETAILS_STALE_MS } from "@/utils/constants/user.constants";

export function useUserById(id: MaybeRefOrGetter<string | null>): UseQueryReturnType<User, Error> {
  const userId = computed(() => toValue(id));

  return useQuery({
    queryKey: QUERY_KEYS.users.detail(computed(() => userId.value ?? "")),
    queryFn: () => getUser(userId.value ?? ""),
    staleTime: USER_DETAILS_STALE_MS,
    enabled: computed(() => userId.value !== null),
  });
}

export function useUsersByIds(
  ids: MaybeRefOrGetter<readonly (string | null)[]>
): ComputedRef<Map<string, User | null>> {
  const uniqueIds = computed(() => [
    ...new Set(toValue(ids).filter((id): id is string => id !== null)),
  ]);

  const results = useQueries({
    queries: computed(() =>
      uniqueIds.value.map((id) => ({
        queryKey: QUERY_KEYS.users.detail(id),
        queryFn: () => getUser(id),
        staleTime: USER_DETAILS_STALE_MS,
      }))
    ),
  });

  return computed(() => {
    const users = new Map<string, User | null>();
    uniqueIds.value.forEach((id, index) => {
      const result = results.value[index];
      if (result?.data) {
        users.set(id, result.data);
      } else if (result?.isError) {
        users.set(id, null);
      }
    });
    return users;
  });
}

export function useUsersCount(): UseQueryReturnType<number, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(1, 1, ""),
    queryFn: () => listUsers({ page: 1, limit: 1 }),
    select: (page) => page.total,
  });
}

export function useUsers(
  query: MaybeRefOrGetter<UserListQuery> = {}
): UseQueryReturnType<Paginated<User>, Error> {
  const page = computed(() => toValue(query).page ?? 1);
  const limit = computed(() => toValue(query).limit ?? ADMIN_USERS_PAGE_SIZE);
  const search = computed(() => toValue(query).search?.trim() ?? "");

  return useQuery({
    queryKey: QUERY_KEYS.users.list(page, limit, search),
    queryFn: () =>
      listUsers({
        page: page.value,
        limit: limit.value,
        ...(search.value && { search: search.value }),
      }),
    placeholderData: keepPreviousData,
  });
}
