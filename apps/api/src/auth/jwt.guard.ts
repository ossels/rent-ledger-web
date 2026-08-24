import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "./public.decorator";

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: AuthPayload }>();
    const token = (req.cookies as Record<string, string> | undefined)?.["rl_token"];
    if (!token) throw new UnauthorizedException("Sign in to open the ledger");
    try {
      req.user = await this.jwt.verifyAsync<AuthPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException("Sign in to open the ledger");
    }
  }
}
