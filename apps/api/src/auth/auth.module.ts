import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtCookieGuard } from "./jwt.guard";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "rentledger-dev-secret-change-me",
      signOptions: { expiresIn: "30d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: JwtCookieGuard }],
})
export class AuthModule {}
