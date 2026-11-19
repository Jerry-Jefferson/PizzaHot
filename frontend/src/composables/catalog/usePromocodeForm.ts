import { helpers } from "@vuelidate/validators";
import { type ComputedRef, type MaybeRefOrGetter, reactive, type Ref, ref, toValue } from "vue";

import { useValidatedForm } from "@/composables/common/useValidatedForm";
import {
  DiscountMode,
  type Promocode,
  type PromocodeField,
  type PromocodeFormErrors,
  type PromocodeFormMode,
  type PromocodeFormValues,
  type PromocodePayload,
} from "@/types/promocode.types";
import {
  INACTIVE_PROMOCODE_EDIT_MESSAGE,
  MAX_PERCENTAGE_DISCOUNT,
  PROMOCODE_CODE_MAX_LENGTH,
  PROMOCODE_CODE_TAKEN_MESSAGE,
} from "@/utils/constants/promocode.constants";
import { getErrorStatus } from "@/utils/errors";
import { startOfTomorrow, toExpiryDay, toExpiryTimestamp } from "@/utils/promocode";

const PROMOCODE_FIELDS: readonly PromocodeField[] = [
  "code",
  "discount",
  "discountMode",
  "validTill",
];

interface PromocodeForm {
  form: PromocodeFormValues;
  isActive: Ref<boolean>;
  errors: ComputedRef<PromocodeFormErrors>;
  formError: Ref<string | null>;
  touch: (field: PromocodeField) => void;
  validate: () => Promise<boolean>;
  fill: (promocode?: Promocode) => void;
  toPayload: () => PromocodePayload;
  applyServerError: (error: unknown) => void;
}

const isFilled = (value: string): boolean => value.trim().length > 0;
const fitsCodeLength = (value: string): boolean => value.trim().length <= PROMOCODE_CODE_MAX_LENGTH;
const isPositiveWholeNumber = (value: number | null): boolean =>
  value !== null && Number.isInteger(value) && value > 0;
const isPicked = (value: Date | null): boolean => value !== null;

export function usePromocodeForm(mode: MaybeRefOrGetter<PromocodeFormMode>): PromocodeForm {
  const form = reactive<PromocodeFormValues>({
    code: "",
    discount: null,
    discountMode: DiscountMode.PERCENTAGE,
    validTill: null,
  });
  const isActive = ref(true);
  const wasActive = ref(true);

  const fitsPercentage = (value: number | null): boolean =>
    form.discountMode !== DiscountMode.PERCENTAGE ||
    value === null ||
    value <= MAX_PERCENTAGE_DISCOUNT;

  const isFutureOnCreate = (value: Date | null): boolean =>
    toValue(mode) === "edit" || value === null || value >= startOfTomorrow();

  const rules = {
    code: {
      required: helpers.withMessage("Code cannot be empty", isFilled),
      maxLength: helpers.withMessage(
        `Code cannot exceed ${String(PROMOCODE_CODE_MAX_LENGTH)} characters`,
        fitsCodeLength
      ),
    },
    discount: {
      positive: helpers.withMessage(
        "Discount must be a positive whole number",
        isPositiveWholeNumber
      ),
      percentage: helpers.withMessage(
        `Percentage discount cannot exceed ${String(MAX_PERCENTAGE_DISCOUNT)}`,
        fitsPercentage
      ),
    },
    discountMode: {},
    validTill: {
      required: helpers.withMessage("Choose an expiry date", isPicked),
      future: helpers.withMessage("Expiry date must be in the future", isFutureOnCreate),
    },
  };

  const { v$, server, errors, touch, validate, formError } = useValidatedForm(
    PROMOCODE_FIELDS,
    form,
    rules
  );

  function fill(promocode?: Promocode): void {
    form.code = promocode?.code ?? "";
    form.discount = promocode?.discount ?? null;
    form.discountMode = promocode?.discountMode ?? DiscountMode.PERCENTAGE;
    form.validTill = promocode ? toExpiryDay(promocode.validTill) : null;
    isActive.value = !promocode?.deletedAt;
    wasActive.value = isActive.value;
    server.clear();
    v$.value.$reset();
  }

  function toPayload(): PromocodePayload {
    return {
      code: form.code.trim().toUpperCase(),
      discount: form.discount ?? 0,
      discountMode: form.discountMode,
      validTill: form.validTill ? toExpiryTimestamp(form.validTill) : "",
    };
  }

  function applyServerError(error: unknown): void {
    const status = getErrorStatus(error);
    if (status === 409) {
      server.setFieldError("code", PROMOCODE_CODE_TAKEN_MESSAGE);
      return;
    }
    if (status === 404 && !wasActive.value && !isActive.value) {
      formError.value = INACTIVE_PROMOCODE_EDIT_MESSAGE;
      return;
    }
    server.apply(error);
  }

  return {
    form,
    isActive,
    errors,
    formError,
    touch,
    validate,
    fill,
    toPayload,
    applyServerError,
  };
}
