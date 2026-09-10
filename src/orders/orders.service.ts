import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrdersRepository } from "./orders.repository.ts";
import { OrderItemsRepository } from "./order-items.repository.ts";
import { CartService } from "../carts/carts.service.ts";
import { PromocodesService } from "../promocodes/promocodes.service.ts";
import { OrderResponseDto } from "./dto/order-response.dto.ts";
import { CreateOrderDto } from "./dto/create-order.dto.ts";
import { OrderStatus } from "./constants/order-status.constant.ts";
import { PaginatedResponseDto } from "../shared/pagination/dto/paginated-response.dto.ts";
import { OrderItem } from "./entities/order-item.entity.ts";
import { calculatePricing } from "../pricing/pricing.ts";
import { MAX_PIZZA_QUANTITY } from "../shared/constants/pizza.constants.ts";
import { Order } from "./entities/order.entity.ts";
import { DeliveryType } from "./constants/delivery-type.constant.ts";
import { PaymentMethod } from "./constants/payment-method.constant.ts";

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly orderItemsRepository: OrderItemsRepository,
    private readonly cartService: CartService,
    private readonly promocodesService: PromocodesService
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const orderItemsToCreate: Partial<OrderItem>[] = [];

    const cart = await this.cartService.getCartEntity(userId);

    if (!cart) {
      throw new NotFoundException("No cart");
    }

    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    for (const cartItem of cart.cartItems) {
      if (!cartItem.pizza) {
        throw new BadRequestException(
          `Pizza for cart item "${cartItem.id}" is no longer available`
        );
      }

      if (cartItem.quantity > MAX_PIZZA_QUANTITY) {
        throw new BadRequestException(`Quantity cannot exceed ${MAX_PIZZA_QUANTITY}`);
      }

      orderItemsToCreate.push({
        pizza: cartItem.pizza,
        pizzaName: cartItem.pizza.name,
        priceAtPurchase: Number(cartItem.pizza.price),
        quantity: cartItem.quantity,
      });
    }

    const { totalPrice, discountAmount, finalPrice } = calculatePricing(cart);

    let promocodeId: string | null = null;
    let codeApplied: string | null = null;

    if (cart.promocode) {
      if (new Date(cart.promocode.validTill) < new Date()) {
        throw new BadRequestException("Promocode has expired");
      }

      const promocodeEntity = await this.promocodesService.findById(cart.promocode.id);
      promocodeId = promocodeEntity.id;
      codeApplied = cart.promocode.code;
    }

    const order = this.ordersRepository.create({
      user: { id: userId },
      promocode: promocodeId ? { id: promocodeId } : null,
      codeApplied,
      address: dto.address ?? "",
      delivery: dto.delivery,
      paymentMethod: dto.paymentMethod,
      totalPrice,
      discountAmount,
      finalPrice,
      status: OrderStatus.PENDING,
      comment: dto.comment ?? null,
    });

    const savedOrder = await this.ordersRepository.save(order);

    const itemsToSave = orderItemsToCreate.map((item) =>
      this.orderItemsRepository.create({
        ...item,
        order: { id: savedOrder.id },
      })
    );

    await this.orderItemsRepository.saveMany(itemsToSave);

    if (cart.promocode) {
      await this.cartService.removePromocode(userId);
    }
    await this.cartService.clearCart(userId);

    const fullOrder = await this.ordersRepository.findById(savedOrder.id);

    if (!fullOrder) {
      throw new NotFoundException("Created order was not found");
    }

    return OrderResponseDto.fromEntity(fullOrder);
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const { data, total } = await this.ordersRepository.findPaginated({
      page,
      limit,
      userId,
    });

    return new PaginatedResponseDto(
      data.map((order) => OrderResponseDto.fromEntity(order)),
      page,
      limit,
      total
    );
  }

  async findMyOrderById(orderId: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order || order.user?.id !== userId) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    return OrderResponseDto.fromEntity(order);
  }

  async findById(orderId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    return OrderResponseDto.fromEntity(order);
  }

  async findAll(
    page: number,
    limit: number,
    userId?: string,
    status?: OrderStatus,
    delivery?: DeliveryType,
    paymentMethod?: PaymentMethod
  ): Promise<{ data: Order[]; total: number }> {
    return await this.ordersRepository.findPaginated({
      page,
      limit,
      userId,
      status,
      delivery,
      paymentMethod,
    });
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }

    await this.ordersRepository.updateStatus(orderId, status);

    const updatedOrder = await this.ordersRepository.findById(orderId);

    if (!updatedOrder) {
      throw new NotFoundException("Updated order was not found");
    }

    return OrderResponseDto.fromEntity(updatedOrder);
  }
}
