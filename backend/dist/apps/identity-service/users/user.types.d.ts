import type { User } from "./user.entity.ts";
import type { Role } from "../../../libs/auth/auth.constant.ts";
import type { PaginatedResult } from "../../../libs/pagination/pagination.types.ts";
export interface IUsersRepository {
    create(data: Partial<User>): User;
    save(user: User): Promise<User>;
    findPaginated(page: number, limit: number, search?: string): Promise<PaginatedResult<User>>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByVerificationToken(token: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<boolean>;
    remove(id: string): Promise<boolean>;
    countByRole(role: Role): Promise<number>;
}
