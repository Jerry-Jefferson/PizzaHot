var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrdersService_1;
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ORDERS_REPOSITORY, ORDER_ITEMS_REPOSITORY } from "../../libs/database/tokens.js";
import { CART_CLIENT, CATALOG_CLIENT, PROMOCODE_CLIENT, EVENTS_CLIENT, } from "../../libs/messaging/tokens.constant.js";
import { EVENTS, RPC } from "../../libs/contracts/index.js";
import { rpc } from "../../libs/messaging/rpc.util.js";
import { OrderResponseDto } from "./dto/order-response.dto.js";
import { OrderStatus } from "./constants/order-status.constant.js";
import { PaginatedResponseDto } from "../../libs/pagination/paginated-response.dto.js";
import { calculatePrice } from "../../libs/price-calculation/price-calculation.js";
import { MAX_PIZZA_QUANTITY } from "../../libs/contracts/order-limit.constant.js";
let OrdersService = OrdersService_1 = class OrdersService {
    ordersRepository;
    orderItemsRepository;
    cartClient;
    catalogClient;
    promocodeClient;
    events;
    logger = new Logger(OrdersService_1.name);
    constructor(ordersRepository, orderItemsRepository, cartClient, catalogClient, promocodeClient, events) {
        this.ordersRepository = ordersRepository;
        this.orderItemsRepository = orderItemsRepository;
        this.cartClient = cartClient;
        this.catalogClient = catalogClient;
        this.promocodeClient = promocodeClient;
        this.events = events;
    }
    async create(userId, dto) {
        const snapshot = await rpc(this.cartClient, RPC.cart.checkoutSnapshot, {
            userId,
        });
        if (!snapshot.cartId) {
            throw new NotFoundException("No cart");
        }
        if (snapshot.items.length === 0) {
            throw new BadRequestException("Cart is empty");
        }
        for (const item of snapshot.items) {
            if (item.quantity > MAX_PIZZA_QUANTITY) {
                throw new BadRequestException(`Quantity cannot exceed ${MAX_PIZZA_QUANTITY}`);
            }
        }
        const resolved = await rpc(this.catalogClient, RPC.catalog.pizzaResolve, {
            pizzaIds: snapshot.items.map((item) => item.pizzaId),
        });
        const priceById = new Map(resolved.map((pizza) => [pizza.pizzaId, pizza]));
        const orderItemsToCreate = snapshot.items.map((item) => {
            const pizza = priceById.get(item.pizzaId);
            if (!pizza || !pizza.isAvailable) {
                throw new BadRequestException(`Pizza "${item.pizzaId}" is no longer available`);
            }
            return {
                pizzaId: pizza.pizzaId,
                pizzaName: pizza.name,
                priceAtPurchase: Number(pizza.price),
                quantity: item.quantity,
            };
        });
        let reserved = null;
        if (snapshot.promocodeId) {
            reserved = await rpc(this.promocodeClient, RPC.promocode.reserve, {
                userId,
                promocodeId: snapshot.promocodeId,
            });
        }
        const { totalPrice, discountAmount, finalPrice } = calculatePrice(orderItemsToCreate.map((item) => ({
            price: item.priceAtPurchase,
            quantity: item.quantity,
        })), reserved
            ? {
                discount: Number(reserved.promocode.discount),
                discountMode: reserved.promocode.discountMode,
                validTill: new Date(reserved.promocode.validTill),
            }
            : null);
        let savedOrder;
        try {
            const order = this.ordersRepository.create({
                userId,
                promocodeId: reserved?.promocode.id ?? null,
                codeApplied: reserved?.promocode.code ?? null,
                address: dto.address ?? "",
                delivery: dto.delivery,
                paymentMethod: dto.paymentMethod,
                totalPrice,
                discountAmount,
                finalPrice,
                status: OrderStatus.PENDING,
                comment: dto.comment ?? null,
            });
            savedOrder = await this.ordersRepository.save(order);
            const itemsToSave = orderItemsToCreate.map((item) => this.orderItemsRepository.create({ ...item, order: { id: savedOrder.id } }));
            await this.orderItemsRepository.saveMany(itemsToSave);
        }
        catch (error) {
            const failure = {
                orderId: "",
                userId,
                promocodeId: snapshot.promocodeId,
                reason: String(error),
            };
            this.events.emit(EVENTS.orderFailed, failure);
            this.logger.error(`Checkout failed for user ${userId}: ${String(error)}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
        const created = {
            orderId: savedOrder.id,
            userId,
            userEmail: null,
            promocodeId: reserved?.promocode.id ?? null,
            totalPrice,
            discountAmount,
            finalPrice,
            items: orderItemsToCreate.map((item) => ({
                pizzaId: item.pizzaId,
                pizzaName: item.pizzaName,
                priceAtPurchase: item.priceAtPurchase,
                quantity: item.quantity,
            })),
            createdAt: new Date().toISOString(),
        };
        this.events.emit(EVENTS.orderCreated, created);
        const fullOrder = await this.ordersRepository.findById(savedOrder.id);
        if (!fullOrder) {
            throw new NotFoundException("Created order was not found");
        }
        this.logger.log(`Order placed: #${savedOrder.id} by user ${userId} with total ${finalPrice} (${orderItemsToCreate.length} items)`);
        return OrderResponseDto.fromEntity(fullOrder);
    }
    async findByUserId(userId, page = 1, limit = 10) {
        const { data, total } = await this.ordersRepository.findPaginated({
            page,
            limit,
            userId,
        });
        return new PaginatedResponseDto(data.map((order) => OrderResponseDto.fromEntity(order)), page, limit, total);
    }
    async findMyOrderById(orderId, userId) {
        const order = await this.ordersRepository.findById(orderId);
        if (!order || order.userId !== userId) {
            throw new NotFoundException(`Order with id "${orderId}" not found`);
        }
        return OrderResponseDto.fromEntity(order);
    }
    async findById(orderId) {
        const order = await this.ordersRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Order with id "${orderId}" not found`);
        }
        return OrderResponseDto.fromEntity(order);
    }
    async findAll(query) {
        const { data, total } = await this.ordersRepository.findPaginated(query);
        return { data: OrderResponseDto.fromEntities(data), total };
    }
    async updateStatus(orderId, status) {
        const order = await this.ordersRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Order with id "${orderId}" not found`);
        }
        await this.ordersRepository.updateStatus(orderId, status);
        const updatedOrder = await this.ordersRepository.findById(orderId);
        if (!updatedOrder) {
            throw new NotFoundException("Updated order was not found");
        }
        this.logger.log(`Order #${orderId} status changed from "${order.status}" to "${status}"`);
        return OrderResponseDto.fromEntity(updatedOrder);
    }
};
OrdersService = OrdersService_1 = __decorate([
    Injectable(),
    __param(0, Inject(ORDERS_REPOSITORY)),
    __param(1, Inject(ORDER_ITEMS_REPOSITORY)),
    __param(2, Inject(CART_CLIENT)),
    __param(3, Inject(CATALOG_CLIENT)),
    __param(4, Inject(PROMOCODE_CLIENT)),
    __param(5, Inject(EVENTS_CLIENT)),
    __metadata("design:paramtypes", [Object, Object, Function, Function, Function, Function])
], OrdersService);
export { OrdersService };
//# sourceMappingURL=orders.service.js.map