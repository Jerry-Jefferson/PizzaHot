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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PizzasService } from "./pizzas.service.ts";
import { Roles } from "../auth/decorators/roles.decorator.ts";
import { Role } from "../shared/constants/role.enum.ts";
import { ZodValidationPipe } from "../shared/pipes/zod-validation.pipe.ts";
import { ImageValidationPipe } from "../shared/pipes/image-validation.pipe.ts";
import { PaginatedResponseDto } from "../shared/pagination/dto/paginated-response.dto.ts";
import { CreatePizzaDto } from "./dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "./dto/update-pizza.dto.ts";
import { PizzaResponseDto } from "./dto/pizza-response.dto.ts";
import { pizzaSchema, listPizzasQuerySchema, updatePizzaSchema } from "./schemas/pizza.schema.ts";
import { pizzaImageMulterOptions } from "./config/pizza-image-multer.config.ts";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
  @ApiBody({ description: "Pizza creation payload", type: CreatePizzaDto })
  @ApiResponse({ status: 201, description: "Pizza successfully created", type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: "Bad request - invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 409, description: "Conflict - Pizza name already exists" })
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
  @ApiBody({ description: "Pizza update payload", type: UpdatePizzaDto })
  @ApiResponse({ status: 200, description: "Pizza successfully updated", type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: "Bad request - invalid data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Pizza not found" })
  @ApiResponse({ status: 409, description: "Conflict - Pizza name already exists" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePizzaSchema)) dto: UpdatePizzaDto
  ): Promise<PizzaResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one field must be provided for update");
    }
    const pizza = await this.pizzasService.update(id, dto);
    return PizzaResponseDto.fromEntity(pizza);
  }

  @Patch(":id/image")
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor("image", pizzaImageMulterOptions))
  @ApiOperation({ summary: "Upload or replace a pizza image (Admin only)" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", type: "string", format: "uuid" })
  @ApiBody({
    description: "Pizza image file",
    schema: {
      type: "object",
      required: ["image"],
      properties: {
        image: {
          type: "string",
          format: "binary",
          description: "Pizza image file (jpeg, png, webp)",
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Image successfully uploaded", type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: "Bad request - invalid file" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Pizza not found" })
  async uploadImage(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File
  ): Promise<PizzaResponseDto> {
    const pizza = await this.pizzasService.uploadImage(id, image);
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
