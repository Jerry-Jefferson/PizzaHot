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
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CatalogClient } from "../clients/catalog.client.ts";

import { ZodValidationPipe } from "../../../libs/validation/zod-validation.pipe.ts";
import {
  ImageCategory,
  ImageValidationPipe,
  UPLOADS_URL_PREFIX,
  imageMulterOptions,
} from "../../../libs/upload/index.ts";
import { PaginatedResponseDto } from "../../../libs/pagination/paginated-response.dto.ts";
import { CreatePizzaDto } from "../../catalog-service/pizzas/dto/create-pizza.dto.ts";
import { UpdatePizzaDto } from "../../catalog-service/pizzas/dto/update-pizza.dto.ts";
import { PizzaResponseDto } from "../../catalog-service/pizzas/dto/pizza-response.dto.ts";
import {
  pizzaSchema,
  listPizzasQuerySchema,
  updatePizzaSchema,
} from "../../catalog-service/pizzas/pizza.schema.ts";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiAddPizza,
  ApiFindAllPizza,
  ApiFindOnePizza,
  ApiRemovePizza,
  ApiUpdatePizza,
  ApiUploadImagePizza,
} from "./pizzas.api-docs.ts";
import { Can } from "../../../libs/auth/decorators/can.decorator.ts";
import { Permission } from "../../../libs/auth/permission.constant.ts";

@ApiTags("Pizzas")
@ApiBearerAuth()
@Controller("pizzas")
export class PizzasController {
  constructor(private readonly pizzasService: CatalogClient) {}

  @Get()
  @Can(Permission.PIZZA_READ)
  @ApiFindAllPizza()
  async findAll(
    @Query(new ZodValidationPipe(listPizzasQuerySchema))
    query: {
      page: number;
      limit: number;
      search?: string;
    }
  ): Promise<PaginatedResponseDto<PizzaResponseDto>> {
    return this.pizzasService.findAll(query.page, query.limit, query.search);
  }

  @Get(":id")
  @Can(Permission.PIZZA_READ)
  @ApiFindOnePizza()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<PizzaResponseDto> {
    return this.pizzasService.findById(id);
  }

  @Post()
  @Can(Permission.PIZZA_WRITE)
  @ApiAddPizza()
  async addPizza(
    @Body(new ZodValidationPipe(pizzaSchema)) dto: CreatePizzaDto
  ): Promise<PizzaResponseDto> {
    return this.pizzasService.create(dto);
  }

  @Patch(":id")
  @Can(Permission.PIZZA_WRITE)
  @ApiUpdatePizza()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePizzaSchema)) dto: UpdatePizzaDto
  ): Promise<PizzaResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one field must be provided for update");
    }
    return this.pizzasService.update(id, dto);
  }

  @Patch(":id/image")
  @Can(Permission.PIZZA_WRITE)
  @UseInterceptors(FileInterceptor("image", imageMulterOptions(ImageCategory.PIZZAS)))
  @ApiUploadImagePizza()
  async uploadImage(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File
  ): Promise<PizzaResponseDto> {
    const imagePath = `${UPLOADS_URL_PREFIX}/${ImageCategory.PIZZAS}/${image.filename}`;
    return this.pizzasService.setImagePath(id, imagePath);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Can(Permission.PIZZA_DELETE)
  @ApiRemovePizza()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.pizzasService.remove(id);
  }
}
