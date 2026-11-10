import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import { RedemptionsService } from "../redemptions/redemptions.service.ts";
import type { IRedemptionsRepository } from "../promocode.types.ts";
import type { PromocodeRedemption } from "../redemptions/promocode-redemption.entity.ts";

type Repo = { [K in keyof IRedemptionsRepository]: jest.Mock<IRedemptionsRepository[K]> };

describe("RedemptionsService", () => {
  let repository: Repo;
  let service: RedemptionsService;

  beforeEach(() => {
    repository = {
      findActive: jest.fn<IRedemptionsRepository["findActive"]>().mockResolvedValue(null),
      reserve: jest
        .fn<IRedemptionsRepository["reserve"]>()
        .mockResolvedValue({ id: "r1" } as PromocodeRedemption),
      confirm: jest.fn<IRedemptionsRepository["confirm"]>().mockResolvedValue(undefined),
      release: jest.fn<IRedemptionsRepository["release"]>().mockResolvedValue(undefined),
      releaseStale: jest.fn<IRedemptionsRepository["releaseStale"]>().mockResolvedValue(0),
      countByStatus: jest.fn<IRedemptionsRepository["countByStatus"]>().mockResolvedValue(0),
    };

    service = new RedemptionsService(repository);
  });

  describe("availability", () => {
    it("is available when no active redemption exists", async () => {
      await expect(service.isAvailableFor("u1", "c1")).resolves.toBe(true);
      await expect(service.assertAvailableFor("u1", "c1")).resolves.toBeUndefined();
    });

    it("is unavailable once the user has used it", async () => {
      repository.findActive.mockResolvedValue({ id: "r1" } as PromocodeRedemption);

      await expect(service.isAvailableFor("u1", "c1")).resolves.toBe(false);
      await expect(service.assertAvailableFor("u1", "c1")).rejects.toThrow(
        new BadRequestException("You have already used this promocode in a previous order")
      );
    });
  });

  describe("reserve", () => {
    it("takes the reservation", async () => {
      await expect(service.reserve("u1", "c1")).resolves.toBeUndefined();

      expect(repository.reserve).toHaveBeenCalledWith("u1", "c1");
    });

    it("refuses when the reservation could not be taken", async () => {
      repository.reserve.mockResolvedValue(null);

      await expect(service.reserve("u1", "c1")).rejects.toThrow(BadRequestException);
    });
  });

  it("confirms and releases through the repository", async () => {
    await service.confirm("u1", "c1", "o1");
    await service.release("u1", "c1");

    expect(repository.confirm).toHaveBeenCalledWith("u1", "c1", "o1");
    expect(repository.release).toHaveBeenCalledWith("u1", "c1");
  });

  describe("reapStaleReservations", () => {
    it("releases reservations older than the time to live", async () => {
      repository.releaseStale.mockResolvedValue(3);

      await expect(service.reapStaleReservations()).resolves.toBe(3);

      const cutoff = repository.releaseStale.mock.calls[0][0];
      expect(cutoff.getTime()).toBeLessThan(Date.now());
      expect(Date.now() - cutoff.getTime()).toBeCloseTo(15 * 60 * 1000, -3);
    });

    it("reports nothing when there was nothing to release", async () => {
      await expect(service.reapStaleReservations()).resolves.toBe(0);
    });

    it("survives a database failure", async () => {
      repository.releaseStale.mockRejectedValue(new Error("db down"));

      await expect(service.reapStaleReservations()).resolves.toBe(0);
    });

    it("survives something thrown that is not an Error", async () => {
      repository.releaseStale.mockRejectedValue("just a string");

      await expect(service.reapStaleReservations()).resolves.toBe(0);
    });
  });
});
