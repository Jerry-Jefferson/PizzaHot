import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../users/entities/user.entity.ts";
import { UsersRepository } from "../../users/users.repository.ts";
import { Ingredient } from "../../ingredients/entities/ingredient.entity.ts";
import { IngredientsRepository } from "../../ingredients/ingredients.repository.ts";
import { Pizza } from "../../pizzas/entities/pizza.entity.ts";
import { PizzaIngredient } from "../../pizzas/entities/pizza-ingredient.entity.ts";
import { PizzasRepository } from "../../pizzas/pizzas.repository.ts";
import { Cart } from "../../carts/entities/cart.entity.ts";
import { CartItem } from "../../carts/entities/cart-item.entity.ts";
import { CartRepository } from "../../carts/carts.repository.ts";
import { CartItemsRepository } from "../../carts/cart-items.repository.ts";
import { Order } from "../../orders/entities/order.entity.ts";
import { OrderItem } from "../../orders/entities/order-item.entity.ts";
import { OrdersRepository } from "../../orders/orders.repository.ts";
import { OrderItemsRepository } from "../../orders/order-items.repository.ts";
import { Promocode } from "../../promocodes/entities/promocode.entity.ts";
import { PromocodesRepository } from "../../promocodes/promocodes.repository.ts";
import { AnalyticsTypeOrmRepository } from "../../analytics/analytics.typeorm.repository.ts";
import {
  USERS_REPOSITORY,
  INGREDIENTS_REPOSITORY,
  PIZZAS_REPOSITORY,
  CART_REPOSITORY,
  CART_ITEMS_REPOSITORY,
  ORDERS_REPOSITORY,
  ORDER_ITEMS_REPOSITORY,
  PROMOCODES_REPOSITORY,
  ANALYTICS_REPOSITORY,
} from "./tokens.ts";

const repositoryProviders = [
  UsersRepository,
  IngredientsRepository,
  PizzasRepository,
  CartRepository,
  CartItemsRepository,
  OrdersRepository,
  OrderItemsRepository,
  PromocodesRepository,
  AnalyticsTypeOrmRepository,
  {
    provide: USERS_REPOSITORY,
    useExisting: UsersRepository,
  },
  {
    provide: INGREDIENTS_REPOSITORY,
    useExisting: IngredientsRepository,
  },
  {
    provide: PIZZAS_REPOSITORY,
    useExisting: PizzasRepository,
  },
  {
    provide: CART_REPOSITORY,
    useExisting: CartRepository,
  },
  {
    provide: CART_ITEMS_REPOSITORY,
    useExisting: CartItemsRepository,
  },
  {
    provide: ORDERS_REPOSITORY,
    useExisting: OrdersRepository,
  },
  {
    provide: ORDER_ITEMS_REPOSITORY,
    useExisting: OrderItemsRepository,
  },
  {
    provide: PROMOCODES_REPOSITORY,
    useExisting: PromocodesRepository,
  },
  {
    provide: ANALYTICS_REPOSITORY,
    useExisting: AnalyticsTypeOrmRepository,
  },
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Ingredient,
      Pizza,
      PizzaIngredient,
      Cart,
      CartItem,
      Order,
      OrderItem,
      Promocode,
    ]),
  ],
  providers: repositoryProviders,
  exports: [
    USERS_REPOSITORY,
    INGREDIENTS_REPOSITORY,
    PIZZAS_REPOSITORY,
    CART_REPOSITORY,
    CART_ITEMS_REPOSITORY,
    ORDERS_REPOSITORY,
    ORDER_ITEMS_REPOSITORY,
    PROMOCODES_REPOSITORY,
    ANALYTICS_REPOSITORY,
  ],
})
export class PersistenceModule {}
