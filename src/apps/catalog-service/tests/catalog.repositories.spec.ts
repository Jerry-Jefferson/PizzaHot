import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { In, type Repository } from "typeorm";
import { IngredientsRepository } from "../ingredients/ingredients.repository.ts";
import type { Ingredient } from "../ingredients/ingredient.entity.ts";

interface Typeorm {
  create: jest.Mock<(data: unknown) => unknown>;
  save: jest.Mock<(row: unknown) => Promise<unknown>>;
  find: jest.Mock<(options?: unknown) => Promise<unknown[]>>;
  findOne: jest.Mock<(options: unknown) => Promise<unknown>>;
  findOneBy: jest.Mock<(where: unknown) => Promise<unknown>>;
  update: jest.Mock<(id: unknown, data: unknown) => Promise<{ affected?: number }>>;
  delete: jest.Mock<(id: unknown) => Promise<{ affected?: number }>>;
}

function typeormRepository(): Typeorm {
  return {
    create: jest.fn<(data: unknown) => unknown>(),
    save: jest.fn<(row: unknown) => Promise<unknown>>(),
    find: jest.fn<(options?: unknown) => Promise<unknown[]>>(),
    findOne: jest.fn<(options: unknown) => Promise<unknown>>(),
    findOneBy: jest.fn<(where: unknown) => Promise<unknown>>(),
    update: jest.fn<(id: unknown, data: unknown) => Promise<{ affected?: number }>>(),
    delete: jest.fn<(id: unknown) => Promise<{ affected?: number }>>(),
  };
}

describe("IngredientsRepository", () => {
  let typeorm: Typeorm;
  let repository: IngredientsRepository;

  beforeEach(() => {
    typeorm = typeormRepository();
    repository = new IngredientsRepository(typeorm as unknown as Repository<Ingredient>);
  });

  it("passes create and save straight through", async () => {
    const row = { id: "i1" } as Ingredient;
    typeorm.create.mockReturnValue(row);
    typeorm.save.mockResolvedValue(row);

    expect(repository.create({ name: "Basil" })).toBe(row);
    await expect(repository.save(row)).resolves.toBe(row);
  });

  it("looks a row up by id", async () => {
    typeorm.findOneBy.mockResolvedValue(null);

    await repository.findById("i1");

    expect(typeorm.findOneBy).toHaveBeenCalledWith({ id: "i1" });
  });

  it("looks a row up by name", async () => {
    typeorm.findOne.mockResolvedValue(null);

    await repository.findByName("Basil");

    expect(typeorm.findOne).toHaveBeenCalledWith({ where: { name: "Basil" } });
  });

  it("does not query the database for an empty id list", async () => {
    await expect(repository.findByIds([])).resolves.toEqual([]);

    expect(typeorm.find).not.toHaveBeenCalled();
  });

  it("uses IN for a non-empty id list", async () => {
    typeorm.find.mockResolvedValue([]);

    await repository.findByIds(["i1", "i2"]);

    expect(typeorm.find).toHaveBeenCalledWith({ where: { id: In(["i1", "i2"]) } });
  });

  describe("update", () => {
    it("reads the row back when something changed", async () => {
      typeorm.update.mockResolvedValue({ affected: 1 });
      typeorm.findOneBy.mockResolvedValue({ id: "i1" });

      await expect(repository.update("i1", { name: "X" })).resolves.toMatchObject({ id: "i1" });
    });

    it("returns null when nothing was affected", async () => {
      typeorm.update.mockResolvedValue({ affected: 0 });

      await expect(repository.update("nope", { name: "X" })).resolves.toBeNull();
      expect(typeorm.findOneBy).not.toHaveBeenCalled();
    });

    it("treats an undefined affected count as nothing", async () => {
      typeorm.update.mockResolvedValue({});

      await expect(repository.update("i1", { name: "X" })).resolves.toBeNull();
    });
  });

  describe("remove", () => {
    it.each([
      [1, true],
      [0, false],
      [undefined, false],
    ])("reports affected %s as %s", async (affected, expected) => {
      typeorm.delete.mockResolvedValue({ affected });

      await expect(repository.remove("i1")).resolves.toBe(expected);
    });
  });
});
