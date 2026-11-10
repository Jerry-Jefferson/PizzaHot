import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { OrderItem } from "./order-item.entity.ts";
import type { IOrderItemsRepository } from "../order.types.ts";

@Injectable()
export class OrderItemsRepository implements IOrderItemsRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repository: Repository<OrderItem>
  ) {}

  create(data: DeepPartial<OrderItem>): OrderItem {
    return this.repository.create(data);
  }

  async save(item: OrderItem): Promise<OrderItem> {
    return this.repository.save(item);
  }

  async saveMany(items: OrderItem[]): Promise<OrderItem[]> {
    return this.repository.save(items);
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.repository.find({
      where: { order: { id: orderId } },
    });
  }

  async deleteByOrderId(orderId: string): Promise<void> {
    await this.repository.delete({ order: { id: orderId } });
  }
}
