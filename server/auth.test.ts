import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import bcrypt from "bcryptjs";
import { getUserByUsername } from "./db";

type CookieCall = {
  name: string;
  value?: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

function createAuthContext(userId: number): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: userId,
    openId: null,
    username: "testuser",
    passwordHash: null,
    email: "test@detran.rj.gov.br",
    name: "Test User",
    loginMethod: "local",
    role: "user",
    mustChangePassword: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

describe("Auth - Login", () => {
  it("deve fazer login com credenciais válidas", async () => {
    const { ctx, cookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      username: "moises",
      password: "123",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.username).toBe("moises");
    expect(result.user?.role).toBe("admin");
    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies[0]?.name).toBe(COOKIE_NAME);
  });

  it("deve rejeitar credenciais inválidas", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        username: "moises",
        password: "senhaerrada",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar usuário inexistente", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        username: "usuarioinexistente",
        password: "123",
      })
    ).rejects.toThrow();
  });
});

describe("Auth - Change Password", () => {
  it("deve validar schema de senha forte", async () => {
    const user = await getUserByUsername("pedro");
    if (!user) throw new Error("User not found");

    const { ctx } = createAuthContext(user.id);
    ctx.user = user;
    const caller = appRouter.createCaller(ctx);

    // Testa que senha fraca é rejeitada
    await expect(
      caller.auth.changePassword({
        currentPassword: "123",
        newPassword: "123",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar senha atual incorreta", async () => {
    const user = await getUserByUsername("moises");
    if (!user) throw new Error("User not found");

    const { ctx } = createAuthContext(user.id);
    ctx.user = user;
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.changePassword({
        currentPassword: "senhaerrada",
        newPassword: "NovaSenh@123",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar senha fraca", async () => {
    const user = await getUserByUsername("moises");
    if (!user) throw new Error("User not found");

    const { ctx } = createAuthContext(user.id);
    ctx.user = user;
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.changePassword({
        currentPassword: "123",
        newPassword: "123", // Senha fraca
      })
    ).rejects.toThrow();
  });
});

describe("Auth - Logout", () => {
  it("deve limpar o cookie de sessão", async () => {
    const { ctx, cookies } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies[0]?.name).toBe(COOKIE_NAME);
    expect(cookies[0]?.options.maxAge).toBe(-1);
  });
});

describe("Auth - Me", () => {
  it("deve retornar null para usuário não autenticado", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });

  it("deve retornar dados do usuário autenticado", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.username).toBe("testuser");
  });
});
