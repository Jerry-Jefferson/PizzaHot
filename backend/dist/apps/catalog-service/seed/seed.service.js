var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SeedService_1;
import { Injectable, Logger } from "@nestjs/common";
import { IngredientsService } from "../ingredients/ingredients.service.js";
import { PizzasService } from "../pizzas/pizzas.service.js";
import { SEED_INGREDIENTS, SEED_PIZZAS } from "./seed.data.js";
let SeedService = SeedService_1 = class SeedService {
    ingredients;
    pizzas;
    logger = new Logger(SeedService_1.name);
    constructor(ingredients, pizzas) {
        this.ingredients = ingredients;
        this.pizzas = pizzas;
    }
    async onModuleInit() {
        const ingredientIdsByName = await this.seedIngredients();
        await this.seedPizzas(ingredientIdsByName);
    }
    async seedIngredients() {
        const existing = await this.ingredients.findAll();
        const byName = new Map(existing.map((ingredient) => [ingredient.name, ingredient.id]));
        let created = 0;
        for (const name of SEED_INGREDIENTS) {
            if (byName.has(name))
                continue;
            const ingredient = await this.ingredients.create({ name });
            byName.set(ingredient.name, ingredient.id);
            created += 1;
        }
        this.logger.log(created === 0
            ? `All ${SEED_INGREDIENTS.length} seed ingredients already present`
            : `Seeded ${created} ingredients (${existing.length} were already there)`);
        return byName;
    }
    async seedPizzas(ingredientIdsByName) {
        const { total } = await this.pizzas.findAll(1, 1);
        if (total > 0) {
            this.logger.log(`Pizzas already present (${total}), skipping seed`);
            return;
        }
        let seeded = 0;
        for (const pizza of SEED_PIZZAS) {
            const ingredientIds = pizza.ingredients.map((name) => ingredientIdsByName.get(name));
            if (ingredientIds.some((id) => id === undefined)) {
                const missing = pizza.ingredients.filter((name) => !ingredientIdsByName.has(name));
                this.logger.warn(`Skipping "${pizza.name}": unknown ingredients ${missing.join(", ")}`);
                continue;
            }
            await this.pizzas.create({
                name: pizza.name,
                description: pizza.description,
                price: pizza.price,
                ingredientIds: ingredientIds.filter((id) => id !== undefined),
            });
            seeded += 1;
        }
        this.logger.log(`Seeded ${seeded} pizzas`);
    }
};
SeedService = SeedService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [IngredientsService,
        PizzasService])
], SeedService);
export { SeedService };
//# sourceMappingURL=seed.service.js.map