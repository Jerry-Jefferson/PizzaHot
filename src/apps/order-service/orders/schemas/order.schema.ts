import { z } from "zod";
import { DeliveryType } from "../constants/delivery-type.constant.ts";
import { PaymentMethod } from "../constants/payment-method.constant.ts";
import { ORDER_STATUSES } from "../constants/order-status.constant.ts";
import { paginationSchema } from "../../../../libs/common/pagination/pagination.schema.ts";

export const createOrderSchema = z
  .object({
    address: z
      .string({ error: "Address must be a string" })
      .trim()
      .max(255, { message: "Address must be at most 255 characters" })
      .optional(),
    delivery: z.enum([DeliveryType.DELIVERY, DeliveryType.PICKUP], {
      error: "Delivery must be either 'delivery' or 'pickup'",
    }),
    paymentMethod: z.enum(
      [PaymentMethod.CARD_ONLINE, PaymentMethod.CARD_ON_DELIVERY, PaymentMethod.CASH],
      {
        error: "paymentMethod must be one of: 'card_online', 'card_on_delivery', 'cash'",
      }
    ),
    comment: z
      .string({ error: "Comment must be a string" })
      .trim()
      .max(500, { message: "Comment must be at most 500 characters" })
      .nullish(),
  })
  .refine(
    (data) => {
      if (data.delivery === DeliveryType.DELIVERY) {
        return Boolean(data.address && data.address.trim().length > 0);
      }
      return true;
    },
    {
      message: "Address is required for delivery",
      path: ["address"],
    }
  );

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, {
    error: `Status must be one of: ${ORDER_STATUSES.map((s) => `'${s}'`).join(", ")}`,
  }),
});

export const listOrdersQuerySchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  delivery: z.enum([DeliveryType.DELIVERY, DeliveryType.PICKUP]).optional(),
  paymentMethod: z
    .enum([PaymentMethod.CARD_ONLINE, PaymentMethod.CARD_ON_DELIVERY, PaymentMethod.CASH])
    .optional(),
  userId: z.uuid({ error: "userId must be a valid UUID" }).optional(),
});
