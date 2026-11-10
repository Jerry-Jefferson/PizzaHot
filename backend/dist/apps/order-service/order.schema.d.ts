import { z } from "zod";
export declare const createOrderSchema: z.ZodObject<{
    address: z.ZodOptional<z.ZodString>;
    delivery: z.ZodEnum<{
        delivery: "delivery";
        pickup: "pickup";
    }>;
    paymentMethod: z.ZodEnum<{
        card_online: "card_online";
        card_on_delivery: "card_on_delivery";
        cash: "cash";
    }>;
    comment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        pending: "pending";
        confirmed: "confirmed";
        preparing: "preparing";
        ready_for_delivery: "ready_for_delivery";
        delivering: "delivering";
        completed: "completed";
        cancelled: "cancelled";
    }>;
}, z.core.$strip>;
export declare const listOrdersQuerySchema: z.ZodPrefault<z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        confirmed: "confirmed";
        preparing: "preparing";
        ready_for_delivery: "ready_for_delivery";
        delivering: "delivering";
        completed: "completed";
        cancelled: "cancelled";
    }>>;
    delivery: z.ZodOptional<z.ZodEnum<{
        delivery: "delivery";
        pickup: "pickup";
    }>>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        card_online: "card_online";
        card_on_delivery: "card_on_delivery";
        cash: "cash";
    }>>;
    userId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strip>>;
