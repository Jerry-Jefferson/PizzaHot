import { helpers } from "@vuelidate/validators";
import {
  computed,
  type ComputedRef,
  type MaybeRefOrGetter,
  reactive,
  type Ref,
  ref,
  toValue,
  watch,
} from "vue";

import { useValidatedForm } from "@/composables/common/useValidatedForm";
import type {
  Pizza,
  PizzaField,
  PizzaFormErrors,
  PizzaFormValues,
  PizzaPayload,
} from "@/types/pizza.types";
import { PIZZA_NAME_TAKEN_MESSAGE } from "@/utils/constants/pizza.constants";
import { getErrorStatus } from "@/utils/errors";

const PIZZA_FIELDS: readonly PizzaField[] = ["name", "description", "price"];

interface PizzaFormSnapshot extends PizzaFormValues {
  ingredientIds: string[];
}

interface PizzaForm {
  form: PizzaFormValues;
  ingredientIds: Ref<string[]>;
  originalName: ComputedRef<string>;
  isDirty: ComputedRef<boolean>;
  errors: ComputedRef<PizzaFormErrors>;
  formError: Ref<string | null>;
  touch: (field: PizzaField) => void;
  validate: () => Promise<boolean>;
  toPayload: () => PizzaPayload;
  markSaved: (pizza: Pizza) => void;
  applyServerError: (error: unknown) => void;
}

const isFilled = (value: string): boolean => value.trim().length > 0;
const isPositivePrice = (value: number | null): boolean => value !== null && value > 0;

function snapshotOf(pizza: Pizza | undefined): PizzaFormSnapshot {
  return {
    name: pizza?.name ?? "",
    description: pizza?.description ?? "",
    price: pizza?.price ?? null,
    ingredientIds: (pizza?.ingredients ?? []).map((ingredient) => ingredient.id),
  };
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id) => right.includes(id));
}

export function usePizzaForm(pizza?: MaybeRefOrGetter<Pizza | undefined>): PizzaForm {
  const form = reactive<PizzaFormValues>({ name: "", description: "", price: null });
  const ingredientIds = ref<string[]>([]);
  const saved = ref<PizzaFormSnapshot>(snapshotOf(undefined));
  const loadedPizzaId = ref<string | null>(null);

  const rules = {
    name: { required: helpers.withMessage("Name cannot be empty", isFilled) },
    description: { required: helpers.withMessage("Description cannot be empty", isFilled) },
    price: { positive: helpers.withMessage("Price must be greater than 0", isPositivePrice) },
  };

  const { v$, server, errors, touch, validate, formError } = useValidatedForm(
    PIZZA_FIELDS,
    form,
    rules
  );

  function fill(snapshot: PizzaFormSnapshot): void {
    form.name = snapshot.name;
    form.description = snapshot.description;
    form.price = snapshot.price;
    ingredientIds.value = [...snapshot.ingredientIds];
    saved.value = snapshot;
    v$.value.$reset();
  }

  watch(
    () => toValue(pizza),
    (current) => {
      if (current && current.id !== loadedPizzaId.value) {
        loadedPizzaId.value = current.id;
        fill(snapshotOf(current));
      }
    },
    { immediate: true }
  );

  const isDirty = computed(
    () =>
      form.name !== saved.value.name ||
      form.description !== saved.value.description ||
      form.price !== saved.value.price ||
      !sameIds(ingredientIds.value, saved.value.ingredientIds)
  );

  function toPayload(): PizzaPayload {
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price ?? 0,
      ingredientIds: [...ingredientIds.value],
    };
  }

  function markSaved(savedPizza: Pizza): void {
    loadedPizzaId.value = savedPizza.id;
    fill(snapshotOf(savedPizza));
  }

  function applyServerError(error: unknown): void {
    if (getErrorStatus(error) === 409) {
      server.setFieldError("name", PIZZA_NAME_TAKEN_MESSAGE);
      return;
    }
    server.apply(error);
  }

  return {
    form,
    ingredientIds,
    originalName: computed(() => saved.value.name),
    isDirty,
    errors,
    formError,
    touch,
    validate,
    toPayload,
    markSaved,
    applyServerError,
  };
}
