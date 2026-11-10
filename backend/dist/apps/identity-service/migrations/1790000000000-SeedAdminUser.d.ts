import type { MigrationInterface, QueryRunner } from "typeorm";
export declare class SeedAdminUser1790000000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
