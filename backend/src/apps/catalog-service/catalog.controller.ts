import { Controller, Inject, Logger, NotFoundException } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { EVENTS, RPC } from "../../libs/contracts/index.ts";
import type { OrderCreatedEvent, ResolvedPizza } from "../../libs/contracts/index.ts";
import { EVENTS_CLIENT } from "../../libs/messaging/tokens.constant.ts";
import { PIZZAS_REPOSITORY } from "../../libs/database/tokens.ts";
import type { IPizzasRepository } from "./pizzas/pizza.types.ts";
import { ack } from "../../libs/messaging/ack.ts";
import { PizzasService } from "./pizzas/pizzas.service.ts";
import { IngredientsService } from "./ingredients/ingredients.service.ts";
import { PizzaResponseDto } from "./pizzas/dto/pizza-response.dto.ts";
import { IngredientResponseDto } from "./ingredients/dto/ingredient-response.dto.ts";
import type { CreatePizzaDto } from "./pizzas/dto/create-pizza.dto.ts";
import type { UpdatePizzaDto } from "./pizzas/dto/update-pizza.dto.ts";
import type { CreateIngredientDto } from "./ingredients/dto/create-ingredient.dto.ts";
import type { UpdateIngredientDto } from "./ingredients/dto/update-ingredient.dto.ts";
import type { PaginatedResult } from "../../libs/pagination/pagination.types.ts";

@Controller()
export class CatalogMessagesController {
  private readonly logger = new Logger(CatalogMessagesController.name);

  constructor(
    private readonly pizzas: PizzasService,
    private readonly ingredients: IngredientsService,
    @Inject(PIZZAS_REPOSITORY)
    private readonly pizzasRepository: IPizzasRepository,
    @Inject(EVENTS_CLIENT)
    private readonly events: ClientProxy
  ) {}

  @MessagePattern(RPC.catalog.pizzaList)
  list(
    @Payload() payload: { page?: number; limit?: number; search?: string }
  ): Promise<PaginatedResult<PizzaResponseDto>> {
    return this.pizzas.findAll(payload.page, payload.limit, payload.search);
  }

  @MessagePattern(RPC.catalog.pizzaFindById)
  findById(@Payload() payload: { id: string }): Promise<PizzaResponseDto> {
    return this.pizzas.getById(payload.id);
  }

  @MessagePattern(RPC.catalog.pizzaCreate)
  create(@Payload() payload: CreatePizzaDto): Promise<PizzaResponseDto> {
    return this.pizzas.create(payload);
  }

  @MessagePattern(RPC.catalog.pizzaUpdate)
  update(@Payload() payload: { id: string; dto: UpdatePizzaDto }): Promise<PizzaResponseDto> {
    return this.pizzas.update(payload.id, payload.dto);
  }

  @MessagePattern(RPC.catalog.pizzaSetImage)
  setImage(@Payload() payload: { id: string; imagePath: string }): Promise<PizzaResponseDto> {
    return this.pizzas.setImagePath(payload.id, payload.imagePath);
  }

  @MessagePattern(RPC.catalog.pizzaRemove)
  async remove(@Payload() payload: { id: string }): Promise<{ ok: true }> {
    await this.pizzas.remove(payload.id);
    this.events.emit(EVENTS.pizzaDeleted, { pizzaId: payload.id });
    return { ok: true };
  }

  @MessagePattern(RPC.catalog.pizzaResolve)
  async resolve(@Payload() payload: { pizzaIds: string[] }): Promise<ResolvedPizza[]> {
    const found = await this.pizzasRepository.findByIds(payload.pizzaIds);
    const byId = new Map(found.map((pizza) => [pizza.id, pizza]));

    return payload.pizzaIds.map((pizzaId) => {
      const pizza = byId.get(pizzaId);
      if (!pizza) {
        throw new NotFoundException(`Pizza ${pizzaId} is no longer available`);
      }
      return {
        pizzaId: pizza.id,
        name: pizza.name,
        price: Number(pizza.price),
        isAvailable: true,
      };
    });
  }

  @MessagePattern(RPC.catalog.ingredientList)
  listIngredients(): Promise<IngredientResponseDto[]> {
    return this.ingredients.findAll();
  }

  @MessagePattern(RPC.catalog.ingredientFindById)
  findIngredient(@Payload() payload: { id: string }): Promise<IngredientResponseDto> {
    return this.ingredients.findById(payload.id);
  }

  @MessagePattern(RPC.catalog.ingredientCreate)
  createIngredient(@Payload() payload: CreateIngredientDto): Promise<IngredientResponseDto> {
    return this.ingredients.create(payload);
  }

  @MessagePattern(RPC.catalog.ingredientUpdate)
  updateIngredient(
    @Payload() payload: { id: string; dto: UpdateIngredientDto }
  ): Promise<IngredientResponseDto> {
    return this.ingredients.update(payload.id, payload.dto);
  }

  @MessagePattern(RPC.catalog.ingredientRemove)
  async removeIngredient(@Payload() payload: { id: string }): Promise<{ ok: true }> {
    await this.ingredients.remove(payload.id);
    return { ok: true };
  }

  @EventPattern(EVENTS.orderCreated)
  async onOrderCreated(
    @Payload() event: OrderCreatedEvent,
    @Ctx() context: RmqContext
  ): Promise<void> {
    await ack(context, this.logger, EVENTS.orderCreated, async () => {
      const pizzaIds = event.items
        .map((item) => item.pizzaId)
        .filter((pizzaId): pizzaId is string => pizzaId !== null);

      await this.pizzasRepository.markOrdered(pizzaIds, new Date(event.createdAt));
    });
  }
}
