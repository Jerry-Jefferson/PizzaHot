import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseUUIDPipe,
  Delete,
  Query,
  Patch,
} from "@nestjs/common";
import { PizzasService } from "./pizzas.service.ts";
import { Roles } from "../auth/decorators/roles.decorator.ts";
import { Role } from "../shared/constants/role.enum.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import { PaginatedResponseDto } from "../shared/pagination/dto/paginated-response.dto.ts";
import { CreatePizzaDto } from "./dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "./dto/update-pizza.dto.ts";
import { PizzaResponseDto } from "./dto/pizza-response.dto.ts";
import { pizzaSchema, listPizzasQuerySchema, updatePizzaSchema } from "./schemas/pizza.schema.ts";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Pizzas")
@ApiBearerAuth()
@Controller("pizzas")
export class PizzasController {
  constructor(private readonly pizzasService: PizzasService) {}

  @Get()
  @ApiOperation({ summary: "Get all pizzas (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({ status: 200, description: "Paginated list of pizzas", type: PaginatedResponseDto })
  async findAll(
    @Query(new ZodValidationPipe(listPizzasQuerySchema))
    query: {
      page: number;
      limit: number;
      search?: string;
    }
  ): Promise<PaginatedResponseDto<PizzaResponseDto>> {
    const { data, total } = await this.pizzasService.findAll(query.page, query.limit, query.search);
    return new PaginatedResponseDto(
      data.map((pizza) => PizzaResponseDto.fromEntity(pizza)),
      query.page,
      query.limit,
      total
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get pizza by ID" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "Pizza found", type: PizzaResponseDto })
  @ApiResponse({ status: 404, description: "Pizza not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<PizzaResponseDto> {
    const pizza = await this.pizzasService.findById(id);
    return PizzaResponseDto.fromEntity(pizza);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Add a new pizza (Admin only)" })
  @ApiBody({ type: CreatePizzaDto })
  @ApiResponse({ status: 201, description: "Pizza successfully created", type: PizzaResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  async addPizza(
    @Body(new ZodValidationPipe(pizzaSchema)) dto: CreatePizzaDto
  ): Promise<PizzaResponseDto> {
    const pizza = await this.pizzasService.create(dto);
    return PizzaResponseDto.fromEntity(pizza);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update a pizza by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiBody({ type: UpdatePizzaDto })
  @ApiResponse({ status: 200, description: "Pizza successfully updated", type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: "Bad request - invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Pizza not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePizzaSchema)) dto: UpdatePizzaDto
  ): Promise<PizzaResponseDto> {
    const pizza = await this.pizzasService.update(id, dto);
    return PizzaResponseDto.fromEntity(pizza);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete a pizza by ID (Admin only)" })
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiResponse({ status: 200, description: "Pizza successfully deleted" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Pizza not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.pizzasService.remove(id);
  }
}
