import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { CATALOG_CLIENT } from "../../../libs/messaging/tokens.constant.ts";
import { RPC } from "../../../libs/contracts/index.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { PizzaResponseDto } from "../../catalog-service/pizzas/dto/pizza-response.dto.ts";
import type { CreatePizzaDto } from "../../catalog-service/pizzas/dto/create-pizza.dto.ts";
import type { UpdatePizzaDto } from "../../catalog-service/pizzas/dto/update-pizza.dto.ts";
import type { IngredientResponseDto } from "../../catalog-service/ingredients/dto/ingredient-response.dto.ts";
import type { CreateIngredientDto } from "../../catalog-service/ingredients/dto/create-ingredient.dto.ts";
import type { UpdateIngredientDto } from "../../catalog-service/ingredients/dto/update-ingredient.dto.ts";
import { PaginatedResponseDto } from "../../../libs/common/pagination/paginated-response.dto.ts";

/**
 * Thin: catalog-service already answers with the shape the API exposes. The only thing
 * built here is the pagination envelope, because page and limit belong to HTTP, not to
 * the message the service answered.
 */
@Injectable()
export class CatalogClient {
  constructor(@Inject(CATALOG_CLIENT) private readonly client: ClientProxy) {}

  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResponseDto<PizzaResponseDto>> {
    const { data, total } = await rpc<{ data: PizzaResponseDto[]; total: number }>(
      this.client,
      RPC.catalog.pizzaList,
      { page, limit, search }
    );

    return new PaginatedResponseDto(data, page, limit, total);
  }

  findById(id: string): Promise<PizzaResponseDto> {
    return rpc(this.client, RPC.catalog.pizzaFindById, { id });
  }

  create(dto: CreatePizzaDto): Promise<PizzaResponseDto> {
    return rpc(this.client, RPC.catalog.pizzaCreate, dto);
  }

  update(id: string, dto: UpdatePizzaDto): Promise<PizzaResponseDto> {
    return rpc(this.client, RPC.catalog.pizzaUpdate, { id, dto });
  }

  setImagePath(id: string, imagePath: string): Promise<PizzaResponseDto> {
    return rpc(this.client, RPC.catalog.pizzaSetImage, { id, imagePath });
  }

  remove(id: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.catalog.pizzaRemove, { id });
  }

  findAllIngredients(): Promise<IngredientResponseDto[]> {
    return rpc(this.client, RPC.catalog.ingredientList, {});
  }

  findIngredientById(id: string): Promise<IngredientResponseDto> {
    return rpc(this.client, RPC.catalog.ingredientFindById, { id });
  }

  createIngredient(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
    return rpc(this.client, RPC.catalog.ingredientCreate, dto);
  }

  updateIngredient(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto> {
    return rpc(this.client, RPC.catalog.ingredientUpdate, { id, dto });
  }

  removeIngredient(id: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.catalog.ingredientRemove, { id });
  }
}
