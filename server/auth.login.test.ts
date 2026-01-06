import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user: Partial<AuthenticatedUser> | null): TrpcContext {
  return {
    user: user as AuthenticatedUser | null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Sistema de Login - Testes Completos", () => {
  const testOpenId = "test-open-id-login-123";

  // Limpar dados de teste antes e depois de cada teste
  beforeEach(async () => {
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.openId, testOpenId));
    }
  });

  afterEach(async () => {
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.openId, testOpenId));
    }
  });

  describe("Criação de Usuário via OAuth", () => {
    it("deve criar um novo usuário com dados do OAuth", async () => {
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.name).toBe("Teste Usuario");
      expect(result?.email).toBe("teste@detran.rj.gov.br");
      expect(result?.role).toBe("user");
      expect(result?.hasCompletedOnboarding).toBe(false);
    });

    it("deve retornar usuário existente se já cadastrado", async () => {
      // Criar usuário primeiro
      const ctx1 = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller1 = appRouter.createCaller(ctx1);
      await caller1.auth.me();

      // Tentar criar novamente com dados atualizados
      const ctx2 = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario Atualizado",
        email: "teste.atualizado@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller2 = appRouter.createCaller(ctx2);
      const result = await caller2.auth.me();

      expect(result).toBeDefined();
      expect(result?.name).toBe("Teste Usuario Atualizado"); // Nome deve ser atualizado
      expect(result?.email).toBe("teste.atualizado@detran.rj.gov.br"); // Email deve ser atualizado
    });

    it("deve criar usuário com hasCompletedOnboarding = false por padrão", async () => {
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.hasCompletedOnboarding).toBe(false);
    });
  });

  describe("Endpoint auth.me", () => {
    it("deve retornar null se usuário não estiver autenticado", async () => {
      const ctx = createMockContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });

    it("deve retornar dados do usuário autenticado", async () => {
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.name).toBe("Teste Usuario");
      expect(result?.email).toBe("teste@detran.rj.gov.br");
      expect(result?.role).toBe("user");
      expect(result?.hasCompletedOnboarding).toBeDefined();
    });
  });

  describe("Endpoint auth.completeOnboarding", () => {
    it("deve marcar onboarding como concluído", async () => {
      // Criar usuário
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      await caller.auth.me();

      // Completar onboarding
      await caller.auth.completeOnboarding();

      // Verificar se foi marcado como concluído
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.hasCompletedOnboarding).toBe(true);
    });

    it("deve falhar se usuário não estiver autenticado", async () => {
      const ctx = createMockContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.completeOnboarding()).rejects.toThrow();
    });
  });

  describe("Validação de Email", () => {
    it("deve aceitar emails do domínio detran.rj.gov.br", async () => {
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.email).toBe("teste@detran.rj.gov.br");
    });

    it("deve aceitar emails de qualquer domínio (sem restrição)", async () => {
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@gmail.com",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.email).toBe("teste@gmail.com");
    });
  });

  describe("Persistência de Dados", () => {
    it("deve persistir dados do usuário no banco de dados", async () => {
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      await caller.auth.me();

      // Verificar se usuário foi salvo no banco
      const db = await getDb();
      const userInDb = await db?.query.users.findFirst({
        where: eq(users.openId, testOpenId),
      });

      expect(userInDb).toBeDefined();
      expect(userInDb?.name).toBe("Teste Usuario");
      expect(userInDb?.email).toBe("teste@detran.rj.gov.br");
      expect(userInDb?.role).toBe("user");
    });

    it("deve atualizar dados do usuário existente", async () => {
      // Criar usuário
      const ctx1 = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario Original",
        email: "teste.original@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller1 = appRouter.createCaller(ctx1);
      await caller1.auth.me();

      // Atualizar dados
      const ctx2 = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario Atualizado",
        email: "teste.atualizado@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller2 = appRouter.createCaller(ctx2);
      await caller2.auth.me();

      // Verificar se dados foram atualizados no banco
      const db = await getDb();
      const userInDb = await db?.query.users.findFirst({
        where: eq(users.openId, testOpenId),
      });

      expect(userInDb).toBeDefined();
      expect(userInDb?.name).toBe("Teste Usuario Atualizado");
      expect(userInDb?.email).toBe("teste.atualizado@detran.rj.gov.br");
    });
  });

  describe("Fluxo Completo de Login", () => {
    it("deve completar fluxo: criar usuário -> completar onboarding -> verificar estado", async () => {
      // 1. Criar usuário (primeiro login)
      const ctx = createMockContext({
        openId: testOpenId,
        name: "Teste Usuario",
        email: "teste@detran.rj.gov.br",
        loginMethod: "manus",
      });

      const caller = appRouter.createCaller(ctx);
      
      // 2. Verificar dados iniciais
      const user1 = await caller.auth.me();
      expect(user1).toBeDefined();
      expect(user1?.hasCompletedOnboarding).toBe(false);

      // 3. Completar onboarding
      await caller.auth.completeOnboarding();

      // 4. Verificar que onboarding foi marcado como concluído
      const user2 = await caller.auth.me();
      expect(user2).toBeDefined();
      expect(user2?.hasCompletedOnboarding).toBe(true);

      // 5. Verificar persistência no banco
      const db = await getDb();
      const userInDb = await db?.query.users.findFirst({
        where: eq(users.openId, testOpenId),
      });

      expect(userInDb).toBeDefined();
      expect(userInDb?.hasCompletedOnboarding).toBe(true);
    });
  });
});
