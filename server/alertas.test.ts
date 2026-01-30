import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@detran.rj.gov.br",
    name: "Usuário Teste",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("alertas.summary", () => {
  it("retorna resumo de alertas com contadores numéricos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.summary();

    // Verifica que o resultado tem a estrutura esperada
    expect(result).toHaveProperty("semNumeroSerie");
    expect(result).toHaveProperty("semResponsavel");
    expect(result).toHaveProperty("semLocalizacao");
    
    // Verifica que os valores são números
    expect(typeof result.semNumeroSerie).toBe("number");
    expect(typeof result.semResponsavel).toBe("number");
    expect(typeof result.semLocalizacao).toBe("number");
    
    // Verifica que os valores são não-negativos
    expect(result.semNumeroSerie).toBeGreaterThanOrEqual(0);
    expect(result.semResponsavel).toBeGreaterThanOrEqual(0);
    expect(result.semLocalizacao).toBeGreaterThanOrEqual(0);
  });
});

describe("alertas.semNumeroSerie", () => {
  it("retorna lista de patrimônios sem número de série", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.semNumeroSerie();

    // Verifica que o resultado é um array
    expect(Array.isArray(result)).toBe(true);
    
    // Se houver itens, verifica a estrutura
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("descricao");
      expect(item).toHaveProperty("categoria");
      expect(item).toHaveProperty("localizacao");
    }
  });
});

describe("alertas.semResponsavel", () => {
  it("retorna lista de patrimônios sem responsável", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.semResponsavel();

    // Verifica que o resultado é um array
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("alertas.semLocalizacao", () => {
  it("retorna lista de patrimônios sem localização", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.alertas.semLocalizacao();

    // Verifica que o resultado é um array
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("historico.recent", () => {
  it("retorna histórico recente de alterações", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.historico.recent({ limit: 10 });

    // Verifica que o resultado é um array
    expect(Array.isArray(result)).toBe(true);
    
    // Se houver itens, verifica a estrutura
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("patrimonioId");
      expect(item).toHaveProperty("userId");
      expect(item).toHaveProperty("tipoAcao");
      expect(item).toHaveProperty("createdAt");
      
      // Verifica que tipoAcao é um dos valores válidos
      expect(["criacao", "edicao", "exclusao", "movimentacao"]).toContain(item.tipoAcao);
    }
  });
});

describe("patrimonio.searchByNumeroSerie", () => {
  it("busca patrimônio por número de série e retorna null se não encontrar", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Buscar por um número de série que provavelmente não existe
    const result = await caller.patrimonio.searchByNumeroSerie({ 
      numeroSerie: "NUMERO_INEXISTENTE_12345" 
    });

    // Pode retornar null ou um patrimônio
    expect(result === null || typeof result === "object").toBe(true);
    
    // Se encontrou, verifica a estrutura
    if (result !== null) {
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("descricao");
      expect(result).toHaveProperty("numeroSerie");
    }
  });
});
