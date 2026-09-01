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
    const adminEmail = "jerryj700@gmail.com";

    const existing = await this.usersService.findByEmail(adminEmail);
    if (existing) {
      this.logger.log("Admin user already exists, skipping seed");
      return;
    }

    const admin = await this.usersService.createWithRole(
      {
        email: adminEmail,
        password: "9090",
        name: "Jerry",
        surname: "Jefferson",
        gender: Gender.FEMALE,
        image: "",
      },
      Role.ADMIN
    );

    this.logger.log(`Admin user seeded successfully (id: ${admin.id})`);
  }
}
