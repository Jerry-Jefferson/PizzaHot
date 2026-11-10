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
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, In, Repository } from "typeorm";
import { Pizza } from "./pizza.entity.js";
import { PizzaIngredient } from "./pizza-ingredient.entity.js";
let PizzasRepository = class PizzasRepository {
    repository;
    dataSource;
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    create(data) {
        return this.repository.create(data);
    }
    async save(pizza) {
        return this.repository.save(pizza);
    }
    async findPaginated(page, limit, search) {
        const where = search ? { name: ILike(`%${search.replace(/[%_]/g, "\\$&")}%`) } : {};
        const [data, total] = await this.repository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" },
            relations: {
                pizzaIngredients: {
                    ingredient: true,
                },
            },
        });
        return { data, total };
    }
    async findById(id) {
        return this.repository.findOne({
            where: { id },
            relations: {
                pizzaIngredients: {
                    ingredient: true,
                },
            },
        });
    }
    async findByIds(ids) {
        if (ids.length === 0) {
            return [];
        }
        return this.repository.find({ where: { id: In(ids) } });
    }
    async findByName(name) {
        return this.repository.findOne({
            where: { name },
            relations: {
                pizzaIngredients: {
                    ingredient: true,
                },
            },
        });
    }
    async update(id, data) {
        const result = await this.repository.update(id, data);
        return (result.affected ?? 0) > 0;
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
    async deleteNotOrderedSince(cutoffDate) {
        const result = await this.repository
            .createQueryBuilder()
            .delete()
            .from(Pizza)
            .where("lastOrderedAt IS NULL AND createdAt < :cutoffDate", { cutoffDate })
            .orWhere("lastOrderedAt < :cutoffDate", { cutoffDate })
            .execute();
        return result.affected ?? 0;
    }
    async markOrdered(pizzaIds, orderedAt) {
        if (pizzaIds.length === 0) {
            return;
        }
        await this.repository
            .createQueryBuilder()
            .update(Pizza)
            .set({ lastOrderedAt: orderedAt })
            .where("id IN (:...pizzaIds)", { pizzaIds })
            .andWhere("(lastOrderedAt IS NULL OR lastOrderedAt < :orderedAt)", { orderedAt })
            .execute();
    }
    async createWithIngredients(createData, ingredientIds) {
        return this.dataSource.transaction(async (manager) => {
            const pizza = manager.create(Pizza, createData);
            const saved = await manager.save(pizza);
            if (ingredientIds && ingredientIds.length > 0) {
                const entities = ingredientIds.map((ingredientId) => manager.create(PizzaIngredient, {
                    pizza: { id: saved.id },
                    ingredient: { id: ingredientId },
                }));
                await manager.save(entities);
            }
            return saved;
        });
    }
    async updateWithIngredients(id, updateData, ingredientIds) {
        await this.dataSource.transaction(async (manager) => {
            if (Object.keys(updateData).length > 0) {
                await manager.update(Pizza, id, updateData);
            }
            if (ingredientIds) {
                await manager.delete(PizzaIngredient, { pizza: { id } });
                if (ingredientIds.length > 0) {
                    const entities = ingredientIds.map((ingredientId) => manager.create(PizzaIngredient, {
                        pizza: { id },
                        ingredient: { id: ingredientId },
                    }));
                    await manager.save(entities);
                }
            }
        });
    }
};
PizzasRepository = __decorate([
    Injectable(),
    __param(0, InjectRepository(Pizza)),
    __metadata("design:paramtypes", [Repository,
        DataSource])
], PizzasRepository);
export { PizzasRepository };
//# sourceMappingURL=pizzas.repository.js.map