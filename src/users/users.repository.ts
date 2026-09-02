import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { User } from "./entities/user.entity.ts";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) { }

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: User[]; total: number }> {
    const where = search ? [{ name: ILike(`%${search}%`) }, { surname: ILike(`%${search}%`) }] : {};

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

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
