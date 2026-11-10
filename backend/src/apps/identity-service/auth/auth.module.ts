import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module.ts";
import { AuthService } from "./auth.service.ts";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          secret: configService.getOrThrow<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("JWT_EXPIRATION") ?? "1d",
          },
        }) as JwtModuleOptions,
    }),
  ],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
