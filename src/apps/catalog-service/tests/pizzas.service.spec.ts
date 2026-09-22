import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { PizzasService } from "../pizzas/pizzas.service.ts";
import type { IPizzasRepository } from "../pizzas/pizza.types.ts";
import type { Pizza } from "../pizzas/pizza.entity.ts";
import type { IngredientsService } from "../ingredients/ingredients.service.ts";
import type { IImageStorage } from "../../../libs/upload/index.ts";
import { EVENTS } from "../../../libs/contracts/index.ts";

function pizza(overrides: Partial<Pizza> = {}): Pizza {
  return {
    id: "p1",
    name: "Margherita",
    description: "Classic",
    price: 8.5,
    image: null,
    pizzaIngredients: [],
    lastOrderedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

type Repo = { [K in keyof IPizzasRepository]: jest.Mock<IPizzasRepository[K]> };

describe("PizzasService", () => {
  let repository: Repo;
  let ingredients: { validateIds: jest.Mock<IngredientsService["validateIds"]> };
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let images: { [K in keyof IImageStorage]: jest.Mock<IImageStorage[K]> };
  let service: PizzasService;

  beforeEach(() => {
    repository = {
      create: jest.fn<IPizzasRepository["create"]>(),
      save: jest.fn<IPizzasRepository["save"]>(),
      findPaginated: jest.fn<IPizzasRepository["findPaginated"]>(),
      findById: jest.fn<IPizzasRepository["findById"]>(),
      findByIds: jest.fn<IPizzasRepository["findByIds"]>(),
      findByName: jest.fn<IPizzasRepository["findByName"]>(),
      update: jest.fn<IPizzasRepository["update"]>(),
      remove: jest.fn<IPizzasRepository["remove"]>(),
      deleteNotOrderedSince: jest.fn<IPizzasRepository["deleteNotOrderedSince"]>(),
      markOrdered: jest.fn<IPizzasRepository["markOrdered"]>(),
      createWithIngredients: jest.fn<IPizzasRepository["createWithIngredients"]>(),
      updateWithIngredients: jest.fn<IPizzasRepository["updateWithIngredients"]>(),
    };
    ingredients = { validateIds: jest.fn<IngredientsService["validateIds"]>() };
    events = { emit: jest.fn() };
    images = {
      urlPathFor: jest.fn<IImageStorage["urlPathFor"]>(),
      remove: jest.fn<IImageStorage["remove"]>().mockResolvedValue(true),
    };

    service = new PizzasService(
      repository,
      ingredients as unknown as IngredientsService,
      events as unknown as ClientProxy,
      images
    );
  });

  describe("create", () => {
    it("saves the pizza and announces it", async () => {
      repository.findByName.mockResolvedValue(null);
      repository.createWithIngredients.mockResolvedValue(pizza());
      repository.findById.mockResolvedValue(pizza());

      const result = await service.create({
        name: "Margherita",
        description: "Classic",
        price: 8.5,
      });

      expect(result).toMatchObject({ id: "p1", name: "Margherita" });
      expect(events.emit).toHaveBeenCalledWith(EVENTS.pizzaCreated, {
        pizzaId: "p1",
        name: "Margherita",
        price: 8.5,
        image: null,
        isAvailable: true,
      });
    });

    it("refuses a duplicate name before touching anything else", async () => {
      repository.findByName.mockResolvedValue(pizza());

      await expect(
        service.create({ name: "Margherita", description: "d", price: 1 })
      ).rejects.toThrow(ConflictException);

      expect(repository.createWithIngredients).not.toHaveBeenCalled();
      expect(events.emit).not.toHaveBeenCalled();
    });

    it("validates ingredient ids when some are given", async () => {
      repository.findByName.mockResolvedValue(null);
      repository.createWithIngredients.mockResolvedValue(pizza());
      repository.findById.mockResolvedValue(pizza());

      await service.create({ name: "X", description: "d", price: 1, ingredientIds: ["i1"] });

      expect(ingredients.validateIds).toHaveBeenCalledWith(["i1"]);
    });

    it("skips validation when the list is empty", async () => {
      repository.findByName.mockResolvedValue(null);
      repository.createWithIngredients.mockResolvedValue(pizza());
      repository.findById.mockResolvedValue(pizza());

      await service.create({ name: "X", description: "d", price: 1, ingredientIds: [] });

      expect(ingredients.validateIds).not.toHaveBeenCalled();
    });

    it("does not save when an ingredient id is unknown", async () => {
      repository.findByName.mockResolvedValue(null);
      ingredients.validateIds.mockRejectedValue(new NotFoundException("Ingredients not found: i9"));

      await expect(
        service.create({ name: "X", description: "d", price: 1, ingredientIds: ["i9"] })
      ).rejects.toThrow(NotFoundException);

      expect(repository.createWithIngredients).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("maps the page and keeps the total", async () => {
      repository.findPaginated.mockResolvedValue({ data: [pizza()], total: 42 });

      const result = await service.findAll(2, 10, "marg");

      expect(repository.findPaginated).toHaveBeenCalledWith(2, 10, "marg");
      expect(result.total).toBe(42);
      expect(result.data).toEqual([expect.objectContaining({ id: "p1" })]);
    });
  });

  describe("findById and getById", () => {
    it("returns the entity for internal callers", async () => {
      const row = pizza();
      repository.findById.mockResolvedValue(row);

      await expect(service.findById("p1")).resolves.toBe(row);
    });

    it("throws when absent", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById("nope")).rejects.toThrow(
        new NotFoundException("Pizza not found")
      );
    });

    it("returns a mapped DTO for message handlers", async () => {
      repository.findById.mockResolvedValue(pizza());

      const result = await service.getById("p1");

      expect(result).not.toHaveProperty("pizzaIngredients");
      expect(result).not.toHaveProperty("lastOrderedAt");
    });
  });

  describe("update", () => {
    it("writes the change and announces the new state", async () => {
      repository.findById.mockResolvedValue(pizza({ price: 9.5 }));
      repository.findByName.mockResolvedValue(null);

      await service.update("p1", { price: 9.5 });

      expect(repository.updateWithIngredients).toHaveBeenCalledWith(
        "p1",
        { price: 9.5 },
        undefined
      );
      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.pizzaUpdated,
        expect.objectContaining({ pizzaId: "p1", price: 9.5 })
      );
    });

    it("throws when the pizza does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update("nope", { price: 1 })).rejects.toThrow(NotFoundException);
      expect(repository.updateWithIngredients).not.toHaveBeenCalled();
    });

    it("refuses a name another pizza holds", async () => {
      repository.findById.mockResolvedValue(pizza());
      repository.findByName.mockResolvedValue(pizza({ id: "p2", name: "Diavola" }));

      await expect(service.update("p1", { name: "Diavola" })).rejects.toThrow(ConflictException);
    });

    it("allows a pizza to keep its own name", async () => {
      repository.findById.mockResolvedValue(pizza());
      repository.findByName.mockResolvedValue(pizza());

      await expect(service.update("p1", { name: "Margherita" })).resolves.toMatchObject({
        id: "p1",
      });
    });
  });

  describe("setImagePath", () => {
    it("stores the path and announces the change", async () => {
      repository.findById.mockResolvedValue(pizza({ image: "/uploads/pizzas/new.png" }));

      await service.setImagePath("p1", "/uploads/pizzas/new.png");

      expect(repository.update).toHaveBeenCalledWith("p1", { image: "/uploads/pizzas/new.png" });
      expect(events.emit).toHaveBeenCalledWith(EVENTS.pizzaUpdated, expect.anything());
    });

    it("deletes the image it replaces", async () => {
      repository.findById.mockResolvedValue(pizza({ image: "/uploads/pizzas/old.png" }));

      await service.setImagePath("p1", "/uploads/pizzas/new.png");

      expect(images.remove).toHaveBeenCalledWith("/uploads/pizzas/old.png");
    });

    it("removes the uploaded file when the pizza is gone", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.setImagePath("nope", "/uploads/pizzas/new.png")).rejects.toThrow(
        NotFoundException
      );
      expect(images.remove).toHaveBeenCalledWith("/uploads/pizzas/new.png");
    });

    it("raises an alert when the replaced file was already missing", async () => {
      repository.findById.mockResolvedValue(pizza({ image: "/uploads/pizzas/old.png" }));
      images.remove.mockResolvedValue(false);

      await service.setImagePath("p1", "/uploads/pizzas/new.png");

      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.criticalError,
        expect.objectContaining({ errorType: "PizzaImageMissing" })
      );
    });

    it("says nothing when there was no previous image", async () => {
      repository.findById.mockResolvedValue(pizza({ image: null }));
      images.remove.mockResolvedValue(false);

      await service.setImagePath("p1", "/uploads/pizzas/new.png");

      expect(events.emit).not.toHaveBeenCalledWith(EVENTS.criticalError, expect.anything());
    });
  });

  describe("remove", () => {
    it("deletes the row and its image", async () => {
      repository.findById.mockResolvedValue(pizza({ image: "/uploads/pizzas/a.png" }));
      repository.remove.mockResolvedValue(true);

      await expect(service.remove("p1")).resolves.toBeUndefined();
      expect(images.remove).toHaveBeenCalledWith("/uploads/pizzas/a.png");
    });

    it("throws when the pizza is not there", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove("nope")).rejects.toThrow(NotFoundException);
    });

    it("still deletes when the image file had vanished, and raises an alert", async () => {
      repository.findById.mockResolvedValue(pizza({ image: "/uploads/pizzas/gone.png" }));
      repository.remove.mockResolvedValue(true);
      images.remove.mockResolvedValue(false);

      await expect(service.remove("p1")).resolves.toBeUndefined();
      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.criticalError,
        expect.objectContaining({ errorType: "PizzaImageMissing" })
      );
    });

    it("keeps the pizza when the image cannot be deleted", async () => {
      repository.findById.mockResolvedValue(pizza({ image: "/uploads/pizzas/locked.png" }));
      images.remove.mockRejectedValue(new Error("EPERM"));

      await expect(service.remove("p1")).rejects.toThrow(InternalServerErrorException);
      expect(repository.remove).not.toHaveBeenCalled();
      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.criticalError,
        expect.objectContaining({ errorType: "PizzaImageDeletionError" })
      );
    });

    it("does not look for a file when there is none", async () => {
      repository.findById.mockResolvedValue(pizza({ image: null }));
      repository.remove.mockResolvedValue(true);

      await service.remove("p1");

      expect(images.remove).not.toHaveBeenCalled();
    });

    it("throws when the delete affected no rows", async () => {
      repository.findById.mockResolvedValue(pizza());
      repository.remove.mockResolvedValue(false);

      await expect(service.remove("p1")).rejects.toThrow(NotFoundException);
    });

    it("turns a repository failure into a 500", async () => {
      repository.findById.mockResolvedValue(pizza());
      repository.remove.mockRejectedValue(new Error("deadlock"));

      await expect(service.remove("p1")).rejects.toThrow(InternalServerErrorException);
    });
  });
});
