import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { CATALOG_CLIENT } from "../../../libs/messaging/tokens.ts";
import { RPC } from "../../../libs/contracts/patterns.ts";
import { rpc } from "../../../libs/messaging/rpc.util.ts";
import type { Pizza } from "../../catalog-service/pizzas/entities/pizza.entity.ts";
import type { CreatePizzaDto } from "../../catalog-service/pizzas/dto/create-pizza.dto.ts";
import type { UpdatePizzaDto } from "../../catalog-service/pizzas/dto/update-pizza.dto.ts";
import type { Ingredient } from "../../catalog-service/ingredients/entities/ingredient.entity.ts";
import type { CreateIngredientDto } from "../../catalog-service/ingredients/dto/create-ingredient.dto.ts";
import type { UpdateIngredientDto } from "../../catalog-service/ingredients/dto/update-ingredient.dto.ts";

@Injectable()
export class CatalogClient {
  constructor(@Inject(CATALOG_CLIENT) private readonly client: ClientProxy) {}

  findAll(page: number, limit: number, search?: string): Promise<{ data: Pizza[]; total: number }> {
    return rpc(this.client, RPC.catalog.pizzaList, { page, limit, search });
  }

  findById(id: string): Promise<Pizza> {
    return rpc(this.client, RPC.catalog.pizzaFindById, { id });
  }

  create(dto: CreatePizzaDto): Promise<Pizza> {
    return rpc(this.client, RPC.catalog.pizzaCreate, dto);
  }

  update(id: string, dto: UpdatePizzaDto): Promise<Pizza> {
    return rpc(this.client, RPC.catalog.pizzaUpdate, { id, dto });
  }

  setImagePath(id: string, imagePath: string): Promise<Pizza> {
    return rpc(this.client, RPC.catalog.pizzaSetImage, { id, imagePath });
  }

  remove(id: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.catalog.pizzaRemove, { id });
  }

  findAllIngredients(): Promise<Ingredient[]> {
    return rpc(this.client, RPC.catalog.ingredientList, {});
  }

  findIngredientById(id: string): Promise<Ingredient> {
    return rpc(this.client, RPC.catalog.ingredientFindById, { id });
  }

  createIngredient(dto: CreateIngredientDto): Promise<Ingredient> {
    return rpc(this.client, RPC.catalog.ingredientCreate, dto);
  }

  updateIngredient(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    return rpc(this.client, RPC.catalog.ingredientUpdate, { id, dto });
  }

  removeIngredient(id: string): Promise<{ ok: true }> {
    return rpc(this.client, RPC.catalog.ingredientRemove, { id });
  }
}
