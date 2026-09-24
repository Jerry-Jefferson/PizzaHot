import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { IngredientsService } from "../ingredients/ingredients.service.ts";
import type { IIngredientsRepository } from "../ingredients/ingredient.types.ts";
import type { Ingredient } from "../ingredients/ingredient.entity.ts";

function ingredient(id: string, name: string): Ingredient {
  return {
    id,
    name,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  } as Ingredient;
}

type Repo = { [K in keyof IIngredientsRepository]: jest.Mock<IIngredientsRepository[K]> };

describe("IngredientsService", () => {
  let repository: Repo;
  let service: IngredientsService;

  beforeEach(() => {
    repository = {
      create: jest.fn<IIngredientsRepository["create"]>(),
      save: jest.fn<IIngredientsRepository["save"]>(),
      findAll: jest.fn<IIngredientsRepository["findAll"]>(),
      findById: jest.fn<IIngredientsRepository["findById"]>(),
      findByName: jest.fn<IIngredientsRepository["findByName"]>(),
      findByIds: jest.fn<IIngredientsRepository["findByIds"]>(),
      update: jest.fn<IIngredientsRepository["update"]>(),
      remove: jest.fn<IIngredientsRepository["remove"]>(),
    };

    service = new IngredientsService(repository);
  });

  describe("create", () => {
    it("saves a new ingredient and returns it mapped", async () => {
      const saved = ingredient("i1", "Basil");
      repository.findByName.mockResolvedValue(null);
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create({ name: "Basil" });

      expect(result).toEqual({
        id: "i1",
        name: "Basil",
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });
    });

    it("refuses a duplicate name", async () => {
      repository.findByName.mockResolvedValue(ingredient("i1", "Basil"));

      await expect(service.create({ name: "Basil" })).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("maps every row", async () => {
      repository.findAll.mockResolvedValue([ingredient("i1", "Basil"), ingredient("i2", "Ham")]);

      await expect(service.findAll()).resolves.toEqual([
        expect.objectContaining({ id: "i1", name: "Basil" }),
        expect.objectContaining({ id: "i2", name: "Ham" }),
      ]);
    });

    it("returns an empty list rather than failing", async () => {
      repository.findAll.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns the mapped ingredient", async () => {
      repository.findById.mockResolvedValue(ingredient("i1", "Basil"));

      await expect(service.findById("i1")).resolves.toMatchObject({ id: "i1", name: "Basil" });
    });

    it("throws when it is not there", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById("missing")).rejects.toThrow(
        new NotFoundException("Ingredient not found")
      );
    });
  });

  describe("validateIds", () => {
    it("does not touch the database for an empty list", async () => {
      await service.validateIds([]);

      expect(repository.findByIds).not.toHaveBeenCalled();
    });

    it("passes when every id resolves", async () => {
      repository.findByIds.mockResolvedValue([ingredient("i1", "Basil"), ingredient("i2", "Ham")]);

      await expect(service.validateIds(["i1", "i2"])).resolves.toBeUndefined();
    });

    it("names exactly the ids that are missing", async () => {
      repository.findByIds.mockResolvedValue([ingredient("i1", "Basil")]);

      await expect(service.validateIds(["i1", "i2", "i3"])).rejects.toThrow(
        "Ingredients not found: i2, i3"
      );
    });
  });

  describe("update", () => {
    it("updates and returns the new state", async () => {
      repository.findById.mockResolvedValue(ingredient("i1", "Basil"));
      repository.findByName.mockResolvedValue(null);
      repository.update.mockResolvedValue(ingredient("i1", "Fresh Basil"));

      await expect(service.update("i1", { name: "Fresh Basil" })).resolves.toMatchObject({
        name: "Fresh Basil",
      });
    });

    it("throws when the ingredient does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update("missing", { name: "X" })).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it("refuses a name another ingredient already holds", async () => {
      repository.findById.mockResolvedValue(ingredient("i1", "Basil"));
      repository.findByName.mockResolvedValue(ingredient("i2", "Ham"));

      await expect(service.update("i1", { name: "Ham" })).rejects.toThrow(ConflictException);
    });

    it("allows an ingredient to keep its own name", async () => {
      const existing = ingredient("i1", "Basil");
      repository.findById.mockResolvedValue(existing);
      repository.findByName.mockResolvedValue(existing);
      repository.update.mockResolvedValue(existing);

      await expect(service.update("i1", { name: "Basil" })).resolves.toMatchObject({ id: "i1" });
    });

    it("throws when the row disappears between the check and the write", async () => {
      repository.findById.mockResolvedValue(ingredient("i1", "Basil"));
      repository.update.mockResolvedValue(null);

      await expect(service.update("i1", { name: "Basil" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("deletes an existing ingredient", async () => {
      repository.findById.mockResolvedValue(ingredient("i1", "Basil"));
      repository.remove.mockResolvedValue(true);

      await expect(service.remove("i1")).resolves.toBeUndefined();
      expect(repository.remove).toHaveBeenCalledWith("i1");
    });

    it("throws when it is not there", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove("missing")).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it("throws when the delete affected no rows", async () => {
      repository.findById.mockResolvedValue(ingredient("i1", "Basil"));
      repository.remove.mockResolvedValue(false);

      await expect(service.remove("i1")).rejects.toThrow(NotFoundException);
    });
  });
});
