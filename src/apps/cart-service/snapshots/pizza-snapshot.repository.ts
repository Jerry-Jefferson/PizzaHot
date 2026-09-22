import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { PizzaSnapshot } from "./pizza-snapshot.entity.ts";

@Injectable()
export class PizzaSnapshotRepository {
  constructor(
    @InjectRepository(PizzaSnapshot)
    private readonly repository: Repository<PizzaSnapshot>
  ) {}

  async findById(id: string): Promise<PizzaSnapshot | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIds(ids: string[]): Promise<PizzaSnapshot[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.repository.find({ where: { id: In(ids) } });
  }

  async upsert(snapshot: Partial<PizzaSnapshot> & { id: string }): Promise<void> {
    await this.repository.upsert(snapshot, ["id"]);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
