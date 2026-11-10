import { Repository } from "typeorm";
import { User } from "./user.entity.ts";
import type { IUsersRepository } from "./user.types.ts";
import type { PaginatedResult } from "../../../libs/pagination/pagination.types.ts";
import type { Role } from "../../../libs/auth/auth.constant.ts";
export declare class UsersRepository implements IUsersRepository {
    private readonly repository;
    constructor(repository: Repository<User>);
    create(data: Partial<User>): User;
    save(user: User): Promise<User>;
    findPaginated(page: number, limit: number, search?: string): Promise<PaginatedResult<User>>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByVerificationToken(token: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<boolean>;
    countByRole(role: Role): Promise<number>;
    remove(id: string): Promise<boolean>;
}
