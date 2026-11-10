import type { IPizzasRepository } from "./pizza.types.ts";
export declare class PizzaCleanupService {
    private readonly pizzasRepository;
    private readonly logger;
    constructor(pizzasRepository: IPizzasRepository);
    handleCleanup(): Promise<number>;
}
