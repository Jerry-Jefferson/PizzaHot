import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity.ts";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>
  ) {}

  create(data: Partial<User>): User {
    return this.repo.create(data);
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findPaginated(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { data, total };
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
