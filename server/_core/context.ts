import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "../../shared/const";
import { getUserById } from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Try local auth first (simple base64 token)
  const cookie = opts.req.cookies?.[COOKIE_NAME];
  if (cookie) {
    try {
      const decoded = JSON.parse(Buffer.from(cookie, "base64").toString());
      if (decoded.userId) {
        const localUser = await getUserById(decoded.userId);
        if (localUser) {
          return {
            req: opts.req,
            res: opts.res,
            user: localUser,
          };
        }
      }
    } catch {
      // Not a local auth token, try OAuth
    }
  }

  // Try OAuth authentication
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
