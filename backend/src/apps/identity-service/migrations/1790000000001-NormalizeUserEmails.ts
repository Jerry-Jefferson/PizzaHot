import type { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeUserEmails1790000000001 implements MigrationInterface {
  name = "NormalizeUserEmails1790000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "users" SET "email" = LOWER(TRIM("email"))`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email_lower" ON "users" (LOWER("email"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_users_email_lower"`);
  }
}
