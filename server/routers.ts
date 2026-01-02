import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getUserByUsername,
  getUserById,
  updateUserPassword,
  updateUserProfile,
  createPatrimonio,
  getAllPatrimonios,
  getPatrimonioById,
  updatePatrimonio,
  deletePatrimonio,
  searchPatrimonios,
} from "./db";

// ============================================
// Validation Schemas
// ============================================

const passwordSchema = z.string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número");

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: passwordSchema,
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
});

const patrimonioSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  valor: z.string().min(1, "Valor é obrigatório"),
  localizacao: z.string().min(1, "Localização é obrigatória"),
  numeroSerie: z.string().optional(),
  dataAquisicao: z.date(),
  responsavel: z.string().min(1, "Responsável é obrigatório"),
});

const searchPatrimoniosSchema = z.object({
  searchTerm: z.string().optional(),
  categoria: z.string().optional(),
  localizacao: z.string().optional(),
});

// ============================================
// App Router
// ============================================

export const appRouter = router({
  system: systemRouter,

  // ============================================
  // Auth Router
  // ============================================
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByUsername(input.username);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não encontrado",
          });
        }

        // Create session token (simplified - using user ID)
        const token = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),

    changePassword: protectedProcedure
      .input(changePasswordSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);

        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não encontrado",
          });
        }

        const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);

        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha atual incorreta",
          });
        }

        const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
        await updateUserPassword(ctx.user.id, newPasswordHash);

        return { success: true };
      }),

    updateProfile: protectedProcedure
      .input(updateProfileSchema)
      .mutation(async ({ input, ctx }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // Patrimonio Router
  // ============================================
  patrimonio: router({
    list: protectedProcedure
      .query(async () => {
        return await getAllPatrimonios();
      }),

    search: protectedProcedure
      .input(searchPatrimoniosSchema)
      .query(async ({ input }) => {
        return await searchPatrimonios(
          input.searchTerm || "",
          input.categoria,
          input.localizacao
        );
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const patrimonio = await getPatrimonioById(input.id);
        if (!patrimonio) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Patrimônio não encontrado",
          });
        }
        return patrimonio;
      }),

    create: protectedProcedure
      .input(patrimonioSchema)
      .mutation(async ({ input, ctx }) => {
        await createPatrimonio({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: patrimonioSchema.partial(),
      }))
      .mutation(async ({ input }) => {
        const patrimonio = await getPatrimonioById(input.id);
        if (!patrimonio) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Patrimônio não encontrado",
          });
        }

        await updatePatrimonio(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const patrimonio = await getPatrimonioById(input.id);
        if (!patrimonio) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Patrimônio não encontrado",
          });
        }

        await deletePatrimonio(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
