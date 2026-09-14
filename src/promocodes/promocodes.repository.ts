import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Promocode } from "./entities/promocode.entity.ts";
import type { IPromocodesRepository } from "./interfaces/promocodes.repository.interface.ts";

@Injectable()
export class PromocodesRepository implements IPromocodesRepository {
  constructor(
    @InjectRepository(Promocode)
    private readonly repository: Repository<Promocode>
  ) {}

  create(data: Partial<Promocode>): Promocode {
    return this.repository.create(data);
  }

  async save(promocode: Promocode): Promise<Promocode> {
    return this.repository.save(promocode);
  }

  async findAll(): Promise<Promocode[]> {
    return this.repository.find({ withDeleted: true });
  }

  async findById(id: string): Promise<Promocode | null> {
    return this.repository.findOneBy({ id });
  }

  async findByCode(code: string): Promise<Promocode | null> {
    return this.repository.findOne({ where: { code } });
  }

  async update(id: string, data: Partial<Promocode>): Promise<boolean> {
    const result = await this.repository.update(id, data);
    return (result.affected ?? 0) > 0;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.repository.restore(id);
    return (result.affected ?? 0) > 0;
  }
}
