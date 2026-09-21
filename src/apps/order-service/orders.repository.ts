import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { Order } from "./order.entity.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
import type { IOrdersRepository, ListOrdersQuery } from "./order.types.ts";

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>
  ) {}

  create(data: DeepPartial<Order>): Order {
    return this.repository.create(data);
  }

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        orderItems: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { userId },
      relations: {
        orderItems: true,
      },
      order: { createdAt: "DESC" },
    });
  }

  async findPaginated(query: ListOrdersQuery): Promise<{ data: Order[]; total: number }> {
    const { page, limit, userId, status, delivery, paymentMethod } = query;

    const where: FindOptionsWhere<Order> = {};

    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }
    if (delivery) {
      where.delivery = delivery;
    }
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: {
        orderItems: true,
      },
    });

    return { data, total };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<boolean> {
    const result = await this.repository.update(id, { status });
    return (result.affected ?? 0) > 0;
  }

  async detachUser(userId: string): Promise<number> {
    const result = await this.repository.update({ userId }, { userId: null });
    return result.affected ?? 0;
  }
}
