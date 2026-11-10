import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import type { ClientProxy } from "@nestjs/microservices";
import { UsersService } from "../users/users.service.ts";
import type { IUsersRepository } from "../users/user.types.ts";
import type { User } from "../users/user.entity.ts";
import { Role } from "../../../libs/auth/auth.constant.ts";
import { Gender } from "../users/constants/gender.constant.ts";
import { EVENTS } from "../../../libs/contracts/index.ts";
import type { IImageStorage } from "../../../libs/upload/index.ts";

function user(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    email: "anna@example.com",
    passwordHash: "$2b$10$storedhash",
    name: "Anna",
    surname: "Ivanova",
    gender: Gender.FEMALE,
    image: null,
    role: Role.USER,
    isEmailVerified: true,
    verificationToken: null,
    verificationTokenExpiresAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

type Repo = { [K in keyof IUsersRepository]: jest.Mock<IUsersRepository[K]> };

describe("UsersService", () => {
  let repository: Repo;
  let events: { emit: jest.Mock<(pattern: string, data: unknown) => unknown> };
  let images: { [K in keyof IImageStorage]: jest.Mock<IImageStorage[K]> };
  let service: UsersService;

  beforeEach(() => {
    repository = {
      create: jest.fn<IUsersRepository["create"]>(),
      save: jest.fn<IUsersRepository["save"]>(),
      findPaginated: jest.fn<IUsersRepository["findPaginated"]>(),
      findById: jest.fn<IUsersRepository["findById"]>(),
      findByEmail: jest.fn<IUsersRepository["findByEmail"]>(),
      findByVerificationToken: jest.fn<IUsersRepository["findByVerificationToken"]>(),
      update: jest.fn<IUsersRepository["update"]>().mockResolvedValue(true),
      remove: jest.fn<IUsersRepository["remove"]>().mockResolvedValue(true),
      countByRole: jest.fn<IUsersRepository["countByRole"]>(),
    };
    events = { emit: jest.fn() };
    images = {
      urlPathFor: jest.fn<IImageStorage["urlPathFor"]>(),
      remove: jest.fn<IImageStorage["remove"]>().mockResolvedValue(true),
    };

    service = new UsersService(repository, events as unknown as ClientProxy, images);
  });

  describe("createWithRole", () => {
    it("hashes the password instead of storing it", async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockImplementation((data) => data as User);
      repository.save.mockImplementation((u) => Promise.resolve(u));

      await service.create({
        email: "new@example.com",
        password: "PlainText1!",
        isEmailVerified: false,
      });

      const created = repository.create.mock.calls[0][0];
      expect(created.passwordHash).not.toBe("PlainText1!");
      expect(await bcrypt.compare("PlainText1!", created.passwordHash ?? "")).toBe(true);
    });

    it("gives a plain registration the customer role", async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockImplementation((data) => data as User);
      repository.save.mockImplementation((u) => Promise.resolve(u));

      await service.create({ email: "new@example.com", password: "p", isEmailVerified: false });

      expect(repository.create.mock.calls[0][0].role).toBe(Role.USER);
    });

    it("refuses an email already registered", async () => {
      repository.findByEmail.mockResolvedValue(user());

      await expect(
        service.create({ email: "anna@example.com", password: "p", isEmailVerified: false })
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("defaults the verification fields when they are absent", async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockImplementation((data) => data as User);
      repository.save.mockImplementation((u) => Promise.resolve(u));

      await service.create({ email: "n@example.com", password: "p", isEmailVerified: false });

      expect(repository.create.mock.calls[0][0]).toMatchObject({
        isEmailVerified: false,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });
    });
  });

  describe("findById", () => {
    it("never lets passwordHash out", async () => {
      repository.findById.mockResolvedValue(user());

      const result = await service.findById("u1");

      expect(result).not.toHaveProperty("passwordHash");
      expect(result).not.toHaveProperty("verificationToken");
      expect(result).toMatchObject({ id: "u1", email: "anna@example.com", role: Role.USER });
    });

    it("throws for an unknown id", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById("nope")).rejects.toThrow(NotFoundException);
    });

    it("returns the entity to callers inside the service", async () => {
      const row = user();
      repository.findById.mockResolvedValue(row);

      await expect(service.findEntityById("u1")).resolves.toBe(row);
    });
  });

  describe("findAll", () => {
    it("maps every row and keeps the total", async () => {
      repository.findPaginated.mockResolvedValue({ data: [user(), user({ id: "u2" })], total: 7 });

      const result = await service.findAll(1, 10, "anna");

      expect(repository.findPaginated).toHaveBeenCalledWith(1, 10, "anna");
      expect(result.total).toBe(7);
      expect(result.data.every((dto) => !("passwordHash" in dto))).toBe(true);
    });
  });

  describe("changePassword", () => {
    it("stores a new hash when the current password matches", async () => {
      const hash = await bcrypt.hash("OldPass1!", 10);
      repository.findById.mockResolvedValue(user({ passwordHash: hash }));

      await service.changePassword("u1", {
        currentPassword: "OldPass1!",
        newPassword: "NewPass1!",
      });

      const written = repository.update.mock.calls[0][1];
      expect(await bcrypt.compare("NewPass1!", written.passwordHash ?? "")).toBe(true);
    });

    it("refuses when the current password is wrong", async () => {
      const hash = await bcrypt.hash("OldPass1!", 10);
      repository.findById.mockResolvedValue(user({ passwordHash: hash }));

      await expect(
        service.changePassword("u1", { currentPassword: "WrongPass1!", newPassword: "NewPass1!" })
      ).rejects.toThrow(UnauthorizedException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe("setRole", () => {
    it("promotes another user", async () => {
      repository.findById.mockResolvedValue(user({ id: "u2", role: Role.USER }));

      await service.setRole("u2", Role.ADMIN, "admin-1");

      expect(repository.update).toHaveBeenCalledWith("u2", { role: Role.ADMIN });
    });

    it("does nothing when the role is already what was asked for", async () => {
      repository.findById.mockResolvedValue(user({ id: "u2", role: Role.ADMIN }));

      await service.setRole("u2", Role.ADMIN, "admin-1");

      expect(repository.update).not.toHaveBeenCalled();
    });

    it("refuses to change your own role", async () => {
      repository.findById.mockResolvedValue(user({ id: "admin-1", role: Role.ADMIN }));

      await expect(service.setRole("admin-1", Role.USER, "admin-1")).rejects.toThrow(
        new BadRequestException("You cannot change your own role")
      );
    });

    it("refuses to demote the last admin", async () => {
      repository.findById.mockResolvedValue(user({ id: "u2", role: Role.ADMIN }));
      repository.countByRole.mockResolvedValue(1);

      await expect(service.setRole("u2", Role.USER, "admin-1")).rejects.toThrow(
        new BadRequestException("Cannot demote the last remaining admin")
      );
    });

    it("allows demoting an admin while others remain", async () => {
      repository.findById.mockResolvedValue(user({ id: "u2", role: Role.ADMIN }));
      repository.countByRole.mockResolvedValue(3);

      await service.setRole("u2", Role.USER, "admin-1");

      expect(repository.update).toHaveBeenCalledWith("u2", { role: Role.USER });
    });
  });

  describe("remove", () => {
    it("announces the deletion so other services can react", async () => {
      repository.findById.mockResolvedValue(user());

      await service.remove("u1");

      expect(events.emit).toHaveBeenCalledWith(EVENTS.userDeleted, {
        userId: "u1",
        email: "anna@example.com",
        name: null,
      });
    });

    it("deletes the avatar along with the account", async () => {
      repository.findById.mockResolvedValue(user({ image: "/uploads/users/a.png" }));

      await service.remove("u1");

      expect(images.remove).toHaveBeenCalledWith("/uploads/users/a.png");
    });

    it("still deletes the account when the avatar cannot be removed", async () => {
      repository.findById.mockResolvedValue(user({ image: "/uploads/users/a.png" }));
      images.remove.mockRejectedValue(new Error("EPERM"));

      await expect(service.remove("u1")).resolves.toBeUndefined();
      expect(repository.remove).toHaveBeenCalledWith("u1");
    });

    it("raises an alert when the avatar file was already missing", async () => {
      repository.findById.mockResolvedValue(user({ image: "/uploads/users/gone.png" }));
      images.remove.mockResolvedValue(false);

      await service.remove("u1");

      expect(events.emit).toHaveBeenCalledWith(
        EVENTS.criticalError,
        expect.objectContaining({ errorType: "UserAvatarMissing" })
      );
    });

    it("throws when the user is not there", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove("nope")).rejects.toThrow(NotFoundException);
    });

    it("survives a broker that refuses the event", async () => {
      repository.findById.mockResolvedValue(user());
      events.emit.mockImplementation(() => {
        throw new Error("broker down");
      });

      await expect(service.remove("u1")).resolves.toBeUndefined();
    });
  });

  describe("setImagePath", () => {
    it("stores the path", async () => {
      repository.findById.mockResolvedValue(user());

      await service.setImagePath("u1", "/uploads/users/new.png");

      expect(repository.update).toHaveBeenCalledWith("u1", { image: "/uploads/users/new.png" });
    });

    it("deletes the avatar it replaces", async () => {
      repository.findById.mockResolvedValue(user({ image: "/uploads/users/old.png" }));

      await service.setImagePath("u1", "/uploads/users/new.png");

      expect(images.remove).toHaveBeenCalledWith("/uploads/users/old.png");
    });

    it("removes the uploaded file when the user is gone", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.setImagePath("nope", "/uploads/users/new.png")).rejects.toThrow(
        NotFoundException
      );
      expect(images.remove).toHaveBeenCalledWith("/uploads/users/new.png");
    });
  });
});
