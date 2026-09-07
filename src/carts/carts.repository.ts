import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { Cart } from "./entities/cart.entity.ts";

@Injectable()
export class CartRepository {
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
      where: { user: { id: userId } },
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

    const cart = this.create({ user: { id: userId } });
    return this.save(cart);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
