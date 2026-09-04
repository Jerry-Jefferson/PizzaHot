import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Gender } from "../../users/constants/gender.enum.ts";
import { Role } from "../constants/role.enum.ts";
import { UsersService } from "../../users/users.service.ts";

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdmin();
  }

  private async seedAdmin(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      this.logger.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed");
      return;
    }

    const existing = await this.usersService.findByEmail(adminEmail);
    if (existing) {
      this.logger.log("Admin user already exists, skipping seed");
      return;
    }

    const admin = await this.usersService.createWithRole(
      {
        email: adminEmail,
        password: adminPassword,
        name: "Admin",
        surname: "Admin",
        gender: Gender.FEMALE,
        image: "",
      },
      Role.ADMIN
    );

    this.logger.log(`Admin user seeded successfully (id: ${admin.id})`);
  }
}
