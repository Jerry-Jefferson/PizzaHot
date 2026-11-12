import { mount } from "@vue/test-utils";
import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from "axios";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";

import { useCheckoutForm } from "@/composables/useCheckoutForm";
import { DeliveryType, PaymentMethod } from "@/types/order.types";

function setup() {
  let result!: ReturnType<typeof useCheckoutForm>;
  mount(
    defineComponent({
      setup: () => {
        result = useCheckoutForm();
        return () => null;
      },
    })
  );
  return result;
}

describe("useCheckoutForm", () => {
  it("starts with delivery and card online selected", () => {
    const { form } = setup();

    expect(form.delivery).toBe(DeliveryType.DELIVERY);
    expect(form.paymentMethod).toBe(PaymentMethod.CARD_ONLINE);
  });

  it("requires a non-blank address for delivery", async () => {
    const checkout = setup();
    checkout.form.address = "   ";

    expect(await checkout.validate()).toBe(false);
    expect(checkout.errors.value.address).toBe("Address is required for delivery");
    expect(checkout.firstInvalidField.value).toBe("address");
  });

  it("does not require an address for pickup", async () => {
    const checkout = setup();
    checkout.form.delivery = DeliveryType.PICKUP;

    expect(await checkout.validate()).toBe(true);
    expect(checkout.errors.value.address).toBeUndefined();
  });

  it("limits the address to 255 characters", async () => {
    const checkout = setup();
    checkout.form.address = "a".repeat(256);

    expect(await checkout.validate()).toBe(false);
    expect(checkout.errors.value.address).toBe("Address must be at most 255 characters");

    checkout.form.address = "a".repeat(255);
    expect(await checkout.validate()).toBe(true);
  });

  it("limits the comment to 500 characters", async () => {
    const checkout = setup();
    checkout.form.delivery = DeliveryType.PICKUP;
    checkout.form.comment = "a".repeat(501);

    expect(await checkout.validate()).toBe(false);
    expect(checkout.errors.value.comment).toBe("Comment must be at most 500 characters");
  });

  it("requires a payment method", async () => {
    const checkout = setup();
    checkout.form.delivery = DeliveryType.PICKUP;
    checkout.form.paymentMethod = "";

    expect(await checkout.validate()).toBe(false);
    expect(checkout.errors.value.paymentMethod).toBe("Choose a payment method");
  });

  it("builds a delivery payload with trimmed values", () => {
    const checkout = setup();
    checkout.form.address = "  1 Pizza Street ";
    checkout.form.comment = "  Ring twice ";
    checkout.form.paymentMethod = PaymentMethod.CASH;

    expect(checkout.toPayload()).toEqual({
      delivery: "delivery",
      paymentMethod: "cash",
      address: "1 Pizza Street",
      comment: "Ring twice",
    });
  });

  it("omits the address for pickup and sends an empty comment as null", () => {
    const checkout = setup();
    checkout.form.delivery = DeliveryType.PICKUP;
    checkout.form.address = "left over";
    checkout.form.comment = "   ";

    expect(checkout.toPayload()).toEqual({
      delivery: "pickup",
      paymentMethod: "card_online",
      comment: null,
    });
  });

  it("maps server field errors and clears them when the field changes", async () => {
    const checkout = setup();
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
    checkout.applyServerError(
      new AxiosError("Bad", "ERR_BAD_REQUEST", config, null, {
        data: { formErrors: [], fieldErrors: { address: ["Address is required for delivery"] } },
        status: 400,
        statusText: "",
        headers: {} as RawAxiosResponseHeaders,
        config,
      })
    );

    expect(checkout.errors.value.address).toBe("Address is required for delivery");

    checkout.form.address = "1 Pizza Street";
    await Promise.resolve();

    expect(checkout.errors.value.address).toBeUndefined();
  });
});
