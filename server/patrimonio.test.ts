import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createPatrimonio, deletePatrimonio, getAllPatrimonios } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: null,
    username: "testuser",
    passwordHash: null,
    email: "test@detran.rj.gov.br",
    name: "Test User",
    loginMethod: "local",
    role: "admin",
    mustChangePassword: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Patrimonio - Create", () => {
  let createdPatrimonioId: number | null = null;

  afterAll(async () => {
    // Limpar patrimônio criado nos testes
    if (createdPatrimonioId) {
      try {
        await deletePatrimonio(createdPatrimonioId);
      } catch (error) {
        // Ignora erro se já foi deletado
      }
    }
  });

  it("deve criar um novo patrimônio com dados válidos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patrimonio.create({
      descricao: "Notebook Dell Latitude 5420",
      categoria: "Notebook",
      valor: "3500.00",
      localizacao: "DTIC - Sala 101",
      numeroSerie: "SN123456789",
      dataAquisicao: new Date("2024-01-15"),
      responsavel: "João Silva",
    });

    expect(result.success).toBe(true);

    // Verifica se foi criado no banco
    const patrimonios = await getAllPatrimonios();
    const created = patrimonios.find(p => p.numeroSerie === "SN123456789");
    expect(created).toBeDefined();
    if (created) {
      createdPatrimonioId = created.id;
    }
  });

  it("deve rejeitar criação sem autenticação", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.patrimonio.create({
        descricao: "Notebook Dell",
        categoria: "Notebook",
        valor: "3500.00",
        localizacao: "DTIC",
        dataAquisicao: new Date(),
        responsavel: "João Silva",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar criação com dados inválidos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.patrimonio.create({
        descricao: "",
        categoria: "Notebook",
        valor: "3500.00",
        localizacao: "DTIC",
        dataAquisicao: new Date(),
        responsavel: "João Silva",
      })
    ).rejects.toThrow();
  });
});

describe("Patrimonio - List", () => {
  it("deve listar todos os patrimônios", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patrimonio.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("deve rejeitar listagem sem autenticação", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.patrimonio.list()).rejects.toThrow();
  });
});

describe("Patrimonio - Search", () => {
  beforeAll(async () => {
    // Criar patrimônio de teste
    await createPatrimonio({
      descricao: "Monitor LG 24 polegadas",
      categoria: "Monitor",
      valor: "800.00",
      localizacao: "DTIC - Sala 102",
      numeroSerie: "MON123456",
      dataAquisicao: new Date(),
      responsavel: "Maria Santos",
      userId: 1,
    });
  });

  it("deve buscar patrimônios por termo de busca", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patrimonio.search({
      searchTerm: "Monitor",
    });

    expect(Array.isArray(result)).toBe(true);
    const found = result.find(p => p.descricao.includes("Monitor"));
    expect(found).toBeDefined();
  });

  it("deve filtrar patrimônios por categoria", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patrimonio.search({
      categoria: "Monitor",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach(p => {
      expect(p.categoria).toBe("Monitor");
    });
  });

  it("deve filtrar patrimônios por localização", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patrimonio.search({
      localizacao: "DTIC",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach(p => {
      expect(p.localizacao).toContain("DTIC");
    });
  });
});

describe("Patrimonio - Update", () => {
  let testPatrimonioId: number;

  beforeAll(async () => {
    // Criar patrimônio de teste
    const result = await createPatrimonio({
      descricao: "Impressora HP LaserJet",
      categoria: "Impressora",
      valor: "1200.00",
      localizacao: "DTIC - Sala 103",
      numeroSerie: "IMP123456",
      dataAquisicao: new Date(),
      responsavel: "Pedro Oliveira",
      userId: 1,
    });
    const patrimonios = await getAllPatrimonios();
    const created = patrimonios.find(p => p.numeroSerie === "IMP123456");
    if (created) {
      testPatrimonioId = created.id;
    }
  });

  it("deve atualizar um patrimônio existente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patrimonio.update({
      id: testPatrimonioId,
      data: {
        descricao: "Impressora HP LaserJet Pro",
        valor: "1500.00",
      },
    });

    expect(result.success).toBe(true);
  });

  it("deve rejeitar atualização de patrimônio inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.patrimonio.update({
        id: 999999,
        data: {
          descricao: "Teste",
        },
      })
    ).rejects.toThrow();
  });
});

describe("Patrimonio - Delete", () => {
  let testPatrimonioId: number;

  beforeAll(async () => {
    // Criar patrimônio de teste
    await createPatrimonio({
      descricao: "Scanner Epson",
      categoria: "Scanner",
      valor: "600.00",
      localizacao: "DTIC - Sala 104",
      numeroSerie: "SCN123456",
      dataAquisicao: new Date(),
      responsavel: "Ana Costa",
      userId: 1,
    });
    const patrimonios = await getAllPatrimonios();
    const created = patrimonios.find(p => p.numeroSerie === "SCN123456");
    if (created) {
      testPatrimonioId = created.id;
    }
  });

  it("deve deletar um patrimônio existente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patrimonio.delete({
      id: testPatrimonioId,
    });

    expect(result.success).toBe(true);
  });

  it("deve rejeitar exclusão de patrimônio inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.patrimonio.delete({
        id: 999999,
      })
    ).rejects.toThrow();
  });
});
