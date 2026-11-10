var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pizza } from "./pizza.entity.js";
import { PizzasRepository } from "./pizzas.repository.js";
import { PizzasService } from "./pizzas.service.js";
import { PizzaCleanupService } from "./pizza-cleanup.service.js";
import { IngredientsModule } from "../ingredients/ingredients.module.js";
import { PIZZAS_REPOSITORY } from "../../../libs/database/tokens.js";
import { UploadModule } from "../../../libs/upload/index.js";
let PizzasModule = class PizzasModule {
};
PizzasModule = __decorate([
    Module({
        imports: [TypeOrmModule.forFeature([Pizza]), IngredientsModule, UploadModule],
        providers: [
            PizzasRepository,
            { provide: PIZZAS_REPOSITORY, useExisting: PizzasRepository },
            PizzasService,
            PizzaCleanupService,
        ],
        exports: [PizzasService, PizzaCleanupService, PIZZAS_REPOSITORY],
    })
], PizzasModule);
export { PizzasModule };
//# sourceMappingURL=pizzas.module.js.map