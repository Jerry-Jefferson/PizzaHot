import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { User } from "./user.entity.ts";
import type { IUsersRepository } from "./user.types.ts";
import type { PaginatedResult } from "../../../libs/pagination/pagination.types.ts";

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResult<User>> {
    const where = search
      ? [
          { name: ILike(`%${search.replace(/[%_]/g, "\\$&")}%`) },
          { surname: ILike(`%${search.replace(/[%_]/g, "\\$&")}%`) },
        ]
      : {};

    const [data, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { data, total };
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.repository.findOne({ where: { verificationToken: token } });
  }

  async update(id: string, data: Partial<User>): Promise<boolean> {
    const result = await this.repository.update(id, data);
    return (result.affected ?? 0) > 0;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
