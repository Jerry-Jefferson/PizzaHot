import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { CartItem } from "./entities/cart-item.entity.ts";
import type { ICartItemsRepository } from "./interfaces/cart-items.repository.interface.ts";

@Injectable()
export class CartItemsRepository implements ICartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly repository: Repository<CartItem>
  ) {}

  create(data: DeepPartial<CartItem>): CartItem {
    return this.repository.create(data);
  }

  async save(cartItem: CartItem): Promise<CartItem> {
    return this.repository.save(cartItem);
  }

  async findByCartAndPizza(cartId: string, pizzaId: string): Promise<CartItem | null> {
    return this.repository.findOne({
      where: {
        cart: { id: cartId },
        pizza: { id: pizzaId },
      },
      relations: {
        pizza: true,
      },
    });
  }

  async removeByCartAndPizza(cartId: string, pizzaId: string): Promise<boolean> {
    const result = await this.repository.delete({
      cart: { id: cartId },
      pizza: { id: pizzaId },
    });
    return (result.affected ?? 0) > 0;
  }

  async removeAllByCartId(cartId: string): Promise<void> {
    await this.repository.delete({ cart: { id: cartId } });
  }
}
