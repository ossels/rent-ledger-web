import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import type { AuthPayload } from "./jwt.guard";

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

class RegisterDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;
}

const COOKIE = "rl_token";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
}

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Get("status")
  status() {
    return this.auth.status();
  }

  @Public()
  @Post("setup")
  async setup(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.setup(dto.name, dto.email, dto.password);
    setSessionCookie(res, token);
    return user;
  }

  @Get("users")
  listUsers() {
    return this.auth.listUsers();
  }

  @Post("users")
  async addUser(@Body() dto: RegisterDto) {
    const { user } = await this.auth.addUser(dto.name, dto.email, dto.password);
    return user;
  }

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.login(dto.email, dto.password);
    setSessionCookie(res, token);
    return user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { path: "/" });
    return { loggedOut: true };
  }

  @Get("me")
  me(@Req() req: Request & { user?: AuthPayload }) {
    return { id: req.user?.sub, email: req.user?.email, name: req.user?.name };
  }
}
