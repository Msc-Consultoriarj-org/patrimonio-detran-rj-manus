import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import * as XLSX from "xlsx";
import { storagePut } from "./storage";
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
  createSugestao,
  getAllSugestoes,
  getSugestoesByUserId,
  updateSugestaoStatus,
  getPatrimoniosByCategoria,
  getPatrimoniosByLocalizacao,
} from "./db";
import { gerarRelatorioExcel, gerarRelatorioPorLocalizacao } from "./relatorios";

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
  imageUrl: z.string().optional(),
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
      .mutation(async ({ input }) => {
        const user = await getUserByUsername(input.username);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não encontrado",
          });
        }

        // Retorna dados do usuário diretamente (sem cookies)
        // O frontend gerencia a sessão via localStorage
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            hasCompletedOnboarding: user.hasCompletedOnboarding === 1,
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

    logout: publicProcedure.mutation(() => {
      // O frontend gerencia a sessão via localStorage
      // Apenas retorna sucesso - o frontend limpa o localStorage
      return { success: true } as const;
    }),

    completeOnboarding: protectedProcedure
      .mutation(async ({ ctx }) => {
        await updateUserProfile(ctx.user.id, { hasCompletedOnboarding: 1 });
        return { success: true };
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

  // ============================================
  // Sugestoes Router
  // ============================================
  sugestoes: router({
    list: protectedProcedure.query(async () => {
      return await getAllSugestoes();
    }),

    myList: protectedProcedure.query(async ({ ctx }) => {
      return await getSugestoesByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          titulo: z.string().min(1, "Título é obrigatório"),
          descricao: z.string().min(1, "Descrição é obrigatória"),
          categoria: z.string().min(1, "Categoria é obrigatória"),
          prioridade: z.enum(["baixa", "media", "alta"]).default("media"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createSugestao({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pendente", "em_analise", "aprovada", "rejeitada"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Apenas admins podem atualizar status
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem atualizar o status",
          });
        }
        await updateSugestaoStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============================================
  // Analytics Router
  // ============================================
  analytics: router({
    byCategoria: protectedProcedure.query(async () => {
      const data = await getPatrimoniosByCategoria();
      return data;
    }),

    byLocalizacao: protectedProcedure.query(async () => {
      const data = await getPatrimoniosByLocalizacao();
      return data;
    }),
  }),

  // ============================================
  // CSV Import Router
  // ============================================
  csv: router({
    parse: protectedProcedure
      .input(
        z.object({
          base64: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Converter base64 para Buffer
          const base64Data = input.base64.split(",")[1] || input.base64;
          const buffer = Buffer.from(base64Data, "base64");

          let data: any[][] = [];

          // Processar baseado no tipo de arquivo
          if (input.mimeType.includes("spreadsheet") || input.fileName.endsWith(".xlsx") || input.fileName.endsWith(".xls")) {
            // Processar Excel
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          } else {
            // Processar CSV
            const text = buffer.toString("utf-8");
            const lines = text.split("\n").filter(line => line.trim());
            data = lines.map(line => {
              // Tentar detectar delimitador
              const delimiters = [",", ";", "\t", "|"];
              let bestDelimiter = ",";
              let maxColumns = 0;

              for (const delimiter of delimiters) {
                const columns = line.split(delimiter).length;
                if (columns > maxColumns) {
                  maxColumns = columns;
                  bestDelimiter = delimiter;
                }
              }

              return line.split(bestDelimiter).map(cell => cell.trim().replace(/^"|"$/g, ""));
            });
          }

          // Extrair cabeçalhos e linhas
          const headers = data[0] || [];
          const rows = data.slice(1).filter(row => row.some(cell => cell));

          // Validar e processar dados
          const processedRows = rows.map((row, index) => {
            const rowData: any = {};
            headers.forEach((header, i) => {
              rowData[header] = row[i] || "";
            });

            // Validações
            const errors: string[] = [];
            const warnings: string[] = [];

            // Campos obrigatórios
            const requiredFields = ["descricao", "categoria", "valor", "localizacao"];
            requiredFields.forEach(field => {
              const value = rowData[field] || rowData[field.charAt(0).toUpperCase() + field.slice(1)];
              if (!value || String(value).trim() === "") {
                errors.push(`Campo obrigatório "${field}" está vazio`);
              }
            });

            // Validar valor numérico
            const valorField = rowData.valor || rowData.Valor || rowData.VALOR;
            if (valorField) {
              const valorNum = Number(String(valorField).replace(/[^0-9.,]/g, "").replace(",", "."));
              if (isNaN(valorNum) || valorNum <= 0) {
                errors.push("Valor deve ser um número positivo");
              }
            }

            // Validar data de aquisição
            const dataField = rowData.dataAquisicao || rowData.DataAquisicao || rowData.data_aquisicao;
            if (dataField && String(dataField).trim()) {
              const dateTest = new Date(dataField);
              if (isNaN(dateTest.getTime())) {
                warnings.push("Data de aquisição em formato inválido");
              }
            }

            return {
              index: index + 2, // +2 porque linha 1 é header e index começa em 0
              data: rowData,
              errors,
              warnings,
              isValid: errors.length === 0,
            };
          });

          const validCount = processedRows.filter(r => r.isValid).length;
          const invalidCount = processedRows.filter(r => !r.isValid).length;

          return {
            success: true,
            headers,
            rows: processedRows,
            stats: {
              total: processedRows.length,
              valid: validCount,
              invalid: invalidCount,
            },
          };
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao processar arquivo. Verifique o formato.",
          });
        }
      }),

    import: protectedProcedure
      .input(
        z.object({
          rows: z.array(
            z.object({
              descricao: z.string(),
              categoria: z.string(),
              valor: z.number(),
              localizacao: z.string(),
              numeroSerie: z.string().optional(),
              dataAquisicao: z.string().optional(),
              responsavel: z.string().optional(),
              imageUrl: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          let successCount = 0;
          let errorCount = 0;
          const errors: string[] = [];

          for (const row of input.rows) {
            try {
              await createPatrimonio({
                ...row,
                valor: String(row.valor),
                dataAquisicao: row.dataAquisicao ? new Date(row.dataAquisicao) : new Date(),
                responsavel: row.responsavel || "Não informado",
                userId: ctx.user.id,
              });
              successCount++;
            } catch (error) {
              errorCount++;
              errors.push(`Erro ao importar "${row.descricao}": ${error}`);
            }
          }

          return {
            success: true,
            imported: successCount,
            failed: errorCount,
            errors,
          };
        } catch (error) {
          console.error("Erro ao importar dados:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao importar dados para o banco",
          });
        }
      }),
  }),

  // ============================================
  // Relatórios Router
  // ============================================
  relatorios: router({
    excel: protectedProcedure
      .query(async () => {
        try {
          const buffer = await gerarRelatorioExcel();
          const base64 = buffer.toString('base64');
          return {
            success: true,
            data: base64,
            fileName: `patrimonio-detran-${new Date().toISOString().split('T')[0]}.xlsx`,
          };
        } catch (error) {
          console.error("Erro ao gerar relatório:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao gerar relatório Excel",
          });
        }
      }),

    porLocalizacao: protectedProcedure
      .query(async () => {
        try {
          const buffer = await gerarRelatorioPorLocalizacao();
          const base64 = buffer.toString('base64');
          return {
            success: true,
            data: base64,
            fileName: `patrimonio-por-localizacao-${new Date().toISOString().split('T')[0]}.xlsx`,
          };
        } catch (error) {
          console.error("Erro ao gerar relatório:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao gerar relatório por localização",
          });
        }
      }),
  }),

  // ============================================
  // Upload Router
  // ============================================
  upload: router({
    image: protectedProcedure
      .input(
        z.object({
          base64: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Converter base64 para Buffer
          const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          // Gerar nome único para o arquivo
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(7);
          const fileExtension = input.fileName.split(".").pop() || "jpg";
          const fileKey = `patrimonios/${ctx.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;

          // Upload para S3
          const { url } = await storagePut(fileKey, buffer, input.mimeType);

          return { success: true, url };
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao fazer upload da imagem",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
