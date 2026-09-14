import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, FindOptionsWhere, Not, Repository } from "typeorm";
import { Order } from "./entities/order.entity.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
import type {
  FindOrdersFilter,
  IOrdersRepository,
} from "./interfaces/orders.repository.interface.ts";

export type { FindOrdersFilter };

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
        orderItems: {
          pizza: true,
        },
        user: true,
        promocode: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: {
        orderItems: true,
        promocode: true,
      },
      order: { createdAt: "DESC" },
    });
  }

  async findPaginated(filter: FindOrdersFilter): Promise<{ data: Order[]; total: number }> {
    const { page, limit, userId, status, delivery, paymentMethod } = filter;

    const where: FindOptionsWhere<Order> = {};

    if (userId) {
      where.user = { id: userId };
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
        user: true,
        promocode: true,
      },
    });

    return { data, total };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<boolean> {
    const result = await this.repository.update(id, { status });
    return (result.affected ?? 0) > 0;
  }

  async hasUserUsedPromocode(userId: string, promocodeId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        user: { id: userId },
        promocode: { id: promocodeId },
        status: Not(OrderStatus.CANCELLED),
      },
    });
    return count > 0;
  }
}
