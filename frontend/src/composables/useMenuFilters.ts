import { computed, onWatcherCleanup, type Ref, ref, watch, type WritableComputedRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { logError } from "@/utils/logger";
import { firstQueryValue, parsePageQuery } from "@/utils/route-query";

export const SEARCH_DEBOUNCE_MS = 300;

interface MenuFilters {
  searchInput: Ref<string>;
  search: Readonly<Ref<string>>;
  page: WritableComputedRef<number>;
  clearSearch: () => void;
}

export function useMenuFilters(): MenuFilters {
  const route = useRoute();
  const router = useRouter();

  const search = computed(() => firstQueryValue(route.query.search).trim());
  const searchInput = ref(search.value);

  const page = computed({
    get: () => parsePageQuery(route.query.page),
    set: (value: number) => {
      router
        .push({ query: { ...route.query, page: value > 1 ? String(value) : undefined } })
        .catch(logError("Menu page navigation"));
    },
  });

  function applySearch(value: string): void {
    const nextSearch = value.trim();
    if (nextSearch === search.value) {
      return;
    }
    router
      .replace({ query: { ...route.query, search: nextSearch || undefined, page: undefined } })
      .catch(logError("Menu search navigation"));
  }

  watch(searchInput, (value) => {
    const timer = setTimeout(() => {
      applySearch(value);
    }, SEARCH_DEBOUNCE_MS);
    onWatcherCleanup(() => {
      clearTimeout(timer);
    });
  });

  watch(search, (value) => {
    if (value !== searchInput.value.trim()) {
      searchInput.value = value;
    }
  });

  function clearSearch(): void {
    searchInput.value = "";
    applySearch("");
  }

  return { searchInput, search, page, clearSearch };
}
