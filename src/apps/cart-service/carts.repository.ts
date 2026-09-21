import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { Cart } from "./cart.entity.ts";
import type { ICartRepository } from "./cart.types.ts";

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly repository: Repository<Cart>
  ) {}

  create(data: DeepPartial<Cart>): Cart {
    return this.repository.create(data);
  }

  async save(cart: Cart): Promise<Cart> {
    return this.repository.save(cart);
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.repository.findOne({
      where: { userId },
      relations: {
        cartItems: {
          pizza: true,
        },
      },
    });
  }

  async findOrCreate(userId: string): Promise<Cart> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const cart = this.create({ userId });
    const saved = await this.save(cart);
    saved.cartItems = [];
    return saved;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async clearPromocode(promocodeId: string): Promise<number> {
    const result = await this.repository.update(
      { promocodeId },
      {
        promocodeId: null,
        promocodeCode: null,
        promocodeDiscount: null,
        promocodeDiscountMode: null,
        promocodeValidTill: null,
      }
    );

    return result.affected ?? 0;
  }
}
