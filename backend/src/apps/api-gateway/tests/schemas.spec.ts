import { describe, it, expect } from "@jest/globals";
import { pizzaSchema, updatePizzaSchema } from "../../catalog-service/pizzas/pizza.schema.ts";
import {
  ingredientSchema,
  updateIngredientSchema,
} from "../../catalog-service/ingredients/ingredient.schema.ts";
import {
  createPromocodeSchema,
  updatePromocodeSchema,
} from "../../promocode-service/promocode.schema.ts";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../../cart-service/cart-items/cart-item.schema.ts";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} from "../../order-service/order.schema.ts";
import { signupSchema, loginSchema } from "../../identity-service/auth/schemas/auth.schema.ts";
import { passwordSchema } from "../../identity-service/auth/schemas/password.schema.ts";
import { updateUserSchema } from "../../identity-service/users/user.schema.ts";
import { listLogsQuerySchema } from "../../log-service/schemas/log-query.schema.ts";
import { DiscountMode } from "../../../libs/contracts/index.ts";
import { MAX_PIZZA_QUANTITY } from "../../../libs/contracts/order-limit.constant.ts";
import { DeliveryType } from "../../order-service/constants/delivery-type.constant.ts";
import { PaymentMethod } from "../../order-service/constants/payment-method.constant.ts";
import { OrderStatus } from "../../order-service/constants/order-status.constant.ts";
import { LogLevel } from "../../../libs/logging/log-level.constant.ts";

const UUID = "11111111-1111-4111-8111-111111111111";
const FUTURE = new Date(Date.now() + 86_400_000);

describe("pizzaSchema", () => {
  const valid = { name: "Margherita", description: "Classic", price: 8.5 };

  it("accepts a complete pizza", () => {
    expect(pizzaSchema.parse(valid)).toMatchObject(valid);
  });

  it("coerces a price sent as text", () => {
    expect(pizzaSchema.parse({ ...valid, price: "8.5" }).price).toBe(8.5);
  });

  it.each([
    ["an empty name", { ...valid, name: "" }],
    ["an empty description", { ...valid, description: "" }],
    ["a price of zero", { ...valid, price: 0 }],
    ["a negative price", { ...valid, price: -1 }],
    ["an ingredient id that is not a uuid", { ...valid, ingredientIds: ["not-a-uuid"] }],
  ])("refuses %s", (_label, input) => {
    expect(pizzaSchema.safeParse(input).success).toBe(false);
  });

  it("refuses the same ingredient twice", () => {
    const result = pizzaSchema.safeParse({ ...valid, ingredientIds: [UUID, UUID] });

    expect(result.success).toBe(false);
  });

  it("accepts distinct ingredient ids", () => {
    const other = "22222222-2222-4222-8222-222222222222";

    expect(pizzaSchema.safeParse({ ...valid, ingredientIds: [UUID, other] }).success).toBe(true);
  });

  it.each([
    ["an empty body", {}],
    ["a body with only a price", { price: 9 }],
    ["a body missing the description", { name: "X", price: 9 }],
  ])("refuses %s as a replacement", (_label, input) => {
    expect(updatePizzaSchema.safeParse(input).success).toBe(false);
  });

  it("accepts a complete replacement", () => {
    expect(updatePizzaSchema.parse({ name: "X", description: "d", price: 9 })).toEqual({
      name: "X",
      description: "d",
      price: 9,
      ingredientIds: [],
    });
  });

  it("defaults the ingredient list to empty rather than absent", () => {
    expect(
      updatePizzaSchema.parse({ name: "X", description: "d", price: 9 }).ingredientIds
    ).toEqual([]);
  });
});

