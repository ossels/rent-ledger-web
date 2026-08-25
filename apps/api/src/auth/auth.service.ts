import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async status() {
    const users = await this.prisma.user.count();
    return { setupRequired: users === 0 };
  }

  /** Creates the very first account. Refused once any account exists. */
  async setup(name: string, email: string, password: string) {
    const users = await this.prisma.user.count();
    if (users > 0) throw new ForbiddenException("The ledger is already set up — sign in instead");
    return this.createUser(name, email, password);
  }

  /** Adds another account (e.g. the other owner). Caller must be signed in. */
  async addUser(name: string, email: string, password: string) {
    return this.createUser(name, email, password);
  }

  listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  }

  private async createUser(name: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("An account with this email already exists");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { name, email, passwordHash } });
    return this.toSession(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("That email or password is not right");
    }
    return this.toSession(user);
  }

  private async toSession(user: { id: string; email: string; name: string }) {
    const safe: SafeUser = { id: user.id, email: user.email, name: user.name };
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, name: user.name });
    return { user: safe, token };
  }
}
