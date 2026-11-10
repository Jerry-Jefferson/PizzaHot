import { Repository } from "typeorm";
import { PizzaSnapshot } from "./pizza-snapshot.entity.ts";
export declare class PizzaSnapshotRepository {
    private readonly repository;
    constructor(repository: Repository<PizzaSnapshot>);
    findById(id: string): Promise<PizzaSnapshot | null>;
    findByIds(ids: string[]): Promise<PizzaSnapshot[]>;
    upsert(snapshot: Partial<PizzaSnapshot> & {
        id: string;
    }): Promise<void>;
    remove(id: string): Promise<void>;
    count(): Promise<number>;
}
