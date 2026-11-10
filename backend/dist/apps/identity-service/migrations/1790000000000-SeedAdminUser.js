import bcrypt from "bcrypt";
import { Role } from "../../../libs/auth/auth.constant.js";
import { Gender } from "../users/constants/gender.constant.js";
import { SALT_ROUNDS } from "../users/constants/salt.constant.js";
export class SeedAdminUser1790000000000 {
    name = "SeedAdminUser1790000000000";
    async up(queryRunner) {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to run SeedAdminUser. " +
                "Set them and run the migration again.");
        }
        const existing = await queryRunner.query(`SELECT id FROM "users" WHERE "email" = $1`, [
            email,
        ]);
        if (Array.isArray(existing) && existing.length > 0) {
            return;
        }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await queryRunner.query(`INSERT INTO "users" ("email", "passwordHash", "name", "surname", "gender", "role", "isEmailVerified")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [email, passwordHash, "Admin", "Admin", Gender.FEMALE, Role.ADMIN, true]);
    }
    async down(queryRunner) {
        const email = process.env.ADMIN_EMAIL;
        if (!email) {
            return;
        }
        await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1 AND "role" = $2`, [
            email,
            Role.ADMIN,
        ]);
    }
}
//# sourceMappingURL=1790000000000-SeedAdminUser.js.map