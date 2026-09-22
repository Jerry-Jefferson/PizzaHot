import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
import { PromocodesService } from "../promocodes.service.ts";
import type { IPromocodesRepository } from "../promocode.types.ts";
import type { Promocode } from "../promocode.entity.ts";
import { DiscountMode, EVENTS } from "../../../libs/contracts/index.ts";

function promocode(overrides: Partial<Promocode> = {}): Promocode {
  return {
    id: "c1",
    code: "SALE10",
    discount: 10,
    discountMode: DiscountMode.PERCENTAGE,
    validTill: new Date("2099-01-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    deletedAt: null,
    ...overrides,
  };
}

type Repo = { [K in keyof IPromocodesRepository]: jest.Mock<IPromocodesRepository[K]> };

describe("PromocodesService", () => {
  let repository: Repo;
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let service: PromocodesService;

  beforeEach(() => {
    repository = {
      create: jest.fn<IPromocodesRepository["create"]>(),
      save: jest.fn<IPromocodesRepository["save"]>(),
      findAll: jest.fn<IPromocodesRepository["findAll"]>(),
      findById: jest.fn<IPromocodesRepository["findById"]>(),
      findByCode: jest.fn<IPromocodesRepository["findByCode"]>(),
      update: jest.fn<IPromocodesRepository["update"]>().mockResolvedValue(true),
      remove: jest.fn<IPromocodesRepository["remove"]>().mockResolvedValue(true),
      restore: jest.fn<IPromocodesRepository["restore"]>().mockResolvedValue(true),
    };
    events = { emit: jest.fn() };

    service = new PromocodesService(repository, events as unknown as ClientProxy);
  });

  describe("create", () => {
    it("saves a new promocode", async () => {
      const saved = promocode();
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      await expect(
        service.create({
          code: "SALE10",
          discount: 10,
          discountMode: DiscountMode.PERCENTAGE,
          validTill: saved.validTill,
        })
      ).resolves.toMatchObject({
        code: "SALE10",
        discount: 10,
      });
    });

    it("refuses a code that already exists", async () => {
      repository.findByCode.mockResolvedValue(promocode());

      await expect(
        service.create({
          code: "SALE10",
          discount: 5,
          discountMode: DiscountMode.PERCENTAGE,
          validTill: new Date(),
        })
      ).rejects.toThrow(ConflictException);
    });

    it("refuses a percentage above 100", async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(
        service.create({
          code: "HALF",
          discount: 150,
          discountMode: DiscountMode.PERCENTAGE,
          validTill: new Date(),
        })
      ).rejects.toThrow(new BadRequestException("Percentage discount cannot exceed 100"));
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("allows a fixed amount above 100", async () => {
      const saved = promocode({ discount: 150, discountMode: DiscountMode.FIXED_AMOUNT });
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      await expect(
        service.create({
          code: "BIG",
          discount: 150,
          discountMode: DiscountMode.FIXED_AMOUNT,
          validTill: saved.validTill,
        })
      ).resolves.toMatchObject({ discount: 150 });
    });
  });

  describe("findByCodeOrFail", () => {
    it("normalises the code before looking it up", async () => {
      repository.findByCode.mockResolvedValue(promocode());

      await service.findByCodeOrFail("  sale10  ");

      expect(repository.findByCode).toHaveBeenCalledWith("SALE10");
    });

    it("throws when the code is unknown", async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(service.findByCodeOrFail("NOPE")).rejects.toThrow(NotFoundException);
    });
  });

  describe("assertNotExpired", () => {
    it("passes for a code valid in the future", () => {
      expect(() => service.assertNotExpired(promocode())).not.toThrow();
    });

    it("throws for a code whose date has passed", () => {
      const expired = promocode({ validTill: new Date("2020-01-01T00:00:00.000Z") });

      expect(() => service.assertNotExpired(expired)).toThrow(
        new BadRequestException("Promocode has expired")
      );
    });
  });

  describe("update", () => {
    it("applies the change", async () => {
      repository.findById.mockResolvedValue(promocode());

      await service.update("c1", { discount: 20 });

      expect(repository.update).toHaveBeenCalledWith("c1", { discount: 20 });
    });

    it("throws when the promocode does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update("nope", { discount: 5 })).rejects.toThrow(NotFoundException);
    });

    it("refuses a code another promocode holds", async () => {
      repository.findById.mockResolvedValue(promocode());
      repository.findByCode.mockResolvedValue(promocode({ id: "c2", code: "OTHER" }));

      await expect(service.update("c1", { code: "OTHER" })).rejects.toThrow(ConflictException);
    });

    it("lets a promocode keep its own code", async () => {
      const current = promocode();
      repository.findById.mockResolvedValue(current);
      repository.findByCode.mockResolvedValue(current);

      await expect(service.update("c1", { code: "SALE10" })).resolves.toMatchObject({ id: "c1" });
    });

    it("refuses a discount above 100 when the stored mode is percentage", async () => {
      repository.findById.mockResolvedValue(promocode({ discountMode: DiscountMode.PERCENTAGE }));

      await expect(service.update("c1", { discount: 120 })).rejects.toThrow(BadRequestException);
    });

    it("refuses switching to percentage when the stored discount is above 100", async () => {
      repository.findById.mockResolvedValue(
        promocode({ discount: 150, discountMode: DiscountMode.FIXED_AMOUNT })
      );

      await expect(service.update("c1", { discountMode: DiscountMode.PERCENTAGE })).rejects.toThrow(
        BadRequestException
      );
    });

    it("throws when the write affected no rows", async () => {
      repository.findById.mockResolvedValue(promocode());
      repository.update.mockResolvedValue(false);

      await expect(service.update("c1", { discount: 5 })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("announces the deletion so carts can detach it", async () => {
      await service.remove("c1");

      expect(events.emit).toHaveBeenCalledWith(EVENTS.promocodeDeleted, { promocodeId: "c1" });
    });

    it("throws when nothing was deleted", async () => {
      repository.remove.mockResolvedValue(false);

      await expect(service.remove("nope")).rejects.toThrow(NotFoundException);
      expect(events.emit).not.toHaveBeenCalled();
    });

    it("survives a broker that refuses the event", async () => {
      events.emit.mockImplementation(() => {
        throw new Error("broker down");
      });

      await expect(service.remove("c1")).resolves.toBeUndefined();
    });
  });

  describe("restore", () => {
    it("returns the restored promocode", async () => {
      repository.findById.mockResolvedValue(promocode());

      await expect(service.restore("c1")).resolves.toMatchObject({ id: "c1" });
    });

    it("throws when there is nothing to restore", async () => {
      repository.restore.mockResolvedValue(false);

      await expect(service.restore("nope")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getById", () => {
    it("maps the entity for message handlers", async () => {
      repository.findById.mockResolvedValue(promocode());

      await expect(service.getById("c1")).resolves.toMatchObject({ id: "c1", code: "SALE10" });
    });
  });

  describe("findAll", () => {
    it("maps every row", async () => {
      repository.findAll.mockResolvedValue([promocode(), promocode({ id: "c2", code: "X" })]);

      await expect(service.findAll()).resolves.toHaveLength(2);
    });
  });
});
