import { useVuelidate } from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { computed, type ComputedRef, reactive, type Ref, toValue } from "vue";

import {
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutFormValues,
  type CreateOrderPayload,
  DeliveryType,
  PaymentMethod,
} from "@/types/order.types";
import { ADDRESS_MAX, ORDER_COMMENT_MAX } from "@/utils/constants/limits";

import { useServerFormErrors } from "./useServerFormErrors";

export const CHECKOUT_FIELDS: readonly CheckoutField[] = [
  "delivery",
  "paymentMethod",
  "address",
  "comment",
];

interface CheckoutForm {
  form: CheckoutFormValues;
  errors: ComputedRef<CheckoutErrors>;
  formError: Ref<string | null>;
  firstInvalidField: ComputedRef<CheckoutField | undefined>;
  touch: (field: CheckoutField) => void;
  validate: () => Promise<boolean>;
  toPayload: () => CreateOrderPayload;
  applyServerError: (error: unknown) => void;
}

const fitsLength =
  (max: number) =>
  (value: string): boolean =>
    value.trim().length <= max;

export function useCheckoutForm(): CheckoutForm {
  const form = reactive<CheckoutFormValues>({
    delivery: DeliveryType.DELIVERY,
    paymentMethod: PaymentMethod.CARD_ONLINE,
    address: "",
    comment: "",
  });
  const server = useServerFormErrors(CHECKOUT_FIELDS, form);

  const isDelivery = computed(() => form.delivery === DeliveryType.DELIVERY);

  const rules = {
    delivery: { required: helpers.withMessage("Choose how to get your order", required) },
    paymentMethod: { required: helpers.withMessage("Choose a payment method", required) },
    address: {
      requiredForDelivery: helpers.withMessage(
        "Address is required for delivery",
        (value: string) => !isDelivery.value || value.trim().length > 0
      ),
      maxLength: helpers.withMessage(
        `Address must be at most ${String(ADDRESS_MAX)} characters`,
        (value: string) => !isDelivery.value || fitsLength(ADDRESS_MAX)(value)
      ),
    },
    comment: {
      maxLength: helpers.withMessage(
        `Comment must be at most ${String(ORDER_COMMENT_MAX)} characters`,
        fitsLength(ORDER_COMMENT_MAX)
      ),
    },
  };

  const v$ = useVuelidate(rules, form);

  const errors = computed<CheckoutErrors>(() =>
    Object.fromEntries(
      CHECKOUT_FIELDS.map((field) => {
        const clientError = v$.value[field].$errors[0]?.$message;
        return [field, clientError ? toValue(clientError) : server.fieldErrors.value[field]];
      })
    )
  );

  const firstInvalidField = computed(() => CHECKOUT_FIELDS.find((field) => errors.value[field]));

  function touch(field: CheckoutField): void {
    v$.value[field].$touch();
  }

  async function validate(): Promise<boolean> {
    server.clear();
    return v$.value.$validate();
  }

  function toPayload(): CreateOrderPayload {
    if (form.paymentMethod === "") {
      throw new Error("Payment method is required");
    }
    const comment = form.comment.trim();
    return {
      delivery: form.delivery,
      paymentMethod: form.paymentMethod,
      ...(isDelivery.value ? { address: form.address.trim() } : {}),
      comment: comment === "" ? null : comment,
    };
  }

  function applyServerError(error: unknown): void {
    server.apply(error);
  }

  return {
    form,
    errors,
    formError: server.formError,
    firstInvalidField,
    touch,
    validate,
    toPayload,
    applyServerError,
  };
}