describe("ingredientSchema", () => {
  it("accepts a name and refuses an empty one", () => {
    expect(ingredientSchema.parse({ name: "Basil" })).toEqual({ name: "Basil" });
    expect(ingredientSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("refuses a replacement with no name", () => {
    expect(updateIngredientSchema.safeParse({}).success).toBe(false);
  });
});

describe("promocode schemas", () => {
  const valid = {
    code: "SALE10",
    discount: 10,
    validTill: FUTURE,
    discountMode: DiscountMode.PERCENTAGE,
  };

  it("accepts a complete promocode", () => {
    expect(createPromocodeSchema.safeParse(valid).success).toBe(true);
  });

  it("trims the code", () => {
    expect(createPromocodeSchema.parse({ ...valid, code: "  SALE10  " }).code).toBe("SALE10");
  });

  it("refuses a date in the past", () => {
    const past = new Date(Date.now() - 86_400_000);

    expect(createPromocodeSchema.safeParse({ ...valid, validTill: past }).success).toBe(false);
  });

  it.each([
    ["an empty code", { ...valid, code: "" }],
    ["a fractional discount", { ...valid, discount: 5.5 }],
    ["a discount of zero", { ...valid, discount: 0 }],
    ["an unknown discount mode", { ...valid, discountMode: "buy_one_get_one" }],
  ])("refuses %s", (_label, input) => {
    expect(createPromocodeSchema.safeParse(input).success).toBe(false);
  });

  it("refuses a percentage above 100 and blames the discount field", () => {
    const result = createPromocodeSchema.safeParse({ ...valid, discount: 150 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["discount"]);
    }
  });

  it("allows a fixed amount above 100", () => {
    const fixed = { ...valid, discount: 150, discountMode: DiscountMode.FIXED_AMOUNT };

    expect(createPromocodeSchema.safeParse(fixed).success).toBe(true);
  });

  it.each([
    ["an empty body", {}],
    ["a body with only a discount", { discount: 20 }],
    ["a body missing the mode", { code: "X", discount: 20, validTill: FUTURE }],
  ])("refuses %s as a replacement", (_label, input) => {
    expect(updatePromocodeSchema.safeParse(input).success).toBe(false);
  });

  it("accepts a complete replacement", () => {
    expect(updatePromocodeSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses a replacement whose percentage exceeds 100", () => {
    expect(updatePromocodeSchema.safeParse({ ...valid, discount: 120 }).success).toBe(false);
  });

  it("allows a replacement to set a past date", () => {
    const past = new Date(Date.now() - 86_400_000);

    expect(updatePromocodeSchema.safeParse({ ...valid, validTill: past }).success).toBe(true);
  });
});

describe("cart item schemas", () => {
  it("defaults the quantity to one", () => {
    expect(addCartItemSchema.parse({ pizzaId: UUID })).toEqual({ pizzaId: UUID, quantity: 1 });
  });

  it.each([
    ["a pizzaId that is not a uuid", { pizzaId: "nope", quantity: 1 }],
    ["a quantity of zero", { pizzaId: UUID, quantity: 0 }],
    ["a fractional quantity", { pizzaId: UUID, quantity: 1.5 }],
    ["a quantity over the limit", { pizzaId: UUID, quantity: MAX_PIZZA_QUANTITY + 1 }],
  ])("refuses %s when adding", (_label, input) => {
    expect(addCartItemSchema.safeParse(input).success).toBe(false);
  });

  it("allows zero when updating", () => {
    expect(updateCartItemSchema.parse({ quantity: 0 })).toEqual({ quantity: 0 });
  });

  it("refuses a negative quantity when updating", () => {
    expect(updateCartItemSchema.safeParse({ quantity: -1 }).success).toBe(false);
  });
});

describe("order schemas", () => {
  const pickup = { delivery: DeliveryType.PICKUP, paymentMethod: PaymentMethod.CASH };

  it("accepts a pickup with no address", () => {
    expect(createOrderSchema.safeParse(pickup).success).toBe(true);
  });

  it("refuses a delivery with no address", () => {
    const result = createOrderSchema.safeParse({ ...pickup, delivery: DeliveryType.DELIVERY });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["address"]);
    }
  });

  it("refuses a delivery whose address is only spaces", () => {
    const input = { ...pickup, delivery: DeliveryType.DELIVERY, address: "   " };

    expect(createOrderSchema.safeParse(input).success).toBe(false);
  });

  it("accepts a delivery with an address", () => {
    const input = { ...pickup, delivery: DeliveryType.DELIVERY, address: "Main street 1" };

    expect(createOrderSchema.safeParse(input).success).toBe(true);
  });

  it.each([
    ["an unknown delivery type", { ...pickup, delivery: "teleport" }],
    ["an unknown payment method", { ...pickup, paymentMethod: "barter" }],
  ])("refuses %s", (_label, input) => {
    expect(createOrderSchema.safeParse(input).success).toBe(false);
  });

  it("accepts a known status and refuses an unknown one", () => {
    expect(updateOrderStatusSchema.safeParse({ status: OrderStatus.CONFIRMED }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: "teleported" }).success).toBe(false);
  });

  describe("listOrdersQuerySchema", () => {
    it("fills in paging for a body that was not sent at all", () => {
      expect(listOrdersQuerySchema.parse(undefined)).toEqual({ page: 1, limit: 10 });
    });

    it("accepts every filter together", () => {
      const query = {
        page: 2,
        limit: 5,
        userId: UUID,
        status: OrderStatus.PENDING,
        delivery: DeliveryType.PICKUP,
        paymentMethod: PaymentMethod.CASH,
      };

      expect(listOrdersQuerySchema.parse(query)).toMatchObject(query);
    });

    it("refuses a userId that is not a uuid", () => {
      expect(listOrdersQuerySchema.safeParse({ userId: "nope" }).success).toBe(false);
    });
  });
});

describe("passwordSchema", () => {
  it("accepts a password with all four kinds of character", () => {
    expect(passwordSchema.safeParse("Str0ng!pass").success).toBe(true);
  });

  it.each([
    ["too short", "Ab1!"],
    ["no uppercase", "str0ng!pass"],
    ["no lowercase", "STR0NG!PASS"],
    ["no digit", "Strong!pass"],
    ["no special character", "Str0ngpass"],
  ])("refuses one that is %s", (_label, password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });
});

describe("auth schemas", () => {
  const valid = {
    email: "anna@example.com",
    password: "Str0ng!pass",
    confirmPassword: "Str0ng!pass",
  };

  it("accepts a matching pair", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses a confirmation that does not match", () => {
    expect(signupSchema.safeParse({ ...valid, confirmPassword: "Other1!pass" }).success).toBe(
      false
    );
  });

  it("refuses an address that is not an address", () => {
    expect(signupSchema.safeParse({ ...valid, email: "anna-at-example" }).success).toBe(false);
  });

  it("accepts any non-empty password when logging in", () => {
    expect(loginSchema.safeParse({ email: "anna@example.com", password: "old" }).success).toBe(
      true
    );
  });
});

