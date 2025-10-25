import superjson from "superjson";
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
// 已移除登录与权限校验，所有接口公开可用
export const protectedProcedure = t.procedure;
export const adminProcedure = t.procedure;
