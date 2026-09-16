import type { Promocode } from "../entities/promocode.entity.ts";

export interface IPromocodesRepository {
  create(data: Partial<Promocode>): Promocode;
  save(promocode: Promocode): Promise<Promocode>;
  findAll(): Promise<Promocode[]>;
  findById(id: string): Promise<Promocode | null>;
  findByCode(code: string): Promise<Promocode | null>;
  update(id: string, data: Partial<Promocode>): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
