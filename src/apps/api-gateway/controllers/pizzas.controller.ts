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

import { Roles } from "../../../libs/auth/decorators/roles.decorator.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
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

@ApiTags("Pizzas")
@ApiBearerAuth()
@Controller("pizzas")
export class PizzasController {
  constructor(private readonly pizzasService: CatalogClient) {}

  @Get()
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
  @ApiFindOnePizza()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<PizzaResponseDto> {
    return this.pizzasService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiAddPizza()
  async addPizza(
    @Body(new ZodValidationPipe(pizzaSchema)) dto: CreatePizzaDto
  ): Promise<PizzaResponseDto> {
    return this.pizzasService.create(dto);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  @ApiRemovePizza()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.pizzasService.remove(id);
  }
}
