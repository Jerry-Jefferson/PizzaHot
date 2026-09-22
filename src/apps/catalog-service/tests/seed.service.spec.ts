import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { SeedService } from "../seed/seed.service.ts";
import { SEED_INGREDIENTS, SEED_PIZZAS } from "../seed/seed.data.ts";
import type { IngredientsService } from "../ingredients/ingredients.service.ts";
import type { PizzasService } from "../pizzas/pizzas.service.ts";

describe("SeedService", () => {
  type NamedRow = { id: string; name: string };
  let ingredients: {
    findAll: jest.Mock<() => Promise<NamedRow[]>>;
    create: jest.Mock<(dto: { name: string }) => Promise<NamedRow>>;
  };
  let pizzas: {
    findAll: jest.Mock<() => Promise<{ data: unknown[]; total: number }>>;
    create: jest.Mock<(dto: unknown) => Promise<unknown>>;
  };
  let service: SeedService;
  let nextId: number;

  beforeEach(() => {
    nextId = 0;
    ingredients = {
      findAll: jest.fn<() => Promise<NamedRow[]>>().mockResolvedValue([]),
      create: jest.fn<(dto: { name: string }) => Promise<NamedRow>>(({ name }) =>
        Promise.resolve({ id: `i${(nextId += 1)}`, name })
      ),
    };
    pizzas = {
      findAll: jest.fn<() => Promise<{ data: unknown[]; total: number }>>().mockResolvedValue({
        data: [],
        total: 0,
      }),
      create: jest.fn<(dto: unknown) => Promise<unknown>>().mockResolvedValue({}),
    };

    service = new SeedService(
      ingredients as unknown as IngredientsService,
      pizzas as unknown as PizzasService
    );
  });

  it("fills an empty catalog", async () => {
    await service.onModuleInit();

    expect(ingredients.create).toHaveBeenCalledTimes(SEED_INGREDIENTS.length);
    expect(pizzas.create).toHaveBeenCalledTimes(SEED_PIZZAS.length);
  });

  it("gives every seeded pizza its ingredients", async () => {
    await service.onModuleInit();

    for (const call of pizzas.create.mock.calls) {
      const dto = call[0] as { name: string; ingredientIds: string[] };
      expect(dto.ingredientIds.length).toBeGreaterThan(0);
      expect(dto.ingredientIds.every((id) => typeof id === "string")).toBe(true);
    }
  });

  it("creates pizzas through the service so the events are published", async () => {
    await service.onModuleInit();

    expect(pizzas.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: SEED_PIZZAS[0].name, price: SEED_PIZZAS[0].price })
    );
  });

  it("tops up when some ingredients are already there", async () => {
    ingredients.findAll.mockResolvedValue([{ id: "existing", name: SEED_INGREDIENTS[0] }]);

    await service.onModuleInit();

    expect(ingredients.create).toHaveBeenCalledTimes(SEED_INGREDIENTS.length - 1);
    expect(pizzas.create).toHaveBeenCalledTimes(SEED_PIZZAS.length);
  });

  it("creates nothing when every ingredient is present", async () => {
    ingredients.findAll.mockResolvedValue(
      SEED_INGREDIENTS.map((name, index) => ({ id: `i${index}`, name }))
    );

    await service.onModuleInit();

    expect(ingredients.create).not.toHaveBeenCalled();
  });

  it("leaves a catalog that already has pizzas alone", async () => {
    pizzas.findAll.mockResolvedValue({ data: [], total: 20 });

    await service.onModuleInit();

    expect(pizzas.create).not.toHaveBeenCalled();
  });

  it("skips a pizza whose ingredient is unknown", async () => {
    ingredients.create.mockImplementation(({ name }) =>
      name === "Mozzarella"
        ? Promise.resolve({ id: "i-moz", name: "Mozzarella Renamed" })
        : Promise.resolve({ id: `i${(nextId += 1)}`, name })
    );

    await service.onModuleInit();

    const seededNames = pizzas.create.mock.calls.map((call) => (call[0] as { name: string }).name);
    const needMozzarella = SEED_PIZZAS.filter((pizza) =>
      pizza.ingredients.includes("Mozzarella")
    ).map((pizza) => pizza.name);

    expect(seededNames).toEqual(expect.not.arrayContaining(needMozzarella));
    expect(pizzas.create).toHaveBeenCalledTimes(SEED_PIZZAS.length - needMozzarella.length);
  });
});

describe("seed data", () => {
  it("declares ten ingredients and twenty pizzas", () => {
    expect(SEED_INGREDIENTS).toHaveLength(10);
    expect(SEED_PIZZAS).toHaveLength(20);
  });

  it("names no ingredient the seed does not create", () => {
    const known = new Set<string>(SEED_INGREDIENTS);

    for (const pizza of SEED_PIZZAS) {
      for (const name of pizza.ingredients) {
        expect(known.has(name)).toBe(true);
      }
    }
  });

  it("gives every pizza a distinct name and a positive price", () => {
    const names = SEED_PIZZAS.map((pizza) => pizza.name);

    expect(new Set(names).size).toBe(names.length);
    expect(SEED_PIZZAS.every((pizza) => pizza.price > 0)).toBe(true);
  });
});