describe("updateUserSchema", () => {
  it("clears every field an empty body leaves out", () => {
    expect(updateUserSchema.parse({})).toEqual({ name: null, surname: null, gender: null });
  });

  it("keeps what the body says and clears the rest", () => {
    expect(updateUserSchema.parse({ name: "Anna" })).toEqual({
      name: "Anna",
      surname: null,
      gender: null,
    });
  });

  it("accepts an explicit null", () => {
    expect(updateUserSchema.parse({ name: null, surname: "Ivanova" })).toMatchObject({
      name: null,
      surname: "Ivanova",
    });
  });

  it("still refuses a value that breaks the rules", () => {
    expect(updateUserSchema.safeParse({ name: "" }).success).toBe(false);
    expect(updateUserSchema.safeParse({ gender: "unknown" }).success).toBe(false);
  });

  it("drops image", () => {
    expect(updateUserSchema.parse({ image: "https://example.com/a.png" })).not.toHaveProperty(
      "image"
    );
  });
});

describe("listLogsQuerySchema", () => {
  it("fills in paging", () => {
    expect(listLogsQuerySchema.parse({})).toMatchObject({ page: 1, limit: 10 });
  });

  it("accepts a known level and refuses an unknown one", () => {
    expect(listLogsQuerySchema.safeParse({ level: LogLevel.ERROR }).success).toBe(true);
    expect(listLogsQuerySchema.safeParse({ level: "verbose" }).success).toBe(false);
  });
});
