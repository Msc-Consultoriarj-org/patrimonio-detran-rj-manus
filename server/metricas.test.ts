import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import { createCallerFactory } from './_core/trpc';

// Mock user for testing
const mockUser = {
  id: 1,
  openId: 'test-open-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin' as const,
};

// Create caller factory
const createCaller = createCallerFactory(appRouter);

describe('Métricas Router', () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    caller = createCaller({
      user: mockUser,
      setCookie: vi.fn(),
      getCookie: vi.fn(),
    });
  });

  describe('metricas.porResponsavel', () => {
    it('should return metrics grouped by responsavel', async () => {
      const result = await caller.metricas.porResponsavel();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('porResponsavel');
      expect(result).toHaveProperty('porResponsavelCategoria');
      expect(result).toHaveProperty('valorPorResponsavel');
      expect(Array.isArray(result.porResponsavel)).toBe(true);
      expect(Array.isArray(result.porResponsavelCategoria)).toBe(true);
      expect(Array.isArray(result.valorPorResponsavel)).toBe(true);
    });

    it('should return responsavel with total count', async () => {
      const result = await caller.metricas.porResponsavel();
      
      if (result.porResponsavel.length > 0) {
        const firstItem = result.porResponsavel[0];
        expect(firstItem).toHaveProperty('responsavel');
        expect(firstItem).toHaveProperty('total');
        expect(typeof firstItem.responsavel).toBe('string');
        expect(typeof firstItem.total).toBe('number');
      }
    });
  });

  describe('metricas.porCategoria', () => {
    it('should return metrics grouped by categoria', async () => {
      const result = await caller.metricas.porCategoria();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return categoria with total count', async () => {
      const result = await caller.metricas.porCategoria();
      
      if (result.length > 0) {
        const firstItem = result[0];
        expect(firstItem).toHaveProperty('categoria');
        expect(firstItem).toHaveProperty('total');
        expect(typeof firstItem.categoria).toBe('string');
        expect(typeof firstItem.total).toBe('number');
      }
    });
  });

  describe('metricas.porLocalizacao', () => {
    it('should return metrics grouped by localizacao', async () => {
      const result = await caller.metricas.porLocalizacao();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return localizacao with total count', async () => {
      const result = await caller.metricas.porLocalizacao();
      
      if (result.length > 0) {
        const firstItem = result[0];
        expect(firstItem).toHaveProperty('localizacao');
        expect(firstItem).toHaveProperty('total');
        expect(typeof firstItem.localizacao).toBe('string');
        expect(typeof firstItem.total).toBe('number');
      }
    });
  });
});
