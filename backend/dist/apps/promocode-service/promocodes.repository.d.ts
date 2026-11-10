import { Repository } from "typeorm";
import { Promocode } from "./promocode.entity.ts";
import type { IPromocodesRepository } from "./promocode.types.ts";
export declare class PromocodesRepository implements IPromocodesRepository {
    private readonly repository;
    constructor(repository: Repository<Promocode>);
    create(data: Partial<Promocode>): Promocode;
    save(promocode: Promocode): Promise<Promocode>;
    findAll(): Promise<Promocode[]>;
    findById(id: string): Promise<Promocode | null>;
    findByCode(code: string): Promise<Promocode | null>;
    update(id: string, data: Partial<Promocode>): Promise<boolean>;
    remove(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
