import {
  useMutation,
  type UseMutationReturnType,
  useQuery,
  useQueryClient,
  type UseQueryReturnType,
} from "@tanstack/vue-query";

import {
  createPromocode,
  deletePromocode,
  listPromocodes,
  restorePromocode,
  updatePromocode,
} from "@/services/api/promocodes";
import type { Promocode, PromocodePayload } from "@/types/promocode.types";
import { QUERY_KEYS } from "@/utils/constants/query-keys.constants";
import { getErrorStatus } from "@/utils/errors";

export function usePromocodes(): UseQueryReturnType<Promocode[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.promocodes,
    queryFn: () => listPromocodes(),
  });
}

interface SetPromocodeActiveVariables {
  id: string;
  active: boolean;
}

interface SetPromocodeActiveContext {
  previous: Promocode[] | undefined;
}

async function setActive(id: string, active: boolean): Promise<void> {
  if (active) {
    await restorePromocode(id);
  } else {
    await deletePromocode(id);
  }
}

export function useSetPromocodeActive(): UseMutationReturnType<
  void,
  Error,
  SetPromocodeActiveVariables,
  SetPromocodeActiveContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => setActive(id, active),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.promocodes });
      const previous = queryClient.getQueryData<Promocode[]>(QUERY_KEYS.promocodes);
      const deletedAt = active ? null : new Date().toISOString();
      queryClient.setQueryData<Promocode[]>(QUERY_KEYS.promocodes, (promocodes) =>
        promocodes?.map((promocode) =>
          promocode.id === id ? { ...promocode, deletedAt } : promocode
        )
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(QUERY_KEYS.promocodes, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promocodes }),
  });
}

interface SavePromocodeVariables {
  payload: PromocodePayload;
  existing?: Promocode;
  active?: boolean;
}

async function updateExisting(
  existing: Promocode,
  payload: PromocodePayload,
  active: boolean
): Promise<void> {
  const wasActive = existing.deletedAt === null;
  try {
    await updatePromocode(existing.id, payload);
  } catch (error) {
    if (getErrorStatus(error) !== 404 || wasActive || !active) {
      throw error;
    }
    await restorePromocode(existing.id);
    await updatePromocode(existing.id, payload);
    return;
  }
  if (active !== wasActive) {
    await setActive(existing.id, active);
  }
}

async function savePromocode({
  payload,
  existing,
  active = true,
}: SavePromocodeVariables): Promise<void> {
  if (existing) {
    await updateExisting(existing, payload, active);
  } else {
    await createPromocode(payload);
  }
}

export function useSavePromocode(): UseMutationReturnType<
  void,
  Error,
  SavePromocodeVariables,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => savePromocode(variables),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promocodes }),
  });
}
